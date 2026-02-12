import { TenantConfig, TenantId } from './types';
import { disparorapidoConfig } from './disparo-rapido.config';

/**
 * All tenant configurations
 */
export const tenants: Record<TenantId, TenantConfig> = {
  'disparo-rapido': disparorapidoConfig,
};

/**
 * Default tenant (fallback)
 * Used when domain doesn't match any tenant
 */
export const DEFAULT_TENANT_ID: TenantId = 'disparo-rapido';

/**
 * Get tenant configuration by domain
 * @param hostname - The hostname to match (e.g., 'localhost:3002')
 * @returns Tenant configuration or default tenant
 */
export function getTenantByDomain(hostname: string): TenantConfig {
  // Para localhost, a porta é importante
  if (hostname.includes('localhost') || hostname.includes(':3002')) {
    console.log(`[getTenantByDomain] Using disparo-rapido for ${hostname}`);
    return tenants['disparo-rapido'];
  }

  // Para domínios de produção
  const normalizedHost = hostname.split(':')[0];

  // Find tenant by matching domain
  for (const tenant of Object.values(tenants)) {
    const domainMatch = tenant.domains.some(domain => {
      const normalizedDomain = domain.split(':')[0];
      return normalizedHost === normalizedDomain ||
             normalizedHost.endsWith(`.${normalizedDomain}`);
    });

    if (domainMatch) {
      console.log(`[getTenantByDomain] Found tenant ${tenant.id} for domain ${hostname}`);
      return tenant;
    }
  }

  // Fallback to default tenant
  console.log(`[getTenantByDomain] Using default tenant: ${DEFAULT_TENANT_ID}`);
  return tenants[DEFAULT_TENANT_ID];
}

/**
 * Get tenant by ID
 * @param id - Tenant ID
 * @returns Tenant configuration
 */
export function getTenantById(id: TenantId): TenantConfig {
  return tenants[id];
}

/**
 * Export individual configs for convenience
 */
export { disparorapidoConfig };
export * from './types';
