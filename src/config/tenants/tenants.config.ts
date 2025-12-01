import { TenantConfig, TenantId } from './types';
import { vendasIaConfig } from './vendas-ia.config';
import { publixConfig } from './publix.config';
import { disparorapidoConfig } from './disparo-rapido.config';
import { leanQualityConfig } from './lean-quality.config';
import { ph3aConfig } from './ph3a.config';

/**
 * All tenant configurations
 */
export const tenants: Record<TenantId, TenantConfig> = {
  'vendas-ia': vendasIaConfig,
  publix: publixConfig,
  'disparo-rapido': disparorapidoConfig,
  'lean-quality': leanQualityConfig,
  ph3a: ph3aConfig,
};

/**
 * Default tenant (fallback)
 * Used when domain doesn't match any tenant
 */
export const DEFAULT_TENANT_ID: TenantId = 'vendas-ia';

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
    if (hostname.includes(':3001')) {
      console.log(`[getTenantByDomain] Using publix for port 3001`);
      return tenants.publix;
    }
    if (hostname.includes(':3002')) {
      console.log(`[getTenantByDomain] Using disparo-rapido for port 3002`);
      return tenants['disparo-rapido'];
    }
    if (hostname.includes(':3003')) {
      console.log(`[getTenantByDomain] Using lean-quality for port 3003`);
      return tenants['lean-quality'];
    }
    if (hostname.includes(':3004')) {
      console.log(`[getTenantByDomain] Using ph3a for port 3004`);
      return tenants.ph3a;
    }

    // Default para vendas-ia em localhost sem porta ou porta 3000
    console.log(`[getTenantByDomain] Using vendas-ia as default for localhost`);
    return tenants['vendas-ia'];
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
export { vendasIaConfig, publixConfig, disparorapidoConfig, leanQualityConfig, ph3aConfig };
export * from './types';
