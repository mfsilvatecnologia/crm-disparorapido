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
  palavras_chave: z.string().optional(),
  localizacao: z.string().optional(),
});

const addContatoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  empresa: z.string().optional(),
  cargo: z.string().optional(),
  telefone: z.string().optional(),
});

type CreateCampanhaForm = z.infer<typeof createCampanhaSchema>;
type AddContatoForm = z.infer<typeof addContatoSchema>;

const tipoIcons = {
  scraping_web: Search,
  lista_importada: Users,
  api_externa: Target,
  manual: Pencil,
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
  const [contatosDialogOpen, setContatosDialogOpen] = useState(false);
  const [addContatoDialogOpen, setAddContatoDialogOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campaign | null>(null);
  const [viewingCampanha, setViewingCampanha] = useState<Campaign | null>(null);
  const [gerenciandoContatos, setGerenciandoContatos] = useState<Campaign | null>(null);

  // Preparar filtros
  const filters: CampaignFilters = {
    search: searchTerm || undefined,
    status: statusFilter && statusFilter !== 'all' ? [statusFilter as Campaign['status']] : undefined,
    tipo: tipoFilter && tipoFilter !== 'all' ? [tipoFilter as Campaign['tipo']] : undefined,
  };

  // Fetch campanhas e stats usando hooks
  const { data: campanhasData, isLoading, error, refetch } = useCampaigns(filters);
  const { data: stats } = useCampaignStats();

  // Debug: verificar estrutura dos dados
  console.log('campanhasData:', campanhasData);

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

  // Add contato form
  const {
    register: registerContato,
    handleSubmit: handleSubmitContato,
    formState: { errors: errorsContato, isSubmitting: isSubmittingContato },
    reset: resetContatoForm,
  } = useForm<AddContatoForm>({
    resolver: zodResolver(addContatoSchema),
  });

  // Mutations
  const createCampanhaMutation = useCreateCampaign();

  const onCreateCampanha = (data: CreateCampanhaForm) => {
    const campaignData = {
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      configuracoes: {
        ...(data.palavras_chave && { 
          palavras_chave: data.palavras_chave.split(',').map(k => k.trim()) 
        }),
        ...(data.localizacao && { localizacao: data.localizacao })
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

  const handleGerenciarContatos = (campanha: Campaign) => {
    setGerenciandoContatos(campanha);
    setContatosDialogOpen(true);
  };

  const handleAdicionarContatos = () => {
    setAddContatoDialogOpen(true);
  };

  const onAdicionarContato = (data: AddContatoForm) => {
    if (!gerenciandoContatos) return;
    
    // Por enquanto, vamos apenas simular a adição
    console.log('Adicionando contato à campanha:', gerenciandoContatos.id, data);
    
    toast({
      title: 'Contato adicionado',
      description: `${data.nome} foi adicionado à campanha com sucesso.`,
    });

    resetContatoForm();
    setAddContatoDialogOpen(false);
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
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <Label htmlFor="palavras_chave">Palavras-chave</Label>
                  <Input
                    id="palavras_chave"
                    {...register('palavras_chave')}
                    placeholder="Ex: tecnologia, startup, marketing (separado por vírgula)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    id="localizacao"
                    {...register('localizacao')}
                    placeholder="Ex: São Paulo, Brasil"
                  />
                </div>
              </div>

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
                {Array.isArray(campanhasData?.campaigns) && campanhasData.campaigns.length > 0 ? campanhasData.campaigns.map((campanha) => {
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
                          {TipoIcon ? (
                            <TipoIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm capitalize">{campanha.tipo.replace('_', ' ')}</span>
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
                            <span>0 contatos</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            <span>0% conversão</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(campanha.createdAt).toLocaleDateString('pt-BR')}
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
                            <DropdownMenuItem onClick={() => handleGerenciarContatos(campanha)}>
                              <Users className="mr-2 h-4 w-4" />
                              Gerenciar Contatos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isLoading ? 'Carregando campanhas...' : 'Nenhuma campanha encontrada.'}
                    </TableCell>
                  </TableRow>
                )}
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
                    {tipoIcons[viewingCampanha.tipo] ? (
                      React.createElement(tipoIcons[viewingCampanha.tipo], { className: "h-4 w-4" })
                    ) : (
                      <Megaphone className="h-4 w-4" />
                    )}
                    <span className="text-sm capitalize">{viewingCampanha.tipo.replace('_', ' ')}</span>
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
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Contatos</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      0%
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa Conversão</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      0
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
                    {new Date(viewingCampanha.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Atualizada em</Label>
                  <p className="text-sm mt-1">
                    {new Date(viewingCampanha.updatedAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gerenciar Contatos Dialog */}
      <Dialog open={contatosDialogOpen} onOpenChange={setContatosDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciar Contatos - {gerenciandoContatos?.nome}
            </DialogTitle>
            <DialogDescription>
              Adicione, visualize ou remova contatos desta campanha(alterar para buscar do banco)
            </DialogDescription>
          </DialogHeader>

          {gerenciandoContatos && (
            <div className="space-y-6">
              {/* Ações rápidas */}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleAdicionarContatos}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Contatos
                </Button>
                <Button variant="outline" className="flex-1">
                  <Users className="h-4 w-4 mr-2" />
                  Importar Lista
                </Button>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-xs text-muted-foreground">Total de Contatos</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-xs text-muted-foreground">Processados</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-xs text-muted-foreground">Pendentes</div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de contatos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contatos da Campanha</h3>
                <div className="border rounded-lg">
                  <div className="p-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Nenhum contato adicionado ainda</p>
                    <p className="text-sm">Comece adicionando contatos para esta campanha</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setContatosDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adicionar Contato Dialog */}
      <Dialog open={addContatoDialogOpen} onOpenChange={setAddContatoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Adicionar Contato
            </DialogTitle>
            <DialogDescription>
              Adicione um novo contato à campanha "{gerenciandoContatos?.nome}"
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitContato(onAdicionarContato)} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome-contato">Nome *</Label>
                <Input
                  id="nome-contato"
                  {...registerContato('nome')}
                  className={errorsContato.nome ? 'border-destructive' : ''}
                  placeholder="Nome completo"
                />
                {errorsContato.nome && (
                  <p className="text-sm text-destructive">{errorsContato.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-contato">Email *</Label>
                <Input
                  id="email-contato"
                  type="email"
                  {...registerContato('email')}
                  className={errorsContato.email ? 'border-destructive' : ''}
                  placeholder="contato@empresa.com"
                />
                {errorsContato.email && (
                  <p className="text-sm text-destructive">{errorsContato.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa-contato">Empresa</Label>
                <Input
                  id="empresa-contato"
                  {...registerContato('empresa')}
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo-contato">Cargo</Label>
                <Input
                  id="cargo-contato"
                  {...registerContato('cargo')}
                  placeholder="Ex: Gerente de Marketing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone-contato">Telefone</Label>
                <Input
                  id="telefone-contato"
                  {...registerContato('telefone')}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAddContatoDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmittingContato}>
                {isSubmittingContato ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}