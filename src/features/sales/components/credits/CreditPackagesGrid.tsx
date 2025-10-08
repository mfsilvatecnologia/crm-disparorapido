import { CreditPackage } from '../../types/credit.types';
import { PackageCard } from './PackageCard';

interface CreditPackagesGridProps {
  packages: CreditPackage[];
  selectedPackageId?: string;
  onSelectPackage: (packageId: string) => void;
}

export function CreditPackagesGrid({
  packages,
  selectedPackageId,
  onSelectPackage,
}: CreditPackagesGridProps) {
  if (packages.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Nenhum pacote de créditos disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Grid responsivo */}
      <div
        className={`
          grid gap-6
          grid-cols-1
          md:grid-cols-2
          ${packages.length >= 3 ? 'lg:grid-cols-3' : ''}
          ${packages.length >= 4 ? 'xl:grid-cols-4' : ''}
        `}
      >
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            isSelected={selectedPackageId === pkg.id}
            onSelect={() => onSelectPackage(pkg.id)}
          />
        ))}
      </div>

      {/* Informações adicionais */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600">
          💡 Quanto mais créditos você compra, mais bônus você ganha!
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Todos os pagamentos são processados de forma segura
        </p>
      </div>
    </div>
  );
}
