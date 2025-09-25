// LeadFilters Component - Advanced filtering interface
import React from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { Calendar } from '@/shared/components/ui/calendar'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet'
import {
  Search,
  Filter,
  X,
  Calendar as CalendarIcon,
  Star,
  Building2,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import type { LeadFilters as LeadFiltersType, Lead } from '../types/leads'

interface LeadFiltersProps {
  filters: LeadFiltersType
  onFiltersChange: (filters: LeadFiltersType) => void
  onClearFilters: () => void
  availableTags?: string[]
  availableCompanies?: Array<{ id: string; name: string }>
  className?: string
}

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'interessado', label: 'Interessado' },
  { value: 'desqualificado', label: 'Desqualificado' },
  { value: 'convertido', label: 'Convertido' },
]

const origemOptions = [
  { value: 'website', label: 'Website', icon: '🌐' },
  { value: 'scraping', label: 'Scraping', icon: '🔍' },
  { value: 'importacao', label: 'Importação', icon: '📁' },
  { value: 'manual', label: 'Manual', icon: '✋' },
]

export function LeadFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  availableTags = [],
  availableCompanies = [],
  className
}: LeadFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState(filters.search || '')

  const hasActiveFilters = React.useMemo(() => {
    return !!(
      filters.status?.length ||
      filters.origem?.length ||
      filters.tags?.length ||
      filters.empresaId ||
      filters.campanhaId ||
      filters.dataInicio ||
      filters.dataFim ||
      filters.search ||
      filters.scoreMinimo !== undefined ||
      filters.scoreMaximo !== undefined
    )
  }, [filters])

  const activeFilterCount = React.useMemo(() => {
    let count = 0
    if (filters.status?.length) count++
    if (filters.origem?.length) count++
    if (filters.tags?.length) count++
    if (filters.empresaId) count++
    if (filters.campanhaId) count++
    if (filters.dataInicio || filters.dataFim) count++
    if (filters.search) count++
    if (filters.scoreMinimo !== undefined || filters.scoreMaximo !== undefined) count++
    return count
  }, [filters])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleStatusToggle = (status: Lead['status']) => {
    const currentStatus = filters.status || []
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status]

    onFiltersChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined
    })
  }

  const handleOrigemToggle = (origem: Lead['origem']) => {
    const currentOrigem = filters.origem || []
    const newOrigem = currentOrigem.includes(origem)
      ? currentOrigem.filter(o => o !== origem)
      : [...currentOrigem, origem]

    onFiltersChange({
      ...filters,
      origem: newOrigem.length > 0 ? newOrigem : undefined
    })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined
    })
  }

  const handleDateRangeChange = (field: 'dataInicio' | 'dataFim', date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      [field]: date ? format(date, 'yyyy-MM-dd') : undefined
    })
  }

  const handleScoreChange = (field: 'scoreMinimo' | 'scoreMaximo', value: string) => {
    const numValue = value === '' ? undefined : Number(value)
    onFiltersChange({
      ...filters,
      [field]: numValue
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de pesquisa principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Pesquisar leads por nome, email ou empresa..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros rápidos e botão de filtros avançados */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filtros rápidos de status */}
        <div className="flex gap-1">
          {statusOptions.slice(0, 4).map((status) => (
            <Button
              key={status.value}
              variant={filters.status?.includes(status.value as Lead['status']) ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusToggle(status.value as Lead['status'])}
            >
              {status.label}
            </Button>
          ))}
        </div>

        {/* Botão de filtros avançados */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Filtros Avançados</SheetTitle>
              <SheetDescription>
                Configure filtros detalhados para refinar sua busca por leads
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Status */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((status) => (
                    <div key={status.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status.value}`}
                        checked={filters.status?.includes(status.value as Lead['status']) || false}
                        onCheckedChange={() => handleStatusToggle(status.value as Lead['status'])}
                      />
                      <Label
                        htmlFor={`status-${status.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {status.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Origem */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Origem</Label>
                <div className="grid grid-cols-2 gap-2">
                  {origemOptions.map((origem) => (
                    <div key={origem.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`origem-${origem.value}`}
                        checked={filters.origem?.includes(origem.value as Lead['origem']) || false}
                        onCheckedChange={() => handleOrigemToggle(origem.value as Lead['origem'])}
                      />
                      <Label
                        htmlFor={`origem-${origem.value}`}
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <span>{origem.icon}</span>
                        {origem.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {availableTags.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empresa */}
              {availableCompanies.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    Empresa
                  </Label>
                  <Select
                    value={filters.empresaId || ''}
                    onValueChange={(value) => onFiltersChange({ ...filters, empresaId: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as empresas</SelectItem>
                      {availableCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Período */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  Período de Criação
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {filters.dataInicio ? (
                            format(new Date(filters.dataInicio), 'PPP', { locale: pt })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dataInicio ? new Date(filters.dataInicio) : undefined}
                          onSelect={(date) => handleDateRangeChange('dataInicio', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {filters.dataFim ? (
                            format(new Date(filters.dataFim), 'PPP', { locale: pt })
                          ) : (
                            <span>Selecione a data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dataFim ? new Date(filters.dataFim) : undefined}
                          onSelect={(date) => handleDateRangeChange('dataFim', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Score Range */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Score
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Mínimo</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={filters.scoreMinimo?.toString() || ''}
                      onChange={(e) => handleScoreChange('scoreMinimo', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Máximo</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="100"
                      value={filters.scoreMaximo?.toString() || ''}
                      onChange={(e) => handleScoreChange('scoreMaximo', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" onClick={onClearFilters} className="flex-1">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Botão para limpar filtros */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Indicadores de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="gap-1">
              Status: {statusOptions.find(s => s.value === status)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusToggle(status)}
              />
            </Badge>
          ))}

          {filters.origem?.map((origem) => (
            <Badge key={origem} variant="secondary" className="gap-1">
              Origem: {origemOptions.find(o => o.value === origem)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleOrigemToggle(origem)}
              />
            </Badge>
          ))}

          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              Tag: {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}

          {(filters.scoreMinimo !== undefined || filters.scoreMaximo !== undefined) && (
            <Badge variant="secondary" className="gap-1">
              Score: {filters.scoreMinimo || 0} - {filters.scoreMaximo || 100}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({
                  ...filters,
                  scoreMinimo: undefined,
                  scoreMaximo: undefined
                })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}