import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Trash2, Edit2, Loader } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AccountTier {
  id: string;
  org_id: string;
  max_assets: number;
  tier_name: string;
  description: string | null;
  created_at: string;
  organization?: {
    name: string;
  } | null;
}

interface Organization {
  id: string;
  name: string;
}

export function AdminTierManagement() {
  const [tiers, setTiers] = useState<AccountTier[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<AccountTier | null>(null);
  const [formData, setFormData] = useState({
    org_id: '',
    max_assets: '5',
    tier_name: '',
    description: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTiers();
    fetchOrganizations();
  }, []);

  const fetchTiers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('account_tiers')
        .select(`
          *,
          organization:org_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch account tiers',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleDialogOpen = (tier?: AccountTier) => {
    if (tier) {
      setSelectedTier(tier);
      setFormData({
        org_id: tier.org_id,
        max_assets: tier.max_assets.toString(),
        tier_name: tier.tier_name,
        description: tier.description || '',
      });
    } else {
      setSelectedTier(null);
      setFormData({
        org_id: '',
        max_assets: '5',
        tier_name: '',
        description: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.org_id || !formData.tier_name || !formData.max_assets) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields',
      });
      return;
    }

    const maxAssets = parseInt(formData.max_assets, 10);
    if (isNaN(maxAssets) || maxAssets < 1) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Max assets must be a positive number',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (selectedTier) {
        // Update existing tier
        const { error } = await supabase
          .from('account_tiers')
          .update({
            max_assets: maxAssets,
            tier_name: formData.tier_name,
            description: formData.description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTier.id);

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Account tier updated successfully',
        });
      } else {
        // Create new tier
        const { error } = await supabase
          .from('account_tiers')
          .insert({
            org_id: formData.org_id,
            max_assets: maxAssets,
            tier_name: formData.tier_name,
            description: formData.description || null,
            created_by: (await supabase.auth.getUser()).data.user?.id || '',
          });

        if (error) throw error;
        toast({
          title: 'Success',
          description: 'Account tier created successfully',
        });
      }

      setIsDialogOpen(false);
      fetchTiers();
    } catch (error) {
      console.error('Error saving tier:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save account tier',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTier) return;

    try {
      const { error } = await supabase
        .from('account_tiers')
        .delete()
        .eq('id', selectedTier.id);

      if (error) throw error;
      toast({
        title: 'Success',
        description: 'Account tier deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      fetchTiers();
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete account tier',
      });
    }
  };

  const filteredTiers = tiers.filter(tier =>
    tier.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tier.tier_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-foreground font-serif">Account Tier Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage custom asset limits for organizations. Set higher limits for demo or premium accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Add Button */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by organization or tier name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleDialogOpen()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Tier
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-serif">
                      {selectedTier ? 'Edit Account Tier' : 'Create New Account Tier'}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedTier
                        ? 'Update the tier settings for this organization'
                        : 'Set custom asset limits for an organization'}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-select">Organization *</Label>
                      <select
                        id="org-select"
                        value={formData.org_id}
                        onChange={(e) => setFormData({ ...formData, org_id: e.target.value })}
                        disabled={!!selectedTier}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      >
                        <option value="">Select an organization...</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tier-name">Tier Name *</Label>
                      <Input
                        id="tier-name"
                        placeholder="e.g., Demo, Premium Demo, Custom"
                        value={formData.tier_name}
                        onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-assets">Maximum Assets *</Label>
                      <Input
                        id="max-assets"
                        type="number"
                        min="1"
                        value={formData.max_assets}
                        onChange={(e) => setFormData({ ...formData, max_assets: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Optional notes about this tier..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving && <Loader className="h-4 w-4 mr-2 animate-spin inline" />}
                        {isSaving ? (selectedTier ? 'Updating...' : 'Creating...') : (selectedTier ? 'Update' : 'Create')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading tiers...</div>
            ) : filteredTiers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No tiers found matching your search' : 'No account tiers created yet'}
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-foreground">Organization</TableHead>
                      <TableHead className="text-foreground">Tier Name</TableHead>
                      <TableHead className="text-foreground">Max Assets</TableHead>
                      <TableHead className="text-foreground">Description</TableHead>
                      <TableHead className="text-foreground text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTiers.map((tier) => (
                      <TableRow key={tier.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">
                          {tier.organization?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-foreground">{tier.tier_name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {tier.max_assets}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {tier.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDialogOpen(tier)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTier(tier);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account Tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tier for "{selectedTier?.organization?.name}"? Users will revert to their plan limits.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
