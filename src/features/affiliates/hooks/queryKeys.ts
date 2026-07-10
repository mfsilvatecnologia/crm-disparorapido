export const affiliateKeys = {
  all: ['affiliates'] as const,
  code: () => [...affiliateKeys.all, 'code'] as const,
  statistics: (periodo?: string) => [...affiliateKeys.all, 'statistics', periodo ?? 'all'] as const,
  commissions: (params?: Record<string, unknown>) =>
    [...affiliateKeys.all, 'commissions', params] as const,
  repasses: (afiliadoId: string) => [...affiliateKeys.all, 'repasses', afiliadoId] as const,
  saldoMesDetalhe: (periodoReferencia: string) =>
    [...affiliateKeys.all, 'saldo-mes-detalhe', periodoReferencia] as const,
  pixKeys: () => [...affiliateKeys.all, 'pix-keys'] as const,
  clients: (afiliadoId: string) => [...affiliateKeys.all, 'clients', afiliadoId] as const,
  toolSubscription: () => [...affiliateKeys.all, 'tool-subscription'] as const,
  cadastro: () => [...affiliateKeys.all, 'cadastro'] as const,
};
