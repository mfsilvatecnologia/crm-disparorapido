import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Target, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface UsageData {
  plan: string;
  leadsUsed: number;
  leadsLimit: number;
  daysRemaining: number;
  activeCampaigns: number;
  maxCampaigns: number;
  integrations: number;
  maxIntegrations: number;
  exports: number;
  maxExports: number;
  apiCalls: number;
  maxApiCalls: number;
  estimatedDaysUntilLimit: number;
}

interface UsageMonitorWidgetProps {
  usage: UsageData;
  className?: string;
}

export function UsageMonitorWidget({ usage, className = '' }: UsageMonitorWidgetProps) {
  const getUsagePercentage = () => {
    return Math.round((usage.leadsUsed / usage.leadsLimit) * 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-danger-500';
    if (percentage >= 75) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  const shouldShowWarning = () => {
    return usage.estimatedDaysUntilLimit <= 10;
  };

  return (
    <Card className={`bg-white border border-gray-200 shadow-lg ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-primary-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            Usage - Plano {usage.plan}
          </CardTitle>
        </div>
        <Button variant="outline" size="sm" className="text-primary-600 hover:text-primary-700">
          Upgrade
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Uso Principal de Leads */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">Leads Consumidos</h3>
            <span className="text-sm font-medium text-gray-600">
              {getUsagePercentage()}%
            </span>
          </div>
          
          <div className="mb-3">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {usage.leadsUsed.toLocaleString()} / {usage.leadsLimit.toLocaleString()} leads
            </div>
            <Progress 
              value={getUsagePercentage()} 
              className="h-3"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>{usage.daysRemaining} dias restantes no ciclo</span>
            </div>
          </div>
        </div>

        {/* Breakdown de Recursos */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Breakdown</h3>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">• Campanhas ativas:</span>
              <span className="font-medium">
                {usage.activeCampaigns} / {usage.maxCampaigns}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">• Integrações CRM:</span>
              <span className="font-medium">
                {usage.integrations} / {usage.maxIntegrations}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">• Exports realizados:</span>
              <span className="font-medium">
                {usage.exports} / {usage.maxExports}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">• API calls:</span>
              <span className="font-medium">
                {usage.apiCalls.toLocaleString()} / {usage.maxApiCalls.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Warning de Uso */}
        {shouldShowWarning() && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning-800">
                  🎯 Baseado no seu uso, você ficará sem créditos em ~{usage.estimatedDaysUntilLimit} dias
                </p>
                <div className="mt-2 space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    📈 Ver Histórico
                  </Button>
                  <Button size="sm" className="text-xs bg-warning-600 hover:bg-warning-700">
                    💎 Fazer Upgrade
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress bars pequenos para outros recursos */}
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Campanhas</span>
              <span>{usage.activeCampaigns}/{usage.maxCampaigns}</span>
            </div>
            <Progress 
              value={(usage.activeCampaigns / usage.maxCampaigns) * 100} 
              className="h-1"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>API Calls</span>
              <span>{Math.round((usage.apiCalls / usage.maxApiCalls) * 100)}%</span>
            </div>
            <Progress 
              value={(usage.apiCalls / usage.maxApiCalls) * 100} 
              className="h-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
