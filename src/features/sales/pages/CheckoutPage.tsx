import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useProducts } from '../hooks/subscriptions/useProducts';
import { useTrialActivation } from '../hooks/subscriptions/useTrialActivation';
import { PlanSelection } from '../components/subscriptions/CheckoutFlow/PlanSelection';
import { CheckoutConfirmation } from '../components/subscriptions/CheckoutFlow/CheckoutConfirmation';
import { SuccessPage } from '../components/subscriptions/CheckoutFlow/SuccessPage';
import { Product } from '../types/product.types';

type CheckoutStep = 'selection' | 'confirmation' | 'success';

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const { isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('selection');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: products, isLoading: productsLoading } = useProducts();
  const trialMutation = useTrialActivation();

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
    navigate('/pricing');
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

  const handleConfirm = async () => {
    if (!selectedProduct || !isAuthenticated) return;

    // Limpa erro anterior
    setErrorMessage('');

    try {
      await trialMutation.mutateAsync({
        produtoId: selectedProduct.id,
      });
      
      setCurrentStep('success');
    } catch (error: any) {
      // O api-client já extraiu a mensagem correta da API
      if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  };

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
          <p className="text-gray-600">Nenhum plano selecionado.</p>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver Planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
              isLoading={trialMutation.isPending}
              errorMessage={errorMessage}
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
