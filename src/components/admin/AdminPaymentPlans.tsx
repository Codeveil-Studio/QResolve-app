import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, CheckCircle2, AlertTriangle, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fetchPaymentPlans, formatPlanPrice, type PaymentPlan } from '@/lib/subscription';
import { cn } from '@/lib/utils';

interface SyncedPlanResult {
  plan_key: string;
  razorpay_plan_id: string;
  status: 'created' | 'existing' | 'recreated';
}

interface SyncResponse {
  synced?: SyncedPlanResult[];
  message?: string;
  error?: string;
}

const STATUS_LABEL: Record<SyncedPlanResult['status'], string> = {
  created: 'Created',
  existing: 'Already up-to-date',
  recreated: 'Recreated (price changed)',
};

const STATUS_TONE: Record<SyncedPlanResult['status'], string> = {
  created: 'bg-accent/10 text-accent border-accent/20',
  existing: 'bg-muted text-muted-foreground border-border',
  recreated: 'bg-warning/10 text-warning border-warning/20',
};

export function AdminPaymentPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<{ at: Date; results: SyncedPlanResult[] } | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentPlans();
      setPlans(data);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to load plans',
        description: err instanceof Error ? err.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke<SyncResponse>('razorpay-sync-plans');

      // supabase-js wraps non-2xx responses in `error` but the body isn't in
      // `error.message` — it lives on `error.context` (the raw Response).
      // Extract it so the user sees the actual reason.
      if (error) {
        let bodyMsg: string | null = null;
        const ctx = (error as unknown as { context?: Response }).context;
        if (ctx && typeof ctx.clone === 'function') {
          try {
            const text = await ctx.clone().text();
            try {
              const body = JSON.parse(text) as { error?: string; code?: string };
              if (body?.error) {
                bodyMsg = body.code
                  ? `${body.error} (code: ${body.code})`
                  : body.error;
              }
            } catch {
              // Not JSON — use raw text if non-empty
              if (text && text.length < 500) bodyMsg = text;
            }
          } catch {
            // ignore — fall back to generic message
          }
        }
        throw new Error(bodyMsg ?? error.message ?? 'Sync failed');
      }
      if (!data) throw new Error('Empty response from server');
      if (data.error) throw new Error(data.error);

      const results = data.synced ?? [];
      setLastSync({ at: new Date(), results });

      const createdCount = results.filter((r) => r.status === 'created').length;
      const recreatedCount = results.filter((r) => r.status === 'recreated').length;
      const existingCount = results.filter((r) => r.status === 'existing').length;

      toast({
        title: 'Sync complete',
        description:
          `${createdCount} created, ${recreatedCount} recreated, ${existingCount} unchanged.`,
      });

      // Refresh the table so razorpay_plan_id columns update
      await loadPlans();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sync plans';
      toast({
        variant: 'destructive',
        title: 'Sync failed',
        description: msg,
      });
    } finally {
      setSyncing(false);
    }
  };

  const unsyncedCount = plans.filter((p) => !p.razorpay_plan_id).length;
  const allSynced = plans.length > 0 && unsyncedCount === 0;

  return (
    <Card className="border-border bg-card shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground font-serif">Payment Plans</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Razorpay billing plans for paid subscriptions. Sync after editing pricing in the database
                or when switching between Test and Live mode.
              </CardDescription>
            </div>
          </div>

          <Button
            onClick={handleSync}
            disabled={syncing || loading || plans.length === 0}
            className="shrink-0 w-full sm:w-auto"
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-label="Syncing" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync to Razorpay
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status banner */}
        {!loading && plans.length > 0 && (
          <div
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3.5',
              allSynced
                ? 'border-accent/30 bg-accent/5'
                : 'border-warning/30 bg-warning/5',
            )}
          >
            {allSynced ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-accent mt-0.5" aria-hidden="true" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" aria-hidden="true" />
            )}
            <div className="flex-1 text-sm">
              {allSynced ? (
                <p className="text-foreground">
                  All {plans.length} plan{plans.length === 1 ? '' : 's'} synced to Razorpay.
                  Users can now subscribe.
                </p>
              ) : (
                <>
                  <p className="text-foreground font-medium">
                    {unsyncedCount} plan{unsyncedCount === 1 ? '' : 's'} not yet synced
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Click "Sync to Razorpay" to create them in your Razorpay dashboard.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Plans table */}
        {loading ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
            No payment plans found. Apply the migration{' '}
            <code className="text-xs px-1.5 py-0.5 bg-muted rounded">
              20260521_razorpay_integration.sql
            </code>{' '}
            to seed the Starter and Pro plans.
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Limits</th>
                  <th className="px-5 py-3">Razorpay Plan ID</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {plan.name}
                        {plan.plan_key === 'starter' && (
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] gap-1 px-1.5 py-0">
                            <Sparkles className="h-2.5 w-2.5" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Key: <code className="font-mono">{plan.plan_key}</code>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {formatPlanPrice(plan.amount, plan.currency)}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        per {plan.interval_count === 1 ? plan.interval.replace(/ly$/, '') : `${plan.interval_count} ${plan.interval}`}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <div>{plan.max_assets === null ? 'Unlimited assets' : `${plan.max_assets.toLocaleString()} assets`}</div>
                      <div>{plan.max_issues === null ? 'Unlimited issues' : `${plan.max_issues.toLocaleString()} issues`}</div>
                    </td>
                    <td className="px-5 py-4">
                      {plan.razorpay_plan_id ? (
                        <code className="text-xs font-mono text-muted-foreground break-all">
                          {plan.razorpay_plan_id}
                        </code>
                      ) : (
                        <span className="text-xs text-warning italic">Not synced yet</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {plan.razorpay_plan_id ? (
                        <Badge className="bg-accent/10 text-accent border-accent/20 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Synced
                        </Badge>
                      ) : (
                        <Badge className="bg-warning/10 text-warning border-warning/20 gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Last sync result detail */}
        {lastSync && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border border-border bg-muted/30 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Last sync result</h4>
              <span className="text-xs text-muted-foreground">
                {lastSync.at.toLocaleTimeString()}
              </span>
            </div>
            {lastSync.results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No plans were processed.</p>
            ) : (
              <ul className="space-y-1.5">
                {lastSync.results.map((r) => (
                  <li key={r.plan_key} className="flex items-center gap-3 text-sm">
                    <Badge
                      className={cn('text-[10px] gap-1 px-1.5 py-0', STATUS_TONE[r.status])}
                    >
                      {STATUS_LABEL[r.status]}
                    </Badge>
                    <span className="font-medium text-foreground capitalize">{r.plan_key}</span>
                    <code className="text-xs text-muted-foreground font-mono truncate">
                      {r.razorpay_plan_id}
                    </code>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}

        {/* Helper note */}
        <p className="text-xs text-muted-foreground flex items-start gap-1.5 pt-1">
          <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            To edit prices, update the{' '}
            <code className="px-1 py-0.5 bg-muted rounded font-mono">payment_plans</code>{' '}
            table in Supabase (set <code className="px-1 py-0.5 bg-muted rounded font-mono">razorpay_plan_id</code> to NULL to force a fresh sync), then click <strong>Sync to Razorpay</strong>.
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
