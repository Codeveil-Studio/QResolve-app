import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, QrCode, MapPin, MoreHorizontal, Trash2, Edit, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2pdf from 'html2pdf.js';
import { createRoot } from 'react-dom/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateReportUrl } from '@/lib/assetUrl';
import { AssetQRPDFTemplate } from '@/components/assets/AssetQRPDFTemplate';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetStatus } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Assets() {
  const { organization, user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    location: '',
    serial_number: '',
    status: 'active' as AssetStatus,
  });

  const fetchAssets = useCallback(async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets((data as Asset[]) || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
      fetchAssets();
    }
  }, [organization, fetchAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !user) return;

    try {
      const assetData = {
        ...formData,
        org_id: organization.id,
        created_by: user.id,
        // qr_code is not needed in DB as we generate it dynamically
      };

      const { error } = await supabase.from('assets').insert(assetData);

      if (error) throw error;

      toast({ title: 'Asset created successfully' });
      setDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        type: '',
        location: '',
        serial_number: '',
        status: 'active',
      });
      fetchAssets();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to create asset',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase.from('assets').delete().eq('id', asset.id);
      if (error) throw error;
      toast({ title: 'Asset deleted successfully' });
      fetchAssets();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete asset',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const showQRCode = (asset: Asset) => {
    setSelectedAsset(asset);
    setQrDialogOpen(true);
  };

  const downloadQR = async (asset: Asset) => {
    const qrUrl = generateReportUrl(asset);
    
    // Create a temporary container
    const container = document.createElement('div');
    // Hide it but keep it in layout for rendering? 
    // html2pdf needs it to be visible or at least rendered. 
    // Absolute positioning off-screen is usually safe.
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);
    
    const root = createRoot(container);
    root.render(<AssetQRPDFTemplate asset={asset} qrUrl={qrUrl} />);
    
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const element = container.firstElementChild as HTMLElement;
    
    const opt = {
      margin: 10,
      filename: `${asset.name.replace(/\s+/g, '_')}-QR.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    try {
        await html2pdf().set(opt).from(element).save();
        toast({ title: 'PDF Downloaded successfully' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Failed to download PDF' });
    } finally {
        root.unmount();
        document.body.removeChild(container);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'name',
      header: 'Asset',
      render: (asset: Asset) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{asset.name}</p>
            <p className="text-sm text-muted-foreground">{asset.type || 'No type'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (asset: Asset) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {asset.location || 'Not specified'}
        </div>
      ),
    },
    {
      key: 'serial_number',
      header: 'Serial No.',
      render: (asset: Asset) => (
        <span className="font-mono text-sm">{asset.serial_number || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (asset: Asset) => <StatusBadge status={asset.status} type="asset" />,
    },
    {
      key: 'created_at',
      header: 'Added',
      render: (asset: Asset) => (
        <span className="text-muted-foreground">
          {format(new Date(asset.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (asset: Asset) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => showQRCode(asset)}>
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadQR(asset)}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(asset)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Inventory"
        description="Manage and track all your organization's assets"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Create a new asset to track in your inventory
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., MacBook Pro 16"
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="e.g., Laptop"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="serial">Serial Number</Label>
                  <Input
                    id="serial"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="e.g., SN123456"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Office 3A, Building B"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details about the asset..."
                  className="mt-1.5"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Asset</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Assets Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <DataTable
          data={filteredAssets}
          columns={columns}
          isLoading={loading}
          emptyMessage="No assets found. Add your first asset to get started."
        />
      </motion.div>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Asset QR Code</DialogTitle>
            <DialogDescription>{selectedAsset?.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {selectedAsset && (
              <>
                <div className="rounded-xl border border-border bg-background p-4">
                  <QRCodeSVG
                    value={selectedAsset ? generateReportUrl(selectedAsset) : ''}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Scan to report issues for this asset
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
