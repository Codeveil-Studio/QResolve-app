import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Insight {
  id: string;
  type: 'preventive' | 'warning' | 'optimization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  score: number;
}

export function AssetInsights() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const { toast } = useToast();
  const { organization } = useAuth();

  const storageKey = organization ? `ai_insights_${organization.id}` : null;

  // Load cached insights from localStorage on mount
  useEffect(() => {
    if (!storageKey) return;
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) setInsights(JSON.parse(cached));
    } catch {
      // ignore corrupted cache
    }
  }, [storageKey]);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights');
      if (error) {
        let message = error.message;
        try {
          const body = await (error as unknown as { context: Response }).context?.json?.();
          if (body?.error) message = body.error;
        } catch {
          // ignore parse failure, use generic message
        }
        throw new Error(message);
      }
      const fresh = data.insights ?? [];
      setInsights(fresh);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(fresh));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate insights';
      toast({ title: 'AI Insights error', description: message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-primary/10 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            AI Prescriptive Insights
          </CardTitle>
          <CardDescription>
            Gemini-powered analysis of your operational data
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={generateInsights} 
          disabled={isGenerating}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
          {isGenerating ? "Analyzing..." : "Re-generate"}
        </Button>
      </CardHeader>
      <CardContent>
        {insights.length === 0 && !isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-primary/60" />
            </div>
            <h4 className="font-medium">No insights generated yet</h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
              Click the button above to analyze your ticket history and asset performance.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border border-primary/10 bg-background/50 relative overflow-hidden group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'} className="text-[10px] uppercase tracking-wider h-5">
                          {insight.impact} impact
                        </Badge>
                        <h5 className="font-semibold text-sm">{insight.title}</h5>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary/40 group-hover:text-primary/100 transition-colors">
                        {insight.score}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">Confidence</div>
                    </div>
                  </div>
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-primary/20 transition-all group-hover:bg-primary/50" 
                    style={{ width: `${insight.score}%` }} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
