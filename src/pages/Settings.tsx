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

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-2xl font-semibold">Trial</p>
                  <p className="text-sm text-muted-foreground mt-1">Free for 14 days</p>
                </div>
                <Button>Upgrade Plan</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Usage This Month</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Assets</p>
                  <p className="text-2xl font-semibold">0 / 50</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Issues</p>
                  <p className="text-2xl font-semibold">0 / 100</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-semibold">1 / 5</p>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
