import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, AlertCircle, MoreHorizontal, Trash2, Edit, CheckCircle, XCircle, Calendar, Clock, ArrowDownToLine, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Issue, Asset, IssueStatus, IssuePriority } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type IssueWithAsset = Issue & {
  revenue_impact?: 'high' | 'low';
  asset?: {
    name: string;
    location?: string | null;
    asset_type?: {
      name: string;
    } | null;
  } | null;
};

export default function Issues() {
  const { organization, membership, isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<IssueWithAsset[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState<Issue | null>(null);
  const [issueDetailOpen, setIssueDetailOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueWithAsset | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_id: '',
    priority: 'medium' as IssuePriority,
  });
  const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

  const fetchIssues = useCallback(async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          asset:assets (
            name,
            location,
            asset_type:asset_types (
              name
            )
          )
        `)
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues((data as unknown as IssueWithAsset[]) || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  const fetchAssets = useCallback(async () => {
    if (!organization) return;

    try {
      const { data } = await supabase
        .from('assets')
        .select('*')
        .eq('org_id', organization.id)
        .eq('status', 'active');

      setAssets((data as Asset[]) || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
      fetchIssues();
      fetchAssets();
    }
  }, [organization, fetchIssues, fetchAssets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization || !user) return;

    try {
      const issueData = {
        ...formData,
        org_id: organization.id,
        reported_by: user.id,
        asset_id: formData.asset_id || null,
      };

      const { error } = await supabase.from('issues').insert(issueData);

      if (error) throw error;

      toast({ title: 'Issue reported successfully' });
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        asset_id: '',
        priority: 'medium',
      });
      fetchIssues();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to report issue',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleStatusChange = async (issue: Issue, newStatus: IssueStatus) => {
    try {
      const updateData: Partial<Issue> = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', issue.id);

      if (error) throw error;
      toast({ title: `Issue marked as ${newStatus.replace('_', ' ')}` });
      fetchIssues();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to update issue',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleImpactChange = async (issue: Issue, newImpact: 'high' | 'low') => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ revenue_impact: newImpact } as any)
        .eq('id', issue.id);

      if (error) throw error;
      toast({ title: `Revenue Impact set to ${newImpact.toUpperCase()}` });
      fetchIssues();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to update impact',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openIssueDetails = useCallback((issue: IssueWithAsset) => {
    setSelectedIssue(issue);
    setIssueDetailOpen(true);
  }, []);

  const handleDelete = async () => {
    if (!issueToDelete) return;
    try {
      const { error } = await supabase.from('issues').delete().eq('id', issueToDelete.id);
      if (error) throw error;
      toast({ title: 'Issue deleted successfully' });
      fetchIssues();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete issue',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIssueToDelete(null);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const columns = [
    {
      key: 'title',
      header: 'Issue',
      className: 'max-w-xs',
      render: (issue: IssueWithAsset) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{issue.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              {issue.description || 'No description'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'asset_type',
      header: 'Asset Name',
      render: (issue: IssueWithAsset) => (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/5 text-primary/80 border border-primary/10">
          {issue.asset?.asset_type?.name || 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'revenue_impact',
      header: 'Revenue Impact',
      render: (issue: IssueWithAsset) => (
        <Badge 
          className={cn(
            "uppercase text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full border shadow-sm transition-all duration-300",
            issue.revenue_impact === 'high' 
              ? "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20" 
              : "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
          )}
          variant="outline"
        >
          {issue.revenue_impact || 'low'}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (issue: Issue) => <StatusBadge status={issue.priority} type="priority" />,
    },
    {
      key: 'status',
      header: 'Status',
      className: 'whitespace-nowrap',
      render: (issue: Issue) => <StatusBadge status={issue.status} type="issue" />,
    },
    {
      key: 'created_at',
      header: 'Reported',
      render: (issue: Issue) => (
        <span className="text-muted-foreground">
          {format(new Date(issue.created_at), 'MMM d, yyyy')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (issue: Issue) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleStatusChange(issue, 'in_progress'); }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Mark In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleStatusChange(issue, 'resolved'); }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Resolved
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleStatusChange(issue, 'closed'); }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Mark Closed
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Triage Impact
            </div>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleImpactChange(issue, 'high'); }}
            >
              <div className="h-2 w-2 rounded-full bg-destructive mr-2" />
              High Impact
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); handleImpactChange(issue, 'low'); }}
            >
              <div className="h-2 w-2 rounded-full bg-primary mr-2" />
              Low Impact
            </DropdownMenuItem>

            {(isAdmin || membership?.role === 'owner' || membership?.role === 'admin') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); setIssueToDelete(issue); }}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Issues"
        description="Track and resolve problems across your organization"
      >
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Report New Issue</DialogTitle>
              <DialogDescription>
                Describe the problem you've encountered
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Issue Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  required
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asset">Related Asset</Label>
                  <Select
                    value={formData.asset_id || "none"}
                    onValueChange={(value) => setFormData({ ...formData, asset_id: value === "none" ? "" : value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({ ...formData, priority: value as IssuePriority })
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide more details about the issue..."
                  className="mt-1.5"
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Issue</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Tabs & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Issues Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <DataTable
          data={filteredIssues}
          columns={columns}
          isLoading={loading}
          emptyMessage="No issues found. That's great news!"
          onRowClick={openIssueDetails}
        />
      </motion.div>
      {/* Issue Detail Dialog */}
      <Dialog
        open={issueDetailOpen}
        onOpenChange={(open) => {
          setIssueDetailOpen(open);
          if (!open) {
            setSelectedIssue(null);
            setPhotoPreviewOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>{selectedIssue?.title}</DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="overflow-y-auto scrollbar-hide min-h-0 flex-1">
            <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
              {/* Left panel — core metadata */}
              <div className="rounded-xl border border-border/50 bg-card p-4 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedIssue.status} type="issue" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Priority</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedIssue.priority} type="priority" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Revenue Impact</p>
                  <div className="mt-1">
                    <Badge
                      className={cn(
                        "uppercase text-[10px] font-bold tracking-tight px-2 py-0.5 rounded-full border",
                        selectedIssue.revenue_impact === 'high'
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                          : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      )}
                      variant="outline"
                    >
                      {selectedIssue.revenue_impact || 'low'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Asset</p>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedIssue.asset?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Asset Type</p>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedIssue.asset?.asset_type?.name || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Asset Location</p>
                  <p className="text-sm font-medium mt-0.5">
                    {selectedIssue.asset?.location || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Right panel — description + dates + photo */}
              <div className="min-w-0 rounded-xl border border-border/50 bg-card p-4 space-y-4">
                {/* Parse structured JSON description (new format) or fall back to raw text */}
                {(() => {
                  let parsed: { note?: string | null; issue_type?: string | null; reporter_name?: string | null; reporter_contact?: string | null; photo_url?: string | null } | null = null;
                  try { if (selectedIssue.description) parsed = JSON.parse(selectedIssue.description); } catch { /* legacy plain text */ }

                  if (parsed) {
                    return (
                      <>
                        {parsed.issue_type && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Issue Type</p>
                            <p className="text-sm font-medium mt-0.5">{parsed.issue_type}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Description</p>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-words">
                            {parsed.note || 'No description provided.'}
                          </p>
                        </div>
                        {parsed.reporter_name && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Reported By</p>
                            <p className="text-sm font-medium mt-0.5">{parsed.reporter_name}</p>
                          </div>
                        )}
                        {parsed.reporter_contact && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Contact</p>
                            <p className="text-sm font-medium mt-0.5 break-words">{parsed.reporter_contact}</p>
                          </div>
                        )}
                      </>
                    );
                  }

                  // Legacy plain-text description (old issues)
                  return (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Description</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line break-words">
                        {selectedIssue.description?.trim() || 'No description provided.'}
                      </p>
                    </div>
                  );
                })()}

                {/* Photo Evidence */}
                {(() => {
                  let photoUrl: string | null | undefined = null;
                  try { if (selectedIssue.description) photoUrl = JSON.parse(selectedIssue.description)?.photo_url; } catch { photoUrl = selectedIssue.description?.match(/Photo: (https?:\/\/\S+)/)?.[1]; }
                  if (!photoUrl) return null;
                  return (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Photo Evidence</p>
                      <button
                        type="button"
                        className="w-full overflow-hidden rounded-lg border border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setPhotoPreviewOpen(true)}
                        aria-label="View full-size photo"
                      >
                        <img
                          src={photoUrl}
                          alt="Issue photo evidence"
                          className="w-full object-cover max-h-[240px] rounded-lg cursor-pointer transition-opacity hover:opacity-90"
                        />
                      </button>
                      <a
                        href={photoUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 w-full justify-center rounded-md border border-border/50 bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ArrowDownToLine className="h-4 w-4" />
                        Download Photo
                      </a>

                      {/* Full-screen preview overlay */}
                      {photoPreviewOpen && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                          onClick={() => setPhotoPreviewOpen(false)}
                          role="dialog"
                          aria-modal="true"
                          aria-label="Full-size photo preview"
                        >
                          <button
                            type="button"
                            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={(e) => { e.stopPropagation(); setPhotoPreviewOpen(false); }}
                            aria-label="Close preview"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <img
                            src={photoUrl}
                            alt="Issue photo evidence — full size"
                            className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <p className="text-xs font-medium text-muted-foreground">Reported</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {format(new Date(selectedIssue.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                {selectedIssue.resolved_at && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Resolved</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {format(new Date(selectedIssue.resolved_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!issueToDelete} onOpenChange={(open) => !open && setIssueToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Issue</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">"{issueToDelete?.title}"</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
