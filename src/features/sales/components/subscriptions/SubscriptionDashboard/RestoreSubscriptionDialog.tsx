import { useState, useEffect, useRef } from 'react';
import type { Subscription } from '../../../types';
import { useRestoreSubscription } from '../../../hooks/subscriptions/useRestoreSubscription';

/** Mesmo tempo do PayOverdueDialog: mensagem "Atualizando página..." antes de fechar e dar reload. */
const RELOAD_DELAY_MS = 4000;

const initialCard = {
  holderName: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  ccv: '',
};

interface RestoreSubscriptionDialogProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'choice' | 'form';

export function RestoreSubscriptionDialog({
  subscription,
  isOpen,
  onClose,
  onSuccess,
}: RestoreSubscriptionDialogProps) {
  const [step, setStep] = useState<Step>('choice');
  const [creditCard, setCreditCard] = useState(initialCard);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successWaitingReload, setSuccessWaitingReload] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);
  onCloseRef.current = onClose;
  onSuccessRef.current = onSuccess;

  const { mutate: restoreSubscription, isPending } = useRestoreSubscription();

  useEffect(() => {
    if (isOpen) {
      setStep('choice');
      setCreditCard(initialCard);
      setErrorMessage(null);
      setSuccessWaitingReload(false);
    }
  }, [isOpen]);

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

  const handleRestoreWithSavedCard = () => {
    if (!subscription) return;
    setErrorMessage(null);
    restoreSubscription(
      { subscriptionId: subscription.id, payload: {} },
      {
        onSuccess: () => {
          setSuccessWaitingReload(true);
        },
        onError: (err) => {
          setErrorMessage(err?.message || 'Erro ao retomar assinatura. Tente novamente.');
        },
      }
    );
  };

  const handleSubmitNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    setErrorMessage(null);
    restoreSubscription(
      {
        subscriptionId: subscription.id,
        payload: {
          creditCard: {
            holderName: creditCard.holderName.trim(),
            number: creditCard.number.replace(/\s/g, ''),
            expiryMonth: creditCard.expiryMonth.padStart(2, '0').slice(-2),
            expiryYear:
              creditCard.expiryYear.length === 2 ? creditCard.expiryYear : creditCard.expiryYear.slice(-2),
            ccv: creditCard.ccv.trim(),
          },
        },
      },
      {
        onSuccess: () => {
          setSuccessWaitingReload(true);
        },
        onError: (err) => {
          setErrorMessage(err?.message || 'Erro ao retomar assinatura. Tente novamente.');
        },
      }
    );
  };

  const isShowingLoading = isPending || successWaitingReload;

  const handleClose = () => {
    if (!isShowingLoading) {
      setStep('choice');
      setCreditCard(initialCard);
      setErrorMessage(null);
      setSuccessWaitingReload(false);
      onClose();
    }
  };

  if (!subscription || !isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
        style={isShowingLoading ? { pointerEvents: 'none' } : undefined}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-lg rounded-lg bg-white shadow-xl my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restore-dialog-title"
          aria-busy={isShowingLoading}
        >
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="restore-dialog-title" className="text-xl font-bold text-gray-900">
                  Retomar assinatura
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {subscription.description || 'Assinatura'}
                </p>
              </div>
              {!isShowingLoading && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-500"
                  type="button"
                  aria-label="Fechar"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isShowingLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-6" role="status" aria-live="polite">
                <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold text-gray-800">
                    {successWaitingReload ? 'Atualizando página...' : 'Reativando assinatura'}
                  </p>
                  <p className="text-sm text-gray-500 max-w-xs">
                    {successWaitingReload
                      ? 'A página será recarregada em instantes para exibir o status atualizado.'
                      : 'Aguarde a confirmação.'}
                  </p>
                </div>
              </div>
            ) : (
            <>
            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800" role="alert">
                {errorMessage}
              </div>
            )}
            {step === 'choice' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Escolha como deseja reativar sua assinatura:
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={handleRestoreWithSavedCard}
                    disabled={isPending}
                    className="w-full rounded-lg border-2 border-green-600 bg-green-50 px-4 py-3 text-left font-medium text-green-800 hover:bg-green-100 disabled:opacity-50 flex items-center justify-between"
                  >
                    <span>Ativar com o cartão já usado</span>
                    {isPending ? (
                      <svg className="h-5 w-5 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <span className="text-green-600">→</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    disabled={isPending}
                    className="w-full rounded-lg border-2 border-blue-600 bg-blue-50 px-4 py-3 text-left font-medium text-blue-800 hover:bg-blue-100 disabled:opacity-50 flex items-center justify-between"
                  >
                    <span>Reativar com outro cartão</span>
                    <span className="text-blue-600">→</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmitNewCard} className="space-y-5">
                <p className="text-sm text-gray-600">
                  Preencha os dados do novo cartão para reativar a assinatura.
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
                        onChange={(e) =>
                          updateCreditCardField({ expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })
                        }
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
                        onChange={(e) =>
                          updateCreditCardField({ expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })
                        }
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
                      onChange={(e) =>
                        updateCreditCardField({ ccv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-24"
                      placeholder="3 ou 4 dígitos"
                      maxLength={4}
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setStep('choice')}
                    className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    disabled={isPending}
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Reativando...
                      </>
                    ) : (
                      'Reativar com este cartão'
                    )}
                  </button>
                </div>
              </form>
            )}
            </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
