// CompanyCard Component - Individual company display card
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import {
  MoreHorizontal,
  Mail,
  Phone,
  Globe,
  MapPin,
  Building2,
  Users,
  Calendar,
  ExternalLink,
  Star,
  TrendingUp
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import type { Company } from '../types/companies'

interface CompanyCardProps {
  company: Company
  onEdit?: (company: Company) => void
  onDelete?: (id: string) => void
  onViewDetails?: (company: Company) => void
  onUpdateStatus?: (id: string, status: Company['status']) => void
  onEnrich?: (id: string) => void
  className?: string
}

const statusConfig = {
  ativa: { label: 'Ativa', color: 'bg-green-500', textColor: 'text-green-700' },
  inativa: { label: 'Inativa', color: 'bg-gray-500', textColor: 'text-gray-700' },
  prospecto: { label: 'Prospecto', color: 'bg-blue-500', textColor: 'text-blue-700' },
  cliente: { label: 'Cliente', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  ex_cliente: { label: 'Ex-cliente', color: 'bg-red-500', textColor: 'text-red-700' },
}

const sizeConfig = {
  startup: { label: 'Startup', icon: '🚀' },
  pequena: { label: 'Pequena', icon: '🏪' },
  media: { label: 'Média', icon: '🏢' },
  grande: { label: 'Grande', icon: '🏭' },
  enterprise: { label: 'Enterprise', icon: '🌆' },
}

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onViewDetails,
  onUpdateStatus,
  onEnrich,
  className
}: CompanyCardProps) {
  const status = statusConfig[company.status]
  const size = sizeConfig[company.tamanhoEmpresa]

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

  const formatCurrency = (value?: number) => {
    if (!value) return null
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const handleStatusChange = (newStatus: Company['status']) => {
    if (onUpdateStatus) {
      onUpdateStatus(company.id, newStatus)
    }
  }

  const openWebsite = () => {
    if (company.website) {
      const url = company.website.startsWith('http')
        ? company.website
        : `https://${company.website}`
      window.open(url, '_blank')
    }
  }

  const openLinkedIn = () => {
    if (company.linkedinUrl) {
      window.open(company.linkedinUrl, '_blank')
    }
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {company.logoUrl ? (
                <AvatarImage src={company.logoUrl} alt={company.nome} />
              ) : (
                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                  {getInitials(company.nome)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-medium truncate">{company.nome}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{company.email}</p>
              {company.cnpj && (
                <p className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {company.dadosEnriquecidos && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Star className="h-3 w-3 fill-current" />
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
                  <DropdownMenuItem onClick={() => onViewDetails(company)}>
                    Ver detalhes
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(company)}>
                    Editar
                  </DropdownMenuItem>
                )}
                {onEnrich && (
                  <DropdownMenuItem onClick={() => onEnrich(company.id)}>
                    Enriquecer dados
                  </DropdownMenuItem>
                )}
                {onUpdateStatus && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('prospecto')}>
                      Marcar como Prospecto
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('cliente')}>
                      Marcar como Cliente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('ativa')}>
                      Marcar como Ativa
                    </DropdownMenuItem>
                  </>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(company.id)}
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
        {/* Status e Tamanho */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className={`${status.color} text-white`}
          >
            {status.label}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{size.icon}</span>
            <span>{size.label}</span>
          </div>
        </div>

        {/* Informações de contato e localização */}
        <div className="space-y-2">
          {company.telefone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{company.telefone}</span>
            </div>
          )}

          {company.website && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span
                className="truncate cursor-pointer hover:text-blue-600"
                onClick={openWebsite}
                title="Abrir website"
              >
                {company.website}
              </span>
              <ExternalLink className="h-3 w-3 cursor-pointer hover:text-blue-600" onClick={openWebsite} />
            </div>
          )}

          {company.endereco && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">
                {company.endereco.cidade}, {company.endereco.estado}
              </span>
            </div>
          )}

          {company.segmento && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{company.segmento}</span>
            </div>
          )}
        </div>

        {/* Métricas da empresa */}
        {(company.numeroFuncionarios || company.faturamentoAnual) && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {company.numeroFuncionarios && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{company.numeroFuncionarios.toLocaleString('pt-BR')} func.</span>
              </div>
            )}

            {company.faturamentoAnual && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                <span className="truncate">{formatCurrency(company.faturamentoAnual)}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {company.tags && company.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {company.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {company.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{company.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* LinkedIn */}
        {company.linkedinUrl && (
          <div className="flex items-center gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={openLinkedIn}
            >
              LinkedIn
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}

        {/* Data de criação */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Criada em {formatDate(company.dataCriacao)}</span>
        </div>
      </CardContent>
    </Card>
  )
}