import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

  const generateInsights = () => {
    setIsGenerating(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setInsights([
        {
          id: '1',
          type: 'warning',
          title: 'Repeat Fault Pattern: Vending M-04',
          description: 'Coin validator has failed 3 times in 14 days. Suggest full module replacement instead of field repair to avoid further downtime.',
          impact: 'high',
          score: 85
        },
        {
          id: '2',
          type: 'optimization',
          title: 'Optimal Dispatch Window',
          description: 'Historical data shows 92% of faults in BKC area occur between 2PM-4PM. Adjusting technician proximity during this window could reduce response time by 12 mins.',
          impact: 'medium',
          score: 72
        },
        {
          id: '3',
          type: 'preventive',
          title: 'Predictive Cooling Tower Service',
          description: 'Based on vibratory sensors and ambient temperature rise, Cooling Tower #2 is predicted to overheat within 72 hours.',
          impact: 'high',
          score: 94
        }
      ]);
      setIsGenerating(false);
    }, 2000);
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
