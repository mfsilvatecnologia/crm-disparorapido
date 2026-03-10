import { useState, useEffect, useRef } from 'react';
import type { Subscription } from '../../../types';
import { paySubscriptionWithCard } from '../../../api/subscriptionsApi';
import toast from 'react-hot-toast';

/** Tempo em ms que o "Processando pagamento" / "Atualizando página" fica visível antes de fechar e dar reload. Mesmo valor usado para o refresh da página. */
const RELOAD_DELAY_MS = 4000;

interface PayOverdueDialogProps {
  subscription: Subscription | null;
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

export function PayOverdueDialog({ subscription, onClose, onSuccess }: PayOverdueDialogProps) {
  const [creditCard, setCreditCard] = useState(initialCard);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** Após pagamento ok, mantemos o loading pelo mesmo tempo do reload para sincronizar o tempo na tela com o refresh. */
  const [successWaitingReload, setSuccessWaitingReload] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);
  onCloseRef.current = onClose;
  onSuccessRef.current = onSuccess;

  if (!subscription) return null;

  useEffect(() => {
    if (subscription) setErrorMessage(null);
  }, [subscription?.id]);

  useEffect(() => {
    if (!successWaitingReload) return;
    timeoutRef.current = setTimeout(() => {
      onCloseRef.current();
      onSuccessRef.current?.();
      setSuccessWaitingReload(false);
    }, RELOAD_DELAY_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [successWaitingReload]);

  const updateCreditCardField = (patch: Partial<typeof initialCard>) => {
    setCreditCard((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;

    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      await paySubscriptionWithCard(subscription.id, {
        creditCard: {
          holderName: creditCard.holderName.trim(),
          number: creditCard.number.replace(/\s/g, ''),
          expiryMonth: creditCard.expiryMonth.padStart(2, '0').slice(-2),
          expiryYear:
            creditCard.expiryYear.length === 2 ? creditCard.expiryYear : creditCard.expiryYear.slice(-2),
          ccv: creditCard.ccv.trim(),
        },
      });

      toast.success('Pagamento concluído. O checkout será fechado e a página atualizada.');
      setCreditCard(initialCard);
      setSuccessWaitingReload(true);
      // Mantém isSubmitting true: loading fica visível pelo mesmo RELOAD_DELAY_MS antes de fechar e dar reload.
    } catch (error: any) {
      const msg = error?.message || 'Falha ao processar pagamento. Tente novamente.';
      setErrorMessage(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const isShowingLoading = isSubmitting;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !isShowingLoading && onClose()}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-2xl rounded-xl bg-white shadow-2xl my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-overdue-dialog-title"
          aria-busy={isShowingLoading}
        >
          <div className="border-b border-gray-200 p-6 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 id="pay-overdue-dialog-title" className="text-2xl font-bold text-gray-900">
                Pagar fatura em atraso
              </h2>
              <p className="text-sm text-gray-600">
                Assinatura: <span className="font-semibold">{subscription.description || 'Sem descrição'}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Valor da fatura</p>
                  <p className="text-2xl font-extrabold text-orange-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(subscription.value || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Próximo vencimento</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {subscription.nextDueDate
                      ? new Date(subscription.nextDueDate).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => !isShowingLoading && onClose()}
              className="text-gray-400 hover:text-gray-500"
              type="button"
              aria-label="Fechar"
              disabled={isShowingLoading}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errorMessage && (
            <div className="mx-6 mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {errorMessage}
            </div>
          )}

          {isShowingLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-6" role="status" aria-live="polite">
              {/* Dots em sequência (pulsação escalonada) */}
              <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '400ms' }} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-semibold text-gray-800">
                  {successWaitingReload ? 'Atualizando página...' : 'Processando pagamento'}
                </p>
                <p className="text-sm text-gray-500 max-w-xs">
                  {successWaitingReload
                    ? 'A página será recarregada em instantes para exibir o status atualizado.'
                    : 'Aguarde a confirmação. O checkout será fechado ao concluir.'}
                </p>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Informe os dados do cartão para pagar a fatura em atraso desta assinatura.
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
                    disabled={isShowingLoading}
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
                    disabled={isShowingLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validade (mês)</label>
                    <input
                      type="text"
                      required
                      value={creditCard.expiryMonth}
                      onChange={(e) =>
                        updateCreditCardField({ expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="MM"
                      maxLength={2}
                      disabled={isShowingLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <input
                      type="text"
                      required
                      value={creditCard.expiryYear}
                      onChange={(e) =>
                        updateCreditCardField({ expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="AA ou AAAA"
                      maxLength={4}
                      disabled={isShowingLoading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    required
                    value={creditCard.ccv}
                    onChange={(e) =>
                      updateCreditCardField({ ccv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-24"
                    placeholder="3 ou 4 dígitos"
                    maxLength={4}
                    disabled={isShowingLoading}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => !isShowingLoading && onClose()}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                disabled={isShowingLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                Pagar agora
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </>
  );
}

