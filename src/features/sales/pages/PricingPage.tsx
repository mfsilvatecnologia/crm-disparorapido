import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/subscriptions/useProducts';
import { useTrialActivation } from '../hooks/subscriptions/useTrialActivation';
import { useDirectSubscription } from '../hooks/subscriptions/useDirectSubscription';
import { useHasUsedTrial } from '../hooks/subscriptions/useHasUsedTrial';
import { PricingTable } from '../components/subscriptions/PricingTable';
import { FeatureComparison } from '../components/subscriptions/FeatureComparison';
import { captureAffiliateCodeFromUrl } from '@/features/affiliates/utils/referralStorage';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading, error } = useProducts();
  const { data: hasUsedTrial } = useHasUsedTrial();
  const trialMutation = useTrialActivation();
  const directMutation = useDirectSubscription();

  const [isProcessing, setIsProcessing] = useState(false);

  // Captura código de afiliado da URL quando a página carrega
  useEffect(() => {
    captureAffiliateCodeFromUrl(searchParams);
  }, [searchParams]);

  const handleSelectPlan = async (productId: string) => {
    // Find selected product
    const selectedProduct = products?.find(p => p.id === productId);
    if (!selectedProduct) {
      toast.error('Produto não encontrado');
      return;
    }

    setIsProcessing(true);

    try {
      const productHasTrial = selectedProduct.trialDays > 0;
      const shouldUseTrial = productHasTrial && !hasUsedTrial;

      let result: any;

      if (shouldUseTrial) {
        // Create trial subscription
        result = await trialMutation.mutateAsync({
          produtoId: selectedProduct.id,
        });
      } else {
        // Create direct subscription (no trial)
        result = await directMutation.mutateAsync({
          produtoId: selectedProduct.id,
          billingCycle: 'MONTHLY',
          value: selectedProduct.priceMonthly,
          hasTrial: false,
          trialDays: 0,
          description: `${selectedProduct.name} - Mensal`,
        });
      }

      // Redirect to Asaas payment link if available
      if (result && 'asaasInvoiceUrl' in result && result.asaasInvoiceUrl) {
        window.location.href = result.asaasInvoiceUrl;
      } else if (result && 'asaasSubscriptionUrl' in result && result.asaasSubscriptionUrl) {
        window.location.href = result.asaasSubscriptionUrl;
      } else {
        // No payment link, redirect to dashboard
        toast.success('Assinatura criada com sucesso!');
        navigate('/app');
      }
    } catch (error: any) {
      setIsProcessing(false);
      const errorMsg = error?.message || 'Erro ao criar assinatura. Tente novamente.';
      toast.error(errorMsg);
    }
  };

  // Filtra produtos por categoria (exclui marketplace_leads que são créditos)
  const crmProducts = products?.filter(p => p.categoria === 'crm_saas') || [];
  const extensionProducts = products?.filter(p => p.categoria === 'extensao_chrome') || [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar planos. Tente novamente.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="rounded-lg bg-white p-8 text-center shadow-2xl">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
            <p className="mt-4 text-lg font-semibold text-gray-900">Criando sua assinatura...</p>
            <p className="mt-2 text-sm text-gray-600">Você será redirecionado para o pagamento</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
      {/* CRM SaaS Plans */}
      {crmProducts.length > 0 && (
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PricingTable
              products={crmProducts}
              onSelectPlan={handleSelectPlan}
            />
          </div>
        </div>
      )}

      {/* WhatsApp Extension Plans */}
      {extensionProducts.length > 0 && (
        <div className="border-t border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PricingTable
              products={extensionProducts}
              onSelectPlan={handleSelectPlan}
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}
