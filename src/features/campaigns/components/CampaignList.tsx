import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { EmptyState } from '@/shared/components/common/EmptyState'
import { LoadingState } from '@/shared/components/common/LoadingState'
import { AdvancedPagination } from '@/shared/components/common/AdvancedPagination'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  Edit,
  Copy,
  BarChart3,
  Mail,
  MessageSquare,
  Phone,
  Linkedin,
  Users,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar
} from 'lucide-react'
import type { Campaign, CampaignFilters } from '../types/campaigns'

interface CampaignListProps {
  campaigns: Campaign[]
  total: number
  page: number
  limit: number
  loading?: boolean
  filters?: CampaignFilters
  onFiltersChange?: (filters: CampaignFilters) => void
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  onCampaignStart?: (id: string) => void
  onCampaignPause?: (id: string) => void
  onCampaignResume?: (id: string) => void
  onCampaignStop?: (id: string) => void
  onCampaignEdit?: (campaign: Campaign) => void
  onCampaignClone?: (id: string) => void
  onCampaignAnalytics?: (id: string) => void
  onCampaignDelete?: (id: string) => void
  onCreate?: () => void
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'secondary' },
  scheduled: { label: 'Agendada', color: 'default' },
  active: { label: 'Ativa', color: 'default' },
  paused: { label: 'Pausada', color: 'secondary' },
  completed: { label: 'Concluída', color: 'default' },
  cancelled: { label: 'Cancelada', color: 'destructive' }
} as const

const typeConfig = {
  email: { label: 'Email', icon: Mail, color: 'bg-blue-500' },
  sms: { label: 'SMS', icon: MessageSquare, color: 'bg-green-500' },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare, color: 'bg-green-600' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600' },
  phone: { label: 'Telefone', icon: Phone, color: 'bg-blue-500' },
  mixed: { label: 'Mista', icon: Users, color: 'bg-gray-500' }
} as const

export function CampaignList({
  campaigns,
  total,
  page,
  limit,
  loading,
  filters = {},
  onFiltersChange,
  onPageChange,
  onLimitChange,
  onCampaignStart,
  onCampaignPause,
  onCampaignResume,
  onCampaignStop,
  onCampaignEdit,
  onCampaignClone,
  onCampaignAnalytics,
  onCampaignDelete,
  onCreate,
}: CampaignListProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (onFiltersChange) {
      onFiltersChange({ ...filters, search: value })
    }
  }

  const handleFilterChange = (key: keyof CampaignFilters, value: any) => {
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [key]: value })
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    if (onFiltersChange) {
      onFiltersChange({})
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatPercentage = (value?: number) =>
    value !== undefined ? `${value.toFixed(1)}%` : '-'

  const getActionButtons = (campaign: Campaign) => {
    const canStart = campaign.status === 'draft' || campaign.status === 'scheduled'
    const canPause = campaign.status === 'active'
    const canResume = campaign.status === 'paused'
    const canStop = campaign.status === 'active' || campaign.status === 'paused'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {canStart && onCampaignStart && (
            <DropdownMenuItem onClick={() => onCampaignStart(campaign.id)}>
              <Play className="mr-2 h-4 w-4" />
              Iniciar
            </DropdownMenuItem>
          )}

          {canPause && onCampaignPause && (
            <DropdownMenuItem onClick={() => onCampaignPause(campaign.id)}>
              <Pause className="mr-2 h-4 w-4" />
              Pausar
            </DropdownMenuItem>
          )}

          {canResume && onCampaignResume && (
            <DropdownMenuItem onClick={() => onCampaignResume(campaign.id)}>
              <Play className="mr-2 h-4 w-4" />
              Retomar
            </DropdownMenuItem>
          )}

          {canStop && onCampaignStop && (
            <DropdownMenuItem onClick={() => onCampaignStop(campaign.id)}>
              <Square className="mr-2 h-4 w-4" />
              Parar
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {onCampaignEdit && (
            <DropdownMenuItem onClick={() => onCampaignEdit(campaign)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
          )}

          {onCampaignClone && (
            <DropdownMenuItem onClick={() => onCampaignClone(campaign.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Clonar
            </DropdownMenuItem>
          )}

          {onCampaignAnalytics && (
            <DropdownMenuItem onClick={() => onCampaignAnalytics(campaign.id)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {onCampaignDelete && campaign.status === 'draft' && (
            <DropdownMenuItem
              onClick={() => onCampaignDelete(campaign.id)}
              className="text-destructive focus:text-destructive"
            >
              Excluir
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="space-y-4">
      {/* Header e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campanhas
            </CardTitle>
            {onCreate && (
              <Button onClick={onCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select
                value={filters.status?.[0] || ''}
                onValueChange={(value) =>
                  handleFilterChange('status', value ? [value as Campaign['status']] : undefined)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tipo?.[0] || ''}
                onValueChange={(value) =>
                  handleFilterChange('tipo', value ? [value as Campaign['tipo']] : undefined)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="phone">Telefone</SelectItem>
                  <SelectItem value="mixed">Mista</SelectItem>
                </SelectContent>
              </Select>

              {(filters.search || filters.status || filters.tipo) && (
                <Button variant="outline" onClick={clearFilters} size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {campaigns.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma campanha encontrada"
          description="Crie sua primeira campanha para começar a automação de marketing"
          action={
            onCreate && (
              <Button onClick={onCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Campanha
              </Button>
            )
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>ROI</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const statusInfo = statusConfig[campaign.status]
                const typeInfo = typeConfig[campaign.tipo]
                const TypeIcon = typeInfo.icon

                const progressPercentage = campaign.metricas.totalContatos > 0
                  ? (campaign.metricas.contatosProcessados / campaign.metricas.totalContatos) * 100
                  : 0

                return (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full ${typeInfo.color} mt-2 flex-shrink-0`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <p className="font-medium truncate">{campaign.nome}</p>
                          </div>
                          {campaign.descricao && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {campaign.descricao}
                            </p>
                          )}
                          {campaign.tags && campaign.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {campaign.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {campaign.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{campaign.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={statusInfo.color as any}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{campaign.metricas.contatosProcessados}</span>
                          <span className="text-muted-foreground">/{campaign.metricas.totalContatos}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {progressPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Abertura:</span>
                          <span>{formatPercentage(campaign.metricas.taxaAbertura)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Resposta:</span>
                          <span>{formatPercentage(campaign.metricas.taxaResposta)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-600">
                          <span className="text-muted-foreground text-current">Leads:</span>
                          <span>{campaign.metricas.leads_gerados}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {campaign.metricas.roi > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={campaign.metricas.roi > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercentage(campaign.metricas.roi)}
                        </span>
                      </div>
                      {campaign.metricas.valorVendas > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatCurrency(campaign.metricas.valorVendas)}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(campaign.dataCriacao), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      {getActionButtons(campaign)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {campaigns.length > 0 && (
        <AdvancedPagination
          currentPage={page}
          totalItems={total}
          pageSize={limit}
          onPageChange={onPageChange || (() => {})}
          onPageSizeChange={onLimitChange || (() => {})}
        />
      )}
    </div>
  )
}