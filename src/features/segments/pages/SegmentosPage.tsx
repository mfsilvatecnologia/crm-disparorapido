import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Users, Plus, TrendingUp, Target, Activity, Layers } from 'lucide-react';
import { SegmentList, SegmentBuilder } from '../components';
import { useSegmentStats } from '../hooks/useSegments';
import { Segment } from '../types/segments';

const SegmentosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | undefined>();

  const { data: stats, isLoading: statsLoading } = useSegmentStats();

  const handleCreateSegment = () => {
    setEditingSegment(undefined);
    setShowBuilder(true);
  };

  const handleEditSegment = (segment: Segment) => {
    setEditingSegment(segment);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingSegment(undefined);
  };

  const handleSaveSegment = (segmentData: any) => {
    console.log('Salvando segmento:', segmentData);
    setShowBuilder(false);
    setEditingSegment(undefined);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'demografico':
        return <Users className="h-4 w-4" />;
      case 'comportamental':
        return <Activity className="h-4 w-4" />;
      case 'geografico':
        return <Target className="h-4 w-4" />;
      case 'psicografico':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segmentação de Leads</h1>
          <p className="text-muted-foreground">
            Organize e categorize seus leads para campanhas mais eficazes
          </p>
        </div>
        <Button onClick={handleCreateSegment}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Segmento
        </Button>
      </div>

      {/* Estatísticas rápidas */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Segmentos</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSegmentos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.segmentosAtivos} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leads Segmentados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalLeadsSegmentados.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreference">
                Organizados em segmentos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Segmento</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.distribuicaoPorTipo.length}</div>
              <p className="text-xs text-muted-foreground">
                Diferentes categorias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mais Utilizado</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.segmentosMaisUtilizados[0]?.contadorLeads.toLocaleString('pt-BR') || '0'}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {stats.segmentosMaisUtilizados[0]?.nome || 'Nenhum segmento'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição por tipo */}
      {!statsLoading && stats && stats.distribuicaoPorTipo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {stats.distribuicaoPorTipo.map((item) => (
                <div key={item.tipo} className="flex items-center gap-2">
                  {getTipoIcon(item.tipo)}
                  <span className="text-sm font-medium capitalize">{item.tipo}</span>
                  <Badge variant="secondary">{item.quantidade}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="lista">Lista de Segmentos</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-6">
          <SegmentList
            onCreateSegment={handleCreateSegment}
            onEditSegment={handleEditSegment}
            onDuplicateSegment={(segment) => {
              // Implementar duplicação
              console.log('Duplicando segmento:', segment);
            }}
            onViewSegmentLeads={(segment) => {
              // Implementar visualização de leads
              console.log('Visualizando leads do segmento:', segment);
            }}
            onViewSegmentAnalytics={(segment) => {
              // Implementar analytics do segmento
              console.log('Analytics do segmento:', segment);
            }}
            onExportSegment={(segment) => {
              // Implementar exportação
              console.log('Exportando segmento:', segment);
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Segmentação</CardTitle>
              <p className="text-sm text-muted-foreground">
                Análises detalhadas sobre performance dos segmentos
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  As análises detalhadas de performance dos segmentos estarão disponíveis em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog do Segment Builder */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSegment ? 'Editar Segmento' : 'Criar Novo Segmento'}
            </DialogTitle>
            <DialogDescription>
              {editingSegment
                ? 'Modifique as configurações do segmento abaixo.'
                : 'Defina as condições e configurações para seu novo segmento de leads.'
              }
            </DialogDescription>
          </DialogHeader>

          <SegmentBuilder
            segment={editingSegment}
            onSave={handleSaveSegment}
            onCancel={handleCloseBuilder}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SegmentosPage;