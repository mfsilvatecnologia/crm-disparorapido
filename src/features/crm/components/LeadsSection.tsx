import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Eye,
  Star,
  MoreVertical,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useLeads } from '@/features/leads/hooks/useLeads';
import { ScoreBadge, StatusBadge } from '@/shared/components/design-system';
import type { Lead } from '@/shared/services/schemas';

interface LeadsSectionProps {
  searchTerm?: string;
}

export function LeadsSection({ searchTerm: externalSearchTerm }: LeadsSectionProps) {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Hook para buscar leads reais
  const { data: leadsData, isLoading } = useLeads({
    search: searchTerm,
    page: 1,
    limit: 12,
    status: selectedFilter !== 'all' ? selectedFilter : undefined,
  });

  const leads = leadsData?.items || [];

  const handleViewLead = (lead: Lead) => {
    console.log('Ver lead:', lead);
    // Implementar navegação ou modal
  };

  const handleConvertToOpportunity = (lead: Lead) => {
    console.log('Converter para oportunidade:', lead);
    // Implementar conversão
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            placeholder="Buscar leads por nome, empresa, email..."
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
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex items-center gap-2">
        {['all', 'novo', 'qualificado', 'contatado'].map((filter) => (
          <Badge
            key={filter}
            variant={selectedFilter === filter ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedFilter(filter)}
          >
            {filter === 'all' ? 'Todos' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Badge>
        ))}
      </div>

      {/* Grid de Cards - Estilo Zoho */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {leads.map((lead) => (
          <Card
            key={lead.id}
            className="border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => handleViewLead(lead)}
          >
            <CardContent className="p-5">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${lead.nomeContato || lead.nomeEmpresa}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-sm font-semibold">
                    {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ||
                     lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                  </AvatarFallback>
                </Avatar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewLead(lead); }}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleConvertToOpportunity(lead); }}>
                      <Zap className="mr-2 h-4 w-4" />
                      Converter em Oportunidade
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Star className="mr-2 h-4 w-4" />
                      Marcar como Favorito
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Nome e Empresa */}
              <div className="mb-4">
                <button
                  onClick={(e) => { e.stopPropagation(); handleViewLead(lead); }}
                  className="text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left block w-full mb-1 transition-colors"
                >
                  {lead.nomeContato || 'Nome não informado'}
                </button>
                <p className="text-sm font-medium text-gray-700">
                  {lead.nomeEmpresa || 'Empresa não informada'}
                </p>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                {lead.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                )}
                {lead.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{lead.telefone}</span>
                  </div>
                )}
                {lead.endereco?.cidade && lead.endereco?.estado && (
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{lead.endereco.cidade}, {lead.endereco.estado}</span>
                  </div>
                )}
                {lead.segmento && (
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{lead.segmento}</span>
                  </div>
                )}
              </div>

              {/* Status e Score */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <StatusBadge
                  type="lead"
                  status={(lead.status as 'novo' | 'qualificado' | 'contatado' | 'convertido' | 'descartado') || 'novo'}
                  size="sm"
                />
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-red-600">
                    {lead.scoreQualificacao || 0}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    Score
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio */}
      {leads.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
          <p className="text-gray-500 mb-4">
            Comece criando novos leads ou ajuste os filtros.
          </p>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeiro Lead
          </Button>
        </div>
      )}
    </div>
  );
}
