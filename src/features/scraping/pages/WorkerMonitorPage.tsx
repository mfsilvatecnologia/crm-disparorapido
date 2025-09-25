import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Progress } from '@/shared/components/ui/progress';
import {
  Play,
  Square,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Zap,
  Users,
  Database,
  RefreshCw
} from 'lucide-react';
import { useWorkerMonitor } from '../hooks/useWorkerMonitor';

const WorkerMonitorPage: React.FC = () => {
  const {
    workers,
    jobs,
    isConnected,
    isLoading,
    error,
    startMonitoring,
    stopMonitoring,
    clearData
  } = useWorkerMonitor();

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Iniciar monitoramento automaticamente quando conectado
  useEffect(() => {
    if (isConnected && !isMonitoring) {
      const cleanup = startMonitoring();
      setIsMonitoring(true);

      return cleanup;
    }
  }, [isConnected, isMonitoring, startMonitoring]);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
      setIsMonitoring(false);
    } else {
      const cleanup = startMonitoring();
      setIsMonitoring(true);
      return cleanup;
    }
  };

  const getWorkerStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Square className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getJobStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'running':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Conectando ao sistema de monitoramento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monitoramento de Workers</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe o status dos workers e progresso dos jobs em tempo real
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          <Button
            onClick={handleToggleMonitoring}
            variant={isMonitoring ? 'destructive' : 'default'}
            size="sm"
          >
            {isMonitoring ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Parar Monitoramento
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Monitoramento
              </>
            )}
          </Button>

          <Button onClick={clearData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpar Dados
          </Button>
        </div>
      </div>

      {/* Workers Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(workers).map(([workerId, worker]) => (
          <Card key={workerId} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getWorkerStatusIcon(worker.status)}
                  {worker.workerId}
                </CardTitle>
                <Badge className={getWorkerStatusColor(worker.status)}>
                  {worker.status}
                </Badge>
              </div>
              <CardDescription>
                Tipo: {worker.workerType.replace('_', ' ').toUpperCase()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status Principal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <div className="flex items-center gap-2">
                  {worker.isRunning ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-sm font-medium">
                    {worker.isRunning ? 'Executando' : 'Parado'}
                  </span>
                </div>
              </div>

              {/* Contadores de Erro */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Erros:</span>
                  <span className="text-sm font-medium">
                    {worker.errorCount}/{worker.maxErrors}
                  </span>
                </div>
                <Progress
                  value={(worker.errorCount / worker.maxErrors) * 100}
                  className="h-2"
                />
              </div>

              {/* Contadores específicos */}
              {worker.workerType === 'message_consumer' && worker.consumerCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Consumidores:
                  </span>
                  <span className="text-sm font-medium">{worker.consumerCount}</span>
                </div>
              )}

              {/* Último processamento */}
              {worker.lastProcessedTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Último processamento:
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(worker.lastProcessedTime).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {/* Timestamp */}
              <div className="pt-2 border-t">
                <span className="text-xs text-gray-500">
                  Atualizado: {new Date(worker.timestamp).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Card vazio quando não há workers */}
        {Object.keys(workers).length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum worker ativo
              </h3>
              <p className="text-gray-600 text-center">
                Os workers aparecerão aqui quando estiverem em execução.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Jobs Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Jobs de Scraping Recentes
          </CardTitle>
          <CardDescription>
            Últimas atualizações dos jobs de coleta de dados
          </CardDescription>
        </CardHeader>

        <CardContent>
          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum job executado recentemente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 10).map((job, index) => (
                <div
                  key={`${job.jobId}-${job.timestamp}-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">Job {job.jobId}</span>
                      <Badge className={getJobStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Encontrados:</span> {job.leadsEncontrados}
                      </div>
                      <div>
                        <span className="font-medium">Inseridos:</span> {job.leadsInseridos}
                      </div>
                      <div>
                        <span className="font-medium">Páginas:</span> {job.paginasProcessadas}
                      </div>
                      {job.tempoExecucaoMs && (
                        <div>
                          <span className="font-medium">Tempo:</span> {(job.tempoExecucaoMs / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>

                    {job.erroDetalhes && (
                      <div className="mt-2 text-sm text-red-600">
                        <strong>Erro:</strong> {job.erroDetalhes}
                      </div>
                    )}
                  </div>

                  <div className="text-right text-xs text-gray-500">
                    {new Date(job.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerMonitorPage;
