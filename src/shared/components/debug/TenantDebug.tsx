import { useTenant } from '@/shared/contexts/TenantContext';
import { useFeatures } from '@/shared/hooks/useFeatures';

/**
 * Componente de Debug para visualizar informações do Tenant
 * Útil para desenvolvimento e troubleshooting
 */
export function TenantDebug() {
  const { tenant, tenantId } = useTenant();
  const { features, getEnabledFeatures, getDisabledFeatures } = useFeatures();

  const enabledFeatures = getEnabledFeatures();
  const disabledFeatures = getDisabledFeatures();

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-xl max-w-md z-50 text-xs font-mono">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🔍 Tenant Debug</h3>
        <button
          onClick={() => {
            const debug = document.getElementById('tenant-debug');
            if (debug) debug.remove();
          }}
          className="text-white/60 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-yellow-400">Tenant ID:</span>{' '}
          <span className="font-bold">{tenantId}</span>
        </div>

        <div>
          <span className="text-yellow-400">Name:</span> {tenant.name}
        </div>

        <div>
          <span className="text-yellow-400">Domain:</span>{' '}
          {window.location.hostname}:{window.location.port || '80'}
        </div>

        <div className="border-t border-white/20 pt-2 mt-2">
          <div className="text-green-400 font-bold mb-1">
            ✅ Enabled ({enabledFeatures.length}):
          </div>
          {enabledFeatures.length > 0 ? (
            <ul className="pl-2 space-y-0.5">
              {enabledFeatures.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          ) : (
            <div className="text-white/40 pl-2">Nenhuma feature habilitada</div>
          )}
        </div>

        <div className="border-t border-white/20 pt-2 mt-2">
          <div className="text-red-400 font-bold mb-1">
            ❌ Disabled ({disabledFeatures.length}):
          </div>
          {disabledFeatures.length > 0 ? (
            <ul className="pl-2 space-y-0.5">
              {disabledFeatures.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          ) : (
            <div className="text-white/40 pl-2">Todas habilitadas</div>
          )}
        </div>

        <div className="border-t border-white/20 pt-2 mt-2 text-white/60">
          Press F12 para abrir DevTools
        </div>
      </div>
    </div>
  );
}

/**
 * Hook para adicionar o debug na página
 * Útil para adicionar temporariamente em qualquer página
 */
export function useTenantDebug() {
  const { tenant } = useTenant();
  const { features } = useFeatures();

  return {
    logTenant: () => {
      console.group('🔍 Tenant Debug');
      console.log('Tenant ID:', tenant.id);
      console.log('Tenant Name:', tenant.name);
      console.log('Domain:', `${window.location.hostname}:${window.location.port || '80'}`);
      console.table(features);
      console.groupEnd();
    },
    tenant,
    features,
  };
}
