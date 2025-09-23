// ConnectionStatus Component - Visual indicator of API connectivity
import React from 'react';
import { Wifi, WifiOff, RotateCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConnectivity } from '@/hooks/useConnectivity';

interface ConnectionStatusProps {
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'card' | 'inline';
}

export function ConnectionStatus({ 
  showDetails = false, 
  size = 'md',
  variant = 'badge'
}: ConnectionStatusProps) {
  const connectivity = useConnectivity();

  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'md' ? 16 : 20;
    
    if (connectivity.isChecking) {
      return <RotateCw className={`animate-spin`} size={iconSize} />;
    }
    
    if (connectivity.isOnline) {
      return <CheckCircle size={iconSize} />;
    }
    
    return <AlertCircle size={iconSize} />;
  };

  const getBadgeVariant = () => {
    const color = connectivity.getStatusColor();
    if (color === 'green') return 'default';
    if (color === 'yellow') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    return connectivity.getStatusMessage();
  };

  if (variant === 'badge') {
    return (
      <Badge 
        variant={getBadgeVariant()}
        className="flex items-center gap-1"
      >
        {getIcon()}
        {getStatusText()}
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 text-sm ${
          connectivity.isOnline ? 'text-green-600' : 'text-red-600'
        }`}>
          {getIcon()}
          <span>{getStatusText()}</span>
        </div>
        
        {!connectivity.isOnline && (
          <Button
            size="sm"
            variant="outline"
            onClick={connectivity.checkNow}
            disabled={connectivity.isChecking}
          >
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  // Card variant
  return (
    <Card className={`w-full ${!connectivity.isOnline ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <p className={`font-medium ${
                connectivity.isOnline ? 'text-green-700' : 'text-red-700'
              }`}>
                {connectivity.isOnline ? 'Conectado ao servidor' : 'Sem conexão com o servidor'}
              </p>
              
              {showDetails && (
                <div className="text-sm text-gray-600 mt-1">
                  {connectivity.lastCheck && (
                    <p>Última verificação: {connectivity.lastCheck.toLocaleTimeString()}</p>
                  )}
                  {connectivity.responseTime && connectivity.isOnline && (
                    <p>Tempo de resposta: {connectivity.responseTime}ms</p>
                  )}
                  {connectivity.apiVersion && (
                    <p>Versão da API: {connectivity.apiVersion}</p>
                  )}
                  {connectivity.error && !connectivity.isOnline && (
                    <p className="text-red-600">Erro: {connectivity.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={connectivity.checkNow}
              disabled={connectivity.isChecking}
              className="flex items-center gap-1"
            >
              <RotateCw className={`h-3 w-3 ${connectivity.isChecking ? 'animate-spin' : ''}`} />
              Verificar
            </Button>
          </div>
        </div>
        
        {!connectivity.isOnline && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Problemas de conectividade</p>
                <p>Verifique sua conexão com a internet ou aguarde alguns minutos. O sistema tentará reconectar automaticamente.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact status for header/navigation
export function ConnectionStatusCompact() {
  const connectivity = useConnectivity();

  return (
    <div className="flex items-center gap-1 text-xs">
      <div className={`w-2 h-2 rounded-full ${
        connectivity.isOnline 
          ? 'bg-green-500' 
          : connectivity.isChecking 
            ? 'bg-yellow-500 animate-pulse' 
            : 'bg-red-500'
      }`} />
      <span className="text-gray-600">
        {connectivity.isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}