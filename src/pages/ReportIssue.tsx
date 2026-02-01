import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getAssetDataFromUrl } from '@/lib/assetUrl';
import { IssuePriority, Asset } from '@/lib/supabase-types';

function getUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ReportIssue() {
  const { assetId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [asset, setAsset] = useState<Pick<Asset, 'id' | 'name' | 'location' | 'org_id' | 'serial_number'> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');

  // Optimistic data from URL
  const urlData = getAssetDataFromUrl(searchParams);

  useEffect(() => {
    async function loadAsset() {
      if (!assetId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('id, name, location, org_id, serial_number')
          .eq('id', assetId)
          .single();

        if (error) {
           console.error('Error fetching asset:', error);
           setError('Could not verify asset details. Please scan the code again or try refreshing.');
        } else {
          setAsset(data);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load asset.');
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [assetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !asset.org_id) {
        toast({ variant: "destructive", title: "Error", description: "Missing asset organization information." });
        return;
    }

    setSubmitting(true);
    
    try {
        const finalDescription = `
${description}

---
Reported by: ${reporterName || 'Anonymous'}
Contact: ${reporterEmail || 'N/A'}
        `.trim();

        const { error: submitError } = await supabase
            .from('issues')
            .insert({
                org_id: asset.org_id,
                asset_id: asset.id,
                title: title,
                description: finalDescription,
                priority: priority,
                status: 'open',
                reported_by: getUUID(),
            });

        if (submitError) throw submitError;

        setSuccess(true);
        toast({ title: "Report submitted successfully" });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to submit report.";
        console.error(err);
        toast({ variant: "destructive", title: "Failed to submit report", description: message });
    } finally {
        setSubmitting(false);
    }
  };

  if (success) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-md text-center p-6">
                  <div className="flex justify-center mb-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                  </div>
                  <CardTitle className="text-2xl mb-2">Thank You!</CardTitle>
                  <CardDescription className="text-lg">
                      Your report for <strong>{asset?.name || urlData.name}</strong> has been submitted.
                  </CardDescription>
                  <div className="mt-8">
                      <Button onClick={() => window.location.reload()} variant="outline">Submit Another</Button>
                  </div>
              </Card>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="mt-2 text-gray-600">
            Help us maintain our assets by reporting problems.
          </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>{asset?.name || urlData.name}</CardTitle>
                <CardDescription>
                    {asset?.location || urlData.location}
                    {asset?.serial_number && <span className="block text-xs font-mono mt-1">SN: {asset.serial_number}</span>}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="space-y-4">
                        <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            <p>{error}</p>
                        </div>
                        <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                            Retry
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Issue Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g. Screen cracked, Not turning on" 
                                required 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Severity</Label>
                            <Select value={priority} onValueChange={(val) => setPriority(val as IssuePriority)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low - Cosmetic/Minor</SelectItem>
                                    <SelectItem value="medium">Medium - Functional Issue</SelectItem>
                                    <SelectItem value="high">High - Major Failure</SelectItem>
                                    <SelectItem value="critical">Critical - Safety Hazard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Please describe the issue in detail..." 
                                required 
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name (Optional)</Label>
                                <Input 
                                    id="name" 
                                    placeholder="John Doe" 
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Optional)</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    value={reporterEmail}
                                    onChange={(e) => setReporterEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={submitting || loading || !asset}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Report'
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
