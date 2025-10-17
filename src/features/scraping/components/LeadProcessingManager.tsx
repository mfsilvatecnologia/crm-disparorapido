import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Play,
  FileBarChart,
  Unlock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useToast } from '@/shared/hooks/use-toast';
import { apiClient } from '@/shared/services/client';

interface LeadProcessingManagerProps {
  empresaId: string;
}

export default function LeadProcessingManager({ empresaId }: LeadProcessingManagerProps) {
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isStuckDialogOpen, setIsStuckDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const [batchSize, setBatchSize] = useState(100);
  const [maxConcurrency, setMaxConcurrency] = useState(3);
  const [reportDays, setReportDays] = useState(30);
  const [stuckMinutes, setStuckMinutes] = useState(30);
  const [resetMinutes, setResetMinutes] = useState(30);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para obter o status do processamento
  const { data: statusData, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['lead-processing', 'status', empresaId],
    queryFn: () => apiClient.getLeadProcessingStatus(empresaId),
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Mutation para iniciar processamento
  const startProcessingMutation = useMutation({
    mutationFn: () => apiClient.startLeadProcessing({
      batchSize,
      maxConcurrency,
    }),
    onSuccess: (data) => {
      toast({
        title: 'Processamento iniciado',
        description: data.message || `Job ${data.data.jobId} iniciado com sucesso.`,
      });
      setIsStartDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lead-processing', 'status'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao iniciar processamento',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  // Query para obter relatório
  const { data: reportData, isLoading: isLoadingReport, refetch: refetchReport } = useQuery({
    queryKey: ['lead-processing', 'report', empresaId, reportDays],
    queryFn: () => apiClient.getLeadProcessingReport(empresaId, reportDays),
    enabled: isReportDialogOpen,
  });

  // Query para obter leads travados
  const { data: stuckLeadsData, isLoading: isLoadingStuck, refetch: refetchStuck } = useQuery({
    queryKey: ['lead-processing', 'stuck', empresaId, stuckMinutes],
    queryFn: () => apiClient.getStuckLeads(empresaId, stuckMinutes),
    enabled: isStuckDialogOpen,
  });

  // Mutation para resetar leads travados
  const resetStuckMutation = useMutation({
    mutationFn: () => apiClient.resetStuckLeads(resetMinutes),
    onSuccess: (data) => {
      toast({
        title: 'Leads resetados',
        description: `${data.data.leadsResetados} leads foram resetados com sucesso.`,
      });
      setIsResetDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['lead-processing'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao resetar leads',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const status = statusData?.data;
  const report = reportData?.data;
  const stuckLeads = stuckLeadsData?.data || [];

  const getProgressPercentage = () => {
    if (!status || status.totalLeads === 0) return 0;
    return Math.round((status.processedLeads / status.totalLeads) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Processamento de Leads</CardTitle>
        <CardDescription>
          Controle o processamento, visualize relatórios e desbloqueie leads travados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {isLoadingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : status?.isRunning ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-gray-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status?.isRunning ? 'Em Execução' : 'Parado'}
              </div>
              <p className="text-xs text-muted-foreground">
                {status?.isRunning ? `${getProgressPercentage()}% concluído` : 'Nenhum processamento ativo'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status?.totalLeads || 0}</div>
              <p className="text-xs text-muted-foreground">
                Leads no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status?.processedLeads || 0}</div>
              <p className="text-xs text-muted-foreground">
                {status?.pendingLeads || 0} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Erros</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status?.errorLeads || 0}</div>
              <p className="text-xs text-muted-foreground">
                Leads com erro
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {/* Iniciar Processamento */}
          <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Iniciar Processamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Iniciar Processamento de Leads</DialogTitle>
                <DialogDescription>
                  Configure os parâmetros do processamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchSize">Tamanho do Lote (1-1000)</Label>
                  <Input
                    id="batchSize"
                    type="number"
                    min="1"
                    max="1000"
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value) || 100)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrency">Máximo de Processamentos Simultâneos (1-10)</Label>
                  <Input
                    id="maxConcurrency"
                    type="number"
                    min="1"
                    max="10"
                    value={maxConcurrency}
                    onChange={(e) => setMaxConcurrency(parseInt(e.target.value) || 3)}
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => startProcessingMutation.mutate()}
                    disabled={startProcessingMutation.isPending}
                  >
                    {startProcessingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Relatório */}
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileBarChart className="mr-2 h-4 w-4" />
                Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Relatório de Processamento</DialogTitle>
                <DialogDescription>
                  Visualize estatísticas detalhadas do processamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportDays">Período em Dias (1-365)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="reportDays"
                      type="number"
                      min="1"
                      max="365"
                      value={reportDays}
                      onChange={(e) => setReportDays(parseInt(e.target.value) || 30)}
                    />
                    <Button onClick={() => refetchReport()}>
                      Atualizar
                    </Button>
                  </div>
                </div>

                {isLoadingReport ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : report ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-sm text-muted-foreground">Período</Label>
                        <p className="text-sm font-medium">
                          {report.periodo?.inicio && formatDate(report.periodo.inicio)} - {report.periodo?.fim && formatDate(report.periodo.fim)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Processados</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {report.estatisticas?.totalProcessados || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Sucessos</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {report.estatisticas?.sucessos || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Erros</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {report.estatisticas?.erros || 0}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Tempo Médio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {report.estatisticas?.tempoMedioProcessamento?.toFixed(2) || '0.00'}s
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum dado disponível
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Leads Travados */}
          <Dialog open={isStuckDialogOpen} onOpenChange={setIsStuckDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Leads Travados
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Leads Travados</DialogTitle>
                <DialogDescription>
                  Visualize leads que estão travados no processamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stuckMinutes">Minutos Mínimos Travado (5-1440)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="stuckMinutes"
                      type="number"
                      min="5"
                      max="1440"
                      value={stuckMinutes}
                      onChange={(e) => setStuckMinutes(parseInt(e.target.value) || 30)}
                    />
                    <Button onClick={() => refetchStuck()}>
                      Atualizar
                    </Button>
                  </div>
                </div>

                {isLoadingStuck ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : stuckLeads.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tempo Travado</TableHead>
                          <TableHead>Última Atualização</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stuckLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.nome}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{lead.status}</Badge>
                            </TableCell>
                            <TableCell>{lead.tempoTravado} min</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(lead.ultimaAtualizacao)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum lead travado encontrado
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Resetar Leads Travados */}
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Unlock className="mr-2 h-4 w-4" />
                Destravar Leads
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resetar Leads Travados</DialogTitle>
                <DialogDescription>
                  Resetar o status de leads que estão travados no processamento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetMinutes">Minutos Mínimos Travado (5-1440)</Label>
                  <Input
                    id="resetMinutes"
                    type="number"
                    min="5"
                    max="1440"
                    value={resetMinutes}
                    onChange={(e) => setResetMinutes(parseInt(e.target.value) || 30)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leads travados por mais de {resetMinutes} minutos serão resetados
                  </p>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => resetStuckMutation.mutate()}
                    disabled={resetStuckMutation.isPending}
                    variant="destructive"
                  >
                    {resetStuckMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetando...
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Resetar
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
