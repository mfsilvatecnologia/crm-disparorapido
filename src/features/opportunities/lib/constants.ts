import type { OpportunityStage, OpportunityStatus } from '../types/opportunity';

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'Lead',
  'Qualificado',
  'Proposta',
  'Negociacao',
  'Ganha',
  'Perdida',
];

export const OPPORTUNITY_STATUS: OpportunityStatus[] = ['active', 'won', 'lost'];

export const OPPORTUNITY_STAGE_LABELS: Record<OpportunityStage, string> = {
  Lead: 'Lead',
  Qualificado: 'Qualificado',
  Proposta: 'Proposta',
  Negociacao: 'Negociacao',
  Ganha: 'Ganha',
  Perdida: 'Perdida',
};

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  active: 'Ativa',
  won: 'Ganha',
  lost: 'Perdida',
};

export const OPPORTUNITY_STAGE_COLORS: Record<OpportunityStage, string> = {
  Lead: 'bg-slate-100 text-slate-700',
  Qualificado: 'bg-blue-100 text-blue-700',
  Proposta: 'bg-amber-100 text-amber-700',
  Negociacao: 'bg-purple-100 text-purple-700',
  Ganha: 'bg-emerald-100 text-emerald-700',
  Perdida: 'bg-rose-100 text-rose-700',
};
