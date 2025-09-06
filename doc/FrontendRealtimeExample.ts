// Exemplo de uso do Supabase Realtime no frontend
// Este arquivo mostra como o frontend pode se inscrever nas atualizações dos workers

import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface WorkerStatusUpdate {
  workerId: string;
  workerType: 'leads_temp_import' | 'message_consumer';
  status: 'running' | 'stopped' | 'error';
  isRunning: boolean;
  errorCount: number;
  maxErrors: number;
  lastProcessedTime?: string;
  config?: Record<string, unknown>;
  consumerCount?: number;
  timestamp: string;
}

interface ScrapingJobUpdate {
  jobId: string;
  status: string;
  leadsEncontrados: number;
  leadsInseridos: number;
  paginasProcessadas: number;
  erroDetalhes?: string;
  tempoExecucaoMs?: number;
  timestamp: string;
}

export class FrontendRealtimeService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Inscreve-se nas atualizações de status dos workers
   */
  subscribeToWorkerStatus(callback: (update: WorkerStatusUpdate) => void) {
    const channel = this.supabase
      .channel('workers_status')
      .on(
        'broadcast',
        { event: 'worker_status_update' },
        (payload) => {
          console.log('Worker status update received:', payload.payload);
          callback(payload.payload as WorkerStatusUpdate);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to worker status updates');
        }
      });

    // Retorna função para cancelar inscrição
    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  /**
   * Inscreve-se nas atualizações de progresso dos scraping jobs
   */
  subscribeToScrapingJobUpdates(callback: (update: ScrapingJobUpdate) => void) {
    const channel = this.supabase
      .channel('scraping_jobs')
      .on(
        'broadcast',
        { event: 'job_progress_update' },
        (payload) => {
          console.log('Scraping job update received:', payload.payload);
          callback(payload.payload as ScrapingJobUpdate);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to scraping job updates');
        }
      });

    // Retorna função para cancelar inscrição
    return () => {
      this.supabase.removeChannel(channel);
    };
  }
}

// Exemplo de uso em um componente React/Vue
export class WorkerStatusMonitor {
  private realtimeService: FrontendRealtimeService;
  private unsubscribeWorkerStatus?: () => void;
  private unsubscribeJobUpdates?: () => void;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.realtimeService = new FrontendRealtimeService(supabaseUrl, supabaseKey);
  }

  /**
   * Inicia o monitoramento dos workers
   */
  startMonitoring(
    onWorkerUpdate: (update: WorkerStatusUpdate) => void,
    onJobUpdate: (update: ScrapingJobUpdate) => void
  ) {
    // Monitora status dos workers
    this.unsubscribeWorkerStatus = this.realtimeService.subscribeToWorkerStatus(
      (update) => {
        console.log(`Worker ${update.workerId} status:`, update.status);
        onWorkerUpdate(update);
      }
    );

    // Monitora progresso dos jobs
    this.unsubscribeJobUpdates = this.realtimeService.subscribeToScrapingJobUpdates(
      (update) => {
        console.log(`Job ${update.jobId} progress:`, update);
        onJobUpdate(update);
      }
    );
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring() {
    if (this.unsubscribeWorkerStatus) {
      this.unsubscribeWorkerStatus();
      this.unsubscribeWorkerStatus = undefined;
    }

    if (this.unsubscribeJobUpdates) {
      this.unsubscribeJobUpdates();
      this.unsubscribeJobUpdates = undefined;
    }
  }
}

// Exemplo de uso em um componente React
/*
import React, { useEffect, useState } from 'react';
import { WorkerStatusMonitor, WorkerStatusUpdate, ScrapingJobUpdate } from './FrontendRealtimeService';

const WorkerDashboard: React.FC = () => {
  const [workerStatuses, setWorkerStatuses] = useState<Record<string, WorkerStatusUpdate>>({});
  const [jobUpdates, setJobUpdates] = useState<ScrapingJobUpdate[]>([]);

  useEffect(() => {
    const monitor = new WorkerStatusMonitor(
      process.env.REACT_APP_SUPABASE_URL!,
      process.env.REACT_APP_SUPABASE_ANON_KEY!
    );

    monitor.startMonitoring(
      (update) => {
        setWorkerStatuses(prev => ({
          ...prev,
          [update.workerId]: update
        }));
      },
      (update) => {
        setJobUpdates(prev => [update, ...prev.slice(0, 9)]); // Mantém últimas 10 atualizações
      }
    );

    return () => {
      monitor.stopMonitoring();
    };
  }, []);

  return (
    <div>
      <h2>Workers Status</h2>
      {Object.entries(workerStatuses).map(([workerId, status]) => (
        <div key={workerId}>
          <h3>{workerId}</h3>
          <p>Status: {status.status}</p>
          <p>Running: {status.isRunning ? 'Yes' : 'No'}</p>
          <p>Errors: {status.errorCount}/{status.maxErrors}</p>
          {status.consumerCount !== undefined && (
            <p>Consumers: {status.consumerCount}</p>
          )}
        </div>
      ))}

      <h2>Job Progress</h2>
      {jobUpdates.map((update, index) => (
        <div key={index}>
          <p>Job {update.jobId}: {update.status}</p>
          <p>Leads: {update.leadsEncontrados} encontrados, {update.leadsInseridos} inseridos</p>
          <p>Páginas: {update.paginasProcessadas}</p>
        </div>
      ))}
    </div>
  );
};

export default WorkerDashboard;
*/
