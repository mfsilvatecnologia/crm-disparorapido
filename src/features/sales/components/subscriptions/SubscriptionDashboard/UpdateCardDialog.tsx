import { useState, useEffect, useRef } from 'react';
import { useUpdateSubscriptionCreditCard, type UpdateCreditCardPayload } from '../../../hooks/subscriptions/useUpdateSubscriptionCreditCard';

interface UpdateCardDialogProps {
  subscriptionId: string;
  productName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const initialCard = {
  holderName: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  ccv: '',
};

const SUCCESS_DELAY_MS = 3500;

export function UpdateCardDialog({
  subscriptionId,
  productName,
  isOpen,
  onClose,
  onSuccess,
}: UpdateCardDialogProps) {
  const [creditCard, setCreditCard] = useState(initialCard);
  const [showSuccess, setShowSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { mutate: updateCard, isPending } = useUpdateSubscriptionCreditCard();

  // Ao abrir o diálogo, garantir estado limpo (não mostrar sucesso de uma abertura anterior)
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false);
      setCountdown(0);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  const updateCreditCardField = (patch: Partial<typeof initialCard>) => {
    setCreditCard((prev) => ({ ...prev, ...patch }));
  };

  const finishAndClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setShowSuccess(false);
    setCreditCard(initialCard);
    onClose();
    onSuccess?.();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateCreditCardPayload = {
      creditCard: {
        holderName: creditCard.holderName.trim(),
        number: creditCard.number.replace(/\s/g, ''),
        expiryMonth: creditCard.expiryMonth.padStart(2, '0').slice(-2),
        expiryYear: creditCard.expiryYear.length === 2 ? creditCard.expiryYear : creditCard.expiryYear.slice(-2),
        ccv: creditCard.ccv.trim(),
      },
    };
    updateCard(
      { subscriptionId, payload },
      {
        onSuccess: () => {
          setShowSuccess(true);
          const seconds = Math.ceil(SUCCESS_DELAY_MS / 1000);
          setCountdown(seconds);
          countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => (prev > 1 ? prev - 1 : 0));
          }, 1000);
          closeTimeoutRef.current = setTimeout(finishAndClose, SUCCESS_DELAY_MS);
        },
      }
    );
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleClose = () => {
    if (!isPending && !showSuccess) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setCreditCard(initialCard);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        style={showSuccess ? { pointerEvents: 'none' } : undefined}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-lg rounded-lg bg-white shadow-xl my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="update-card-dialog-title"
        >
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="update-card-dialog-title" className="text-xl font-bold text-gray-900">
                  {showSuccess ? 'Cartão atualizado' : 'Alterar cartão de crédito'}
                </h2>
                {productName && !showSuccess && <p className="mt-1 text-sm text-gray-600">{productName}</p>}
              </div>
              {!showSuccess && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500"
                  type="button"
                  aria-label="Fechar"
                  disabled={isPending}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {showSuccess ? (
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-900">Cartão atualizado com sucesso!</p>
              <p className="mt-2 text-sm text-gray-600">
                O novo cartão será usado na próxima fatura.
              </p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Informe apenas os dados do novo cartão. O titular e endereço já cadastrados serão mantidos para a próxima fatura.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome no cartão</label>
                  <input
                    type="text"
                    required
                    value={creditCard.holderName}
                    onChange={(e) => updateCreditCardField({ holderName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Como está no cartão"
                    disabled={isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número do cartão</label>
                  <input
                    type="text"
                    required
                    value={creditCard.number}
                    onChange={(e) => updateCreditCardField({ number: e.target.value.replace(/\D/g, '') })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Somente números"
                    maxLength={19}
                    disabled={isPending}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validade (mês)</label>
                    <input
                      type="text"
                      required
                      value={creditCard.expiryMonth}
                      onChange={(e) => updateCreditCardField({ expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="MM"
                      maxLength={2}
                      disabled={isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <input
                      type="text"
                      required
                      value={creditCard.expiryYear}
                      onChange={(e) => updateCreditCardField({ expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="AA ou AAAA"
                      maxLength={4}
                      disabled={isPending}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    required
                    value={creditCard.ccv}
                    onChange={(e) => updateCreditCardField({ ccv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-24"
                    placeholder="3 ou 4 dígitos"
                    maxLength={4}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvando...
                  </>
                ) : (
                  'Atualizar cartão'
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </>
  );
}
