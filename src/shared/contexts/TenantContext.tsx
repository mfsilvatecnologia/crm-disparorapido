import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TenantConfig, TenantId } from '@/config/tenants/types';
import { getTenantByDomain, DEFAULT_TENANT_ID, tenants } from '@/config/tenants/tenants.config';

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

    // Convert hex to HSL for CSS variables (Tailwind uses HSL)
    root.style.setProperty('--tenant-primary', theme.primary);
    root.style.setProperty('--tenant-primary-foreground', theme.primaryForeground);
    root.style.setProperty('--tenant-secondary', theme.secondary);
    root.style.setProperty('--tenant-secondary-foreground', theme.secondaryForeground);
    root.style.setProperty('--tenant-accent', theme.accent);
    root.style.setProperty('--tenant-accent-foreground', theme.accentForeground);
    root.style.setProperty('--tenant-gradient-from', theme.gradientFrom);
    root.style.setProperty('--tenant-gradient-via', theme.gradientVia || theme.gradientFrom);
    root.style.setProperty('--tenant-gradient-to', theme.gradientTo);

    // Update document title and favicon
    document.title = tenant.branding.companyName;

    const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (favicon) {
      favicon.href = tenant.branding.favicon;
    }

    // Add tenant class to body for CSS targeting
    document.body.classList.remove('tenant-vendas', 'tenant-publix');
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
