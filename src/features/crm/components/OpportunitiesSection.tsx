import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Search,
  Filter,
  Download,
  Plus,
  DollarSign,
  Calendar,
  User,
  TrendingUp,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { useOpportunities } from '@/features/opportunities/api/opportunities';

interface OpportunitiesSectionProps {
  searchTerm?: string;
}

export function OpportunitiesSection({ searchTerm: externalSearchTerm }: OpportunitiesSectionProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [selectedStage, setSelectedStage] = useState<string>('all');

  // Buscar dados reais da API
  const { data, isLoading, fetchNextPage, hasNextPage } = useOpportunities({
    search: searchTerm,
    status: 'active', // Apenas oportunidades ativas
    stage: selectedStage !== 'all' ? selectedStage : undefined,
  });

  // Flatten paginated data
  const opportunities = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading && opportunities.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de Ferramentas */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar oportunidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Filtros Rápidos por Estágio */}
      <div className="flex items-center gap-2">
        {['all', 'Qualificação', 'Proposta', 'Negociação', 'Fechamento'].map((stage) => (
          <Badge
            key={stage}
            variant={selectedStage === stage ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedStage(stage)}
          >
            {stage === 'all' ? 'Todas' : stage}
          </Badge>
        ))}
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {opportunities.map((opp) => (
          <Card
            key={opp.id}
            className="border-2 border-orange-200 bg-orange-50/30 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate(`/app/crm/opportunities/${opp.id}`)}
          >
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {opp.nome}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {opp.descricao || 'Sem descrição'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Valor */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(opp.valorEstimado)}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {opp.estagio}
                </Badge>
              </div>

              {/* Probabilidade */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-medium text-gray-600">Probabilidade</span>
                  <span className={`font-bold ${getProbabilityColor(opp.probabilidade)}`}>
                    {opp.probabilidade}%
                  </span>
                </div>
                <Progress value={opp.probabilidade} className="h-2" />
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {opp.expectedCloseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Fechamento: {new Date(opp.expectedCloseDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  Criado em: {new Date(opp.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/crm/opportunities/${opp.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/crm/opportunities/${opp.id}`);
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Avançar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio */}
      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma oportunidade encontrada</h3>
          <p className="text-gray-500 mb-4">
            Crie oportunidades a partir de leads qualificados.
          </p>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Oportunidade
          </Button>
        </div>
      )}
    </div>
  );
}
