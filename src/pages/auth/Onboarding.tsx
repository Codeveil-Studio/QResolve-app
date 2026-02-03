import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, organization, createOrganization, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (!authLoading && organization) {
      navigate('/dashboard');
    }
  }, [user, organization, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await createOrganization(orgName);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create organization',
        description: error.message,
      });
    } else {
      toast({
        title: 'Organization created!',
        description: 'Welcome to QResolve.',
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user && !user.email_confirmed_at) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <QrCode className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Email Verification Required</h2>
            <p className="text-muted-foreground mb-6">
              Please verify your email address to continue setting up your organization.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              I've verified my email
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <QrCode className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">Set up your organization</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an organization to start managing your assets and issues
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="orgName">Organization name</Label>
              <div className="relative mt-2">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corporation"
                  required
                  className="pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                You can invite team members later
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
