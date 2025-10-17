export interface StartProcessingRequest {
  batchSize?: number;
  maxConcurrency?: number;
  filters?: Record<string, unknown>;
}

export interface StartProcessingResponse {
  success: boolean;
  data: {
    jobId: string;
  };
  message: string;
}

export interface ProcessingStatus {
  isRunning: boolean;
  totalLeads: number;
  processedLeads: number;
  pendingLeads: number;
  errorLeads: number;
}

export interface ProcessingStatusResponse {
  success: boolean;
  data: ProcessingStatus;
  message: string;
}

export interface ProcessingReport {
  periodo: {
    inicio: string;
    fim: string;
  };
  estatisticas: {
    totalProcessados: number;
    sucessos: number;
    erros: number;
    tempoMedioProcessamento: number;
  };
}

export interface ProcessingReportResponse {
  success: boolean;
  data: ProcessingReport;
  message: string;
}

export interface StuckLead {
  id: string;
  nome: string;
  status: string;
  tempoTravado: number;
  ultimaAtualizacao: string;
}

export interface StuckLeadsResponse {
  success: boolean;
  data: StuckLead[];
}

export interface ResetStuckRequest {
  minutosMinimos: number;
}

export interface ResetStuckResponse {
  success: boolean;
  data: {
    leadsResetados: number;
  };
  message: string;
}
