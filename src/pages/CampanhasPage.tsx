import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatsGrid } from '@/components/shared/StatsCard';
import { apiClient } from '@/lib/api/client';
import type { Campanha, CampanhaStats, CreateCampanha, UpdateCampanha } from '@/lib/api/schemas';

const createCampanhaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['EMAIL', 'SMS', 'WHATSAPP', 'LINKEDIN', 'SEQUENCE']),
  segmentosAlvo: z.array(z.string()).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  periodicidade: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY']).optional(),
});

type CreateCampanhaForm = z.infer<typeof createCampanhaSchema>;

const tipoIcons = {
  EMAIL: Mail,
  SMS: Smartphone,
  WHATSAPP: MessageSquare,
  LINKEDIN: Users,
  SEQUENCE: BarChart3,
};

const statusLabels = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function CampanhasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null);
  const [viewingCampanha, setViewingCampanha] = useState<Campanha | null>(null);

  // Fetch campanhas
  const { data: campanhasData, isLoading, error } = useQuery({
    queryKey: ['campanhas', currentPage, searchTerm, statusFilter, tipoFilter],
    queryFn: () => apiClient.getCampanhas({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      status: statusFilter || undefined,
      tipo: tipoFilter || undefined,
    }),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['campanhas', 'stats'],
    queryFn: () => apiClient.getCampanhaStats(),
  });

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
  const createCampanhaMutation = useMutation({
    mutationFn: (data: CreateCampanha) => apiClient.createCampanha(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      resetForm();
      setCreateDialogOpen(false);
      toast({
        title: "Campanha criada",
        description: "Nova campanha foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar campanha",
        description: error.message || "Ocorreu um erro ao criar a campanha.",
        variant: "destructive",
      });
    },
  });

  const updateCampanhaStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      apiClient.updateCampanha(id, { status } as UpdateCampanha),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({
        title: "Status atualizado",
        description: "Status da campanha foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro ao atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const deleteCampanhaMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCampanha(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      toast({
        title: "Campanha removida",
        description: "Campanha foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover campanha",
        description: error.message || "Ocorreu um erro ao remover a campanha.",
        variant: "destructive",
      });
    },
  });

  const onCreateCampanha = (data: CreateCampanhaForm) => {
    const campanha: CreateCampanha = {
      nome: data.nome,
      descricao: data.descricao,
      tipo: data.tipo,
      configuracoes: {
        segmentosAlvo: data.segmentosAlvo,
        agendamento: {
          dataInicio: data.dataInicio,
          dataFim: data.dataFim,
          periodicidade: data.periodicidade,
        },
      },
    };
    
    createCampanhaMutation.mutate(campanha);
  };

  const handleStatusChange = (campanha: Campanha, newStatus: string) => {
    updateCampanhaStatusMutation.mutate({
      id: campanha.id,
      status: newStatus,
    });
  };

  const handleDeleteCampanha = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja remover a campanha "${nome}"?`)) {
      deleteCampanhaMutation.mutate(id);
    }
  };

  const handleViewCampanha = (campanha: Campanha) => {
    setViewingCampanha(campanha);
    setViewDialogOpen(true);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  if (isLoading) {
    return <LoadingState message="Carregando campanhas..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Erro ao carregar campanhas"
        message="Não foi possível carregar a lista de campanhas"
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['campanhas'] })}
      />
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
                        <SelectItem value="EMAIL">Email Marketing</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                        <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                        <SelectItem value="SEQUENCE">Sequência Automática</SelectItem>
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
        <StatsGrid 
          cards={[
            {
              title: 'Total de Campanhas',
              value: stats.totalCampanhas,
              icon: Megaphone,
              description: `${stats.campanhasAtivas} ativas`,
            },
            {
              title: 'Total Enviados',
              value: formatNumber(stats.totalEnviados),
              icon: Send,
              description: 'Mensagens enviadas',
            },
            {
              title: 'Taxa de Entrega',
              value: formatPercentage(stats.taxaEntregaGeral),
              icon: Target,
              variant: stats.taxaEntregaGeral >= 95 ? 'success' : 'warning',
            },
            {
              title: 'Taxa de Abertura',
              value: formatPercentage(stats.taxaAberturaGeral),
              icon: TrendingUp,
              variant: stats.taxaAberturaGeral >= 20 ? 'success' : 'warning',
            },
          ]}
        />
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="DRAFT">Rascunho</SelectItem>
                <SelectItem value="ACTIVE">Ativa</SelectItem>
                <SelectItem value="PAUSED">Pausada</SelectItem>
                <SelectItem value="COMPLETED">Concluída</SelectItem>
                <SelectItem value="CANCELLED">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="EMAIL">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="LINKEDIN">LinkedIn</SelectItem>
                <SelectItem value="SEQUENCE">Sequência</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campanhasData?.items?.map((campanha) => {
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
                        <span className="text-sm">{campanha.tipo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={statusColors[campanha.status]}
                      >
                        {statusLabels[campanha.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Send className="h-3 w-3" />
                          <span>{formatNumber(campanha.metricas.totalEnviados)} enviados</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{formatPercentage(campanha.metricas.taxaAbertura)} abertura</span>
                        </div>
                        <Progress 
                          value={campanha.metricas.taxaAbertura} 
                          className="h-1 w-16" 
                        />
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
                          
                          {campanha.status === 'DRAFT' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(campanha, 'ACTIVE')}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Ativar
                            </DropdownMenuItem>
                          )}
                          
                          {campanha.status === 'ACTIVE' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(campanha, 'PAUSED')}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pausar
                            </DropdownMenuItem>
                          )}
                          
                          {campanha.status === 'PAUSED' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(campanha, 'ACTIVE')}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Retomar
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem onClick={() => setEditingCampanha(campanha)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCampanha(campanha.id, campanha.nome)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {(!campanhasData?.items || campanhasData.items.length === 0) && (
            <EmptyState
              icon={Megaphone}
              title="Nenhuma campanha encontrada"
              description={
                searchTerm || statusFilter || tipoFilter
                  ? 'Tente ajustar os filtros para encontrar campanhas.'
                  : 'Comece criando sua primeira campanha de marketing.'
              }
              action={{
                label: 'Nova Campanha',
                onClick: () => setCreateDialogOpen(true)
              }}
            />
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
                    <span className="text-sm">{viewingCampanha.tipo}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[viewingCampanha.status]}>
                      {statusLabels[viewingCampanha.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Métricas</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(viewingCampanha.metricas.totalEnviados)}
                    </div>
                    <div className="text-xs text-muted-foreground">Enviados</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(viewingCampanha.metricas.taxaEntrega)}
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa Entrega</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatPercentage(viewingCampanha.metricas.taxaAbertura)}
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa Abertura</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPercentage(viewingCampanha.metricas.taxaClique)}
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa Clique</div>
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
    </div>
  );
}