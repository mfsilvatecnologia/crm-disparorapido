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
  private channels: Map<string, any> = new Map();
  private connectionRetries: number = 0;
  private maxRetries: number = 3;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
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

    const channelName = 'workers_status';
    const channel = this.supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'worker_status_update' },
        (payload) => {
          console.log('📡 Worker status update received:', payload.payload);
          try {
            callback(payload.payload as WorkerStatusUpdate);
          } catch (error) {
            console.error('❌ Erro ao processar atualização do worker:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to worker status updates');
          this.isConnected = true;
          this.connectionRetries = 0;
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Channel error:', err);
          this.handleConnectionError('workers');
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Connection timed out for workers');
          this.handleConnectionError('workers');
        } else if (status === 'CLOSED') {
          console.log('❌ Unsubscribed from worker status updates');
          this.isConnected = false;
        }
      });

    this.channels.set(channelName, channel);

    // Retorna função para cancelar inscrição
    return () => {
      console.log('🔌 Cancelando inscrição dos workers...');
      const storedChannel = this.channels.get(channelName);
      if (storedChannel) {
        try {
          this.supabase.removeChannel(storedChannel);
          this.channels.delete(channelName);
        } catch (error) {
          console.warn('⚠️ Erro ao remover channel:', error);
        }
      }
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
   * Trata erros de conexão e tenta reconectar se necessário
   */
  private handleConnectionError(context: string) {
    this.connectionRetries++;
    console.warn(`⚠️ Tentativa de reconexão ${this.connectionRetries}/${this.maxRetries} para ${context}`);

    if (this.connectionRetries >= this.maxRetries) {
      console.error('❌ Máximo de tentativas de reconexão atingido');
      this.isConnected = false;
    }
  }

  /**
   * Limpa todos os channels ativos
   */
  cleanup() {
    console.log('🧹 Limpando channels ativos...');
    this.channels.forEach((channel, name) => {
      try {
        this.supabase.removeChannel(channel);
        console.log(`✅ Channel ${name} removido`);
      } catch (error) {
        console.warn(`⚠️ Erro ao remover channel ${name}:`, error);
      }
    });
    this.channels.clear();
    this.isConnected = false;
  }

  /**
   * Testa a conexão com o Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      // Testa conexão usando a tabela leads_base_geral que existe no banco
      const { data, error } = await this.supabase.from('leads_base_geral').select('count').limit(1);
      if (error) {
        console.warn('⚠️ Supabase não disponível:', error.message);
        return false;
      }
      console.log('✅ Conexão com Supabase estabelecida');
      return true;
    } catch (error) {
      console.warn('⚠️ Supabase offline - monitoramento realtime não disponível');
      return false;
    }
  }
}
