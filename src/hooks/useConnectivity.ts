// useConnectivity Hook - Monitor API connectivity status
import { useState, useEffect } from 'react';
import { healthCheckService, type HealthStatus } from '../lib/api/health-check';

export interface ConnectivityState {
  isOnline: boolean;
  isChecking: boolean;
  lastCheck: Date | null;
  responseTime: number | null;
  apiVersion: string | null;
  error: string | null;
}

export function useConnectivity() {
  const [state, setState] = useState<ConnectivityState>({
    isOnline: false,
    isChecking: false,
    lastCheck: null,
    responseTime: null,
    apiVersion: null,
    error: null,
  });

  useEffect(() => {
    // Get initial status
    const currentStatus = healthCheckService.getHealthStatus();
    updateStateFromHealth(currentStatus);

    // Subscribe to status changes
    const unsubscribe = healthCheckService.addStatusListener((status: HealthStatus) => {
      updateStateFromHealth(status);
    });

    return unsubscribe;
  }, []);

  const updateStateFromHealth = (health: HealthStatus) => {
    setState({
      isOnline: health.isOnline,
      isChecking: false,
      lastCheck: health.lastCheck,
      responseTime: health.responseTime || null,
      apiVersion: health.apiVersion || null,
      error: health.error || null,
    });
  };

  const checkNow = async () => {
    setState(prev => ({ ...prev, isChecking: true }));
    
    try {
      const status = await healthCheckService.performHealthCheck();
      updateStateFromHealth(status);
    } catch (error) {
      console.error('Manual health check failed:', error);
    }
  };

  const getStatusMessage = (): string => {
    if (state.isChecking) {
      return 'Verificando conexão...';
    }
    
    if (state.isOnline) {
      const time = state.responseTime ? `${state.responseTime}ms` : '';
      return `Online ${time ? `(${time})` : ''}`;
    }
    
    return state.error || 'Offline';
  };

  const getStatusColor = (): 'green' | 'yellow' | 'red' => {
    if (state.isChecking) return 'yellow';
    if (state.isOnline) {
      if (state.responseTime && state.responseTime > 2000) return 'yellow';
      return 'green';
    }
    return 'red';
  };

  return {
    ...state,
    checkNow,
    getStatusMessage,
    getStatusColor,
  };
}