import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Play, 
  Square, 
  Plus, 
  RotateCcw, 
  Map, 
  Clock, 
  Target, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Settings,
  Download,
  Filter
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/hooks/use-toast';
import { apiClient } from '@/shared/services/client';
import type { 
  ScrapingJob, 
  CreateScrapingJob, 
  ScrapingTemplate, 
  ScrapingStats,
  WorkerStatus 
} from '@/shared/services/schemas';

// Componente para estatísticas do scraping
function ScrapingStatsCards({ stats, workerStatus }: { 
  stats?: ScrapingStats; 
  workerStatus?: WorkerStatus;
}) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Worker Status</CardTitle>
          {workerStatus?.isRunning ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {workerStatus?.isRunning ? 'Ativo' : 'Parado'}
          </div>
          <p className="text-xs text-muted-foreground">
            {workerStatus?.isRunning 
              ? `${workerStatus.processedJobs || 0} jobs processados`
              : 'Worker não está executando'
            }
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jobs Ativos</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.jobsAtivos}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalJobs} jobs totais
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Coletados</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLeadsColetados.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.leadsHoje} hoje
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(stats.taxaSucesso * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.tempoMedioExecucao.toFixed(1)} min médio
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente do formulário de job
function ScrapingJobForm({ 
  templates,
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: {
  templates?: ScrapingTemplate[];
  onSubmit: (data: CreateScrapingJob) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<CreateScrapingJob>({
    termo: '',
    localizacao: '',
    limite: 50,
    prioridade: 'normal',
    filtros: {
      verificado: false,
      comTelefone: true,
      avaliacaoMinima: undefined,
      aberto: false,
    },
  });

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setFormData({
        termo: template.parametrosBase.termo,
        localizacao: template.parametrosBase.localizacao,
        limite: template.parametrosBase.limite,
        prioridade: template.parametrosBase.prioridade,
        filtros: { ...template.parametrosBase.filtros },
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {templates && templates.length > 0 && (
        <div className="space-y-2">
          <Label>Template (opcional)</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.nome} - {template.segmento}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="termo">Termo de Busca</Label>
        <Input
          id="termo"
          value={formData.termo}
          onChange={(e) => setFormData(prev => ({ ...prev, termo: e.target.value }))}
          placeholder="Ex: restaurantes, clínicas dentárias..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="localizacao">Localização</Label>
        <Input
          id="localizacao"
          value={formData.localizacao}
          onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
          placeholder="Ex: São Paulo, SP"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="limite">Limite de Leads</Label>
          <Input
            id="limite"
            type="number"
            min="1"
            max="1000"
            value={formData.limite}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              limite: parseInt(e.target.value) || 50 
            }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select 
            value={formData.prioridade} 
            onValueChange={(value: 'low' | 'normal' | 'high') => 
              setFormData(prev => ({ ...prev, prioridade: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Filtros</Label>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="verificado"
              checked={formData.filtros?.verificado || false}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  filtros: { ...prev.filtros, verificado: checked }
                }))
              }
            />
            <Label htmlFor="verificado">Apenas estabelecimentos verificados</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="comTelefone"
              checked={formData.filtros?.comTelefone || false}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  filtros: { ...prev.filtros, comTelefone: checked }
                }))
              }
            />
            <Label htmlFor="comTelefone">Apenas com telefone</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="aberto"
              checked={formData.filtros?.aberto || false}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  filtros: { ...prev.filtros, aberto: checked }
                }))
              }
            />
            <Label htmlFor="aberto">Apenas estabelecimentos abertos</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avaliacaoMinima">Avaliação mínima (1-5)</Label>
            <Input
              id="avaliacaoMinima"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.filtros?.avaliacaoMinima || ''}
              onChange={(e) => 
                setFormData(prev => ({
                  ...prev,
                  filtros: { 
                    ...prev.filtros, 
                    avaliacaoMinima: e.target.value ? parseFloat(e.target.value) : undefined 
                  }
                }))
              }
              placeholder="Ex: 4.0"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando Job...' : 'Criar Job'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function ScrapingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: workerStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['scraping', 'status'],
    queryFn: () => apiClient.getScrapingStatus(),
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  const { data: stats } = useQuery({
    queryKey: ['scraping', 'stats'],
    queryFn: () => apiClient.getScrapingStats(),
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['scraping', 'jobs', { page, status: statusFilter }],
    queryFn: () => apiClient.getScrapingJobs({
      page,
      limit: 20,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }),
    refetchInterval: 3000, // Atualizar a cada 3 segundos para jobs ativos
  });

  const { data: templates } = useQuery({
    queryKey: ['scraping', 'templates'],
    queryFn: () => apiClient.getScrapingTemplates(),
  });

  // Mutations
  const startWorkerMutation = useMutation({
    mutationFn: () => apiClient.startScraping(),
    onSuccess: () => {
      toast({
        title: 'Worker iniciado',
        description: 'O worker de scraping foi iniciado com sucesso.',
      });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao iniciar worker',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const stopWorkerMutation = useMutation({
    mutationFn: () => apiClient.stopScraping(),
    onSuccess: () => {
      toast({
        title: 'Worker parado',
        description: 'O worker de scraping foi parado com sucesso.',
      });
      refetchStatus();
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao parar worker',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: (data: CreateScrapingJob) => apiClient.createScrapingJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scraping', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['scraping', 'stats'] });
      toast({
        title: 'Job criado',
        description: 'O job de scraping foi adicionado à fila.',
      });
      setIsJobDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar job',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <Square className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { variant: 'secondary' as const, label: 'Pendente' },
      running: { variant: 'default' as const, label: 'Executando' },
      completed: { variant: 'outline' as const, label: 'Concluído' },
      failed: { variant: 'destructive' as const, label: 'Falhou' },
      cancelled: { variant: 'secondary' as const, label: 'Cancelado' },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || 
                      { variant: 'secondary' as const, label: status };
    
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Maps Scraping</h1>
          <p className="text-muted-foreground">
            Gerencie jobs de coleta automática de leads do Google Maps
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {workerStatus?.isRunning ? (
            <Button 
              variant="outline" 
              onClick={() => stopWorkerMutation.mutate()}
              disabled={stopWorkerMutation.isPending}
            >
              <Square className="mr-2 h-4 w-4" />
              Parar Worker
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => startWorkerMutation.mutate()}
              disabled={startWorkerMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Iniciar Worker
            </Button>
          )}
          
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Job de Scraping</DialogTitle>
              </DialogHeader>
              <ScrapingJobForm
                templates={templates}
                onSubmit={createJobMutation.mutate}
                onCancel={() => setIsJobDialogOpen(false)}
                isSubmitting={createJobMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <ScrapingStatsCards stats={stats} workerStatus={workerStatus} />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="running">Executando</SelectItem>
                <SelectItem value="completed">Concluídos</SelectItem>
                <SelectItem value="failed">Falharam</SelectItem>
                <SelectItem value="cancelled">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['scraping'] })}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Jobs */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead>Finalizado</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingJobs ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-48 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-28 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-28 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : jobs?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum job de scraping encontrado
                  </TableCell>
                </TableRow>
              ) : (
                jobs?.items.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          {job.parametros.termo}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {job.parametros.localizacao} • Limite: {job.parametros.limite}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        {getStatusBadge(job.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.status === 'running' ? (
                        <div className="space-y-1">
                          <Progress value={job.progresso} className="w-[60px]" />
                          <span className="text-xs text-muted-foreground">{job.progresso}%</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {job.status === 'completed' ? '100%' : '-'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{job.leadsEncontrados}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(job.criadoEm)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(job.finalizadoEm)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Detalhes
                          </DropdownMenuItem>
                          {job.status === 'completed' && job.leadsEncontrados > 0 && (
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Baixar Leads
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginação */}
      {jobs && jobs.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {jobs.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= jobs.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}