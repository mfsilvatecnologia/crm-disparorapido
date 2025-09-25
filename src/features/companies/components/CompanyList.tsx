// CompanyList Component - Grid/list display of companies
import React from 'react'
import { CompanyCard } from './CompanyCard'
import { EmptyState } from '@/shared/components/common/EmptyState'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { ErrorState } from '@/shared/components/common/ErrorState'
import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Grid3X3, List, Download, Upload, Sparkles } from 'lucide-react'
import type { Company } from '../types/companies'

interface CompanyListProps {
  companies: Company[]
  isLoading?: boolean
  error?: Error | null
  selectedCompanies?: string[]
  onCompanySelect?: (companyId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onEdit?: (company: Company) => void
  onDelete?: (id: string) => void
  onViewDetails?: (company: Company) => void
  onUpdateStatus?: (id: string, status: Company['status']) => void
  onEnrich?: (id: string) => void
  onBulkStatusUpdate?: (ids: string[], status: Company['status']) => void
  onBulkDelete?: (ids: string[]) => void
  onBulkEnrich?: (ids: string[]) => void
  onExport?: () => void
  onImport?: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  className?: string
}

export function CompanyList({
  companies,
  isLoading,
  error,
  selectedCompanies = [],
  onCompanySelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  onEnrich,
  onBulkStatusUpdate,
  onBulkDelete,
  onBulkEnrich,
  onExport,
  onImport,
  viewMode = 'grid',
  onViewModeChange,
  className
}: CompanyListProps) {
  const hasSelection = selectedCompanies.length > 0
  const isAllSelected = companies.length > 0 && selectedCompanies.length === companies.length

  if (isLoading) {
    return <LoadingState message="Carregando empresas..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar empresas"
        description={error.message}
        actionLabel="Tentar novamente"
        onAction={() => window.location.reload()}
      />
    )
  }

  if (companies.length === 0) {
    return (
      <EmptyState
        title="Nenhuma empresa encontrada"
        description="Não há empresas cadastradas ou que correspondam aos filtros aplicados"
        actionLabel="Adicionar Empresa"
        onAction={() => {}}
      />
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked)
    }
  }

  const handleCompanySelect = (companyId: string, checked: boolean) => {
    if (onCompanySelect) {
      onCompanySelect(companyId, checked)
    }
  }

  const handleBulkAction = (action: 'delete' | 'enrich' | Company['status']) => {
    if (action === 'delete' && onBulkDelete) {
      onBulkDelete(selectedCompanies)
    } else if (action === 'enrich' && onBulkEnrich) {
      onBulkEnrich(selectedCompanies)
    } else if (action !== 'delete' && action !== 'enrich' && onBulkStatusUpdate) {
      onBulkStatusUpdate(selectedCompanies, action)
    }
  }

  const getStatusBadgeColor = (status: Company['status']) => {
    const colors = {
      ativa: 'bg-green-500',
      inativa: 'bg-gray-500',
      prospecto: 'bg-blue-500',
      cliente: 'bg-emerald-500',
      ex_cliente: 'bg-red-500',
    }
    return colors[status] || 'bg-gray-500'
  }

  const enrichedCount = companies.filter(c => c.dadosEnriquecidos).length
  const clienteCount = companies.filter(c => c.status === 'cliente').length
  const prospectoCount = companies.filter(c => c.status === 'prospecto').length

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Seleção em massa */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Selecionar todas"
            />
            <span className="text-sm text-muted-foreground">
              {hasSelection ? `${selectedCompanies.length} selecionadas` : 'Selecionar todas'}
            </span>
          </div>

          {/* Ações em lote */}
          {hasSelection && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedCompanies.length} selecionada{selectedCompanies.length > 1 ? 's' : ''}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ações em lote
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('prospecto')}>
                    Marcar como Prospecto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('cliente')}>
                    Marcar como Cliente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('ativa')}>
                    Marcar como Ativa
                  </DropdownMenuItem>
                  {onBulkEnrich && (
                    <DropdownMenuItem onClick={() => handleBulkAction('enrich')}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Enriquecer Dados
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600"
                  >
                    Excluir Selecionadas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Controles de visualização e ações */}
        <div className="flex items-center gap-2">
          {/* Import/Export */}
          {onImport && (
            <Button variant="outline" size="sm" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Button>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}

          {/* Toggle de visualização */}
          {onViewModeChange && (
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => onViewModeChange('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas rápidas */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
            {clienteCount} Clientes
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {prospectoCount} Prospectos
          </Badge>
        </div>
        {enrichedCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              <Sparkles className="h-3 w-3 mr-1" />
              {enrichedCount} Enriquecidas
            </Badge>
          </div>
        )}
      </div>

      {/* Lista/Grid de empresas */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
      }>
        {companies.map((company) => (
          <div key={company.id} className="relative">
            {/* Checkbox de seleção */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedCompanies.includes(company.id)}
                onCheckedChange={(checked) => handleCompanySelect(company.id, checked as boolean)}
                className="bg-white shadow-sm"
              />
            </div>

            <CompanyCard
              company={company}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
              onEnrich={onEnrich}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedCompanies.includes(company.id)
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : ''
              }`}
            />
          </div>
        ))}
      </div>

      {/* Rodapé com estatísticas */}
      <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
        <div className="flex gap-6">
          <span>Mostrando {companies.length} empresa{companies.length !== 1 ? 's' : ''}</span>

          <div className="flex gap-4">
            <span className="text-emerald-600">{clienteCount} cliente{clienteCount !== 1 ? 's' : ''}</span>
            <span className="text-blue-600">{prospectoCount} prospecto{prospectoCount !== 1 ? 's' : ''}</span>
            {enrichedCount > 0 && (
              <span className="text-yellow-600">{enrichedCount} enriquecida{enrichedCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>

        {hasSelection && (
          <div>
            {selectedCompanies.length} de {companies.length} selecionada{selectedCompanies.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}