import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Clock, 
  TrendingUp,
  Award,
  Users,
  MessageSquare,
  ArrowUpRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function OwnerDashboard() {
  const { user, organization, profile } = useAuth();
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProviderData = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      setProvider(data);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  // If no provider is associated yet, show a different view or redirect
  if (!provider) {
    return (
      <DashboardLayout>
        <PageHeader 
          title="Management Dashboard" 
          description="Claim your business listing to see advanced performance metrics." 
        />
        <div className="bg-card border border-dashed border-border p-12 text-center rounded-xl">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-semibold mb-2">No Business Linked</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't successfully claimed a business listing yet. Once approved by an admin, your dashboard will transform into a management console.
          </p>
          <a 
            href="https://qresolve.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
          >
            Go to Directory to claim listing <ExternalLink size={16} />
          </a>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader
          title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Owner'}!`}
          description={`Managing ${provider.provider_name}`}
        />
        <Link to="/edit-business-profile">
          <Button variant="outline" className="gap-2">
            <Edit3 size={16} /> Edit Business Profile
          </Button>
        </Link>
      </div>

      {/* Verification Status */}
      {provider.is_verified && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-8 flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="font-bold text-accent">Verified Business Listing</p>
            <p className="text-sm text-foreground/70">Your business is ranked and verified in the QResolve Directory.</p>
          </div>
        </motion.div>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Trust Score"
          value={`${provider.trust_score || 85}%`}
          description="Based on verifications"
          icon={ShieldCheck}
          variant="primary"
          delay={0}
        />
        <StatCard
          title="Avg. Response"
          value={`${provider.response_time_avg || 120}m`}
          description="Scan to technician"
          icon={Clock}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="Conversion Rate"
          value="42%"
          description="Profile views to leads"
          icon={TrendingUp}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          title="Active Contracts"
          value="12"
          description="Verified Relay users"
          icon={Users}
          variant="primary"
          delay={0.3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Profile Completion */}
        <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Directory Performance</h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
          <div className="space-y-6">
             <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completeness</span>
                <span className="font-bold text-accent">75%</span>
             </div>
             <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent w-3/4 rounded-full" />
             </div>
             
             <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                   <div className="text-2xl font-bold">1.2k</div>
                   <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Directory Views</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                   <div className="text-2xl font-bold">248</div>
                   <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Contact Clicks</div>
                </div>
             </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Grow your business</h3>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                < Award size={14} className="text-accent" /> Improve Trust Score
              </p>
              <p className="text-xs text-muted-foreground">Upload certifications and verified customer testimonials to boost your ranking.</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm font-medium mb-1">Update Photos</p>
              <p className="text-xs text-muted-foreground">Businesses with real team photos get 3x more contact requests.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Sub-component Helper
function Button({ children, variant, className, onClick }: any) {
  const variants: any = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-transparent hover:bg-muted text-foreground",
  };
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-md font-medium transition-colors inline-flex items-center ${variants[variant] || ""} ${className}`}
    >
      {children}
    </button>
  );
}
