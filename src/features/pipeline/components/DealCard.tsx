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
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Target,
  Building2,
  User,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import type { Deal } from '../types/pipeline'

interface DealCardProps {
  deal: Deal
  showStage?: boolean
  onEdit?: (deal: Deal) => void
  onDelete?: (id: string) => void
  onMove?: (dealId: string) => void
  onCall?: (deal: Deal) => void
  onEmail?: (deal: Deal) => void
  onSchedule?: (deal: Deal) => void
  className?: string
}

const statusConfig = {
  ativo: { label: 'Ativo', color: 'default' },
  ganho: { label: 'Ganho', color: 'default' },
  perdido: { label: 'Perdido', color: 'destructive' },
  pausado: { label: 'Pausado', color: 'secondary' },
  arquivado: { label: 'Arquivado', color: 'outline' }
} as const

const prioridadeConfig = {
  baixa: { label: 'Baixa', color: 'secondary', icon: '🔵' },
  media: { label: 'Média', color: 'default', icon: '🟡' },
  alta: { label: 'Alta', color: 'destructive', icon: '🔴' }
} as const

const origemConfig = {
  manual: { label: 'Manual', icon: '✏️' },
  lead_conversion: { label: 'Lead', icon: '🎯' },
  import: { label: 'Importação', icon: '📥' },
  api: { label: 'API', icon: '🔌' },
  campaign: { label: 'Campanha', icon: '📧' }
} as const

export function DealCard({
  deal,
  showStage = false,
  onEdit,
  onDelete,
  onMove,
  onCall,
  onEmail,
  onSchedule,
  className
}: DealCardProps) {
  const statusInfo = statusConfig[deal.status]
  const prioridadeInfo = prioridadeConfig[deal.prioridade]
  const origemInfo = origemConfig[deal.origem]

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase()

  const isOverdue = deal.dataProximaAcao &&
    new Date(deal.dataProximaAcao) < new Date() &&
    deal.status === 'ativo'

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://avatar.vercel.sh/${deal.nomeContato || deal.nomeEmpresa}?size=40`} />
              <AvatarFallback className="text-sm bg-primary/10">
                {getInitials(deal.nomeContato || deal.nomeEmpresa || 'NN')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                {deal.titulo}
              </CardTitle>
              {deal.descricao && (
                <CardDescription className="line-clamp-2 mt-1">
                  {deal.descricao}
                </CardDescription>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(deal)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}

              {onMove && (
                <DropdownMenuItem onClick={() => onMove(deal.id)}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Mover Etapa
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onCall && deal.telefoneContato && (
                <DropdownMenuItem onClick={() => onCall(deal)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar
                </DropdownMenuItem>
              )}

              {onEmail && deal.emailContato && (
                <DropdownMenuItem onClick={() => onEmail(deal)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </DropdownMenuItem>
              )}

              {onSchedule && (
                <DropdownMenuItem onClick={() => onSchedule(deal)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Atividade
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(deal.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Valor e Probabilidade */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-600">
              {formatCurrency(deal.valor)}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {deal.probabilidade}%
            </span>
          </div>
        </div>

        {/* Contato e Empresa */}
        <div className="space-y-2 text-sm">
          {deal.nomeContato && (
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{deal.nomeContato}</span>
              {deal.cargoContato && (
                <span className="text-muted-foreground">• {deal.cargoContato}</span>
              )}
            </div>
          )}

          {deal.nomeEmpresa && (
            <div className="flex items-center space-x-2">
              <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{deal.nomeEmpresa}</span>
              {deal.segmentoEmpresa && (
                <Badge variant="outline" className="text-xs ml-auto">
                  {deal.segmentoEmpresa}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Stage (se habilitado) */}
        {showStage && deal.stage && (
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: deal.stage.cor }}
            />
            <span className="text-sm text-muted-foreground">
              {deal.stage.nome}
            </span>
          </div>
        )}

        {/* Badges de Status, Prioridade e Origem */}
        <div className="flex flex-wrap gap-1">
          <Badge variant={statusInfo.color as any}>
            {statusInfo.label}
          </Badge>

          <Badge variant={prioridadeInfo.color as any} className="text-xs">
            {prioridadeInfo.icon} {prioridadeInfo.label}
          </Badge>

          <Badge variant="outline" className="text-xs">
            {origemInfo.icon} {origemInfo.label}
          </Badge>
        </div>

        {/* Tags */}
        {deal.tags && deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {deal.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{deal.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Próxima Ação */}
        {deal.proximaAcao && (
          <div className={`p-2 rounded-md text-sm ${isOverdue ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
            <div className="flex items-start space-x-2">
              {isOverdue ? (
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Target className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${isOverdue ? 'text-red-700' : 'text-foreground'}`}>
                  {deal.proximaAcao}
                </p>
                {deal.dataProximaAcao && (
                  <p className={`text-xs mt-1 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {format(new Date(deal.dataProximaAcao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    {isOverdue && ' (Vencida)'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-3 text-xs text-muted-foreground border-t">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>
            {deal.tempoNoStage} dias nesta etapa
          </span>
        </div>

        {deal.ultimaInteracao && (
          <div>
            Última interação: {format(new Date(deal.ultimaInteracao), 'dd/MM', { locale: ptBR })}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}