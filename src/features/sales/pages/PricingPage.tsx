import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/subscriptions/useProducts';
import { PricingTable } from '../components/subscriptions/PricingTable';
import { FeatureComparison } from '../components/subscriptions/FeatureComparison';

export function PricingPage() {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useProducts();

  const handleSelectPlan = (productId: string) => {
    // Redireciona para checkout com o plano selecionado
    navigate(`/checkout?productId=${productId}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">
              Escolha o Plano Ideal para Seu Negócio
            </h1>
            <p className="mt-4 text-xl text-blue-100">
              Comece com 7 dias grátis. Cancele quando quiser.
            </p>
          </div>
        </div>
      </div>

      {/* CRM SaaS Plans */}
      {crmProducts.length > 0 && (
        <div className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Planos CRM SaaS
              </h2>
              <p className="mt-2 text-gray-600">
                Gerencie seus leads e campanhas com nosso CRM completo
              </p>
            </div>
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
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Extensão WhatsApp
              </h2>
              <p className="mt-2 text-gray-600">
                Automatize suas campanhas de WhatsApp com nossa extensão Chrome
              </p>
            </div>
            <PricingTable
              products={extensionProducts}
              onSelectPlan={handleSelectPlan}
            />
          </div>
        </div>
      )}

      {/* Feature Comparison - All Products */}
      {(crmProducts.length > 0 || extensionProducts.length > 0) && (
        <div className="border-t border-gray-200 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Compare os Recursos
            </h2>
            <FeatureComparison products={products || []} />
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="border-t border-gray-200 py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Como funciona o período de teste?
              </h3>
              <p className="mt-2 text-gray-600">
                Você tem 7 dias para experimentar todos os recursos do plano escolhido.
                Se cancelar antes do fim do período, não será cobrado.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Posso mudar de plano depois?
              </h3>
              <p className="mt-2 text-gray-600">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Como funciona o cancelamento?
              </h3>
              <p className="mt-2 text-gray-600">
                Você pode cancelar a qualquer momento. O acesso continua até o fim do
                período pago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
