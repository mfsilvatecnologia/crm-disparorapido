import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TenantConfig, TenantId } from '@/config/tenants/types';
import { getTenantByDomain, DEFAULT_TENANT_ID, tenants } from '@/config/tenants/tenants.config';

/**
 * Converte hex (#RRGGBB) para componentes HSL no formato usado pelo Tailwind: "H S% L%"
 * (sem a função hsl(), pois as classes usam `hsl(var(--primary))`).
 */
function hexToHslChannels(hex: string): string | null {
  const raw = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return null;

  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function lightenHslChannels(channels: string, deltaL: number): string {
  const match = channels.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return channels;
  const h = match[1];
  const s = match[2];
  const l = Math.min(100, Math.max(0, Number(match[3]) + deltaL));
  return `${h} ${s}% ${Math.round(l)}%`;
}

/**
 * Tenant Context Interface
 */
interface TenantContextValue {
  tenant: TenantConfig;
  tenantId: TenantId;
  isLoading: boolean;

  // Helper functions
  setTenant: (tenantId: TenantId) => void;
  isTenant: (tenantId: TenantId) => boolean;
}

/**
 * Tenant Context
 */
const TenantContext = createContext<TenantContextValue | undefined>(undefined);

/**
 * Tenant Provider Props
 */
interface TenantProviderProps {
  children: React.ReactNode;
  /** Force a specific tenant (useful for testing) */
  forceTenant?: TenantId;
}

/**
 * Tenant Provider Component
 * Automatically detects and provides tenant configuration based on domain
 */
export function TenantProvider({ children, forceTenant }: TenantProviderProps) {
  const [tenant, setTenantState] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Detect tenant based on current domain
    const detectTenant = () => {
      try {
        if (forceTenant) {
          // Use forced tenant (for testing)
          setTenantState(tenants[forceTenant]);
        } else {
          // Detect from hostname
          const hostname = window.location.hostname;
          const port = window.location.port;
          const hostnameWithPort = port ? `${hostname}:${port}` : hostname;

          const detectedTenant = getTenantByDomain(hostnameWithPort);
          setTenantState(detectedTenant);

          console.log(`[TenantProvider] Detected tenant: ${detectedTenant.id} for domain: ${hostnameWithPort}`);
        }
      } catch (error) {
        console.error('[TenantProvider] Error detecting tenant:', error);
        // Fallback to default tenant
        setTenantState(tenants[DEFAULT_TENANT_ID]);
      } finally {
        setIsLoading(false);
      }
    };

    detectTenant();
  }, [forceTenant]);

  // Apply tenant theme to document
  useEffect(() => {
    if (!tenant) return;

    // Set CSS variables for theme
    const root = document.documentElement;
    const theme = tenant.theme;

    // Variáveis hex específicas do tenant (gradientes / uso direto)
    root.style.setProperty('--tenant-primary', theme.primary);
    root.style.setProperty('--tenant-primary-foreground', theme.primaryForeground);
    root.style.setProperty('--tenant-secondary', theme.secondary);
    root.style.setProperty('--tenant-secondary-foreground', theme.secondaryForeground);
    root.style.setProperty('--tenant-accent', theme.accent);
    root.style.setProperty('--tenant-accent-foreground', theme.accentForeground);
    root.style.setProperty('--tenant-gradient-from', theme.gradientFrom);
    root.style.setProperty('--tenant-gradient-via', theme.gradientVia || theme.gradientFrom);
    root.style.setProperty('--tenant-gradient-to', theme.gradientTo);

    // Sobrescreve tokens shadcn/Tailwind (bg-primary, ring, etc.) com a marca do tenant
    const primaryHsl = hexToHslChannels(theme.primary);
    const accentHsl = hexToHslChannels(theme.accent) ?? primaryHsl;
    const primaryFgHsl = hexToHslChannels(theme.primaryForeground) ?? '0 0% 100%';

    if (primaryHsl) {
      const primaryGlow = lightenHslChannels(primaryHsl, 10);
      const primaryDark = lightenHslChannels(primaryHsl, -8);
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--primary-foreground', primaryFgHsl);
      root.style.setProperty('--primary-glow', primaryGlow);
      root.style.setProperty('--primary-dark', primaryDark);
      root.style.setProperty('--ring', primaryHsl);
      root.style.setProperty('--sidebar-primary', primaryHsl);
      root.style.setProperty('--sidebar-primary-foreground', primaryFgHsl);
      root.style.setProperty('--sidebar-ring', primaryHsl);
      root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(135deg, hsl(${primaryHsl}), hsl(${primaryGlow}))`
      );
    }

    if (accentHsl) {
      // Mantém --accent como tom suave para hovers; brand fica no --primary
      root.style.setProperty('--accent', lightenHslChannels(primaryHsl ?? accentHsl, 62));
      root.style.setProperty('--accent-foreground', primaryHsl ?? '210 100% 32%');
      root.style.setProperty('--accent-light', lightenHslChannels(primaryHsl ?? accentHsl, 12));
    }

    // Update document title and favicon
    document.title = tenant.branding.companyName;

    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = tenant.branding.favicon;
    }

    // Add tenant class to body for CSS targeting
    document.body.classList.remove('tenant-vendas-ia', 'tenant-publix', 'tenant-disparo-rapido', 'tenant-lean-quality', 'tenant-ph3a');
    document.body.classList.add(`tenant-${tenant.id}`);
  }, [tenant]);

  const setTenant = (tenantId: TenantId) => {
    setTenantState(tenants[tenantId]);
  };

  const isTenant = (tenantId: TenantId): boolean => {
    return tenant?.id === tenantId;
  };

  const contextValue = useMemo<TenantContextValue | undefined>(() => {
    if (!tenant) return undefined;

    return {
      tenant,
      tenantId: tenant.id,
      isLoading,
      setTenant,
      isTenant,
    };
  }, [tenant, isLoading]);

  if (isLoading || !contextValue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Carregando configuração...</p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to use tenant context
 * @returns Tenant context value
 * @throws Error if used outside TenantProvider
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }

  return context;
}

/**
 * Export TenantContext for advanced usage
 */
export { TenantContext };
