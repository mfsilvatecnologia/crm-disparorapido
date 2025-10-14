import React, { useState, useEffect } from 'react';
import { useApiClient } from '@/shared/services/tenantApiClient';
import { useTenant } from '@/shared/contexts/TenantContext';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Wifi,
  WifiOff 
} from 'lucide-react';

interface ApiStatusProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * API Status Component
 * 
 * Displays the current connection status to the API backend
 * and provides controls for retrying failed connections
 */
export function ApiStatus({ showDetails = false, className = '' }: ApiStatusProps) {
  const { tenant } = useTenant();
  const apiClient = useApiClient();
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiHealth = React.useCallback(async () => {
    setIsChecking(true);
    try {
      const healthy = await apiClient.checkHealth();
      setIsHealthy(healthy);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
      setIsHealthy(false);
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  }, [apiClient]);

  // Initial health check
  useEffect(() => {
    if (tenant?.id) {
      // Small delay to allow client initialization
      const timer = setTimeout(checkApiHealth, 1000);
      return () => clearTimeout(timer);
    }
  }, [tenant?.id, checkApiHealth]);

  // Periodic health checks
  useEffect(() => {
    if (isHealthy === false) {
      // If unhealthy, check more frequently
      const interval = setInterval(checkApiHealth, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    } else if (isHealthy === true) {
      // If healthy, check less frequently
      const interval = setInterval(checkApiHealth, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isHealthy, checkApiHealth]);

  const getStatusInfo = () => {
    if (isChecking) {
      return {
        icon: RefreshCw,
        color: 'blue',
        status: 'Verificando...',
        description: 'Testando conexão com a API',
        variant: 'default' as const,
      };
    }

    if (isHealthy === null) {
      return {
        icon: AlertCircle,
        color: 'gray',
        status: 'Desconhecido',
        description: 'Status da API ainda não verificado',
        variant: 'default' as const,
      };
    }

    if (isHealthy) {
      return {
        icon: CheckCircle,
        color: 'green',
        status: 'Online',
        description: 'API funcionando normalmente',
        variant: 'default' as const,
      };
    } else {
      return {
        icon: XCircle,
        color: 'red',
        status: 'Offline',
        description: 'Não foi possível conectar com a API. Usando dados em cache.',
        variant: 'destructive' as const,
      };
    }
  };

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;
  const apiStatus = apiClient.getStatus();

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <IconComponent 
          className={`h-4 w-4 ${
            statusInfo.color === 'green' ? 'text-green-600' :
            statusInfo.color === 'red' ? 'text-red-600' :
            statusInfo.color === 'blue' ? 'text-blue-600 animate-spin' :
            'text-gray-400'
          }`} 
        />
        <Badge variant={statusInfo.variant}>
          API: {statusInfo.status}
        </Badge>
      </div>
    );
  }

  return (
    <div className={className}>
      <Alert variant={statusInfo.variant}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <IconComponent 
              className={`h-5 w-5 mt-0.5 ${
                statusInfo.color === 'green' ? 'text-green-600' :
                statusInfo.color === 'red' ? 'text-red-600' :
                statusInfo.color === 'blue' ? 'text-blue-600 animate-spin' :
                'text-gray-400'
              }`} 
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">API Status: {statusInfo.status}</span>
                {isHealthy === true && <Wifi className="h-4 w-4 text-green-600" />}
                {isHealthy === false && <WifiOff className="h-4 w-4 text-red-600" />}
              </div>
              <AlertDescription>
                {statusInfo.description}
              </AlertDescription>
              
              {showDetails && (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <div>Tenant: <span className="font-mono">{tenant?.id}</span></div>
                  <div>Endpoint: <span className="font-mono">{apiStatus.baseUrl}</span></div>
                  <div>Inicializado: {apiStatus.isInitialized ? 'Sim' : 'Não'}</div>
                  {lastChecked && (
                    <div>Última verificação: {lastChecked.toLocaleTimeString()}</div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={checkApiHealth}
            disabled={isChecking}
            className="ml-4"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Testando' : 'Testar'}
          </Button>
        </div>
      </Alert>

      {/* Troubleshooting tips for offline status */}
      {isHealthy === false && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Sugestões de Resolução:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Verifique se o servidor backend está rodando</li>
            <li>• Confirme se a porta {apiStatus.baseUrl.split(':').pop()} está disponível</li>
            <li>• Verifique as configurações de CORS do servidor</li>
            <li>• Tente recarregar a página</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ApiStatus;