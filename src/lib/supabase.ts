import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface WorkerStatusUpdate {
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

export interface ScrapingJobUpdate {
  jobId: string;
  status: string;
  leadsEncontrados: number;
  leadsInseridos: number;
  paginasProcessadas: number;
  erroDetalhes?: string;
  tempoExecucaoMs?: number;
  timestamp: string;
}

export class SupabaseRealtimeService {
  private supabase: SupabaseClient;
  private isConnected: boolean = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Verifica se está conectado ao Supabase
   */
  isConnectedToRealtime(): boolean {
    return this.isConnected;
  }

  /**
   * Inscreve-se nas atualizações de status dos workers
   */
  subscribeToWorkerStatus(callback: (update: WorkerStatusUpdate) => void): () => void {
    console.log('🔄 Inscrevendo-se nas atualizações de status dos workers...');

    const channel = this.supabase
      .channel('workers_status')
      .on(
        'broadcast',
        { event: 'worker_status_update' },
        (payload) => {
          console.log('📡 Worker status update received:', payload.payload);
          callback(payload.payload as WorkerStatusUpdate);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to worker status updates');
          this.isConnected = true;
        } else if (status === 'CLOSED') {
          console.log('❌ Unsubscribed from worker status updates');
          this.isConnected = false;
        }
      });

    // Retorna função para cancelar inscrição
    return () => {
      console.log('🔌 Cancelando inscrição dos workers...');
      this.supabase.removeChannel(channel);
      this.isConnected = false;
    };
  }

  /**
   * Inscreve-se nas atualizações de progresso dos scraping jobs
   */
  subscribeToScrapingJobUpdates(callback: (update: ScrapingJobUpdate) => void): () => void {
    console.log('🔄 Inscrevendo-se nas atualizações de scraping jobs...');

    const channel = this.supabase
      .channel('scraping_jobs')
      .on(
        'broadcast',
        { event: 'job_progress_update' },
        (payload) => {
          console.log('📡 Scraping job update received:', payload.payload);
          callback(payload.payload as ScrapingJobUpdate);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to scraping job updates');
          this.isConnected = true;
        } else if (status === 'CLOSED') {
          console.log('❌ Unsubscribed from scraping job updates');
          this.isConnected = false;
        }
      });

    // Retorna função para cancelar inscrição
    return () => {
      console.log('🔌 Cancelando inscrição dos jobs...');
      this.supabase.removeChannel(channel);
      this.isConnected = false;
    };
  }

  /**
   * Testa a conexão com o Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      // Testa conexão usando a tabela leads_base_geral que existe no banco
      const { data, error } = await this.supabase.from('leads_base_geral').select('count').limit(1);
      if (error) {
        console.error('❌ Erro na conexão com Supabase:', error);
        return false;
      }
      console.log('✅ Conexão com Supabase estabelecida');
      return true;
    } catch (error) {
      console.error('❌ Erro ao testar conexão:', error);
      return false;
    }
  }
}
