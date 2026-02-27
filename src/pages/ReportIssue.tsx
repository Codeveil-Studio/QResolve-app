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
import { Loader2, CheckCircle2, AlertTriangle, Check } from 'lucide-react';
import { getAssetDataFromUrl } from '@/lib/assetUrl';
import { IssuePriority, Asset } from '@/lib/supabase-types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  const [asset, setAsset] = useState<(Pick<Asset, 'id' | 'name' | 'location' | 'org_id' | 'serial_number'> & { issue_types?: string[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [selectedIssueTags, setSelectedIssueTags] = useState<string[]>([]);

  // Optimistic data from URL
  const urlData = getAssetDataFromUrl(searchParams);

  useEffect(() => {
    async function loadAsset() {
      if (!assetId) {
        if (urlData.orgId) {
          setAsset({
            id: '' as Asset['id'],
            name: urlData.name,
            location: urlData.location,
            org_id: urlData.orgId,
            serial_number: null,
            issue_types: []
          });
        }
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('id, name, location, org_id, serial_number, issue_types')
          .eq('id', assetId)
          .single();

        if (error) {
          console.error('Error fetching asset:', error);
          if (urlData.orgId) {
            setAsset({
              id: assetId as Asset['id'],
              name: urlData.name,
              location: urlData.location,
              org_id: urlData.orgId,
              serial_number: null,
              issue_types: []
            });
            setError(null);
          } else {
            setError('Could not verify asset details. Please scan the code again or try refreshing.');
          }
        } else {
          setAsset(data);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (assetId && urlData.orgId) {
          setAsset({
            id: assetId as Asset['id'],
            name: urlData.name,
            location: urlData.location,
            org_id: urlData.orgId,
            serial_number: null,
            issue_types: []
          });
          setError(null);
        } else {
          setError('Failed to load asset.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadAsset();
  }, [assetId, urlData.location, urlData.name, urlData.orgId]);

  const toggleIssueTag = (tag: string) => {
    setSelectedIssueTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = asset?.org_id || urlData.orgId;
    const finalAssetId = asset?.id || (assetId as string | undefined);

    if (!orgId || !finalAssetId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing asset information. Please scan the code again.",
      });
      return;
    }

    // Validation: Require at least one tag if the asset has tags defined
    if (asset?.issue_types && asset.issue_types.length > 0 && selectedIssueTags.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select at least one issue type.",
      });
      return;
    }

    setSubmitting(true);
    
    try {
        // Auto-generate title from tags or use a default
        let generatedTitle = "Issue Report";
        if (selectedIssueTags.length > 0) {
          generatedTitle = selectedIssueTags.join(', ');
        } else if (title) {
          // Fallback if title state still exists or for assets without tags
          generatedTitle = title;
        }

        const finalDescription = `
${description}

---
Tags: ${selectedIssueTags.join(', ') || 'None'}
Reported by: ${reporterName || 'Anonymous'}
Contact: ${reporterEmail || 'N/A'}
        `.trim();

        const { error: submitError } = await supabase
          .from('issues')
          .insert({
            org_id: orgId,
            asset_id: finalAssetId,
            title: generatedTitle,
            description: finalDescription,
            priority: priority,
            status: 'open',
            reported_by: getUUID(),
            issue_tags: selectedIssueTags
          });

        if (submitError) throw submitError;

        setSuccess(true);
        toast({ title: "Report submitted successfully" });
    } catch (err: unknown) {
      let message = "Failed to submit report.";
      if (err instanceof Error) {
        message = err.message || message;
      } else if (err && typeof err === "object") {
        const anyErr = err as { message?: string; details?: string; hint?: string };
        if (anyErr.message) message = anyErr.message;
        else if (anyErr.details) message = anyErr.details;
        else if (anyErr.hint) message = anyErr.hint;
      }
      console.error("Issue submit error:", err);
      toast({
        variant: "destructive",
        title: "Failed to submit report",
        description: message,
      });
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
    <div className="qresolve-auth min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="mt-2 text-gray-600">
            Help us maintain our assets by reporting problems.
          </p>
        </div>

        <Card className="bg-white text-slate-900 shadow-md border border-gray-200">
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
                        {asset?.issue_types && asset.issue_types.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-slate-900">What type of issue is this?</Label>
                                <div className="flex flex-wrap gap-2">
                                    {asset.issue_types.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleIssueTag(tag)}
                                            className={cn(
                                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                                selectedIssueTags.includes(tag)
                                                    ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                                                    : "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200"
                                            )}
                                        >
                                            {selectedIssueTags.includes(tag) && <Check className="mr-1 h-3 w-3" />}
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Select all that apply</p>
                            </div>
                        )}

                        {!asset?.issue_types || asset.issue_types.length === 0 ? (
                            <div className="space-y-2">
                                <Label htmlFor="title">Issue Title</Label>
                                <Input 
                                    id="title" 
                                    placeholder="e.g. Screen cracked, Not turning on" 
                                    required 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-white text-slate-900 placeholder:text-slate-500"
                                />
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <Label htmlFor="priority">Severity</Label>
                            <Select value={priority} onValueChange={(val) => setPriority(val as IssuePriority)}>
                                <SelectTrigger className="bg-white text-slate-900 border border-gray-200">
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
                                className="min-h-[100px] bg-white text-slate-900 placeholder:text-slate-500"
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
                                    className="bg-white text-slate-900 placeholder:text-slate-500"
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
                                    className="bg-white text-slate-900 placeholder:text-slate-500"
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
