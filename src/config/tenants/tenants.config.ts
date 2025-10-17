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
 * @param hostname - The hostname to match (e.g., 'vendas.ia.br' or 'localhost:8080')
 * @returns Tenant configuration or default tenant
 */
export function getTenantByDomain(hostname: string): TenantConfig {
  // Para localhost, a porta é importante - não normalizar
  if (hostname.includes('localhost')) {
    // Procurar tenant que tenha exatamente este hostname com porta
    for (const tenant of Object.values(tenants)) {
      if (tenant.domains.includes(hostname)) {
        console.log(`[getTenantByDomain] Found tenant ${tenant.id} for ${hostname}`);
        return tenant;
      }
    }

    // Se não encontrou com porta, usar fallback por porta
    if (hostname.includes(':8081')) {
      console.log(`[getTenantByDomain] Using publix for port 8081`);
      return tenants.publix;
    }

    // Default para vendas em localhost sem porta ou porta 8080
    console.log(`[getTenantByDomain] Using vendas as default for localhost`);
    return tenants.vendas;
  }

  // Para domínios de produção, remover porta para comparação
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
  console.warn(`[getTenantByDomain] No tenant found for domain: ${hostname}. Using default tenant.`);
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
