import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { Clock, Target, CheckCircle, AlertCircle } from 'lucide-react';
import { ScrapingJob } from '../types/scraping';

interface ProgressMonitorProps {
  job: ScrapingJob;
  className?: string;
}

export const ProgressMonitor: React.FC<ProgressMonitorProps> = ({ job, className }) => {
  const getStatusColor = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'running':
        return <Target className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Calcular progresso baseado na estrutura correta do ScrapingJob
  const progressPercentage = job.progresso?.totalEstimado > 0
    ? job.progresso.percentualCompleto
    : 0;
  
  const successRate = job.progresso?.processados > 0
    ? Math.round((job.progresso.sucessos / job.progresso.processados) * 100)
    : 0;

  const errorRate = job.progresso?.processados > 0
    ? Math.round((job.progresso.erros / job.progresso.processados) * 100)
    : 0

  // Calcular tempo decorrido se disponível
  const elapsedTime = job.dataInicio 
    ? Math.floor((Date.now() - new Date(job.dataInicio).getTime()) / 1000)
    : 0;

  // Calcular velocidade de processamento
  const processingRate = elapsedTime > 60 && job.progresso?.processados
    ? Math.round((job.progresso.processados) / (elapsedTime / 60))
    : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Monitor de Progresso</CardTitle>
          <Badge className={getStatusColor(job.status)}>
            {getStatusIcon(job.status)}
            <span className="ml-1 capitalize">{job.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso Geral</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{job.progresso?.processados || 0} de {job.progresso?.totalEstimado || 0} termos</span>
            <span>{(job.progresso?.totalEstimado || 0) - (job.progresso?.processados || 0)} restantes</span>
          </div>
          {job.progresso?.etapaAtual && (
            <div className="text-xs text-muted-foreground">
              Etapa atual: {job.progresso.etapaAtual}
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Sucessos</p>
            <p className="text-2xl font-bold text-green-600">{job.progresso?.sucessos || 0}</p>
            <p className="text-xs text-muted-foreground">Taxa: {successRate}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Erros</p>
            <p className="text-2xl font-bold text-red-600">{job.progresso?.erros || 0}</p>
            <p className="text-xs text-muted-foreground">
              Taxa: {errorRate}%
            </p>
          </div>
        </div>

        {/* Resultados */}
        {job.resultados && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-medium">Resultados</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Leads Encontrados:</span>
                <span className="ml-2 font-medium">{job.resultados.leadsEncontrados}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Leads Novos:</span>
                <span className="ml-2 font-medium text-green-600">{job.resultados.leadsNovos}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Empresas:</span>
                <span className="ml-2 font-medium">{job.resultados.empresasEncontradas}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Empresas Novas:</span>
                <span className="ml-2 font-medium text-blue-600">{job.resultados.empresasNovas}</span>
              </div>
            </div>
          </div>
        )}

        {/* Timing Information */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tempo Decorrido:</span>
            <span className="font-medium">
              {elapsedTime > 0 ? formatTime(elapsedTime) : '-'}
            </span>
          </div>

          {job.tempoEstimado && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tempo Estimado:</span>
              <span className="font-medium">
                {job.tempoEstimado} min
              </span>
            </div>
          )}

          {processingRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Velocidade:</span>
              <span className="font-medium">
                {processingRate} termos/min
              </span>
            </div>
          )}
        </div>

        {/* Parametros do Job */}
        {job.parametros && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Parâmetros</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Termo:</span>
                <span className="font-medium">{job.parametros.termo}</span>
              </div>
              {job.parametros.localizacao && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Localização:</span>
                  <span className="font-medium">{job.parametros.localizacao}</span>
                </div>
              )}
              {job.parametros.maxResultados && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Resultados:</span>
                  <span className="font-medium">{job.parametros.maxResultados}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Information */}
        {job.erros && job.erros.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm text-red-600 font-medium">Últimos Erros:</p>
            <div className="max-h-24 overflow-y-auto">
              {job.erros.slice(-3).map((erro, index) => (
                <div key={index} className="text-xs text-muted-foreground bg-red-50 p-2 rounded mb-2">
                  <div className="font-medium text-red-600">
                    {new Date(erro.timestamp).toLocaleTimeString()}
                  </div>
                  <div>{erro.mensagem}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressMonitor;