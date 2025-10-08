import { CreditPackage } from '../../types/credit.types';
import { formatPrice } from '../../services/productService';

interface PackageCardProps {
  package: CreditPackage;
  isSelected: boolean;
  onSelect: () => void;
  isPopular?: boolean;
}

export function PackageCard({
  package: pkg,
  isSelected,
  onSelect,
  isPopular = false,
}: PackageCardProps) {
  // Usa campos da API
  const quantidadeCreditos = pkg.quantidade_creditos;
  const bonusCreditos = pkg.bonus_creditos;
  const creditosTotal = pkg.metadata?.creditos_total ?? (quantidadeCreditos + bonusCreditos);
  const custoPorCredito = pkg.metadata?.custo_por_credito ?? 0;
  
  // Calcula percentual de bônus
  const bonusPercentual = quantidadeCreditos > 0 
    ? Math.round((bonusCreditos / quantidadeCreditos) * 100) 
    : 0;

  return (
    <div
      className={`
        relative rounded-lg border-2 p-6 shadow-sm transition-all hover:shadow-md
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}
        ${isPopular || pkg.destaque ? 'ring-2 ring-blue-400' : ''}
        cursor-pointer
      `}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-label={`Selecionar pacote ${pkg.nome}`}
      aria-pressed={isSelected}
    >
      {/* Badge "Mais Popular" */}
      {(isPopular || pkg.destaque) && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-md">
          ⭐ Mais Popular
        </div>
      )}

      {/* Nome do pacote */}
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-gray-900">{pkg.nome}</h3>
        {pkg.descricao && (
          <p className="mt-1 text-sm text-gray-500">{pkg.descricao}</p>
        )}
      </div>

      {/* Preço */}
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold text-gray-900">
          {pkg.precoFormatado}
        </div>
      </div>

      {/* Créditos */}
      <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Créditos:</span>
          <span className="text-lg font-semibold text-gray-900">
            {quantidadeCreditos.toLocaleString('pt-BR')}
          </span>
        </div>

        {bonusCreditos > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-2">
            <span className="text-sm text-green-600">
              + Bônus {bonusPercentual > 0 ? `(${bonusPercentual}%)` : ''}:
            </span>
            <span className="text-lg font-semibold text-green-600">
              {bonusCreditos.toLocaleString('pt-BR')}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between border-t-2 border-gray-300 pt-2">
          <span className="text-sm font-medium text-gray-700">Total:</span>
          <span className="text-xl font-bold text-blue-600">
            {creditosTotal.toLocaleString('pt-BR')}
          </span>
        </div>
      </div>

      {/* Custo por crédito */}
      {custoPorCredito > 0 && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Custo por crédito:{' '}
            <span className="font-semibold text-gray-900">
              R$ {custoPorCredito.toFixed(2)}
            </span>
          </p>
        </div>
      )}

      {/* Botão de seleção */}
      <button
        type="button"
        className={`
          w-full rounded-lg px-4 py-2.5 text-center font-semibold transition-colors
          ${
            isSelected
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }
        `}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {isSelected ? '✓ Selecionado' : 'Selecionar'}
      </button>

      {/* Badge status ativo */}
      {pkg.ativo && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            ● Disponível
          </span>
        </div>
      )}
    </div>
  );
}
