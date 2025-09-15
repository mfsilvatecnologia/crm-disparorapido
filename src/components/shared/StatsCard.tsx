import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: {
    card: 'border-border',
    icon: 'text-muted-foreground',
    value: 'text-foreground',
  },
  success: {
    card: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    icon: 'text-green-600 dark:text-green-400',
    value: 'text-green-900 dark:text-green-100',
  },
  warning: {
    card: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    icon: 'text-yellow-600 dark:text-yellow-400',
    value: 'text-yellow-900 dark:text-yellow-100',
  },
  destructive: {
    card: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    icon: 'text-red-600 dark:text-red-400',
    value: 'text-red-900 dark:text-red-100',
  },
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`;
      }
      return val.toLocaleString('pt-BR');
    }
    return val;
  };

  return (
    <Card className={cn(styles.card, className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <p className={cn("text-2xl font-bold", styles.value)}>
                {formatValue(value)}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
              {trend && (
                <div className="flex items-center gap-1">
                  <Badge 
                    variant={trend.isPositive === false ? "destructive" : "secondary"}
                    className="text-xs px-2 py-0"
                  >
                    {trend.isPositive === false ? '↓' : '↑'} {Math.abs(trend.value)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
          </div>
          <div className={cn("h-8 w-8 flex-shrink-0", styles.icon)}>
            <Icon className="h-full w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  cards: Omit<StatsCardProps, 'className'>[];
  className?: string;
  columns?: 2 | 3 | 4;
}

export function StatsGrid({ 
  cards, 
  className, 
  columns = 4 
}: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {cards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  );
}