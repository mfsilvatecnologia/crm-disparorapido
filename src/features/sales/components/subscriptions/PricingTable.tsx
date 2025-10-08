import { Product } from '../../types/product.types';
import { PricingCard } from './PricingCard';

interface PricingTableProps {
  products: Product[];
  onSelectPlan: (productId: string) => void;
  selectedPlanId?: string;
  highlightMostPopular?: boolean;
}

export function PricingTable({
  products,
  onSelectPlan,
  selectedPlanId,
  highlightMostPopular = true,
}: PricingTableProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Nenhum plano disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Grid responsivo */}
      <div
        className={`
          grid gap-8
          grid-cols-1
          md:grid-cols-2
          ${products.length >= 3 ? 'lg:grid-cols-3' : ''}
          ${products.length >= 4 ? 'xl:grid-cols-4' : ''}
        `}
      >
        {products.map((product) => {
          const isPopular = highlightMostPopular && product.isMostPopular;
          const isSelected = selectedPlanId === product.id;

          return (
            <div
              key={product.id}
              className={`
                ${isPopular ? 'md:scale-105' : ''}
                transition-transform duration-200
              `}
            >
              <PricingCard
                product={product}
                onSelect={onSelectPlan}
                isPopular={isPopular}
                isSelected={isSelected}
                disabled={!product.isActive}
              />
            </div>
          );
        })}
      </div>

      {/* Informações adicionais */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600">
          Todos os planos incluem suporte por email e atualizações gratuitas
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Precisa de mais recursos?{' '}
          <a href="/contato" className="text-blue-600 hover:underline">
            Entre em contato
          </a>{' '}
          para planos personalizados
        </p>
      </div>
    </div>
  );
}
