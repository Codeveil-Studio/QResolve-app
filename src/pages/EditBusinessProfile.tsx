import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Info, 
  Save, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Provider } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function EditBusinessProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState<Provider | null>(null);


  // Form states
  const [formData, setFormData] = useState({
    provider_name: '',
    description: '',
    business_email: '',
    contact_info: '',
    website: '',
    sub_locality: '',
  });

  useEffect(() => {
    const fetchProvider = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('providers')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          const providerData = data as unknown as Provider;
          setProvider(providerData);
          setFormData({
            provider_name: providerData.provider_name || '',
            description: providerData.description || '',
            business_email: providerData.business_email || '',
            contact_info: providerData.contact_info || '',
            website: providerData.website || '',
            sub_locality: providerData.sub_locality || '',
          });
        }

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error loading profile',
          description: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('providers')
        .update({
          provider_name: formData.provider_name,
          description: formData.description,
          business_email: formData.business_email,
          contact_info: formData.contact_info,
          website: formData.website,
          sub_locality: formData.sub_locality,
        })
        .eq('id', provider.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your directory listing has been updated successfully.',
      });
      navigate('/owner-dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!provider) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-semibold">Profile Not Found</h2>
          <p className="text-muted-foreground mt-2">You don't have an associated business listing yet.</p>
          <Button variant="link" onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/owner-dashboard')}
          className="shrink-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <PageHeader 
          title="Edit Business Profile" 
          description="Update your public listing in the QResolve Directory"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="provider_name">Business Name</Label>
                  <Input 
                    id="provider_name"
                    value={formData.provider_name}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                    placeholder="e.g. Acme Lifts Ltd"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub_locality">Primary City/Location</Label>
                  <Input 
                    id="sub_locality"
                    value={formData.sub_locality}
                    onChange={(e) => setFormData({ ...formData, sub_locality: e.target.value })}
                    placeholder="e.g. Bangalore"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea 
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell your customers about your services..."
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">Keep it professional. This will be shown on your public profile.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_email">Public Contact Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="business_email"
                      type="email"
                      value={formData.business_email}
                      onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                      placeholder="contact@business.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_info">Public Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="contact_info"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      placeholder="+91 00000 00000"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/owner-dashboard')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="gap-2">
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-accent" /> Verified Profile
            </h3>
            <p className="text-sm text-muted-foreground">
              Your profile is verified. Changes are mirrored instantly to the QResolve Directory. High-quality descriptions improve your Trust Score.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-primary/5 p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Info size={18} className="text-primary" /> Why add a description?
            </h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Improves search visibility</li>
              <li>• Helps customers trust your brand</li>
              <li>• Showcases your specializations</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
