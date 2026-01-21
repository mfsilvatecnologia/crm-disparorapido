// LeadCard Component - Individual lead display card
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarInitials } from '@/shared/components/ui/avatar'
import { MoreHorizontal, Mail, Phone, Building2, Calendar, Star } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { Lead } from '../types/leads'

interface LeadCardProps {
  lead: Lead
  onEdit?: (lead: Lead) => void
  onDelete?: (id: string) => void
  onViewDetails?: (lead: Lead) => void
  onUpdateStatus?: (id: string, status: Lead['status']) => void
  className?: string
}

const statusConfig = {
  novo: { label: 'Novo', color: 'bg-blue-500', textColor: 'text-blue-700' },
  qualificado: { label: 'Qualificado', color: 'bg-green-500', textColor: 'text-green-700' },
  contatado: { label: 'Contatado', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  interessado: { label: 'Interessado', color: 'bg-blue-500', textColor: 'text-blue-700' },
  desqualificado: { label: 'Desqualificado', color: 'bg-red-500', textColor: 'text-red-700' },
  convertido: { label: 'Convertido', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
}

const origemConfig = {
  website: { label: 'Website', icon: '🌐' },
  scraping: { label: 'Scraping', icon: '🔍' },
  importacao: { label: 'Importação', icon: '📁' },
  manual: { label: 'Manual', icon: '✋' },
}

export function LeadCard({
  lead,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  className
}: LeadCardProps) {
  const status = statusConfig[lead.status]
  const origem = origemConfig[lead.origem]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleStatusChange = (newStatus: Lead['status']) => {
    if (onUpdateStatus) {
      onUpdateStatus(lead.id, newStatus)
    }
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                {getInitials(lead.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-medium">{lead.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">{lead.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lead.score && (
              <div className="flex items-center gap-1 text-sm text-yellow-600">
                <Star className="h-3 w-3 fill-current" />
                <span>{lead.score}</span>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onViewDetails && (
                  <DropdownMenuItem onClick={() => onViewDetails(lead)}>
                    Ver detalhes
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(lead)}>
                    Editar
                  </DropdownMenuItem>
                )}
                {onUpdateStatus && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('qualificado')}>
                      Marcar como Qualificado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('contatado')}>
                      Marcar como Contatado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('convertido')}>
                      Marcar como Convertido
                    </DropdownMenuItem>
                  </>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(lead.id)}
                    className="text-red-600"
                  >
                    Excluir
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Status e Origem */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`${status.color} text-white`}
          >
            {status.label}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{origem.icon}</span>
            <span>{origem.label}</span>
          </div>
        </div>

        {/* Informações de contato */}
        <div className="space-y-2">
          {lead.telefone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{lead.telefone}</span>
            </div>
          )}

          {(lead.empresa || lead.nomeEmpresa) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{lead.empresa || lead.nomeEmpresa}</span>
              {lead.cargo && <span className="text-xs">• {lead.cargo}</span>}
            </div>
          )}
        </div>

        {/* Tags */}
        {lead.tags && lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {lead.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{lead.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Data de criação */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Criado em {formatDate(lead.dataCriacao)}</span>
        </div>
      </CardContent>
    </Card>
  )
}