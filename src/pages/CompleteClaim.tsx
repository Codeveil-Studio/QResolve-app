import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Building2, Mail, Phone, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function CompleteClaim() {
  const [searchParams] = useSearchParams();
  const claimId = searchParams.get('claim_id');
  const [provider, setProvider] = useState<any>(null);
  const [existingClaim, setExistingClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    businessEmail: '',
    phone: '',
    message: ''
  });
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchProvider() {
      if (!claimId) {
        setLoading(false);
        return;
      }

      // Check if this user already has an active (pending/approved) claim
      const { data: activeClaim } = await supabase
        .from('profile_claims')
        .select('id, status, provider_id, providers:providers(provider_name)')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (activeClaim) {
        setExistingClaim(activeClaim);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('id', claimId)
        .maybeSingle();

      if (data) setProvider(data);
      setLoading(false);
    }

    fetchProvider();
  }, [claimId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !claimId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('profile_claims')
        .insert({
          provider_id: claimId,
          user_id: user.id,
          full_name: formData.fullName,
          business_email: formData.businessEmail,
          phone: formData.phone,
          message: formData.message,
          status: 'pending'
        });

      if (error) throw error;

      localStorage.removeItem('pending_claim_id');
      toast({
        title: 'Claim request submitted',
        description: 'Your request is pending admin approval. We will notify you once reviewed.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (existingClaim) {
    const providerName = existingClaim.providers?.provider_name || 'a business';
    const isPending = existingClaim.status === 'pending';
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
          <div className="rounded-full bg-warning/10 p-4 mb-4">
            <AlertTriangle className="h-10 w-10 text-warning" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Claim Already Exists</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            {isPending
              ? `You already have a pending claim for "${providerName}". Each account can only manage one business listing. Please wait for admin review before submitting another claim.`
              : `Your claim for "${providerName}" has already been approved. Each account can only manage one business listing.`}
          </p>
          <Button className="mt-8" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] flex-col items-center justify-center text-center px-4">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Provider not found</h2>
          <p className="mt-2 text-muted-foreground max-w-md">
            We couldn't find the business profile you're trying to claim. Please return to the directory and try again.
          </p>
          <Button className="mt-8" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Complete Your Claim</h1>
              <p className="text-muted-foreground">Verify your ownership of <strong>{provider.provider_name}</strong></p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Your Full Name</Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">Business Email</Label>
                      <div className="relative">
                        <Input
                          id="businessEmail"
                          type="email"
                          required
                          value={formData.businessEmail}
                          onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Verification Message (Optional)</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide any additional context to help us verify your ownership..."
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <p className="text-xs text-muted-foreground max-w-[200px]">
                      By submitting, you agree to our verification terms. Admin approval usually takes 24-48 hours.
                    </p>
                    <Button type="submit" disabled={submitting} className="min-w-[140px]">
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Submit Claim
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                  <Building2 size={18} />
                  Business Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-muted-foreground text-xs uppercase letter-spacing-wider font-semibold">Name</div>
                    <div className="font-medium">{provider.provider_name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase letter-spacing-wider font-semibold">Category</div>
                    <div className="font-medium">{provider.category}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs uppercase letter-spacing-wider font-semibold">Location</div>
                    <div className="font-medium">{provider.location}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-5 border border-dashed">
                <h3 className="font-semibold mb-2 text-sm">Why claim?</h3>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    Verified by Relay badge on directory
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    Manage assets and receive live reports
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={14} className="text-primary shrink-0" />
                    Real-time performance analytics
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function CheckCircle2({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
