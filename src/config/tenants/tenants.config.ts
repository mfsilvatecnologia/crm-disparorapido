import { TenantConfig, TenantId } from './types';
import { vendasConfig } from './vendas.config';
import { publixConfig } from './publix.config';

/**
 * All tenant configurations
 */
export const tenants: Record<TenantId, TenantConfig> = {
  vendas: vendasConfig,
  publix: publixConfig,
};

/**
 * Default tenant (fallback)
 * Used when domain doesn't match any tenant
 */
export const DEFAULT_TENANT_ID: TenantId = 'vendas';

/**
 * Get tenant configuration by domain
 * @param hostname - The hostname to match (e.g., 'vendas.ia.br')
 * @returns Tenant configuration or default tenant
 */
export function getTenantByDomain(hostname: string): TenantConfig {
  // Normalize hostname (remove port if present)
  const normalizedHost = hostname.split(':')[0];

  // Find tenant by matching domain
  for (const tenant of Object.values(tenants)) {
    const domainMatch = tenant.domains.some(domain => {
      const normalizedDomain = domain.split(':')[0];
      return normalizedHost === normalizedDomain ||
             normalizedHost.endsWith(`.${normalizedDomain}`);
    });

    if (domainMatch) {
      return tenant;
    }
  }

  // For localhost without port specification, check if port is in URL
  if (hostname.includes('localhost')) {
    // Check for specific ports
    if (hostname.includes(':8081')) {
      return tenants.publix;
    }
    // Default to vendas for localhost:8080 or just localhost
    return tenants.vendas;
  }

  // Fallback to default tenant
  console.warn(`No tenant found for domain: ${hostname}. Using default tenant.`);
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
export { vendasConfig, publixConfig };
export * from './types';
