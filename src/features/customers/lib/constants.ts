import type { CustomerSegment, CustomerStatus } from '../types/customer';

export const CUSTOMER_STATUSES: CustomerStatus[] = ['ATIVO', 'INATIVO', 'SUSPENSO', 'CANCELADO'];

// Display labels for status
export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
};

export const CUSTOMER_SEGMENTS: CustomerSegment[] = ['Enterprise', 'SMB', 'Startup', 'Outro'];

export const CUSTOMER_SEGMENT_LABELS: Record<CustomerSegment, string> = {
  Enterprise: 'Enterprise',
  SMB: 'SMB',
  Startup: 'Startup',
  Outro: 'Outro',
};

export const HEALTH_SCORE_THRESHOLDS = {
  healthy: 80,
  atRisk: 50,
};
