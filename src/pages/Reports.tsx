import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
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

// ── Theme-aligned chart color palette ──────────────────────────────────────
// All values map directly to the Forest Green CSS variable definitions in
// src/index.css so they remain consistent regardless of theme tweaks.
const CHART_COLORS = {
  primary: 'hsl(160, 84%, 39%)',   // --primary  (emerald green)
  accent:  'hsl(160, 84%, 45%)',   // --accent   (bright emerald)
  warning: 'hsl(38, 92%, 50%)',    // --warning  (amber)
  destructive: 'hsl(0, 84%, 60%)',     // --destructive (red)
  success: 'hsl(142, 76%, 36%)',   // --success  (green)
  muted:   'hsl(160, 10%, 55%)',   // derived from --muted-foreground
};

// Priority ordering for consistent display across charts
const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low'];

// Color mapping per priority — uses theme tokens directly
const PRIORITY_COLORS: Record<string, string> = {
  critical: CHART_COLORS.destructive,
  high:     CHART_COLORS.warning,
  medium:   CHART_COLORS.primary,
  low:      CHART_COLORS.success,
};

// Status color mapping for the assets bar chart
const STATUS_COLORS: Record<string, string> = {
  active:      CHART_COLORS.primary,
  inactive:    CHART_COLORS.muted,
  maintenance: CHART_COLORS.warning,
  retired:     CHART_COLORS.destructive,
};

// ── Types ───────────────────────────────────────────────────────────────────
interface PriorityDatum {
  name: string;
  value: number;
  color: string;
}

interface TrendDatum {
  month: string;
  opened: number;
  resolved: number;
}

interface StatusDatum {
  status: string;
  count: number;
  fill: string;
}

interface ResolutionDatum {
  category: string;
  avgDays: number;
}

interface SummaryStats {
  totalAssets: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  criticalIssues: number;
  avgResolutionDays: number;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────
// Recharts' default tooltip injects hardcoded light-mode inline styles that
// clash with the Forest Green dark theme. Using a fully custom `content`
// component gives us complete Tailwind-token control and eliminates all
// default Recharts styling from the popup box.
interface TooltipPayloadEntry {
  name: string;
  value: number | string;
  color: string;
  dataKey?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  // Optional formatter so each chart can customise the value display
  valueFormatter?: (value: number | string, name: string) => string;
}

function ChartTooltip({ active, payload, label, valueFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg text-xs">
      {label !== undefined && label !== '' && (
        <p className="mb-1.5 font-medium text-muted-foreground">{label}</p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry, i) => {
          const displayValue = valueFormatter
            ? valueFormatter(entry.value, entry.name)
            : String(entry.value);
          return (
            <div key={i} className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.name}:</span>
              <span className="font-semibold text-foreground">{displayValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// cursor overlay shown behind hovered bars — matches the card surface at low opacity
const barCursorStyle = { fill: 'hsl(160, 15%, 18%)', opacity: 0.4 };

// ── Axis style — shared across all charts ─────────────────────────────────
const axisStyle = {
  stroke: 'hsl(160, 10%, 55%)',
  fontSize: 12,
};

// ── Grid style ────────────────────────────────────────────────────────────
const gridStyle = { strokeDasharray: '3 3', stroke: 'hsl(160, 15%, 18%)' };

// ── Custom Legend ─────────────────────────────────────────────────────────
// Recharts' default <Legend /> uses inline styles that clash with dark theme.
// This custom renderer uses theme text tokens instead.
function renderThemeLegend(props: { payload?: Array<{ value: string; color: string }> }) {
  const { payload } = props;
  if (!payload) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-lg bg-muted/40" />
  );
}

// ============================================================================
export default function Reports() {
  const { organization } = useAuth();

  const [stats, setStats] = useState<SummaryStats>({
    totalAssets: 0,
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
    avgResolutionDays: 0,
  });

  const [issuesByPriority, setIssuesByPriority] = useState<PriorityDatum[]>([]);
  const [issuesTrend, setIssuesTrend] = useState<TrendDatum[]>([]);
  const [assetsByStatus, setAssetsByStatus] = useState<StatusDatum[]>([]);
  const [resolutionTime, setResolutionTime] = useState<ResolutionDatum[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = useCallback(async () => {
    if (!organization) return;
    const orgId = organization.id;

    try {
      // ── Parallel fetches ──────────────────────────────────────────────
      const [
        assetsRes,
        issuesAllRes,
        issuesPriorityRes,
        issuesTrendRes,
        assetsStatusRes,
        resolutionRes,
      ] = await Promise.all([
        // 1. Total asset count
        supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId),

        // 2. All issues (for open/resolved/critical counts)
        supabase
          .from('issues')
          .select('status, priority')
          .eq('org_id', orgId),

        // 3. Issue count grouped by priority
        supabase
          .from('issues')
          .select('priority')
          .eq('org_id', orgId),

        // 4. Issues per month (last 6 months) for trend chart
        supabase
          .from('issues')
          .select('created_at, status')
          .eq('org_id', orgId)
          .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()),

        // 5. Assets grouped by status
        supabase
          .from('assets')
          .select('status')
          .eq('org_id', orgId),

        // 6. Resolved issues with timestamps for avg resolution time
        supabase
          .from('issues')
          .select('priority, created_at, resolved_at')
          .eq('org_id', orgId)
          .not('resolved_at', 'is', null),
      ]);

      // ── Summary stats ─────────────────────────────────────────────────
      const allIssues = issuesAllRes.data ?? [];
      const openCount     = allIssues.filter(i => i.status === 'open' || i.status === 'in_progress').length;
      const resolvedCount = allIssues.filter(i => i.status === 'resolved' || i.status === 'closed').length;
      const criticalCount = allIssues.filter(i => i.priority === 'critical').length;

      // Average resolution time (days)
      const resolvedWithTime = (resolutionRes.data ?? []).filter(
        i => i.resolved_at && i.created_at
      );
      let avgDays = 0;
      if (resolvedWithTime.length > 0) {
        const totalMs = resolvedWithTime.reduce((acc, i) => {
          return acc + (new Date(i.resolved_at!).getTime() - new Date(i.created_at).getTime());
        }, 0);
        avgDays = parseFloat((totalMs / resolvedWithTime.length / 86_400_000).toFixed(1));
      }

      setStats({
        totalAssets:       assetsRes.count ?? 0,
        totalIssues:       allIssues.length,
        openIssues:        openCount,
        resolvedIssues:    resolvedCount,
        criticalIssues:    criticalCount,
        avgResolutionDays: avgDays,
      });

      // ── Issues by priority (pie chart) ────────────────────────────────
      const priorityMap: Record<string, number> = {};
      for (const row of (issuesPriorityRes.data ?? [])) {
        const p = row.priority as string;
        priorityMap[p] = (priorityMap[p] ?? 0) + 1;
      }
      const priorityData: PriorityDatum[] = PRIORITY_ORDER
        .filter(p => priorityMap[p] !== undefined)
        .map(p => ({
          name:  p.charAt(0).toUpperCase() + p.slice(1),
          value: priorityMap[p],
          color: PRIORITY_COLORS[p],
        }));
      setIssuesByPriority(priorityData);

      // ── Issues trend (line chart) ─────────────────────────────────────
      // Build a map keyed by "YYYY-MM" then convert to display labels
      const trendMap: Record<string, { opened: number; resolved: number }> = {};
      for (const row of (issuesTrendRes.data ?? [])) {
        const d    = new Date(row.created_at);
        const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!trendMap[key]) trendMap[key] = { opened: 0, resolved: 0 };
        trendMap[key].opened += 1;
        if (row.status === 'resolved' || row.status === 'closed') {
          trendMap[key].resolved += 1;
        }
      }
      const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const trendData: TrendDatum[] = Object.keys(trendMap)
        .sort()
        .map(key => {
          const monthIdx = parseInt(key.split('-')[1], 10) - 1;
          return {
            month:    MONTH_LABELS[monthIdx],
            opened:   trendMap[key].opened,
            resolved: trendMap[key].resolved,
          };
        });
      setIssuesTrend(trendData);

      // ── Assets by status (horizontal bar chart) ───────────────────────
      const statusMap: Record<string, number> = {};
      for (const row of (assetsStatusRes.data ?? [])) {
        const s = row.status as string;
        statusMap[s] = (statusMap[s] ?? 0) + 1;
      }
      // Preserve consistent ordering: active → inactive → maintenance → retired
      const STATUS_ORDER = ['active', 'inactive', 'maintenance', 'retired'];
      const statusData: StatusDatum[] = STATUS_ORDER
        .filter(s => statusMap[s] !== undefined)
        .map(s => ({
          status: s.charAt(0).toUpperCase() + s.slice(1),
          count:  statusMap[s],
          fill:   STATUS_COLORS[s],
        }));
      // Include any statuses not in our predefined order
      for (const s of Object.keys(statusMap)) {
        if (!STATUS_ORDER.includes(s)) {
          statusData.push({
            status: s.charAt(0).toUpperCase() + s.slice(1),
            count:  statusMap[s],
            fill:   CHART_COLORS.muted,
          });
        }
      }
      setAssetsByStatus(statusData);

      // ── Avg resolution time by priority (bar chart) ───────────────────
      const resMap: Record<string, { totalMs: number; count: number }> = {};
      for (const row of (resolutionRes.data ?? [])) {
        if (!row.resolved_at) continue;
        const p  = row.priority as string;
        const ms = new Date(row.resolved_at).getTime() - new Date(row.created_at).getTime();
        if (!resMap[p]) resMap[p] = { totalMs: 0, count: 0 };
        resMap[p].totalMs += ms;
        resMap[p].count   += 1;
      }
      const resData: ResolutionDatum[] = PRIORITY_ORDER
        .filter(p => resMap[p] !== undefined)
        .map(p => ({
          category: p.charAt(0).toUpperCase() + p.slice(1),
          avgDays:  parseFloat((resMap[p].totalMs / resMap[p].count / 86_400_000).toFixed(2)),
        }));
      setResolutionTime(resData);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
      fetchAllData();
    }
  }, [organization, fetchAllData]);

  // ── Stat card definitions ─────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Assets',
      value: stats.totalAssets,
      icon:  BarChart3,
      accent: 'text-primary',
      bg:     'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      label: 'Open Issues',
      value: stats.openIssues,
      icon:  TrendingUp,
      accent: 'text-warning',
      bg:     'bg-warning/10',
      border: 'border-warning/20',
    },
    {
      label: 'Resolved Issues',
      value: stats.resolvedIssues,
      icon:  TrendingDown,
      accent: 'text-success',
      bg:     'bg-success/10',
      border: 'border-success/20',
    },
    {
      label: 'Avg Resolution',
      value: stats.avgResolutionDays > 0 ? `${stats.avgResolutionDays}d` : '—',
      icon:  Clock,
      accent: 'text-primary',
      bg:     'bg-primary/10',
      border: 'border-primary/20',
    },
    {
      label: 'Critical Issues',
      value: stats.criticalIssues,
      icon:  AlertTriangle,
      accent: 'text-destructive',
      bg:     'bg-destructive/10',
      border: 'border-destructive/20',
    },
  ];

  const cardStyle = { boxShadow: 'var(--shadow-card)' };

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports"
        description="Analytics and insights for your organization"
      />

      {/* ── Summary Stats ────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.07 }}
            className={`rounded-xl border bg-card p-5 ${stat.border}`}
            style={cardStyle}
          >
            <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-3 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.accent}`} />
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {loading ? (
                <span className="inline-block h-7 w-16 animate-pulse rounded bg-muted" />
              ) : (
                stat.value
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Grid ──────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Issues Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-base font-semibold text-foreground mb-0.5">Issue Trends</h3>
          <p className="text-xs text-muted-foreground mb-5">Monthly opened vs resolved (last 6 months)</p>
          {loading ? (
            <ChartSkeleton />
          ) : issuesTrend.length === 0 ? (
            <EmptyChart label="No issue data in the last 6 months" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={issuesTrend}>
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="month" {...axisStyle} />
                  <YAxis {...axisStyle} allowDecimals={false} />
                  <Tooltip
                    content={(props) => (
                      <ChartTooltip
                        {...props}
                        valueFormatter={(v) => String(v)}
                      />
                    )}
                  />
                  <Legend content={renderThemeLegend} />
                  <Line
                    type="monotone"
                    dataKey="opened"
                    name="opened"
                    stroke={CHART_COLORS.warning}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.warning, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="resolved"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Issues by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-base font-semibold text-foreground mb-0.5">Issues by Priority</h3>
          <p className="text-xs text-muted-foreground mb-5">Distribution of all issues</p>
          {loading ? (
            <ChartSkeleton />
          ) : issuesByPriority.length === 0 ? (
            <EmptyChart label="No issues recorded yet" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issuesByPriority}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {issuesByPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={(props) => (
                      <ChartTooltip
                        {...props}
                        valueFormatter={(v) => String(v)}
                      />
                    )}
                  />
                  <Legend content={renderThemeLegend} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Assets by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-base font-semibold text-foreground mb-0.5">Assets by Status</h3>
          <p className="text-xs text-muted-foreground mb-5">Current inventory breakdown</p>
          {loading ? (
            <ChartSkeleton />
          ) : assetsByStatus.length === 0 ? (
            <EmptyChart label="No assets recorded yet" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetsByStatus} layout="vertical" barCategoryGap="30%">
                  <CartesianGrid {...gridStyle} horizontal={false} />
                  <XAxis type="number" {...axisStyle} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="status"
                    {...axisStyle}
                    width={90}
                  />
                  <Tooltip
                    cursor={barCursorStyle}
                    content={(props) => (
                      <ChartTooltip
                        {...props}
                        valueFormatter={(v) => `${v} assets`}
                      />
                    )}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {assetsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Average Resolution Time by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="rounded-xl border border-border/50 bg-card p-6"
          style={cardStyle}
        >
          <h3 className="text-base font-semibold text-foreground mb-0.5">Average Resolution Time</h3>
          <p className="text-xs text-muted-foreground mb-5">Days to resolve by priority</p>
          {loading ? (
            <ChartSkeleton />
          ) : resolutionTime.length === 0 ? (
            <EmptyChart label="No resolved issues with timing data yet" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionTime} barCategoryGap="35%">
                  <CartesianGrid {...gridStyle} />
                  <XAxis dataKey="category" {...axisStyle} />
                  <YAxis {...axisStyle} />
                  <Tooltip
                    cursor={barCursorStyle}
                    content={(props) => (
                      <ChartTooltip
                        {...props}
                        valueFormatter={(v) => `${v} days`}
                      />
                    )}
                  />
                  <Bar dataKey="avgDays" radius={[4, 4, 0, 0]}>
                    {resolutionTime.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORITY_COLORS[entry.category.toLowerCase()] ?? CHART_COLORS.primary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
