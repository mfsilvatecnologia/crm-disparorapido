import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PieChart,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Progress } from '@/shared/components/ui/progress';
import { LoadingState } from '@/shared/components/common/LoadingState';
import { ErrorState } from '@/shared/components/common/ErrorState';
import { EmptyState } from '@/shared/components/common/EmptyState';
import { useToast } from '@/shared/hooks/use-toast';
import { apiClient } from '@/shared/services/client';
import type { Segment, SegmentStats } from '@/shared/services/schemas';

export default function SegmentosPage() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState('30d');
  const [sortBy, setSortBy] = useState('totalEmpresas');

  // Fetch segments
  const { data: segments, isLoading: segmentsLoading, error: segmentsError } = useQuery({
    queryKey: ['segments', timeRange],
    queryFn: () => apiClient.getSegments({ timeRange }),
  });

  // Fetch segment stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['segments', 'stats', timeRange],
    queryFn: () => apiClient.getSegmentStats({ timeRange }),
  });

  const isLoading = segmentsLoading || statsLoading;

  if (isLoading) {
    return <LoadingState message="Carregando análise de segmentos..." />;
  }

  if (segmentsError) {
    return (
      <ErrorState 
        title="Erro ao carregar segmentos"
        message="Não foi possível carregar a análise de segmentos"
      />
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const sortedSegments = segments ? [...segments].sort((a, b) => {
    switch (sortBy) {
      case 'totalEmpresas':
        return b.totalEmpresas - a.totalEmpresas;
      case 'taxaConversao':
        return b.taxaConversao - a.taxaConversao;
      case 'crescimentoMensal':
        return (b.crescimentoMensal || 0) - (a.crescimentoMensal || 0);
      case 'valorMedio':
        return (b.valorMedio || 0) - (a.valorMedio || 0);
      default:
        return 0;
    }
  }) : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Análise por Segmentos
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho por segmento de mercado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Segmentos</p>
                  <p className="text-2xl font-bold">{stats.totalSegmentos}</p>
                </div>
                <PieChart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Empresas Segmentadas</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.totalEmpresasSegmentadas)}</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa Conversão Geral</p>
                  <p className="text-2xl font-bold">{formatPercentage(stats.taxaConversaoGeral)}</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.faturamentoTotal)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Segmento Mais Lucrativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {stats.segmentoMaisLucrativo || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Maior Crescimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {stats.segmentoMaisCrescimento || 'N/A'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="segments" className="w-full">
        <TabsList>
          <TabsTrigger value="segments">Desempenho por Segmento</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="segments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros e Ordenação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ordenar por:</span>
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totalEmpresas">Total de Empresas</SelectItem>
                    <SelectItem value="taxaConversao">Taxa de Conversão</SelectItem>
                    <SelectItem value="crescimentoMensal">Crescimento Mensal</SelectItem>
                    <SelectItem value="valorMedio">Valor Médio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Segments List */}
          <div className="grid grid-cols-1 gap-4">
            {sortedSegments.map((segment) => (
              <Card key={segment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{segment.nome}</CardTitle>
                      {segment.descricao && (
                        <CardDescription>{segment.descricao}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {segment.crescimentoMensal !== undefined && (
                        <Badge 
                          variant={segment.crescimentoMensal >= 0 ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {segment.crescimentoMensal >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {formatPercentage(Math.abs(segment.crescimentoMensal))}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Empresas</p>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{formatNumber(segment.totalEmpresas)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {segment.empresasAtivas} ativas
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Leads</p>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{formatNumber(segment.totalLeads)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {segment.leadsQualificados} qualificados
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-orange-500" />
                        <span className="font-semibold">{formatPercentage(segment.taxaConversao)}</span>
                      </div>
                      <Progress value={segment.taxaConversao} className="h-1 mt-1" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Valor Médio</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-500" />
                        <span className="font-semibold">
                          {segment.valorMedio ? formatCurrency(segment.valorMedio) : 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {segment.oportunidadesAbertas} oportunidades
                      </div>
                    </div>
                  </div>

                  {/* Performance Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Performance Geral</span>
                      <span className="font-medium">
                        {Math.round((segment.taxaConversao + (segment.crescimentoMensal || 0) + 10) / 3)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.round((segment.taxaConversao + (segment.crescimentoMensal || 0) + 10) / 3)} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!segments || segments.length === 0) && (
            <EmptyState
              icon={BarChart3}
              title="Nenhum segmento encontrado"
              description="Os dados de segmentos aparecerão aqui conforme as empresas forem categorizadas."
            />
          )}
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Segmento</CardTitle>
              <CardDescription>
                Visualize como suas empresas e leads estão distribuídos entre os segmentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.distribuicaoPorSegmento ? (
                <div className="space-y-4">
                  {stats.distribuicaoPorSegmento.map((item, index) => (
                    <div key={item.segmento} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.segmento}</span>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatNumber(item.empresas)} empresas</span>
                          <span>{formatNumber(item.leads)} leads</span>
                          <span className="font-medium">{formatPercentage(item.percentual)}</span>
                        </div>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={PieChart}
                  title="Dados de distribuição não disponíveis"
                  description="Os dados de distribuição aparecerão conforme mais dados forem coletados."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}