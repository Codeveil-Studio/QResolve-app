import React from 'react';
import { cn } from '@/lib/utils';
import { AssetStatus, IssueStatus, IssuePriority } from '@/lib/supabase-types';

interface StatusBadgeProps {
  status: AssetStatus | IssueStatus | IssuePriority | string;
  type?: 'asset' | 'issue' | 'priority';
}

const assetStatusStyles: Record<AssetStatus, string> = {
  active: 'status-badge-active',
  inactive: 'status-badge-inactive',
  maintenance: 'status-badge-pending',
  retired: 'status-badge-inactive',
};

const issueStatusStyles: Record<IssueStatus, string> = {
  open: 'status-badge-pending',
  in_progress: 'bg-primary/10 text-primary',
  resolved: 'status-badge-active',
  closed: 'status-badge-inactive',
};

const priorityStyles: Record<IssuePriority, string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
  critical: 'bg-destructive text-destructive-foreground',
};

const formatLabel = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function StatusBadge({ status, type = 'asset' }: StatusBadgeProps) {
  let styleClass = 'status-badge-inactive';
  
  if (type === 'asset' && status in assetStatusStyles) {
    styleClass = assetStatusStyles[status as AssetStatus];
  } else if (type === 'issue' && status in issueStatusStyles) {
    styleClass = issueStatusStyles[status as IssueStatus];
  } else if (type === 'priority' && status in priorityStyles) {
    styleClass = priorityStyles[status as IssuePriority];
  }

  return (
    <span className={cn('status-badge', styleClass)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatLabel(status)}
    </span>
  );
}
