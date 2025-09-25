// LeadList Component - Grid/list display of leads
import React from 'react'
import { LeadCard } from './LeadCard'
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
import { MoreHorizontal, Grid3X3, List, Download, Upload } from 'lucide-react'
import type { Lead } from '../types/leads'

interface LeadListProps {
  leads: Lead[]
  isLoading?: boolean
  error?: Error | null
  selectedLeads?: string[]
  onLeadSelect?: (leadId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  onEdit?: (lead: Lead) => void
  onDelete?: (id: string) => void
  onViewDetails?: (lead: Lead) => void
  onUpdateStatus?: (id: string, status: Lead['status']) => void
  onBulkStatusUpdate?: (ids: string[], status: Lead['status']) => void
  onBulkDelete?: (ids: string[]) => void
  onExport?: () => void
  onImport?: () => void
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  className?: string
}

export function LeadList({
  leads,
  isLoading,
  error,
  selectedLeads = [],
  onLeadSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  onBulkStatusUpdate,
  onBulkDelete,
  onExport,
  onImport,
  viewMode = 'grid',
  onViewModeChange,
  className
}: LeadListProps) {
  const hasSelection = selectedLeads.length > 0
  const isAllSelected = leads.length > 0 && selectedLeads.length === leads.length

  if (isLoading) {
    return <LoadingState message="Carregando leads..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Erro ao carregar leads"
        description={error.message}
        actionLabel="Tentar novamente"
        onAction={() => window.location.reload()}
      />
    )
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="Nenhum lead encontrado"
        description="Não há leads cadastrados ou que correspondam aos filtros aplicados"
        actionLabel="Adicionar Lead"
        onAction={() => {}}
      />
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectAll) {
      onSelectAll(checked)
    }
  }

  const handleLeadSelect = (leadId: string, checked: boolean) => {
    if (onLeadSelect) {
      onLeadSelect(leadId, checked)
    }
  }

  const handleBulkAction = (action: 'delete' | Lead['status']) => {
    if (action === 'delete' && onBulkDelete) {
      onBulkDelete(selectedLeads)
    } else if (action !== 'delete' && onBulkStatusUpdate) {
      onBulkStatusUpdate(selectedLeads, action)
    }
  }

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
              aria-label="Selecionar todos"
            />
            <span className="text-sm text-muted-foreground">
              {hasSelection ? `${selectedLeads.length} selecionados` : 'Selecionar todos'}
            </span>
          </div>

          {/* Ações em lote */}
          {hasSelection && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedLeads.length} selecionado{selectedLeads.length > 1 ? 's' : ''}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ações em lote
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBulkAction('qualificado')}>
                    Marcar como Qualificado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('contatado')}>
                    Marcar como Contatado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('interessado')}>
                    Marcar como Interessado
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('convertido')}>
                    Marcar como Convertido
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600"
                  >
                    Excluir Selecionados
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

      {/* Lista/Grid de leads */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
      }>
        {leads.map((lead) => (
          <div key={lead.id} className="relative">
            {/* Checkbox de seleção */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedLeads.includes(lead.id)}
                onCheckedChange={(checked) => handleLeadSelect(lead.id, checked as boolean)}
                className="bg-white shadow-sm"
              />
            </div>

            <LeadCard
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={onViewDetails}
              onUpdateStatus={onUpdateStatus}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedLeads.includes(lead.id)
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : ''
              }`}
            />
          </div>
        ))}
      </div>

      {/* Rodapé com estatísticas */}
      <div className="flex items-center justify-between pt-4 border-t text-sm text-muted-foreground">
        <div>
          Mostrando {leads.length} lead{leads.length !== 1 ? 's' : ''}
        </div>

        {hasSelection && (
          <div>
            {selectedLeads.length} de {leads.length} selecionado{selectedLeads.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}