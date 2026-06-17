import { useState, useEffect } from 'react';
import type { Subscription } from '../../../types';
import { UpdateCardDialog } from './UpdateCardDialog';
import { MigrateToPixAutomaticDialog } from './MigrateToPixAutomaticDialog';

interface ChangePaymentMethodDialogProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 'choice' | 'card' | 'pix';

export function ChangePaymentMethodDialog({
  subscription,
  isOpen,
  onClose,
  onSuccess,
}: ChangePaymentMethodDialogProps) {
  const [step, setStep] = useState<Step>('choice');

  useEffect(() => {
    if (isOpen) {
      setStep('choice');
    }
  }, [isOpen]);

  const handleClose = () => {
    setStep('choice');
    onClose();
  };

  const handleSuccess = () => {
    setStep('choice');
    onSuccess?.();
  };

  if (!subscription || !isOpen) return null;

  if (step === 'card') {
    return (
      <UpdateCardDialog
        isOpen={isOpen}
        subscriptionId={subscription.id}
        productName={subscription.description || 'Assinatura'}
        onClose={() => setStep('choice')}
        onSuccess={handleSuccess}
      />
    );
  }

  if (step === 'pix') {
    return (
      <MigrateToPixAutomaticDialog
        flow="migrate"
        isOpen={isOpen}
        subscriptionId={subscription.id}
        productName={subscription.description || 'Assinatura'}
        onClose={() => setStep('choice')}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="w-full max-w-lg rounded-lg bg-white shadow-xl my-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-payment-method-title"
        >
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="change-payment-method-title" className="text-xl font-bold text-gray-900">
                  Alterar meio de pagamento
                </h2>
                <p className="mt-1 text-sm text-gray-600">{subscription.description || 'Assinatura'}</p>
              </div>
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
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Escolha como deseja alterar o pagamento da sua assinatura:</p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setStep('card')}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-blue-600 bg-blue-50 px-4 py-3 text-left font-medium text-blue-800 hover:bg-blue-100"
                >
                  <span>Alterar cartão de crédito</span>
                  <span className="text-blue-600">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('pix')}
                  className="flex w-full items-center justify-between rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-3 text-left font-medium text-emerald-800 hover:bg-emerald-100"
                >
                  <span>Mudar para PIX Automático</span>
                  <span className="text-emerald-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
