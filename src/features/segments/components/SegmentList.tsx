import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Loader2, Search, Filter, Plus, RefreshCw } from 'lucide-react';
import { SegmentCard } from './SegmentCard';
import { useSegments, useRefreshSegmentCount, useDeleteSegment } from '../hooks/useSegments';
import { Segment, SegmentFilter } from '../types/segments';

interface SegmentListProps {
  onCreateSegment?: () => void;
  onEditSegment?: (segment: Segment) => void;
  onDuplicateSegment?: (segment: Segment) => void;
  onViewSegmentLeads?: (segment: Segment) => void;
  onViewSegmentAnalytics?: (segment: Segment) => void;
  onExportSegment?: (segment: Segment) => void;
  className?: string;
}

export const SegmentList: React.FC<SegmentListProps> = ({
  onCreateSegment,
  onEditSegment,
  onDuplicateSegment,
  onViewSegmentLeads,
  onViewSegmentAnalytics,
  onExportSegment,
  className
}) => {
  const [filtros, setFiltros] = useState<SegmentFilter>({
    busca: '',
    tipo: undefined,
    ativo: undefined,
    ordenacao: 'nome',
    direcao: 'asc'
  });

  const [filtrosAplicados, setFiltrosAplicados] = useState<SegmentFilter>(filtros);

  const { data: segments, isLoading, error, refetch } = useSegments(filtrosAplicados);
  const refreshCountMutation = useRefreshSegmentCount();
  const deleteMutation = useDeleteSegment();

  const aplicarFiltros = () => {
    setFiltrosAplicados({ ...filtros });
  };

  const limparFiltros = () => {
    const filtrosLimpos: SegmentFilter = {
      busca: '',
      tipo: undefined,
      ativo: undefined,
      ordenacao: 'nome',
      direcao: 'asc'
    };
    setFiltros(filtrosLimpos);
    setFiltrosAplicados(filtrosLimpos);
  };

  const handleRefreshCount = (segment: Segment) => {
    refreshCountMutation.mutate(segment.id);
  };

  const handleDeleteSegment = (segment: Segment) => {
    if (window.confirm(`Tem certeza que deseja excluir o segmento "${segment.nome}"?`)) {
      deleteMutation.mutate(segment.id);
    }
  };

  const getTotalLeads = () => {
    return segments?.reduce((total, segment) => total + segment.contadorLeads, 0) || 0;
  };

  const getSegmentsByType = () => {
    if (!segments) return {};

    return segments.reduce((acc, segment) => {
      if (!acc[segment.tipo]) acc[segment.tipo] = 0;
      acc[segment.tipo]++;
      return acc;
    }, {} as Record<string, number>);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            Erro ao carregar segmentos: {error.message}
            <br />
            <Button onClick={() => refetch()} variant="outline" className="mt-2">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Segmentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{segments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Segmentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {segments?.filter(s => s.ativo).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalLeads().toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tipos Diferentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(getSegmentsByType()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              {onCreateSegment && (
                <Button onClick={onCreateSegment} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Segmento
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Buscar segmentos..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="w-full"
              />
            </div>

            <Select
              value={filtros.tipo || ''}
              onValueChange={(value: string) =>
                setFiltros(prev => ({
                  ...prev,
                  tipo: value ? value as Segment['tipo'] : undefined
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="demografico">Demográfico</SelectItem>
                <SelectItem value="comportamental">Comportamental</SelectItem>
                <SelectItem value="geografico">Geográfico</SelectItem>
                <SelectItem value="psicografico">Psicográfico</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filtros.ativo?.toString() || ''}
              onValueChange={(value: string) =>
                setFiltros(prev => ({
                  ...prev,
                  ativo: value ? value === 'true' : undefined
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={aplicarFiltros} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button onClick={limparFiltros} variant="outline" size="sm">
                Limpar
              </Button>
            </div>
          </div>

          {/* Filtros ativos */}
          {(filtrosAplicados.busca || filtrosAplicados.tipo || filtrosAplicados.ativo !== undefined) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filtrosAplicados.busca && (
                <Badge variant="secondary">
                  Busca: {filtrosAplicados.busca}
                </Badge>
              )}
              {filtrosAplicados.tipo && (
                <Badge variant="secondary">
                  Tipo: {filtrosAplicados.tipo}
                </Badge>
              )}
              {filtrosAplicados.ativo !== undefined && (
                <Badge variant="secondary">
                  Status: {filtrosAplicados.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Segmentos */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando segmentos...</span>
          </div>
        ) : segments?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum segmento encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  {filtrosAplicados.busca || filtrosAplicados.tipo || filtrosAplicados.ativo !== undefined
                    ? 'Tente ajustar os filtros para encontrar segmentos.'
                    : 'Comece criando seu primeiro segmento para organizar seus leads.'
                  }
                </p>
                {onCreateSegment && (
                  <Button onClick={onCreateSegment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Segmento
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map((segment) => (
              <SegmentCard
                key={segment.id}
                segment={segment}
                onEdit={onEditSegment}
                onDuplicate={onDuplicateSegment}
                onDelete={handleDeleteSegment}
                onRefresh={handleRefreshCount}
                onExport={onExportSegment}
                onViewLeads={onViewSegmentLeads}
                onViewAnalytics={onViewSegmentAnalytics}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};