export const affiliateKeys = {
  all: ['affiliates'] as const,
  code: () => [...affiliateKeys.all, 'code'] as const,
  statistics: () => [...affiliateKeys.all, 'statistics'] as const,
  commissions: (params?: Record<string, unknown>) =>
    [...affiliateKeys.all, 'commissions', params] as const,
};
