import React from 'react';
import { cn } from '@/shared/utils/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  icon?: React.ReactNode;
  meta?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  emptyState?: React.ReactNode;
}

export function Timeline({ items, className, emptyState }: TimelineProps) {
  if (!items.length) {
    return <div className={cn('py-6 text-sm text-muted-foreground', className)}>{emptyState ?? 'Sem eventos.'}</div>;
  }

  return (
    <ol className={cn('space-y-6 border-l border-border pl-6', className)}>
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[29px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-xs text-muted-foreground">
            {item.icon ?? <span className="h-2 w-2 rounded-full bg-primary" />}
          </span>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-foreground">{item.title}</span>
              {item.timestamp ? (
                <span className="text-xs text-muted-foreground">{item.timestamp}</span>
              ) : null}
              {item.meta}
            </div>
            {item.description ? (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
