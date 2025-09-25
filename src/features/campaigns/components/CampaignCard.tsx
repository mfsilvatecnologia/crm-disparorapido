import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Progress } from '@/shared/components/ui/progress'
import {
  MoreHorizontal,
  Play,
  Pause,
  Square,
  Copy,
  Edit,
  BarChart3,
  Users,
  Mail,
  MessageSquare,
  Phone,
  Linkedin,
  Calendar
} from 'lucide-react'
import type { Campaign } from '../types/campaigns'

interface CampaignCardProps {
  campaign: Campaign
  onStart?: (id: string) => void
  onPause?: (id: string) => void
  onResume?: (id: string) => void
  onStop?: (id: string) => void
  onEdit?: (campaign: Campaign) => void
  onClone?: (id: string) => void
  onViewAnalytics?: (id: string) => void
  onDelete?: (id: string) => void
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
  email: { label: 'Email', icon: Mail },
  sms: { label: 'SMS', icon: MessageSquare },
  whatsapp: { label: 'WhatsApp', icon: MessageSquare },
  linkedin: { label: 'LinkedIn', icon: Linkedin },
  phone: { label: 'Telefone', icon: Phone },
  mixed: { label: 'Mista', icon: Users }
} as const

export function CampaignCard({
  campaign,
  onStart,
  onPause,
  onResume,
  onStop,
  onEdit,
  onClone,
  onViewAnalytics,
  onDelete,
}: CampaignCardProps) {
  const statusInfo = statusConfig[campaign.status]
  const typeInfo = typeConfig[campaign.tipo]
  const TypeIcon = typeInfo.icon

  const progressPercentage = campaign.metricas.totalContatos > 0
    ? (campaign.metricas.contatosProcessados / campaign.metricas.totalContatos) * 100
    : 0

  const canStart = campaign.status === 'draft' || campaign.status === 'scheduled'
  const canPause = campaign.status === 'active'
  const canResume = campaign.status === 'paused'
  const canStop = campaign.status === 'active' || campaign.status === 'paused'

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const formatPercentage = (value?: number) =>
    value !== undefined ? `${value.toFixed(1)}%` : '-'

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">{campaign.nome}</CardTitle>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={statusInfo.color as any}>{statusInfo.label}</Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                {canStart && onStart && (
                  <DropdownMenuItem onClick={() => onStart(campaign.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                  </DropdownMenuItem>
                )}

                {canPause && onPause && (
                  <DropdownMenuItem onClick={() => onPause(campaign.id)}>
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar
                  </DropdownMenuItem>
                )}

                {canResume && onResume && (
                  <DropdownMenuItem onClick={() => onResume(campaign.id)}>
                    <Play className="mr-2 h-4 w-4" />
                    Retomar
                  </DropdownMenuItem>
                )}

                {canStop && onStop && (
                  <DropdownMenuItem onClick={() => onStop(campaign.id)}>
                    <Square className="mr-2 h-4 w-4" />
                    Parar
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(campaign)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                )}

                {onClone && (
                  <DropdownMenuItem onClick={() => onClone(campaign.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Clonar
                  </DropdownMenuItem>
                )}

                {onViewAnalytics && (
                  <DropdownMenuItem onClick={() => onViewAnalytics(campaign.id)}>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {onDelete && campaign.status === 'draft' && (
                  <DropdownMenuItem
                    onClick={() => onDelete(campaign.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {campaign.descricao && (
          <CardDescription className="mt-2">{campaign.descricao}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{campaign.metricas.contatosProcessados}/{campaign.metricas.totalContatos} contatos</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Taxa de Abertura</p>
            <p className="font-medium">{formatPercentage(campaign.metricas.taxaAbertura)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground">Taxa de Resposta</p>
            <p className="font-medium">{formatPercentage(campaign.metricas.taxaResposta)}</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground">Leads Gerados</p>
            <p className="font-medium text-green-600">{campaign.metricas.leads_gerados}</p>
          </div>

          <div className="space-y-1">
            <p className="text-muted-foreground">ROI</p>
            <p className="font-medium">{formatPercentage(campaign.metricas.roi)}</p>
          </div>
        </div>

        {/* Revenue */}
        {campaign.metricas.valorVendas > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Valor em Vendas</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(campaign.metricas.valorVendas)}
              </span>
            </div>
          </div>
        )}

        {/* Tags */}
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {campaign.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {campaign.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{campaign.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 text-xs text-muted-foreground border-t">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>
            Criada em {format(new Date(campaign.dataCriacao), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
        </div>

        {campaign.ultimaExecucao && (
          <div>
            Última execução: {format(new Date(campaign.ultimaExecucao), 'dd/MM HH:mm', { locale: ptBR })}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}