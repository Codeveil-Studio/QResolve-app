import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, PieChart as PieIcon, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['hsl(217, 91%, 45%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

// Mock data for charts
const issuesByPriority = [
  { name: 'Critical', value: 8, color: 'hsl(0, 84%, 60%)' },
  { name: 'High', value: 15, color: 'hsl(38, 92%, 50%)' },
  { name: 'Medium', value: 32, color: 'hsl(217, 91%, 45%)' },
  { name: 'Low', value: 45, color: 'hsl(142, 76%, 36%)' },
];

const issuesTrend = [
  { month: 'Jan', opened: 45, resolved: 38 },
  { month: 'Feb', opened: 52, resolved: 48 },
  { month: 'Mar', opened: 38, resolved: 42 },
  { month: 'Apr', opened: 65, resolved: 55 },
  { month: 'May', opened: 48, resolved: 52 },
  { month: 'Jun', opened: 55, resolved: 58 },
];

const assetsByStatus = [
  { status: 'Active', count: 156 },
  { status: 'Inactive', count: 23 },
  { status: 'Maintenance', count: 12 },
  { status: 'Retired', count: 45 },
];

const resolutionTime = [
  { category: 'Critical', avgDays: 0.5 },
  { category: 'High', avgDays: 1.2 },
  { category: 'Medium', avgDays: 2.8 },
  { category: 'Low', avgDays: 5.4 },
];

export default function Reports() {
  const { organization } = useAuth();
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalIssues: 0,
    resolvedIssues: 0,
    avgResolutionDays: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!organization) return;

    try {
      const [assetsRes, issuesRes, resolvedRes] = await Promise.all([
        supabase.from('assets').select('*', { count: 'exact', head: true }).eq('org_id', organization.id),
        supabase.from('issues').select('*', { count: 'exact', head: true }).eq('org_id', organization.id),
        supabase.from('issues').select('*', { count: 'exact', head: true }).eq('org_id', organization.id).eq('status', 'resolved'),
      ]);

      setStats({
        totalAssets: assetsRes.count || 0,
        totalIssues: issuesRes.count || 0,
        resolvedIssues: resolvedRes.count || 0,
        avgResolutionDays: 2.3, // Mock
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
      fetchStats();
    }
  }, [organization, fetchStats]);

  const cardStyle = {
    boxShadow: 'var(--shadow-card)',
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        description="Analytics and insights for your organization"
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total Assets', value: stats.totalAssets, icon: BarChart3, change: '+12%', positive: true },
          { label: 'Total Issues', value: stats.totalIssues, icon: TrendingUp, change: '+8%', positive: false },
          { label: 'Resolved Issues', value: stats.resolvedIssues, icon: TrendingDown, change: '+23%', positive: true },
          { label: 'Avg Resolution', value: `${stats.avgResolutionDays}d`, icon: Calendar, change: '-15%', positive: true },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="rounded-xl border border-border/50 bg-card p-6"
            style={cardStyle}
          >
            <div className="flex items-center justify-between">
              <stat.icon className="h-5 w-5 text-muted-foreground" />
              <span className={`text-sm font-medium ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                {stat.change}
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Issues Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-lg font-semibold mb-1">Issue Trends</h3>
          <p className="text-sm text-muted-foreground mb-6">Monthly opened vs resolved</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={issuesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  stroke="hsl(217, 91%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(217, 91%, 45%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Issues by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-lg font-semibold mb-1">Issues by Priority</h3>
          <p className="text-sm text-muted-foreground mb-6">Distribution of open issues</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issuesByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {issuesByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Assets by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-lg font-semibold mb-1">Assets by Status</h3>
          <p className="text-sm text-muted-foreground mb-6">Current inventory breakdown</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetsByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="status" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(217, 91%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Resolution Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-lg font-semibold mb-1">Average Resolution Time</h3>
          <p className="text-sm text-muted-foreground mb-6">Days to resolve by priority</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resolutionTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value} days`, 'Avg Time']}
                />
                <Bar dataKey="avgDays" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
