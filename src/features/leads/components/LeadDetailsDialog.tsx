import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building2,
  User,
  Tag,
  Globe,
  Edit,
  ExternalLink,
  Briefcase,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Lead, UpdateLeadDTO } from '../types/leads';
import { updateLead, fetchLead } from '../services/leads';
import { useToast } from '@/shared/hooks/use-toast';
import { StatusBadge, ScoreBadge, RelativeTime } from '@/shared/components/design-system';

interface LeadDetailsDialogProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
  onUpdate?: (lead: Lead) => void;
}

export const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
  lead,
  open,
  onClose,
  onEdit,
  onUpdate
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editData, setEditData] = useState<UpdateLeadDTO>({});

  if (!lead) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    // Inicializar dados de edição com os valores atuais
    setEditData({
      nomeContato: lead.nomeContato || '',
      cargoContato: lead.cargoContato || '',
      email: lead.email || '',
      telefone: lead.telefone || '',
      linkedinUrl: lead.linkedinUrl || '',
      siteEmpresa: lead.siteEmpresa || '',
      cnpj: lead.cnpj || '',
      segmento: lead.segmento || '',
      porteEmpresa: lead.porteEmpresa || '',
      numFuncionarios: lead.numFuncionarios || 0,
      receitaAnualEstimada: lead.receitaAnualEstimada || 0,
      endereco: lead.endereco || {},
      tags: lead.tags || [],
      observacoes: lead.observacoes || '',
      dadosOriginais: lead.dadosOriginais || {},
      custoAquisicao: lead.custoAquisicao || 0,
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
    setEditData({});
  };

  const handleSave = async () => {
    if (!lead) return;

    setIsLoading(true);
    setError(null);

    try {
      // Remover campos vazios ou undefined
      const cleanedData = Object.fromEntries(
        Object.entries(editData).filter(([_, value]) => {
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'number') return value > 0;
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'object' && value !== null) {
            return Object.keys(value).length > 0;
          }
          return value !== null && value !== undefined;
        })
      );

      // Primeiro, atualizar o lead
      await updateLead({
        id: lead.id,
        ...cleanedData
      });

      // Após sucesso, recarregar os dados atualizados da API
      const refreshedLead = await fetchLead(lead.id);

      // Atualizar o componente pai com os dados mais recentes
      if (onUpdate) {
        onUpdate(refreshedLead);
      }

      // Sair do modo de edição
      setIsEditing(false);
      setEditData({});

      toast({
        title: "Sucesso",
        description: "Lead atualizado com sucesso!",
      });

    } catch (error: any) {
      console.error('Erro ao atualizar lead:', error);

      let errorMessage = 'Erro desconhecido ao atualizar lead';

      if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Não autorizado. Faça login novamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Acesso negado. Você não tem permissão para editar este lead.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Lead não encontrado.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Status and score colors are now handled by StatusBadge and ScoreBadge components

  const renderEditableField = (
    label: string,
    value: string | number,
    fieldName: keyof UpdateLeadDTO,
    type: 'text' | 'email' | 'tel' | 'number' = 'text',
    placeholder?: string
  ) => {
    if (!isEditing) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}:</span>
          <span className="text-sm">{value || 'Não informado'}</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Input
          type={type}
          value={editData[fieldName] as string || ''}
          onChange={(e) => setEditData(prev => ({
            ...prev,
            [fieldName]: type === 'number' ? Number(e.target.value) : e.target.value
          }))}
          placeholder={placeholder}
          className="h-8"
        />
      </div>
    );
  };

  const renderEditableTextarea = (
    label: string,
    value: string,
    fieldName: keyof UpdateLeadDTO,
    placeholder?: string
  ) => {
    if (!isEditing) {
      return (
        <div>
          <h4 className="text-sm font-medium mb-2">{label}:</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {value || 'Não informado'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Textarea
          value={editData[fieldName] as string || ''}
          onChange={(e) => setEditData(prev => ({
            ...prev,
            [fieldName]: e.target.value
          }))}
          placeholder={placeholder}
          className="min-h-[80px]"
        />
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl lg:max-w-2xl p-0">
        {/* Header fixo */}
        <SheetHeader className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://avatar.vercel.sh/${lead.nomeContato || lead.nomeEmpresa}?size=40`} />
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                   lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{lead.nomeEmpresa}</h2>
                <p className="text-sm text-muted-foreground font-normal">{lead.nomeContato || 'Contato não informado'}</p>
              </div>
            </SheetTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            ) : (
              onEdit && (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )
            )}
          </div>
          
          {/* Status e Score badges abaixo do header */}
          <div className="flex items-center gap-3 mt-3">
            <StatusBadge
              type="lead"
              status={(lead.status as 'novo' | 'qualificado' | 'contatado' | 'convertido' | 'descartado') || 'novo'}
              size="sm"
            />
            <ScoreBadge score={lead.scoreQualificacao || 0} showLabel size="sm" />
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações do Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {renderEditableField('Nome', lead.nomeContato || '', 'nomeContato')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    {renderEditableField('Cargo', lead.cargoContato || '', 'cargoContato')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {renderEditableField('Email', lead.email || '', 'email', 'email')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {renderEditableField('Telefone', lead.telefone || '', 'telefone', 'tel')}
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
                    {isEditing ? (
                      <Input
                        value={editData.siteEmpresa || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, siteEmpresa: e.target.value }))}
                        placeholder="https://exemplo.com"
                        className="h-8"
                      />
                    ) : lead.siteEmpresa ? (
                      <a
                        href={lead.siteEmpresa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {lead.siteEmpresa}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm">Não informado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Localização:</span>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Input
                          value={editData.endereco?.cidade || ''}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            endereco: { ...prev.endereco, cidade: e.target.value }
                          }))}
                          placeholder="Cidade"
                          className="h-6 w-20"
                        />
                        <Input
                          value={editData.endereco?.estado || ''}
                          onChange={(e) => setEditData(prev => ({
                            ...prev,
                            endereco: { ...prev.endereco, estado: e.target.value }
                          }))}
                          placeholder="Estado"
                          className="h-6 w-16"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        {lead.endereco?.cidade && lead.endereco?.estado
                          ? `${lead.endereco.cidade}, ${lead.endereco.estado}`
                          : 'Não informado'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Segmento:</span>
                    {isEditing ? (
                      <Input
                        value={editData.segmento || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, segmento: e.target.value }))}
                        placeholder="Segmento"
                        className="h-8"
                      />
                    ) : (
                      <Badge variant="outline">{lead.segmento || 'Não definido'}</Badge>
                    )}
                  </div>
                </div>

                {renderEditableTextarea(
                  'Descrição da Empresa',
                  lead.descricaoEmpresa || '',
                  'descricaoEmpresa'
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

            {/* Detalhes Adicionais */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Fonte</div>
                <div className="font-medium capitalize">{lead.fonte || 'Não informado'}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Custo de Aquisição</div>
                <div className="font-medium">
                  {lead.custoAquisicao
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(lead.custoAquisicao)
                    : 'Não informado'
                  }
                </div>
              </Card>
            </div>

            {/* Informações de Data */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Histórico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data de Criação</span>
                  <span className="text-sm">
                    {lead.dataCriacao
                      ? format(new Date(lead.dataCriacao), "dd/MM/yyyy HH:mm", { locale: ptBR })
                      : 'Não informado'}
                  </span>
                </div>

                {lead.dataAtualizacao && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Última Atualização</span>
                    <RelativeTime date={lead.dataAtualizacao} showTooltip />
                  </div>
                )}

                {lead.ultimoContato && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Último Contato</span>
                    <RelativeTime date={lead.ultimoContato} showTooltip />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observações */}
            {(lead.observacoes || isEditing) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Observações</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderEditableTextarea(
                    'Observações',
                    lead.observacoes || '',
                    'observacoes'
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};