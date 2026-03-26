import React from 'react';
import { cn } from '@/lib/utils';
import { AssetStatus, IssueStatus, IssuePriority } from '@/lib/supabase-types';

interface StatusBadgeProps {
  status: AssetStatus | IssueStatus | IssuePriority | string;
  type?: 'asset' | 'issue' | 'priority';
}

const assetStatusStyles: Record<AssetStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  maintenance: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  retired: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const issueStatusStyles: Record<IssueStatus, string> = {
  open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const priorityStyles: Record<IssuePriority, string> = {
  low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-600 border-red-500/30 font-bold',
};

const formatLabel = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function StatusBadge({ status, type = 'asset' }: StatusBadgeProps) {
  let styleClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  
  if (type === 'asset' && status in assetStatusStyles) {
    styleClass = assetStatusStyles[status as AssetStatus];
  } else if (type === 'issue' && status in issueStatusStyles) {
    styleClass = issueStatusStyles[status as IssueStatus];
  } else if (type === 'priority' && status in priorityStyles) {
    styleClass = priorityStyles[status as IssuePriority];
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-all duration-200', 
      styleClass
    )}>
      <span className="h-1 w-1 rounded-full bg-current animate-pulse-subtle" />
      {formatLabel(status)}
    </span>
  );
}
