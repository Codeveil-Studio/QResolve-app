import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, QrCode, MapPin, MoreHorizontal, Trash2, Edit, Download, Printer, X as XIcon } from 'lucide-react';
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
import { AssetQRPDFTemplateMinimal } from '@/components/assets/AssetQRPDFTemplateMinimal';
import { AssetQRPDFTemplateBold } from '@/components/assets/AssetQRPDFTemplateBold';
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
import { Asset, AssetStatus, Issue } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { getPlan } from '@/lib/subscription';

type AssetTypeOption = {
  id: string;
  name: string;
};

type AssetWithType = Asset & {
  asset_type?: { name: string } | null;
  asset_type_id?: string | null;
  issue_types?: string[] | null;
};

type QRTemplateId = 'classic' | 'minimal' | 'bold';
type QRTemplateAction = 'download' | 'print';

export default function Assets() {
  const { organization, user } = useAuth();
  const { toast } = useToast();
  const [assets, setAssets] = useState<AssetWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetWithType | null>(null);
  const [assetIssues, setAssetIssues] = useState<Issue[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    location: '',
    serial_number: '',
    status: 'active' as AssetStatus,
    issue_types: [] as string[],
    asset_type_id: '',
  });
  const [currentIssueType, setCurrentIssueType] = useState('');
  const [assetTypes, setAssetTypes] = useState<AssetTypeOption[]>([]);
  const [qrTemplateDialogOpen, setQrTemplateDialogOpen] = useState(false);
  const [qrTemplateAction, setQrTemplateAction] = useState<QRTemplateAction | null>(null);
  const [qrTemplateAsset, setQrTemplateAsset] = useState<AssetWithType | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          *,
          asset_type:asset_types(name)
        `)
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets((data as unknown as AssetWithType[]) || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  const fetchAssetTypes = useCallback(async () => {
    if (!organization) return;
    const { data } = await supabase
      .from('asset_types')
      .select('id, name')
      .eq('org_id', organization.id)
      .order('name');
    setAssetTypes(data || []);
  }, [organization]);

  const fetchSubscription = useCallback(async () => {
    if (!organization) return;
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('org_id', organization.id)
      .maybeSingle();
    setSubscription(data);
  }, [organization]);

  useEffect(() => {
    if (organization) {
      fetchAssets();
      fetchAssetTypes();
      fetchSubscription();
    }
  }, [organization, fetchAssets, fetchAssetTypes, fetchSubscription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !user) return;

    // Check Plan Limits only for new assets
    if (!editingAssetId) {
      const currentPlan = getPlan(subscription?.status, assets.length);
      if (assets.length >= currentPlan.maxAssets) {
        toast({
          variant: 'destructive',
          title: 'Limit Reached',
          description: `Your ${subscription?.status || 'trial'} plan is limited to ${currentPlan.maxAssets} assets. Please upgrade in Settings to add more.`,
        });
        return;
      }
    }

    try {
      const assetData = {
        name: formData.name,
        description: formData.description.trim() || null,
        type: formData.type,
        asset_type_id: formData.asset_type_id || null,
        location: formData.location,
        serial_number: formData.serial_number,
        status: formData.status,
        issue_types: formData.issue_types.includes('Others') ? formData.issue_types : [...formData.issue_types, 'Others'],
      };

      if (editingAssetId) {
        // Update existing asset
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', editingAssetId);

        if (error) throw error;
        toast({ title: 'Asset updated successfully' });
      } else {
        // Create new asset
        const { error } = await supabase.from('assets').insert({
          ...assetData,
          org_id: organization.id,
          created_by: user.id,
        });

        if (error) throw error;
        toast({ title: 'Asset created successfully' });
      }

      setDialogOpen(false);
      setEditingAssetId(null);
      setFormData({
        name: '',
        description: '',
        type: '',
        location: '',
        serial_number: '',
        status: 'active',
        issue_types: [],
        asset_type_id: '',
      });
      fetchAssets();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: editingAssetId ? 'Failed to update asset' : 'Failed to create asset',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleAddIssueType = () => {
    if (currentIssueType.trim()) {
      if (!formData.issue_types.includes(currentIssueType.trim())) {
        setFormData({
          ...formData,
          issue_types: [...formData.issue_types, currentIssueType.trim()]
        });
      }
      setCurrentIssueType('');
    }
  };

  const handleRemoveIssueType = (tag: string) => {
    setFormData({
      ...formData,
      issue_types: formData.issue_types.filter(t => t !== tag)
    });
  };

  const handleAssetTypeChange = async (assetTypeId: string) => {
    setFormData(prev => ({ ...prev, asset_type_id: assetTypeId }));
    if (!assetTypeId) return;

    try {
      const { data } = await supabase
        .from('asset_types')
        .select('issue_types')
        .eq('id', assetTypeId)
        .single();

      if (data?.issue_types?.length > 0) {
        setFormData(prev => ({ ...prev, issue_types: data.issue_types }));
      }
    } catch (error) {
      console.error('Error fetching asset type templates:', error);
    }
  };

  const handleDelete = async (asset: AssetWithType) => {
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

  const openEditDialog = (asset: AssetWithType) => {
    setEditingAssetId(asset.id);
    setFormData({
      name: asset.name,
      description: asset.description || '',
      type: asset.type || '',
      location: asset.location || '',
      serial_number: asset.serial_number || '',
      status: asset.status,
      issue_types: asset.issue_types || [],
      asset_type_id: asset.asset_type_id || '',
    });
    setCurrentIssueType('');
    setDialogOpen(true);
  };

  const showQRCode = (asset: AssetWithType) => {
    setSelectedAsset(asset);
    setQrDialogOpen(true);
  };

  const openAssetDetails = useCallback(
    async (asset: AssetWithType) => {
      setSelectedAsset(asset);
      setAssetDialogOpen(true);
      if (!organization) return;

      setIssuesLoading(true);
      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .eq('org_id', organization.id)
          .eq('asset_id', asset.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAssetIssues((data as Issue[]) || []);
      } catch (error: unknown) {
        toast({
          variant: 'destructive',
          title: 'Failed to load asset issues',
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        setIssuesLoading(false);
      }
    },
    [organization, toast]
  );

  const getQRTemplateElement = (templateId: QRTemplateId, asset: AssetWithType, qrUrl: string) => {
    switch (templateId) {
      case 'minimal':
        return <AssetQRPDFTemplateMinimal asset={asset} qrUrl={qrUrl} />;
      case 'bold':
        return <AssetQRPDFTemplateBold asset={asset} qrUrl={qrUrl} />;
      case 'classic':
      default:
        return <AssetQRPDFTemplate asset={asset} qrUrl={qrUrl} />;
    }
  };

  const openQRTemplatePicker = (action: QRTemplateAction, asset: AssetWithType) => {
    setQrTemplateAction(action);
    setQrTemplateAsset(asset);
    setQrTemplateDialogOpen(true);
  };

  const qrTemplates: Array<{ id: QRTemplateId; title: string; subtitle: string }> = [
    { id: 'classic', title: 'Classic', subtitle: 'Yellow branded (current)' },
    { id: 'minimal', title: 'Minimal', subtitle: 'Clean white layout' },
    { id: 'bold', title: 'Bold', subtitle: 'Dark + neon accent' },
  ];

  const handleQRTemplateSelect = (templateId: QRTemplateId) => {
    const asset = qrTemplateAsset;
    const action = qrTemplateAction;
    setQrTemplateDialogOpen(false);
    setQrTemplateAsset(null);
    setQrTemplateAction(null);

    if (!asset || !action) return;

    if (action === 'download') {
      void downloadQR(asset, templateId);
      return;
    }

    const printWindow = window.open('about:blank', '_blank');
    if (printWindow) {
      injectPrintPlaceholder(printWindow);
      void printQRIntoWindow(asset, printWindow, templateId);
      return;
    }

    toast({
      title: 'Pop-up blocked',
      description: 'Using in-page print instead.',
    });
    void printQRInIframe(asset, templateId);
  };

  const downloadQR = async (asset: AssetWithType, templateId: QRTemplateId) => {
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
    root.render(getQRTemplateElement(templateId, asset, qrUrl));
    
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const element = container.firstElementChild as HTMLElement;
    
    const opt = {
      margin: 0,
      filename: `${asset.name.replace(/\s+/g, '_')}-QR-${templateId}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, windowWidth: 560, windowHeight: 794 },
      jsPDF: { unit: 'mm' as const, format: 'a5' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

  const injectPrintPlaceholder = (printWindow: Window) => {
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Generating QR Code...</title>
      <style>
        html, body { margin: 0; padding: 0; height: 100%; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .wrap { height: 100%; display: grid; place-items: center; background: #0b1220; color: #e2e8f0; }
        .card { text-align: center; padding: 24px 20px; border: 1px solid rgba(148,163,184,0.2); border-radius: 12px; background: rgba(15,23,42,0.8); }
        .spinner { width: 28px; height: 28px; border-radius: 9999px; border: 3px solid rgba(226,232,240,0.25); border-top-color: #06d6a0; margin: 0 auto 12px; animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </head><body><div class="wrap"><div class="card"><div class="spinner"></div><div>Generating QR Code…</div></div></div></body></html>`);
    printWindow.document.close();
  };

  const getPrintDocumentHTML = (title: string) => `<!doctype html><html><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.svg" />
    <style>
      @page { size: A5 portrait; margin: 0; }
      * { box-sizing: border-box; }
      html, body { width: 148mm; height: 210mm; margin: 0; padding: 0; overflow: hidden; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      #root { width: 148mm; height: 210mm; overflow: hidden; }
    </style>
  </head><body><div id="root"></div></body></html>`;

  const printQRIntoWindow = async (asset: AssetWithType, printWindow: Window, templateId: QRTemplateId) => {
    try {
      const qrUrl = generateReportUrl(asset);

      printWindow.document.open();
      printWindow.document.write(getPrintDocumentHTML(`${asset.name} QR`));
      printWindow.document.close();

      const mountNode = printWindow.document.getElementById('root');
      if (!mountNode) throw new Error('Failed to mount print template');

      const root = createRoot(mountNode);
      root.render(getQRTemplateElement(templateId, asset, qrUrl));

      await new Promise(resolve => setTimeout(resolve, 500));

      const cleanup = () => {
        root.unmount();
        if (!printWindow.closed) {
          printWindow.close();
        }
      };

      printWindow.onafterprint = cleanup;
      printWindow.focus();
      printWindow.print();

      setTimeout(cleanup, 2000);
    } catch (error) {
      if (!printWindow.closed) {
        printWindow.close();
      }
      toast({
        variant: 'destructive',
        title: 'Failed to print QR code',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const printQRInIframe = async (asset: AssetWithType, templateId: QRTemplateId) => {
    const qrUrl = generateReportUrl(asset);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.border = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframe.contentDocument;

    if (!iframeWindow || !iframeDocument) {
      iframe.remove();
      toast({
        variant: 'destructive',
        title: 'Failed to print QR code',
        description: 'Print frame could not be initialized.',
      });
      return;
    }

    try {
      iframeDocument.open();
      iframeDocument.write(getPrintDocumentHTML(`${asset.name} QR`));
      iframeDocument.close();

      const mountNode = iframeDocument.getElementById('root');
      if (!mountNode) throw new Error('Failed to mount print template');

      const root = createRoot(mountNode);
      root.render(getQRTemplateElement(templateId, asset, qrUrl));

      await new Promise(resolve => setTimeout(resolve, 500));

      const cleanup = () => {
        root.unmount();
        iframe.remove();
      };

      iframeWindow.onafterprint = cleanup;
      iframeWindow.focus();
      iframeWindow.print();

      setTimeout(cleanup, 2000);
    } catch (error) {
      iframe.remove();
      toast({
        variant: 'destructive',
        title: 'Failed to print QR code',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
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
      render: (asset: AssetWithType) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{asset.name}</p>
            <p className="text-sm text-muted-foreground">{asset.asset_type?.name || asset.type || 'No type'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (asset: AssetWithType) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {asset.location || 'Not specified'}
        </div>
      ),
    },
    {
      key: 'serial_number',
      header: 'Serial No.',
      render: (asset: AssetWithType) => (
        <span className="font-mono text-sm">{asset.serial_number || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (asset: AssetWithType) => <StatusBadge status={asset.status} type="asset" />,
    },
    {
      key: 'created_at',
      header: 'Added',
      render: (asset: AssetWithType) => (
        <span className="text-muted-foreground">
          {format(new Date(asset.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (asset: AssetWithType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(event) => event.stopPropagation()}
              >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                showQRCode(asset);
              }}
            >
              <QrCode className="mr-2 h-4 w-4" />
              View QR Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                openQRTemplatePicker('download', asset);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                openQRTemplatePicker('print', asset);
              }}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print QR Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                openEditDialog(asset);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                handleDelete(asset);
              }}
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
        <Dialog 
          open={dialogOpen} 
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingAssetId(null);
              setFormData({
                name: '',
                description: '',
                type: '',
                location: '',
                serial_number: '',
                status: 'active',
                issue_types: [],
                asset_type_id: '',
              });
              setCurrentIssueType('');
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingAssetId ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
              <DialogDescription>
                {editingAssetId ? 'Update the asset details' : 'Create a new asset to track in your inventory'}
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
              
              <div>
                <Label htmlFor="asset_type">Asset Type</Label>
                <Select
                  value={formData.asset_type_id}
                  onValueChange={handleAssetTypeChange}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Asset Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {assetTypes.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No asset types found. Create one in the "Asset Types" tab.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issue_types">Issue Types (Tags)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="issue_types"
                      value={currentIssueType}
                      onChange={(e) => setCurrentIssueType(e.target.value)}
                      placeholder="e.g. Screen, Battery"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddIssueType();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddIssueType} variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.issue_types.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <XIcon 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => handleRemoveIssueType(tag)}
                        />
                      </Badge>
                    ))}
                    {formData.issue_types.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">No issue types added</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="serial">Serial Number</Label>
                  <Input
                    id="serial"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    placeholder="e.g., SN123456"
                    className="mt-1.5"
                    required
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as AssetStatus })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description <span className="text-xs font-normal text-muted-foreground">(Optional)</span></Label>
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
                <Button type="submit">{editingAssetId ? 'Update Asset' : 'Create Asset'}</Button>
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
          onRowClick={openAssetDetails}
        />
      </motion.div>

      <Dialog
        open={assetDialogOpen}
        onOpenChange={(open) => {
          setAssetDialogOpen(open);
          if (!open) {
            setAssetIssues([]);
            setIssuesLoading(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Asset Details</DialogTitle>
            <DialogDescription>{selectedAsset?.name}</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide min-h-0 flex-1">
          <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">
                    {selectedAsset?.asset_type?.name || selectedAsset?.type || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{selectedAsset?.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Serial Number</p>
                  <p className="text-sm font-medium">{selectedAsset?.serial_number || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  {selectedAsset && <StatusBadge status={selectedAsset.status} type="asset" />}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Added</p>
                  <p className="text-sm font-medium">
                    {selectedAsset ? format(new Date(selectedAsset.created_at), 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <p className="text-sm text-muted-foreground break-words">
                    {selectedAsset?.description || 'No description'}
                  </p>
                </div>
              </div>
            </div>
            <div className="min-w-0 rounded-xl border border-border/50 bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Reported Issues</p>
                <span className="text-xs text-muted-foreground">{assetIssues.length}</span>
              </div>
              {issuesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : assetIssues.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No issues reported for this asset yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {assetIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-border/50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{issue.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {issue.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(issue.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={issue.priority} type="priority" />
                        <StatusBadge status={issue.status} type="issue" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={qrTemplateDialogOpen} onOpenChange={setQrTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose QR Template</DialogTitle>
            <DialogDescription>
              {qrTemplateAction === 'print' ? 'Select a template to print.' : 'Select a template to download as PDF.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
            {qrTemplates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleQRTemplateSelect(t.id)}
                className="group text-left rounded-xl border border-border/50 bg-card hover:border-border hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="px-4 pt-4">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.subtitle}</div>
                </div>
                <div className="p-4 pt-3">
                  <div className="relative h-56 overflow-hidden rounded-lg border border-border/50 bg-muted/10">
                    {qrTemplateAsset ? (
                      <div
                        style={{
                          width: '148mm',
                          height: '210mm',
                          transform: 'scale(0.23)',
                          transformOrigin: 'top left',
                        }}
                      >
                        {getQRTemplateElement(t.id, qrTemplateAsset, generateReportUrl(qrTemplateAsset))}
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                        Loading…
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Asset QR Code</DialogTitle>
            <DialogDescription>{selectedAsset?.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {selectedAsset && (
              <>
                {/* Outer styled ring — purely decorative, never clips the QR */}
                <div className="rounded-xl border border-border bg-muted p-3">
                  {/* Inner white quiet-zone container — white background is required by QR spec */}
                  <div className="rounded-md bg-white p-4">
                    <QRCodeSVG
                      value={selectedAsset ? generateReportUrl(selectedAsset) : ''}
                      size={200}
                      level="H"
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
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
