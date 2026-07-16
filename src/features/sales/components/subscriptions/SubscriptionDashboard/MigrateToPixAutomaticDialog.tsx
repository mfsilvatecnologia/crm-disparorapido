import { useState, useEffect, useRef, useCallback } from 'react';
import {
  startPixAutomaticMigration,
  startPixAutomaticRestore,
  getPixMigrationStatus,
  type StartPixMigrationResult,
} from '../../../api/pixMigrationApi';

interface MigrateToPixAutomaticDialogProps {
  subscriptionId: string;
  productName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** migrate = trocar cartão por PIX; restore = reativar assinatura cancelada */
  flow?: 'migrate' | 'restore';
}

const POLL_INTERVAL_MS = 4000;

export function MigrateToPixAutomaticDialog({
  subscriptionId,
  productName,
  isOpen,
  onClose,
  onSuccess,
  flow = 'migrate',
}: MigrateToPixAutomaticDialogProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [migrationData, setMigrationData] = useState<StartPixMigrationResult | null>(null);
  const [awaitingAuthorization, setAwaitingAuthorization] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      setLoading(false);
      setErrorMessage(null);
      setMigrationData(null);
      setAwaitingAuthorization(false);
      setConfirmed(false);
      setCopied(false);
    }
  }, [isOpen, stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const status = await getPixMigrationStatus(subscriptionId);
        if (status.pixQrCodeUrl && migrationData && !migrationData.pixQrCodeUrl) {
          setMigrationData((prev) =>
            prev
              ? {
                  ...prev,
                  pixQrCodeUrl: status.pixQrCodeUrl ?? prev.pixQrCodeUrl,
                  pixCopyPasteCode: status.pixCopyPasteCode ?? prev.pixCopyPasteCode,
                }
              : prev
          );
        }
        if (status.confirmed || status.completed) {
          setConfirmed(true);
          setAwaitingAuthorization(false);
          stopPolling();
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2500);
        }
      } catch {
        // polling silencioso — usuário pode tentar novamente
      }
    }, POLL_INTERVAL_MS);
  }, [subscriptionId, migrationData, stopPolling, onSuccess, onClose]);

  const handleStartMigration = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result =
        flow === 'restore'
          ? await startPixAutomaticRestore(subscriptionId)
          : await startPixAutomaticMigration(subscriptionId);
      setMigrationData(result);
      setAwaitingAuthorization(true);
      startPolling();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao iniciar fluxo PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = async () => {
    const code = migrationData?.pixCopyPasteCode;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage('Não foi possível copiar o código PIX');
    }
  };

  if (!isOpen) return null;

  const title = flow === 'restore' ? 'Reativar com PIX Automático' : 'Mudar para PIX Automático';
  const introText =
    flow === 'restore'
      ? 'Você receberá um QR Code para autorizar débitos automáticos e reativar a assinatura. Use o mesmo CPF/CNPJ do cadastro.'
      : 'Você receberá um QR Code para autorizar débitos automáticos no app do banco. Use o mesmo CPF/CNPJ do cadastro da empresa.';
  const pauseNote =
    flow === 'restore'
      ? 'Ao autorizar o PIX no app do banco, haverá cobrança imediata do valor do plano. O próximo vencimento será daqui a 1 ciclo a partir dessa autorização.'
      : 'Ao autorizar o PIX no app do banco, haverá cobrança imediata do valor do plano. A cobrança no cartão será pausada e o próximo ciclo passa a contar a partir dessa autorização.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {productName && <p className="text-sm text-gray-500">{productName}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {confirmed ? (
          <div className="py-6 text-center">
            <p className="text-green-700 font-medium">
              {flow === 'restore' ? 'Assinatura reativada com PIX Automático!' : 'PIX Automático autorizado com sucesso!'}
            </p>
            <p className="mt-2 text-sm text-gray-500">Atualizando sua assinatura...</p>
          </div>
        ) : !migrationData ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{introText}</p>
            <p className="text-sm text-amber-700 bg-amber-50 rounded-md p-3">{pauseNote}</p>
            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">{errorMessage}</p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleStartMigration}
                disabled={loading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Gerando QR...' : 'Gerar QR Code PIX'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Escaneie o QR Code ou copie o código no app do seu banco.
            </p>

            {migrationData.pixQrCodeUrl && (
              <div className="flex justify-center">
                <img
                  src={migrationData.pixQrCodeUrl}
                  alt="QR Code PIX Automático"
                  className="h-48 w-48 rounded border border-gray-200"
                />
              </div>
            )}

            {migrationData.pixCopyPasteCode && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500">Pix copia e cola</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={migrationData.pixCopyPasteCode}
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs font-mono text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            )}

            {awaitingAuthorization && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                Aguardando autorização no banco...
              </div>
            )}

            {errorMessage && (
              <p className="text-sm text-red-600 bg-red-50 rounded-md p-3">{errorMessage}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
