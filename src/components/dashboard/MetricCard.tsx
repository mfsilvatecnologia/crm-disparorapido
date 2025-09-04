import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Target,
  Star,
  Activity,
  Zap,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    period: string;
  };
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  breakdown?: Array<{
    label: string;
    value: number;
    percentage?: number;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  status?: 'success' | 'warning' | 'error' | 'info';
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  color = 'blue',
  breakdown,
  actions,
  status
}: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      border: 'border-blue-200',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      border: 'border-green-200',
      accent: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      border: 'border-yellow-200',
      accent: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-200',
      accent: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      border: 'border-purple-200',
      accent: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      icon: 'text-gray-600',
      border: 'border-gray-200',
      accent: 'text-gray-600'
    }
  };

  const currentColor = colorClasses[color];

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'neutral':
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    if (!status) return null;
    
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'info':
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className={`border-2 ${currentColor.border} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${currentColor.bg}`}>
              <div className={`h-5 w-5 ${currentColor.icon}`}>
                {icon}
              </div>
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
              {status && (
                <div className="flex items-center gap-1 mt-1">
                  {getStatusIcon()}
                  <span className="text-xs text-gray-500">
                    {status === 'success' && 'Excelente'}
                    {status === 'warning' && 'Atenção'}
                    {status === 'error' && 'Crítico'}
                    {status === 'info' && 'Informação'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Main Value */}
          <div>
            <div className={`text-3xl font-bold ${currentColor.accent}`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Change Indicator */}
          {change && (
            <div className="flex items-center gap-2">
              {getChangeIcon()}
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">{change.period}</span>
            </div>
          )}

          {/* Breakdown */}
          {breakdown && breakdown.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Detalhamento
              </div>
              {breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value.toLocaleString('pt-BR')}</span>
                    {item.percentage !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  className="flex-1 text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componentes específicos para diferentes tipos de métricas

interface LeadsMetricProps {
  total: number;
  change: number;
  breakdown: {
    novos: number;
    qualificados: number;
    convertidos: number;
  };
  onViewAll: () => void;
  onFilter: () => void;
  onExport: () => void;
}

export function LeadsMetricCard({
  total,
  change,
  breakdown,
  onViewAll,
  onFilter,
  onExport
}: LeadsMetricProps) {
  const totalBreakdown = breakdown.novos + breakdown.qualificados + breakdown.convertidos;
  
  return (
    <MetricCard
      title="Leads Este Mês"
      value={total}
      subtitle="Total de leads capturados"
      change={{
        value: change,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        period: 'vs mês anterior'
      }}
      icon={<Users className="h-5 w-5" />}
      color="blue"
      breakdown={[
        {
          label: 'Novos',
          value: breakdown.novos,
          percentage: (breakdown.novos / totalBreakdown) * 100
        },
        {
          label: 'Qualificados',
          value: breakdown.qualificados,
          percentage: (breakdown.qualificados / totalBreakdown) * 100
        },
        {
          label: 'Convertidos',
          value: breakdown.convertidos,
          percentage: (breakdown.convertidos / totalBreakdown) * 100
        }
      ]}
      actions={[
        { label: 'Ver Todos', onClick: onViewAll },
        { label: 'Filtrar', onClick: onFilter, variant: 'outline' },
        { label: 'Exportar', onClick: onExport, variant: 'outline' }
      ]}
    />
  );
}

interface QualityMetricProps {
  average: number;
  distribution: {
    alta: number;
    media: number;
    baixa: number;
  };
  trend: 'up' | 'down' | 'stable';
  onOptimize: () => void;
}

export function QualityMetricCard({
  average,
  distribution,
  trend,
  onOptimize
}: QualityMetricProps) {
  const getStatus = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getLabel = (score: number) => {
    if (score >= 85) return 'Excelente';
    if (score >= 70) return 'Boa';
    return 'Regular';
  };

  return (
    <MetricCard
      title="Qualidade Média"
      value={`${average}%`}
      subtitle={getLabel(average)}
      change={{
        value: trend === 'up' ? 2.3 : trend === 'down' ? -1.2 : 0,
        direction: trend === 'stable' ? 'neutral' : trend,
        period: 'últimos 7 dias'
      }}
      icon={<Star className="h-5 w-5" />}
      color="green"
      status={getStatus(average)}
      breakdown={[
        {
          label: 'Alta (85-100)',
          value: distribution.alta,
          percentage: (distribution.alta / (distribution.alta + distribution.media + distribution.baixa)) * 100
        },
        {
          label: 'Média (70-84)',
          value: distribution.media,
          percentage: (distribution.media / (distribution.alta + distribution.media + distribution.baixa)) * 100
        },
        {
          label: 'Baixa (<70)',
          value: distribution.baixa,
          percentage: (distribution.baixa / (distribution.alta + distribution.media + distribution.baixa)) * 100
        }
      ]}
      actions={[
        { label: 'Otimizar', onClick: onOptimize }
      ]}
    />
  );
}

interface ROIMetricProps {
  value: number;
  period: string;
  projection: number;
  onViewReport: () => void;
}

export function ROIMetricCard({
  value,
  period,
  projection,
  onViewReport
}: ROIMetricProps) {
  return (
    <MetricCard
      title="ROI Estimado"
      value={`R$ ${value.toLocaleString('pt-BR')}`}
      subtitle={period}
      change={{
        value: 45.2,
        direction: 'up',
        period: 'vs período anterior'
      }}
      icon={<Target className="h-5 w-5" />}
      color="purple"
      breakdown={[
        {
          label: 'Projeção próximo mês',
          value: projection
        }
      ]}
      actions={[
        { label: 'Ver Relatório', onClick: onViewReport }
      ]}
    />
  );
}

interface GrowthMetricProps {
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  onAnalyze: () => void;
}

export function GrowthMetricCard({
  percentage,
  trend,
  onAnalyze
}: GrowthMetricProps) {
  return (
    <MetricCard
      title="Crescimento"
      value={`${percentage}%`}
      subtitle="vs mês anterior"
      change={{
        value: percentage,
        direction: trend === 'stable' ? 'neutral' : trend,
        period: 'tendência'
      }}
      icon={<BarChart3 className="h-5 w-5" />}
      color={percentage > 100 ? 'green' : percentage > 50 ? 'yellow' : 'red'}
      actions={[
        { label: 'Analisar', onClick: onAnalyze }
      ]}
    />
  );
}
