import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Bell, Shield, CreditCard, Save, Upload } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Subscription } from '@/lib/supabase-types';
import { getPlan, getCustomAssetLimit, fetchPaymentPlans, formatPlanPrice, type PaymentPlan } from '@/lib/subscription';
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout';
import { cn } from '@/lib/utils';
import { QrCode, AlertCircle, Users, CheckCircle, Loader2, Sparkles, AlertTriangle, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// The Starter plan is highlighted as the recommended option in the pricing grid.
const RECOMMENDED_PLAN_KEY = 'starter';

// Plan card visual treatment — varies by tier to give weight to the higher tier.
function getPlanCardEmphasis(planKey: string) {
  return planKey === 'pro'
    ? { priceClass: 'text-4xl', accentTone: 'emerald-strong' as const }
    : { priceClass: 'text-3xl', accentTone: 'emerald' as const };
}

function safeFormatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return format(d, 'd MMM yyyy');
}

export default function Settings() {
  const { user, profile, organization } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
  });
  const [orgData, setOrgData] = useState({
    name: organization?.name || '',
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    issueUpdates: true,
    weeklyReports: false,
    criticalOnly: false,
  });
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [assetCount, setAssetCount] = useState(0);
  const [customAssetLimit, setCustomAssetLimit] = useState<number | null>(null);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const { activePlanKey: checkoutPlanKey, cancelling, startCheckout, cancelSubscription } = useRazorpayCheckout();

  const refreshSubscription = React.useCallback(async () => {
    if (!organization) return;
    const subRes = await supabase
      .from('subscriptions')
      .select('*')
      .eq('org_id', organization.id)
      .maybeSingle();
    setSubscription(subRes.data);
  }, [organization]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!organization) return;
      setPlansLoading(true);

      const [subRes, assetsRes, customLimit, plansRes] = await Promise.all([
        supabase.from('subscriptions').select('*').eq('org_id', organization.id).maybeSingle(),
        supabase.from('assets').select('id', { count: 'exact', head: true }).eq('org_id', organization.id),
        getCustomAssetLimit(organization.id),
        fetchPaymentPlans(),
      ]);

      setSubscription(subRes.data);
      setAssetCount(assetsRes.count || 0);
      setCustomAssetLimit(customLimit);
      setPaymentPlans(plansRes);
      setPlansLoading(false);
    };
    fetchData();
  }, [organization]);

  const handleUpgrade = async (planKey: string) => {
    await startCheckout(planKey, {
      onSuccess: () => {
        // The webhook is the source of truth, but poll once after payment authorisation
        // so the UI updates quickly if the webhook has already fired.
        setTimeout(refreshSubscription, 2000);
      },
    });
  };

  const handleCancel = async () => {
    await cancelSubscription({ immediate: false });
    setTimeout(refreshSubscription, 1500);
  };

  const currentPlan = getPlan(subscription?.status, assetCount);
  const activePlanKey: string | null = subscription?.plan_key ?? null;
  const isCancellationScheduled =
    subscription?.status === 'active' && !!subscription?.cancelled_at;
  const cancellationDate = safeFormatDate(subscription?.cancelled_at);
  const nextBillingDate = safeFormatDate(subscription?.current_period_end);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profileData.full_name })
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Profile updated successfully' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to update profile',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrgUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgData.name })
        .eq('id', organization.id);

      if (error) throw error;
      toast({ title: 'Organization updated successfully' });
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to update organization',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const cardStyle = {
    boxShadow: 'var(--shadow-card)',
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Settings"
        description="Manage your account and organization preferences"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Org</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-6"
            style={cardStyle}
          >
            <h3 className="text-lg font-semibold mb-1">Profile Information</h3>
            <p className="text-sm text-muted-foreground mb-6">Update your personal details</p>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="mt-1.5 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </TabsContent>

        {/* Organization Settings */}
        <TabsContent value="organization">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-6"
            style={cardStyle}
          >
            <h3 className="text-lg font-semibold mb-1">Organization Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">Manage your organization details</p>

            <form onSubmit={handleOrgUpdate} className="space-y-6">
              <div className="max-w-md">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  value={orgData.name}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Danger Zone</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your organization and all its data
                    </p>
                  </div>
                </div>
                <Button variant="destructive" className="mt-4" type="button">
                  Delete Organization
                </Button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </motion.div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-6"
            style={cardStyle}
          >
            <h3 className="text-lg font-semibold mb-1">Notification Preferences</h3>
            <p className="text-sm text-muted-foreground mb-6">Choose how you want to be notified</p>

            <div className="space-y-6">
              {[
                { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive email notifications for important updates' },
                { key: 'issueUpdates', label: 'Issue Updates', description: 'Get notified when issues are created or updated' },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive a weekly summary of your organization' },
                { key: 'criticalOnly', label: 'Critical Only', description: 'Only notify for critical priority issues' },
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={notifications[setting.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [setting.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-border/50 bg-card p-6"
            style={cardStyle}
          >
            <h3 className="text-lg font-semibold mb-1">Billing & Subscription</h3>
            <p className="text-sm text-muted-foreground mb-6">Manage your subscription and payment methods</p>

            {/* Inline notice when subscription is mid-cancellation */}
            {isCancellationScheduled && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4"
              >
                <AlertTriangle className="h-5 w-5 shrink-0 text-warning mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Cancellation scheduled</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Your subscription will remain active
                    {nextBillingDate ? ` until ${nextBillingDate}` : ' until the end of the current billing period'}
                    {cancellationDate && nextBillingDate !== cancellationDate ? ` (requested on ${cancellationDate})` : ''}.
                  </p>
                </div>
                {/* TODO: wire up a razorpay-resume-subscription edge function so this can actually undo the cancel */}
                <Button variant="outline" size="sm" disabled title="Resume requires admin action — coming soon">
                  Resume plan
                </Button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {/* Skeleton loaders while plans fetch */}
              {plansLoading ? (
                <>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="relative rounded-xl border border-border bg-card p-6"
                    >
                      <Skeleton className="h-6 w-20 mb-3" />
                      <Skeleton className="h-9 w-32 mb-5" />
                      <div className="space-y-2 mb-6">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/6" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {/* Trial card — baseline */}
                  <div
                    className={cn(
                      'relative rounded-xl border p-6 transition-all duration-200',
                      !subscription || subscription.status === 'trialing'
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card',
                    )}
                  >
                    {(!subscription || subscription.status === 'trialing') && (
                      <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                        Current Plan
                      </Badge>
                    )}
                    <h4 className="text-xl font-bold mb-1">Trial</h4>
                    <p className="mb-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">Free</span>
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                    <ul className="space-y-2 mb-6">
                      {['QR Reporting', 'Basic Dashboard', 'Dispatch'].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                      aria-label="Trial is your default plan; no action available"
                    >
                      Default
                    </Button>
                  </div>

                  {/* DB-driven paid plans */}
                  {paymentPlans.map((plan) => {
                    const isCurrent =
                      subscription?.status === 'active' &&
                      (activePlanKey === plan.plan_key ||
                        (!activePlanKey && plan.plan_key === 'starter'));
                    const isRecommended =
                      !isCurrent &&
                      plan.plan_key === RECOMMENDED_PLAN_KEY &&
                      // Only show "Most Popular" if user isn't already on a paid plan
                      subscription?.status !== 'active';
                    const notSyncedYet = !plan.razorpay_plan_id;
                    const isThisPlanLoading = checkoutPlanKey === plan.plan_key;
                    const anyCheckoutInFlight = checkoutPlanKey !== null;
                    const { priceClass } = getPlanCardEmphasis(plan.plan_key);

                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          'relative rounded-xl border p-6 transition-all duration-200',
                          isCurrent
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : isRecommended
                              ? 'border-primary/60 bg-card hover:border-primary'
                              : 'border-border bg-card hover:border-primary/50',
                        )}
                      >
                        {isCurrent && (
                          <Badge className="absolute -top-3 left-4 bg-primary text-primary-foreground">
                            Current Plan
                          </Badge>
                        )}
                        {isRecommended && (
                          <Badge
                            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground gap-1 px-2.5 py-0.5"
                          >
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            Most Popular
                          </Badge>
                        )}
                        <h4 className="text-xl font-bold mb-1">{plan.name}</h4>
                        <p className="mb-4 flex items-baseline gap-1">
                          <span className={cn('font-bold', priceClass)}>
                            {formatPlanPrice(plan.amount, plan.currency)}
                          </span>
                          <span className="text-sm font-normal text-muted-foreground">/month</span>
                        </p>
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* Next-billing line for active subscribers */}
                        {isCurrent && nextBillingDate && !isCancellationScheduled && (
                          <p className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                            Next billing: {nextBillingDate}
                          </p>
                        )}

                        {isCurrent ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                                disabled={cancelling || isCancellationScheduled}
                              >
                                {isCancellationScheduled
                                  ? 'Cancellation pending'
                                  : cancelling
                                    ? 'Cancelling...'
                                    : 'Cancel Subscription'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Your {plan.name} plan will remain active until the end of the
                                  current billing period
                                  {nextBillingDate ? ` (${nextBillingDate})` : ''}. You won't be
                                  charged again.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep plan</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleCancel}
                                  className={cn(
                                    buttonVariants({ variant: 'destructive' }),
                                  )}
                                >
                                  Cancel at period end
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              className="w-full"
                              disabled={anyCheckoutInFlight || notSyncedYet}
                              aria-busy={isThisPlanLoading}
                              onClick={() => handleUpgrade(plan.plan_key)}
                            >
                              {isThisPlanLoading && (
                                <Loader2
                                  className="mr-2 h-4 w-4 animate-spin"
                                  aria-label="Loading"
                                />
                              )}
                              {notSyncedYet
                                ? 'Unavailable'
                                : isThisPlanLoading
                                  ? 'Opening checkout...'
                                  : 'Upgrade'}
                            </Button>
                            {notSyncedYet && (
                              <p className="text-xs text-muted-foreground text-center">
                                Plan not yet available — admin sync pending
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Plan Usage</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">Assets Used</p>
                    {customAssetLimit !== null && (
                      <Badge variant="secondary" className="text-xs">Custom Tier</Badge>
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold">{assetCount}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      Limit: {customAssetLimit !== null ? customAssetLimit : (currentPlan.maxAssets === Infinity ? 'Unlimited' : currentPlan.maxAssets)}
                    </p>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min((assetCount / (customAssetLimit !== null ? customAssetLimit : (currentPlan.maxAssets === Infinity ? assetCount : currentPlan.maxAssets))) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 border border-border opacity-60">
                  <p className="text-sm text-muted-foreground mb-1">Team Seats</p>
                  <p className="text-2xl font-bold">1 / 5</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 border border-border opacity-60">
                  <p className="text-sm text-muted-foreground mb-1">Reports Generated</p>
                  <p className="text-2xl font-bold">0 / 50</p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
