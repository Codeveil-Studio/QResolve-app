import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, AlertCircle, MoreHorizontal, Trash2, Edit, CheckCircle } from 'lucide-react';
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

export default function Issues() {
  const { organization, user } = useAuth();
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    asset_id: '',
    priority: 'medium' as IssuePriority,
  });

  const fetchIssues = useCallback(async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues((data as Issue[]) || []);
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

  const handleDelete = async (issue: Issue) => {
    if (!confirm('Are you sure you want to delete this issue?')) return;

    try {
      const { error } = await supabase.from('issues').delete().eq('id', issue.id);
      if (error) throw error;
      toast({ title: 'Issue deleted successfully' });
      fetchIssues();
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete issue',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
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
      render: (issue: Issue) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="font-medium">{issue.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {issue.description || 'No description'}
            </p>
          </div>
        </div>
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
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange(issue, 'in_progress')}>
              <Edit className="mr-2 h-4 w-4" />
              Mark In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(issue, 'resolved')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark Resolved
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDelete(issue)}
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
                    value={formData.asset_id}
                    onValueChange={(value) => setFormData({ ...formData, asset_id: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
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
        />
      </motion.div>
    </DashboardLayout>
  );
}
