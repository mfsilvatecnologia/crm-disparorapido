import { Product } from '../../types/product.types';
import { formatPrice, getBillingCycleLabel } from '../../services/productService';

interface PricingCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  isPopular?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}

export function PricingCard({
  product,
  onSelect,
  isPopular = false,
  isSelected = false,
  disabled = false,
}: PricingCardProps) {
  const handleClick = () => {
    if (!disabled) {
      onSelect(product.id);
    }
  };

  const hasTrial = product.trialDays > 0;

  return (
    <div
      className={`
        relative rounded-lg border-2 p-6 transition-all hover:shadow-lg
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isPopular ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
          Mais Popular
        </div>
      )}

      {/* Trial Badge */}
      {hasTrial && (
        <div className="mb-4 inline-block rounded-md bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          {product.trialDays} dias grátis
        </div>
      )}

      {/* Plan Name */}
      <h3 className="mb-2 text-2xl font-bold text-gray-900">{product.name}</h3>

      {/* Description */}
      {product.description && (
        <p className="mb-6 text-sm text-gray-600">{product.description}</p>
      )}

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(product.priceMonthly)}
          </span>
          <span className="ml-2 text-gray-600">
            /{getBillingCycleLabel(product.billingCycle)}
          </span>
        </div>
        {hasTrial && (
          <p className="mt-2 text-sm text-gray-500">
            Após {product.trialDays} dias de teste grátis
          </p>
        )}
      </div>

      {/* Features List */}
      <ul className="mb-8 space-y-3">
        {product.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="mr-3 h-5 w-5 flex-shrink-0 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Session Limit */}
      {product.maxSessions > 0 && (
        <p className="mb-4 text-sm text-gray-600">
          Até {product.maxSessions}{' '}
          {product.maxSessions === 1 ? 'sessão simultânea' : 'sessões simultâneas'}
        </p>
      )}

      {/* CTA Button */}
      <button
        className={`
          w-full rounded-lg px-6 py-3 font-semibold transition-colors
          ${
            isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-800 text-white hover:bg-gray-900'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Selecionar plano ${product.name}`}
      >
        {hasTrial ? 'Iniciar Teste Grátis' : 'Assinar Agora'}
      </button>

      {/* Additional Info */}
      {hasTrial && (
        <p className="mt-3 text-center text-xs text-gray-500">
          Cancele quando quiser, sem compromisso
        </p>
      )}
    </div>
  );
}
