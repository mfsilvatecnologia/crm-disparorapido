import { useState, useEffect, useCallback } from 'react';
import { SupabaseRealtimeService, WorkerStatusUpdate, ScrapingJobUpdate } from '@/shared/services/supabase';

export interface WorkerMonitorState {
  workers: Record<string, WorkerStatusUpdate>;
  jobs: ScrapingJobUpdate[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWorkerMonitor() {
  const [state, setState] = useState<WorkerMonitorState>({
    workers: {},
    jobs: [],
    isConnected: false,
    isLoading: true,
    error: null,
  });

  const [realtimeService, setRealtimeService] = useState<SupabaseRealtimeService | null>(null);

  // Inicializar serviço
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Variáveis de ambiente do Supabase não configuradas'
      }));
      return;
    }

    const service = new SupabaseRealtimeService(supabaseUrl, supabaseKey);
    setRealtimeService(service);

    // Testar conexão
    service.testConnection().then((connected) => {
      setState(prev => ({
        ...prev,
        isConnected: connected,
        isLoading: false,
        error: connected ? null : null // Sem erro se não conectado - é opcional
      }));
    });

    // Cleanup na desmontagem
    return () => {
      console.log('🧹 Limpando serviço realtime...');
      service.cleanup();
    };
  }, []);

  // Handlers para atualizações
  const handleWorkerUpdate = useCallback((update: WorkerStatusUpdate) => {
    setState(prev => ({
      ...prev,
      workers: {
        ...prev.workers,
        [update.workerId]: update
      }
    }));
  }, []);

  const handleJobUpdate = useCallback((update: ScrapingJobUpdate) => {
    setState(prev => ({
      ...prev,
      jobs: [update, ...prev.jobs.slice(0, 49)] // Mantém últimas 50 atualizações
    }));
  }, []);

  // Iniciar monitoramento
  const startMonitoring = useCallback(() => {
    if (!realtimeService) {
      return;
    }

    if (!state.isConnected) {
      console.log('ℹ️ Monitoramento realtime não disponível - Supabase offline');
      return;
    }

    console.log('🚀 Iniciando monitoramento de workers...');

    let isActive = true;
    let unsubscribeWorkers: (() => void) | null = null;
    let unsubscribeJobs: (() => void) | null = null;

    // Aguardar um pouco para garantir que a conexão está estável
    const timer = setTimeout(() => {
      if (isActive) {
        unsubscribeWorkers = realtimeService.subscribeToWorkerStatus(handleWorkerUpdate);
        unsubscribeJobs = realtimeService.subscribeToScrapingJobUpdates(handleJobUpdate);
      }
    }, 100);

    return () => {
      isActive = false;
      clearTimeout(timer);
      console.log('🛑 Parando monitoramento de workers...');

      if (unsubscribeWorkers) {
        try {
          unsubscribeWorkers();
        } catch (error) {
          console.warn('⚠️ Erro ao cancelar inscrição de workers:', error);
        }
      }

      if (unsubscribeJobs) {
        try {
          unsubscribeJobs();
        } catch (error) {
          console.warn('⚠️ Erro ao cancelar inscrição de jobs:', error);
        }
      }
    };
  }, [realtimeService, handleWorkerUpdate, handleJobUpdate, state.isConnected]);

  // Parar monitoramento
  const stopMonitoring = useCallback(() => {
    if (!realtimeService) return;

    console.log('🛑 Parando monitoramento...');
    // As inscrições serão canceladas quando o componente for desmontado
  }, [realtimeService]);

  // Limpar dados
  const clearData = useCallback(() => {
    setState(prev => ({
      ...prev,
      workers: {},
      jobs: []
    }));
  }, []);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    clearData,
    realtimeService
  };
}
