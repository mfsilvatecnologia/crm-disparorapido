import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useProducts } from '../hooks/subscriptions/useProducts';
import { useTrialActivation } from '../hooks/subscriptions/useTrialActivation';
import { useDirectSubscription } from '../hooks/subscriptions/useDirectSubscription';
import { useHasUsedTrial } from '../hooks/subscriptions/useHasUsedTrial';
import { PlanSelection } from '../components/subscriptions/CheckoutFlow/PlanSelection';
import { CheckoutConfirmation } from '../components/subscriptions/CheckoutFlow/CheckoutConfirmation';
import { SuccessPage } from '../components/subscriptions/CheckoutFlow/SuccessPage';
import { Product } from '../types/product.types';
import { captureAffiliateCodeFromUrl, getStoredAffiliateCode } from '@/features/affiliates/utils/referralStorage';

type CheckoutStep = 'selection' | 'confirmation' | 'success';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('selection');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  // Track if trial was already used (from API error or pre-check)
  const [trialUsed, setTrialUsed] = useState<boolean>(false);
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);

  useEffect(() => {
    captureAffiliateCodeFromUrl(searchParams);
    // Carrega código de afiliado do storage
    setAffiliateCode(getStoredAffiliateCode());
  }, [searchParams]);

  const { data: products, isLoading: productsLoading } = useProducts();
  const trialMutation = useTrialActivation();
  const directMutation = useDirectSubscription();
  
  // Pre-check if trial was already used
  const { data: hasUsedTrialFromAPI, isLoading: checkingTrialUsage } = useHasUsedTrial();

  // Update trialUsed state when API check completes
  useEffect(() => {
    if (hasUsedTrialFromAPI !== undefined) {
      setTrialUsed(hasUsedTrialFromAPI);
    }
  }, [hasUsedTrialFromAPI]);

  // Carrega produto selecionado da URL
  useEffect(() => {
    if (products && productId) {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [products, productId]);

  const handleChangePlan = () => {
    navigate('/app/subscription');
  };

  const handleContinueToConfirmation = () => {
    // Se não estiver autenticado, redireciona para login com redirect de volta
    if (!isAuthenticated) {
      const currentUrl = `/checkout?productId=${selectedProduct?.id}`;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }
    
    setCurrentStep('confirmation');
  };

  /**
   * Handle subscription confirmation
   * 
   * Strategy:
   * 1. If product has trial AND user hasn't used trial -> use trial endpoint
   * 2. If product has trial but user already used trial -> use direct endpoint (no trial)
   * 3. If product has no trial -> use direct endpoint
   */
  const handleConfirm = async () => {
    if (!selectedProduct || !isAuthenticated) return;

    // Limpa erro anterior
    setErrorMessage('');

    const productHasTrial = selectedProduct.trialDays > 0;
    const shouldUseTrial = productHasTrial && !trialUsed;

    try {
      if (shouldUseTrial) {
        // Attempt trial creation
        await trialMutation.mutateAsync({
          produtoId: selectedProduct.id,
        });
      } else {
        // Direct subscription (no trial)
        await directMutation.mutateAsync({
          produtoId: selectedProduct.id,
          billingCycle: 'MONTHLY',
          value: selectedProduct.priceMonthly,
          hasTrial: false,
          trialDays: 0,
          description: `${selectedProduct.name} - Mensal`,
        });
      }
      
      setCurrentStep('success');
    } catch (error: any) {
      const errorMsg = error?.message || '';
      
      // Check if error is about trial already used
      const isTrialAlreadyUsedError = 
        errorMsg.includes('já utilizou') || 
        errorMsg.includes('período de teste gratuito') ||
        errorMsg.includes('BUSINESS_RULE_VIOLATION');
      
      if (isTrialAlreadyUsedError && !trialUsed) {
        // Mark trial as used and show message with option to continue
        setTrialUsed(true);
        setErrorMessage(
          'Você já utilizou seu período de teste gratuito. Clique em "Assinar Plano" para continuar com a assinatura paga.'
        );
      } else if (errorMsg) {
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  };

  // Determine if currently processing
  const isProcessing = trialMutation.isPending || directMutation.isPending;

  const handleGoToDashboard = () => {
    navigate('/app');
  };

  if (productsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum plano selecionado. A contratação é feita pelo checkout do site.</p>
          <button
            onClick={() => navigate('/app/subscription')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver minha assinatura
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Affiliate Code Display */}
        {affiliateCode && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-900">
                  Código de Indicação Aplicado
                </p>
                <p className="text-sm text-green-700">
                  Ref: <span className="font-mono font-semibold">{affiliateCode}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'selection' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'selection' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Seleção</span>
            </div>
            
            <div className="h-px w-16 bg-gray-300" />
            
            <div className={`flex items-center ${currentStep === 'confirmation' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Confirmação</span>
            </div>
            
            <div className="h-px w-16 bg-gray-300" />
            
            <div className={`flex items-center ${currentStep === 'success' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'success' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Concluído</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          {currentStep === 'selection' && (
            <PlanSelection
              product={selectedProduct}
              onEdit={handleChangePlan}
              onContinue={handleContinueToConfirmation}
            />
          )}

          {currentStep === 'confirmation' && (
            <CheckoutConfirmation
              product={selectedProduct}
              onCancel={() => {
                setErrorMessage('');
                setCurrentStep('selection');
              }}
              onConfirm={handleConfirm}
              isLoading={isProcessing}
              errorMessage={errorMessage}
              trialUsed={trialUsed}
            />
          )}

          {currentStep === 'success' && (
            <SuccessPage
              product={selectedProduct}
              onGoToDashboard={handleGoToDashboard}
            />
          )}
        </div>
      </div>
    </div>
  );
}
