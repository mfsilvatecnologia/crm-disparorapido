import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building2,
  User,
  Star,
  Tag,
  Globe,
  Edit,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lead } from '../types/leads';

interface LeadDetailsDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
}

export const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
  lead,
  open,
  onClose,
  onEdit
}) => {
  if (!lead) return null;

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      novo: 'bg-blue-100 text-blue-800 border-blue-200',
      qualificado: 'bg-green-100 text-green-800 border-green-200',
      contatado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      convertido: 'bg-purple-100 text-purple-800 border-purple-200',
      descartado: 'bg-red-100 text-red-800 border-red-200'
    } as const;

    return colors[status as keyof typeof colors] || colors.novo;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${lead.nomeContato || lead.nomeEmpresa}?size=40`} />
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                   lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{lead.nomeEmpresa}</h2>
                <p className="text-sm text-muted-foreground">{lead.nomeContato || 'Contato não informado'}</p>
              </div>
            </DialogTitle>
            {onEdit && (
              <Button onClick={() => onEdit(lead)} variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nome:</span>
                    <span className="text-sm">{lead.nomeContato || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Cargo:</span>
                    <span className="text-sm">{lead.cargoContato || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{lead.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Telefone:</span>
                    <span className="text-sm">{lead.telefone || 'Não informado'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Nome:</span>
                    <span className="text-sm">{lead.nomeEmpresa}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Website:</span>
                    {lead.website ? (
                      <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {lead.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm">Não informado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Localização:</span>
                    <span className="text-sm">
                      {lead.endereco?.cidade && lead.endereco?.estado
                        ? `${lead.endereco.cidade}, ${lead.endereco.estado}`
                        : 'Não informado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Segmento:</span>
                    <Badge variant="outline">{lead.segmento || 'Não definido'}</Badge>
                  </div>
                </div>

                {lead.descricaoEmpresa && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Descrição:</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {lead.descricaoEmpresa}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {lead.tags && lead.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lead.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status e Qualificação */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status & Qualificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Status Atual</span>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(lead.status || 'novo')} capitalize`}>
                      {lead.status || 'novo'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Score de Qualificação</span>
                  <div className={`mt-1 p-3 rounded-lg border ${getQualityColor(lead.scoreQualificacao || 0)}`}>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      <span className="text-xl font-bold">{lead.scoreQualificacao || 0}%</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Fonte</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="capitalize">
                      {lead.fonte || 'Não informado'}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Custo de Aquisição</span>
                  <div className="mt-1">
                    <span className="font-medium">
                      {lead.custoAquisicao
                        ? new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(lead.custoAquisicao)
                        : 'Não informado'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações de Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Data de Criação</span>
                  <p className="text-sm">
                    {lead.dataCriacao
                      ? format(new Date(lead.dataCriacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                      : 'Não informado'}
                  </p>
                </div>

                {lead.dataAtualizacao && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Última Atualização</span>
                    <p className="text-sm">
                      {format(new Date(lead.dataAtualizacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                )}

                {lead.ultimoContato && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Último Contato</span>
                    <p className="text-sm">
                      {format(new Date(lead.ultimoContato), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações */}
            {lead.observacoes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lead.observacoes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};