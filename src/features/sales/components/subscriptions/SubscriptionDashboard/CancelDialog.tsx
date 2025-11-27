import { useState } from 'react';
import { useCancelSubscription } from '../../../hooks/subscriptions/useCancelSubscription';

interface CancelDialogProps {
  subscriptionId: string;
  productName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelDialog({
  subscriptionId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const { mutate: cancelSubscription, isPending } = useCancelSubscription();

  const handleConfirm = () => {
    cancelSubscription(
      {
        subscriptionId,
        data: {
          cancelInAsaas: true,
          reason: reason.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          // Limpa os campos
          setReason('');
          // Fecha o modal
          onClose();
          // Callback de sucesso
          if (onSuccess) onSuccess();
        },
        onError: (error) => {
          console.error('Erro ao cancelar assinatura:', error);
          // Mesmo em erro, podemos fechar o modal se desejar
          // ou manter aberto para o usuário tentar novamente
        },
      }
    );
  };

  const handleCancel = () => {
    onClose();
    setReason('');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-lg bg-white shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
        >
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Warning Icon */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <div>
                  <h2
                    id="cancel-dialog-title"
                    className="text-xl font-bold text-gray-900"
                  >
                    Cancelar Assinatura
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{productName}</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-500"
                type="button"
                aria-label="Fechar"
                disabled={isPending}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Warning Message */}
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-red-800">
                ⚠️ Antes de cancelar, considere:
              </h3>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Você perderá acesso a todos os recursos do plano</li>
                <li>• Seus dados serão mantidos por 30 dias</li>
                <li>• Você pode reativar a qualquer momento</li>
              </ul>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label
                htmlFor="cancelReason"
                className="mb-2 block text-sm font-semibold text-gray-900"
              >
                Por que você está cancelando? (opcional)
              </label>
              <textarea
                id="cancelReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu feedback nos ajuda a melhorar..."
                disabled={isPending}
              />
              <p className="mt-1 text-xs text-gray-500">
                Suas sugestões são importantes para nós
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-6 sm:flex-row sm:justify-end">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isPending}
            >
              Voltar
            </button>
            <button
              onClick={handleConfirm}
              className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Cancelando...
                </span>
              ) : (
                'Confirmar Cancelamento'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
