import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  className?: string;
}

export function KpiCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend = 'stable',
  trendValue,
  className 
}: KpiCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success-500';
      case 'down':
        return 'text-danger-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className={cn("bg-gradient-card border-0 shadow-xl hover:shadow-2xl transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">{description}</span>
          {trendValue && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}