import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  Play,
  Pause,
  Square,
  Eye,
  Send,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Progress } from '@/shared/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useToast } from '@/shared/hooks/use-toast';
import { useCampaigns, useCampaignStats, useCreateCampaign } from '../hooks/useCampaigns';
import type { Campaign, CampaignFilters } from '../types/campaigns';

const createCampanhaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['scraping_web', 'lista_importada', 'api_externa', 'manual']),
  segmentosAlvo: z.array(z.string()).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

type CreateCampanhaForm = z.infer<typeof createCampanhaSchema>;

const tipoIcons = {
  email: Mail,
  sms: Smartphone,
  whatsapp: MessageSquare,
  linkedin: Users,
  phone: Smartphone,
  mixed: BarChart3,
};

const statusLabels = {
  rascunho: 'Rascunho',
  ativa: 'Ativa',
  pausada: 'Pausada',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

const statusColors = {
  rascunho: 'bg-gray-100 text-gray-800',
  ativa: 'bg-green-100 text-green-800',
  pausada: 'bg-yellow-100 text-yellow-800',
  finalizada: 'bg-blue-100 text-blue-800',
  cancelada: 'bg-red-100 text-red-800',
};

export default function CampanhasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campaign | null>(null);
  const [viewingCampanha, setViewingCampanha] = useState<Campaign | null>(null);

  // Preparar filtros
  const filters: CampaignFilters = {
    search: searchTerm || undefined,
    status: statusFilter && statusFilter !== 'all' ? [statusFilter] : undefined,
    tipo: tipoFilter && tipoFilter !== 'all' ? [tipoFilter] : undefined,
  };

  // Fetch campanhas e stats usando hooks
  const { data: campanhasData, isLoading, error, refetch } = useCampaigns(filters);
  const { data: stats } = useCampaignStats();

  // Create campanha form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetForm,
    setValue,
    watch,
  } = useForm<CreateCampanhaForm>({
    resolver: zodResolver(createCampanhaSchema),
  });

  // Mutations
  const createCampanhaMutation = useCreateCampaign();

  const onCreateCampanha = (data: CreateCampanhaForm) => {
    const campaignData = {
      nome: data.nome,
      descricao: data.descricao || '',
      tipo: data.tipo,
      sequencia: [], // Sequência vazia por enquanto
      segmentosAlvo: data.segmentosAlvo || [],
      configuracoes: {
        agendamento: {
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
        }
      }
    };

    createCampanhaMutation.mutate(campaignData, {
      onSuccess: () => {
        resetForm();
        setCreateDialogOpen(false);
        refetch(); // Atualizar lista
      }
    });
  };

  const handleViewCampanha = (campanha: Campaign) => {
    setViewingCampanha(campanha);
    setViewDialogOpen(true);
  };

  const formatPercentage = (value: number | undefined) => value ? `${value.toFixed(1)}%` : '0%';
  const formatNumber = (value: number | undefined) => value ? value.toLocaleString('pt-BR') : '0';

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando campanhas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Erro ao carregar campanhas</h3>
              <p className="text-muted-foreground mb-4">Não foi possível carregar a lista de campanhas</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            Gestão de Campanhas
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie campanhas de marketing automatizadas
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Campanha</DialogTitle>
              <DialogDescription>
                Configure uma nova campanha de marketing
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onCreateCampanha)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="config">Configurações</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Campanha</Label>
                    <Input
                      id="nome"
                      {...register('nome')}
                      className={errors.nome ? 'border-destructive' : ''}
                      placeholder="Ex: Campanha de Prospeccão Q1"
                    />
                    {errors.nome && (
                      <p className="text-sm text-destructive">{errors.nome.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Campanha</Label>
                    <Select onValueChange={(value) => setValue('tipo', value as any)}>
                      <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scraping_web">Scraping Web</SelectItem>
                        <SelectItem value="lista_importada">Lista Importada</SelectItem>
                        <SelectItem value="api_externa">API Externa</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo && (
                      <p className="text-sm text-destructive">{errors.tipo.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      {...register('descricao')}
                      placeholder="Descreva o objetivo da campanha..."
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="datetime-local"
                        {...register('dataInicio')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataFim">Data de Fim</Label>
                      <Input
                        id="dataFim"
                        type="datetime-local"
                        {...register('dataFim')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodicidade">Periodicidade</Label>
                    <Select onValueChange={(value) => setValue('periodicidade', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a periodicidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONCE">Uma vez</SelectItem>
                        <SelectItem value="DAILY">Diária</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Campanha'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.ativas} ativas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contatos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.performanceGeral.totalContatos)}</div>
              <p className="text-xs text-muted-foreground">Total de contatos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(stats.performanceGeral.taxaAberturaMedia)}</div>
              <p className="text-xs text-muted-foreground">Média geral</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ROI Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(stats.performanceGeral.roiMedio)}</div>
              <p className="text-xs text-muted-foreground">Retorno sobre investimento</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre campanhas por nome, status ou tipo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar campanhas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={(value) => setTipoFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="phone">Telefone</SelectItem>
                <SelectItem value="mixed">Misto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campanhas Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Campanhas ({campanhasData?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!campanhasData?.campaigns || campanhasData.campaigns.length === 0) ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter || tipoFilter
                  ? 'Tente ajustar os filtros para encontrar campanhas.'
                  : 'Comece criando sua primeira campanha de marketing.'
                }
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Campanha
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contatos</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campanhasData.campaigns.map((campanha) => {
                  const TipoIcon = tipoIcons[campanha.tipo];
                  return (
                    <TableRow key={campanha.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campanha.nome}</div>
                          {campanha.descricao && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {campanha.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TipoIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{campanha.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[campanha.status] || 'bg-gray-100 text-gray-800'}
                        >
                          {statusLabels[campanha.status] || campanha.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{formatNumber(campanha.metricas?.totalContatos || 0)} contatos</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>{formatPercentage(campanha.metricas?.taxaConversao || 0)} conversão</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(campanha.dataCriacao).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewCampanha(campanha)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingCampanha(campanha)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Campanha Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              {viewingCampanha?.nome}
            </DialogTitle>
            <DialogDescription>
              Detalhes e métricas da campanha
            </DialogDescription>
          </DialogHeader>

          {viewingCampanha && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {React.createElement(tipoIcons[viewingCampanha.tipo], { className: "h-4 w-4" })}
                    <span className="text-sm capitalize">{viewingCampanha.tipo}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[viewingCampanha.status] || 'bg-gray-100 text-gray-800'}>
                      {statusLabels[viewingCampanha.status] || viewingCampanha.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Métricas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(viewingCampanha.metricas?.totalContatos || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Contatos</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(viewingCampanha.metricas?.taxaConversao || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa Conversão</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {viewingCampanha.sequencia?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Etapas</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingCampanha.descricao && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="text-sm mt-1">{viewingCampanha.descricao}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Criada em</Label>
                  <p className="text-sm mt-1">
                    {new Date(viewingCampanha.dataCriacao).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Atualizada em</Label>
                  <p className="text-sm mt-1">
                    {new Date(viewingCampanha.dataAtualizacao).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}