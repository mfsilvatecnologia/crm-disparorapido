import type { ContractStatus } from '../types/contract';

export const CONTRACT_STATUSES: ContractStatus[] = ['VIGENTE', 'VENCIDO', 'RENOVADO', 'CANCELADO'];

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  VIGENTE: 'Vigente',
  VENCIDO: 'Vencido',
  RENOVADO: 'Renovado',
  CANCELADO: 'Cancelado',
};

export const CURRENCY_CODES = ['BRL', 'USD', 'EUR'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  BRL: 'Real (BRL)',
  USD: 'Dólar (USD)',
  EUR: 'Euro (EUR)',
};
