import { useState } from 'react';
import { Product } from '../../types/product.types';
import { formatPrice } from '../../services/productService';

interface FeatureComparisonProps {
  products: Product[];
}

interface FeatureRow {
  name: string;
  availability: Record<string, boolean | string>;
}

export function FeatureComparison({ products }: FeatureComparisonProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  if (products.length === 0) {
    return null;
  }

  // Extrair todas as features únicas
  const allFeatures = new Set<string>();
  products.forEach(product => {
    product.features.forEach(feature => allFeatures.add(feature));
  });

  // Criar linhas da tabela de comparação
  const featureRows: FeatureRow[] = Array.from(allFeatures).map(featureName => {
    const availability: Record<string, boolean | string> = {};
    
    products.forEach(product => {
      const hasFeature = product.features.includes(featureName);
      availability[product.id] = hasFeature;
    });

    return {
      name: featureName,
      availability,
    };
  });

  // Adicionar informações de sessões e leads
  const additionalRows: FeatureRow[] = [
    {
      name: 'Sessões Simultâneas',
      availability: products.reduce((acc, p) => {
        acc[p.id] = p.maxSessions > 0 ? `${p.maxSessions}` : 'Ilimitado';
        return acc;
      }, {} as Record<string, string>),
    },
    {
      name: 'Leads por Mês',
      availability: products.reduce((acc, p) => {
        acc[p.id] = p.maxLeads ? `${p.maxLeads}` : 'Ilimitado';
        return acc;
      }, {} as Record<string, string>),
    },
  ];

  const allRows = [...featureRows, ...additionalRows];

  // Vista Desktop - Tabela completa
  const DesktopView = () => (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="px-6 py-4 text-left font-semibold text-gray-900">
              Recursos
            </th>
            {products.map(product => (
              <th
                key={product.id}
                className={`px-6 py-4 text-center font-semibold ${
                  product.isMostPopular ? 'bg-blue-50' : ''
                }`}
              >
                <div className="mb-2">{product.name}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrice(product.priceMonthly)}
                </div>
                <div className="text-sm font-normal text-gray-500">/mês</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allRows.map((row, index) => (
            <tr
              key={index}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-6 py-4 font-medium text-gray-900">
                {row.name}
              </td>
              {products.map(product => {
                const value = row.availability[product.id];
                return (
                  <td
                    key={product.id}
                    className={`px-6 py-4 text-center ${
                      product.isMostPopular ? 'bg-blue-50' : ''
                    }`}
                  >
                    {typeof value === 'boolean' ? (
                      value ? (
                        <svg
                          className="mx-auto h-6 w-6 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mx-auto h-6 w-6 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )
                    ) : (
                      <span className="font-semibold text-gray-700">{value}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Vista Mobile - Carrossel
  const MobileView = () => {
    const activeProduct = products[activeProductIndex];

    return (
      <div className="lg:hidden">
        {/* Seletor de plano */}
        <div className="mb-6">
          <div className="flex items-center justify-between rounded-lg bg-gray-100 p-1">
            {products.map((product, index) => (
              <button
                key={product.id}
                onClick={() => setActiveProductIndex(index)}
                className={`
                  flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors
                  ${
                    index === activeProductIndex
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preço do plano ativo */}
        <div className="mb-6 text-center">
          <div className="text-3xl font-bold text-blue-600">
            {formatPrice(activeProduct.priceMonthly)}
          </div>
          <div className="text-sm text-gray-500">/mês</div>
        </div>

        {/* Lista de recursos */}
        <div className="space-y-3">
          {allRows.map((row, index) => {
            const value = row.availability[activeProduct.id];
            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
              >
                <span className="font-medium text-gray-900">{row.name}</span>
                {typeof value === 'boolean' ? (
                  value ? (
                    <svg
                      className="h-6 w-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )
                ) : (
                  <span className="font-semibold text-gray-700">{value}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Indicadores de navegação */}
        <div className="mt-6 flex justify-center gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveProductIndex(index)}
              className={`
                h-2 w-2 rounded-full transition-all
                ${
                  index === activeProductIndex
                    ? 'w-8 bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Ver plano ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Compare os Planos
        </h2>
        <p className="mt-2 text-gray-600">
          Escolha o plano ideal para suas necessidades
        </p>
      </div>

      <DesktopView />
      <MobileView />
    </div>
  );
}
