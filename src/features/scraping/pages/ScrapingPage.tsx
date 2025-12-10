import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  Square,
  Plus,
  Map,
  Clock,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Loader2,
  Download,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { useToast } from '@/shared/hooks/use-toast';
import { apiClient } from '@/shared/services/client';
import type {
  ScrapingJob,
  CreateScrapingJob,
  ScrapingTemplate,
  WorkerStatus
} from '@/shared/services/schemas';

// Worker Status Indicator (discreto no canto)
function WorkerStatusBadge({ status }: { status?: WorkerStatus }) {
  if (!status) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        {status.isRunning ? (
          <>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-700">Worker Ativo</span>
          </>
        ) : (
          <>
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-600">Worker Parado</span>
          </>
        )}
      </div>
      {status.isRunning && status.currentJobs !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {status.currentJobs} em execução
        </Badge>
      )}
    </div>
  );
}

// Formulário Simplificado de Criação de Job
function QuickJobForm({
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState({
    termo_busca: '',
    cidade: '',
    estado: '',
    maxResultados: 20,
    prioridade: 'normal' as 'low' | 'normal' | 'high',
    filtros: {
      apenasVerificados: false,
      apenasComTelefone: true,
      avaliacaoMinima: 0,
    },
  });

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      const localizacaoParts = template.parametrosBase.localizacao.split(',');
      const cidade = localizacaoParts[0]?.trim() || '';
      const estado = localizacaoParts[1]?.trim() || '';

      setFormData({
        termo_busca: template.parametrosBase.termo,
        cidade,
        estado,
        maxResultados: template.parametrosBase.limite,
        prioridade: template.parametrosBase.prioridade,
        filtros: {
          apenasVerificados: template.parametrosBase.filtros?.verificado || false,
          apenasComTelefone: template.parametrosBase.filtros?.comTelefone || true,
          avaliacaoMinima: template.parametrosBase.filtros?.avaliacaoMinima || 0,
        },
      });
      setShowAdvanced(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateScrapingJob = {
      parametros_busca: {
        termo_busca: formData.termo_busca,
        cidade: formData.cidade,
        estado: formData.estado,
        maxResultados: formData.maxResultados,
        filtros: {
          apenasVerificados: formData.filtros.apenasVerificados,
          apenasComTelefone: formData.filtros.apenasComTelefone,
          avaliacaoMinima: formData.filtros.avaliacaoMinima,
        },
      },
      prioridade: formData.prioridade,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campos Essenciais */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="termo_busca" className="text-base">
            O que você está buscando?
          </Label>
          <Input
            id="termo_busca"
            value={formData.termo_busca}
            onChange={(e) => setFormData(prev => ({ ...prev, termo_busca: e.target.value }))}
            placeholder="Ex: restaurantes, clínicas dentárias, academias..."
            className="text-base h-11"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
              placeholder="Ex: Franca"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              placeholder="Ex: SP"
              maxLength={2}
              required
            />
          </div>
        </div>
      </div>

      {/* Opções Avançadas (Collapsible) */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between p-0 h-auto hover:bg-transparent"
          >
            <span className="text-sm font-medium text-muted-foreground">
              Opções avançadas
            </span>
            {showAdvanced ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-4">
          {templates && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolher template..." />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="maxResultados">Máximo de Resultados</Label>
              <Input
                id="maxResultados"
                type="number"
                min="1"
                max="1000"
                value={formData.maxResultados}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxResultados: parseInt(e.target.value) || 20
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

          <div className="space-y-3 pt-2">
            <Label className="text-sm text-muted-foreground">Filtros</Label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="apenasVerificados" className="font-normal cursor-pointer">
                  Apenas estabelecimentos verificados
                </Label>
                <Switch
                  id="apenasVerificados"
                  checked={formData.filtros.apenasVerificados}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      filtros: { ...prev.filtros, apenasVerificados: checked }
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="apenasComTelefone" className="font-normal cursor-pointer">
                  Apenas com telefone
                </Label>
                <Switch
                  id="apenasComTelefone"
                  checked={formData.filtros.apenasComTelefone}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      filtros: { ...prev.filtros, apenasComTelefone: checked }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avaliacaoMinima">Avaliação mínima (0-5)</Label>
                <Input
                  id="avaliacaoMinima"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.filtros.avaliacaoMinima}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      filtros: {
                        ...prev.filtros,
                        avaliacaoMinima: parseFloat(e.target.value) || 0
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Iniciar Busca
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} size="lg">
          Cancelar
        </Button>
      </div>
    </form>
  );
}

// Job Card Component (substituindo linhas da tabela)
function JobCard({ job }: { job: ScrapingJob }) {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        label: 'Pendente',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        iconColor: 'text-yellow-600'
      },
      running: {
        icon: Activity,
        label: 'Executando',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600'
      },
      completed: {
        icon: CheckCircle,
        label: 'Concluído',
        color: 'text-green-600 bg-green-50 border-green-200',
        iconColor: 'text-green-600'
      },
      failed: {
        icon: XCircle,
        label: 'Falhou',
        color: 'text-red-600 bg-red-50 border-red-200',
        iconColor: 'text-red-600'
      },
      cancelled: {
        icon: Square,
        label: 'Cancelado',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        iconColor: 'text-gray-600'
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig(job.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`border-l-4 transition-all hover:shadow-md ${statusConfig.color}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Map className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-base truncate">
                {job.parametros.termo}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <MapPin className="h-3.5 w-3.5" />
              <span>{job.parametros.localizacao}</span>
              <span className="text-xs">•</span>
              <span className="text-xs">Limite: {job.parametros.limite}</span>
            </div>

            {/* Progress Bar (apenas para running) */}
            {job.status === 'running' && (
              <div className="space-y-1.5">
                <Progress value={job.progresso} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {job.progresso}% concluído
                </p>
              </div>
            )}

            {/* Results */}
            {job.leadsEncontrados > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="font-normal">
                  {job.leadsEncontrados} leads encontrados
                </Badge>
              </div>
            )}
          </div>

          {/* Right: Status & Actions */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
              <Badge variant="outline" className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>

            {formatDate(job.criadoEm) && (
              <p className="text-xs text-muted-foreground">
                {formatDate(job.criadoEm)}
              </p>
            )}

            {job.status === 'completed' && job.leadsEncontrados > 0 && (
              <Button size="sm" variant="ghost" className="h-8">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Baixar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState({ onCreateJob }: { onCreateJob: () => void }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <Map className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          Nenhuma busca iniciada ainda
        </h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Comece criando sua primeira busca no Google Maps para coletar leads qualificados automaticamente.
        </p>
        <Button size="lg" onClick={onCreateJob}>
          <Plus className="mr-2 h-5 w-5" />
          Criar Primeira Busca
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Page Component
export default function ScrapingPage() {
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: workerStatus } = useQuery({
    queryKey: ['scraping', 'status'],
    queryFn: () => apiClient.getScrapingStatus(),
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ['scraping', 'stats'],
    queryFn: () => apiClient.getScrapingStats(),
    refetchInterval: 10000,
  });

  // Buscar jobs ativos e pendentes
  const { data: activeJobs, isLoading: isLoadingActive } = useQuery({
    queryKey: ['scraping', 'jobs', 'active'],
    queryFn: () => apiClient.getScrapingJobs({
      page: 1,
      limit: 10,
      status: 'running,pending',
    }),
    refetchInterval: 3000,
  });

  // Buscar jobs concluídos (apenas quando expandir histórico)
  const { data: completedJobs, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['scraping', 'jobs', 'completed'],
    queryFn: () => apiClient.getScrapingJobs({
      page: 1,
      limit: 20,
      status: 'completed,failed,cancelled',
    }),
    enabled: showHistory,
    refetchInterval: showHistory ? 10000 : false,
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
      queryClient.invalidateQueries({ queryKey: ['scraping', 'status'] });
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
      queryClient.invalidateQueries({ queryKey: ['scraping', 'status'] });
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
        title: 'Busca criada com sucesso',
        description: 'Seu job foi adicionado à fila e será processado em breve.',
      });
      setIsJobDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar busca',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const activeJobsList = activeJobs?.items || [];
  const completedJobsList = completedJobs?.items || [];
  const hasActiveJobs = activeJobsList.length > 0;
  const hasAnyJobs = hasActiveJobs || (completedJobs?.total || 0) > 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header com Worker Status */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Maps</h1>
          <p className="text-muted-foreground mt-1">
            Colete leads automaticamente do Google Maps
          </p>
        </div>

        <div className="flex items-center gap-3">
          <WorkerStatusBadge status={workerStatus} />

          {workerStatus?.isRunning ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => stopWorkerMutation.mutate()}
              disabled={stopWorkerMutation.isPending}
            >
              <Square className="mr-2 h-4 w-4" />
              Parar Worker
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startWorkerMutation.mutate()}
              disabled={startWorkerMutation.isPending}
            >
              <Play className="mr-2 h-4 w-4" />
              Iniciar Worker
            </Button>
          )}
        </div>
      </div>

      {/* Hero Section - Ação Primária */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Map className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Encontre seus próximos clientes
            </h2>
            <p className="text-muted-foreground mb-6">
              Crie uma nova busca no Google Maps e colete leads qualificados em minutos
            </p>

            <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="h-12 px-8 text-base">
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Busca no Google Maps
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nova Busca no Google Maps</DialogTitle>
                  <DialogDescription>
                    Configure sua busca e colete leads automaticamente
                  </DialogDescription>
                </DialogHeader>
                <QuickJobForm
                  templates={templates}
                  onSubmit={createJobMutation.mutate}
                  onCancel={() => setIsJobDialogOpen(false)}
                  isSubmitting={createJobMutation.isPending}
                />
              </DialogContent>
            </Dialog>

            {/* Quick Stats (inline, minimal) */}
            {stats && hasAnyJobs && (
              <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{stats.totalLeadsColetados.toLocaleString()} leads coletados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>{stats.jobsAtivos} jobs ativos</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Jobs Ativos */}
      {hasActiveJobs && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Jobs em Andamento</h2>
            <Badge variant="secondary">{activeJobsList.length}</Badge>
          </div>

          <div className="grid gap-4">
            {isLoadingActive ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              activeJobsList.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAnyJobs && !isLoadingActive && (
        <EmptyState onCreateJob={() => setIsJobDialogOpen(true)} />
      )}

      {/* Histórico (Collapsible) */}
      {hasAnyJobs && (
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle>Histórico</CardTitle>
                      <CardDescription>
                        {completedJobs?.total || 0} jobs concluídos, falhados ou cancelados
                      </CardDescription>
                    </div>
                  </div>
                  {showHistory ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                {isLoadingCompleted ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : completedJobsList.length > 0 ? (
                  <div className="grid gap-3">
                    {completedJobsList.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum job no histórico
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Estatísticas Detalhadas (Collapsible) */}
      {stats && hasAnyJobs && (
        <Collapsible open={showStats} onOpenChange={setShowStats}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle>Estatísticas</CardTitle>
                      <CardDescription>
                        Métricas detalhadas de performance
                      </CardDescription>
                    </div>
                  </div>
                  {showStats ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total de Jobs</p>
                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Leads Hoje</p>
                    <p className="text-2xl font-bold">{stats.leadsHoje}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold">
                      {(stats.taxaSucesso * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total de Leads</p>
                    <p className="text-2xl font-bold">
                      {stats.totalLeadsColetados.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">
                      {stats.tempoMedioExecucao.toFixed(1)} min
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Jobs Ativos</p>
                    <p className="text-2xl font-bold">{stats.jobsAtivos}</p>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
