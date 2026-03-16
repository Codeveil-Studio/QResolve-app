import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  AlertCircle, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Asset, Issue } from '@/lib/supabase-types';
import { format, startOfDay, subDays, addDays, isValid } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type IssueTrendPoint = { name: string; issues: number; resolved: number };

const buildEmptyWeek = (startDate: Date): IssueTrendPoint[] => {
  return Array.from({ length: 7 }).map((_, idx) => {
    const day = addDays(startDate, idx);
    return { name: format(day, 'EEE'), issues: 0, resolved: 0 };
  });
};

export default function Dashboard() {
  const { organization, profile } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 0,
    activeIssues: 0,
    criticalAlerts: 0,
    resolvedThisWeek: 0,
    resolvedTrendPct: 0,
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [issueTrendData, setIssueTrendData] = useState<IssueTrendPoint[]>(() =>
    buildEmptyWeek(startOfDay(subDays(new Date(), 6)))
  );
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!organization) return;

    try {
      const startThisWeek = startOfDay(subDays(new Date(), 6));
      const startLastWeek = startOfDay(subDays(startThisWeek, 7));

      // Fetch assets count
      const { count: assetsCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', organization.id);

      // Fetch open issues count
      const { count: openIssues } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', organization.id)
        .in('status', ['open', 'in_progress']);

      // Fetch critical issues count
      const { count: criticalCount } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', organization.id)
        .eq('priority', 'critical')
        .neq('status', 'closed');

      const { data: newIssuesThisWeek, error: newIssuesErr } = await supabase
        .from('issues')
        .select('created_at')
        .eq('org_id', organization.id)
        .gte('created_at', startThisWeek.toISOString());
      if (newIssuesErr) throw newIssuesErr;

      const { data: resolvedThisWeekRows, error: resolvedThisWeekErr } = await supabase
        .from('issues')
        .select('resolved_at, updated_at, status')
        .eq('org_id', organization.id)
        .in('status', ['resolved', 'closed'])
        .or(
          `resolved_at.gte.${startThisWeek.toISOString()},and(resolved_at.is.null,updated_at.gte.${startThisWeek.toISOString()})`
        );
      if (resolvedThisWeekErr) throw resolvedThisWeekErr;

      const { data: resolvedLastWeekRows, error: resolvedLastWeekErr } = await supabase
        .from('issues')
        .select('resolved_at, updated_at, status')
        .eq('org_id', organization.id)
        .in('status', ['resolved', 'closed'])
        .or(
          `and(resolved_at.gte.${startLastWeek.toISOString()},resolved_at.lt.${startThisWeek.toISOString()}),and(resolved_at.is.null,updated_at.gte.${startLastWeek.toISOString()},updated_at.lt.${startThisWeek.toISOString()})`
        );
      if (resolvedLastWeekErr) throw resolvedLastWeekErr;

      // Fetch recent issues
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .eq('org_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const weekly = buildEmptyWeek(startThisWeek);

      (newIssuesThisWeek || []).forEach((row: { created_at: string }) => {
        const d = startOfDay(new Date(row.created_at));
        if (!isValid(d)) return;
        const diff = Math.floor((d.getTime() - startThisWeek.getTime()) / (24 * 60 * 60 * 1000));
        if (diff >= 0 && diff < 7) weekly[diff].issues += 1;
      });

      (resolvedThisWeekRows || []).forEach((row: { resolved_at: string | null; updated_at: string; status: string }) => {
        const rawDate = row.resolved_at || row.updated_at;
        const d = startOfDay(new Date(rawDate));
        if (!isValid(d)) return;
        const diff = Math.floor((d.getTime() - startThisWeek.getTime()) / (24 * 60 * 60 * 1000));
        if (diff >= 0 && diff < 7) weekly[diff].resolved += 1;
      });

      const resolvedThisWeekCount = (resolvedThisWeekRows || []).length;
      const resolvedLastWeekCount = (resolvedLastWeekRows || []).length;
      const resolvedTrendPct =
        resolvedLastWeekCount === 0
          ? resolvedThisWeekCount > 0
            ? 100
            : 0
          : Math.round(((resolvedThisWeekCount - resolvedLastWeekCount) / resolvedLastWeekCount) * 100);

      setStats({
        totalAssets: assetsCount || 0,
        activeIssues: openIssues || 0,
        criticalAlerts: criticalCount || 0,
        resolvedThisWeek: resolvedThisWeekCount,
        resolvedTrendPct,
      });

      setIssueTrendData(weekly);
      setRecentIssues((issues as Issue[]) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
      fetchDashboardData();
    }
  }, [organization, fetchDashboardData]);

  // Real-time subscription
  useEffect(() => {
    if (!organization) return;

    const channel = supabase
      .channel('dashboard-issues')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
          filter: `org_id=eq.${organization.id}`,
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [organization, fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`${getGreeting()}, ${profile?.full_name?.split(' ')[0] || 'there'}!`}
        description={`Here's what's happening at ${organization?.name || 'your organization'}`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Assets"
          value={stats.totalAssets}
          description="Managed items"
          icon={Package}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Active Issues"
          value={stats.activeIssues}
          description="Open tickets"
          icon={AlertCircle}
          variant="warning"
          delay={0.1}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalAlerts}
          description="Needs attention"
          icon={AlertTriangle}
          variant="destructive"
          delay={0.2}
        />
        <StatCard
          title="Resolved This Week"
          value={stats.resolvedThisWeek}
          description={`${stats.resolvedTrendPct >= 0 ? '+' : ''}${stats.resolvedTrendPct}% from last week`}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: Math.abs(stats.resolvedTrendPct), isPositive: stats.resolvedTrendPct >= 0 }}
          delay={0.3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Issue Trends</h3>
              <p className="text-sm text-muted-foreground">Weekly overview</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                New Issues
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                Resolved
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={issueTrendData}>
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(217, 91%, 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="issues"
                  stroke="hsl(217, 91%, 45%)"
                  fillOpacity={1}
                  fill="url(#colorIssues)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="hsl(142, 76%, 36%)"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <h3 className="text-lg font-semibold">AI Insights</h3>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Maintenance Prediction</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    3 assets may need maintenance in the next 2 weeks based on usage patterns
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-success/5 border border-success/20 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Efficiency Improved</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Issue resolution time decreased by 23% this month
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Peak Hours Detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Most issues are reported between 9-11 AM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Issues */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-6 rounded-xl border border-border/50 bg-card"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h3 className="text-lg font-semibold">Recent Issues</h3>
            <p className="text-sm text-muted-foreground">Latest reported problems</p>
          </div>
          <a href="/issues" className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover">
            View all
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="divide-y divide-border/50">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No issues reported yet
            </div>
          ) : (
            recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{issue.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(issue.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={issue.priority} type="priority" />
                  <StatusBadge status={issue.status} type="issue" />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
