import React, { useEffect, useState } from 'react';
import type { Provider } from '../types/enrichment';
import { listProviders, updateProvider } from '../services/providersApi';
import { ProviderTable } from '../components/ProviderTable';
import { ProviderEditModal } from '../components/ProviderEditModal';
import { notifyError, notifySuccess } from '../lib/notifications';

export const ProviderAdminPage: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const list = await listProviders();
    setProviders(list);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onToggleEnabled = async (id: string, next: boolean) => {
    // optimistic update
    setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: next } : p)));
    try {
      setLoading(true);
      const updated = await updateProvider(id, { enabled: next });
      setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)));
      notifySuccess('Provider atualizado com sucesso');
    } catch (e) {
      notifyError('Erro ao atualizar provider');
      // revert on error
      setProviders((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !next } : p)));
    } finally {
      setLoading(false);
    }
  };

  const onSaveEdit = async (values: { priority: number; rateLimitPerMin: number }) => {
    if (!editing) return;
    try {
      setLoading(true);
      const updated = await updateProvider(editing.id, values);
      setProviders((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      notifySuccess('Provider editado com sucesso');
    } catch (e) {
      notifyError('Erro ao editar provider');
    } finally {
      setLoading(false);
      setEditing(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Administração de Providers</h2>
        <button className="px-3 py-2 border rounded" onClick={refresh} disabled={loading}>Atualizar</button>
      </div>
      <ProviderTable providers={providers} onToggleEnabled={onToggleEnabled} onEdit={setEditing} />
      <ProviderEditModal open={!!editing} provider={editing} onClose={() => setEditing(null)} onSave={onSaveEdit} />
    </div>
  );
};
