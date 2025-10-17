import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  Eye,
  Phone,
  Mail,
  Star,
  Target,
  Grid3X3,
  List,
  Kanban,
  SlidersHorizontal,
  FileDown,
  Building2,
  MapPin,
  LinkedinIcon,
  RefreshCw,
  Tags,
  Filter as FilterIcon,
  Zap,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUpDown,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Progress } from '@/shared/components/ui/progress';
import { useOrganization } from '@/shared/contexts/OrganizationContext';
import { useLeads } from '../hooks/useLeads';
import { useAuth } from '@/shared/contexts/AuthContext';
import { formatCurrency } from '@/shared/utils/utils';
import { AdvancedPagination } from '@/shared/components/common/AdvancedPagination';
import { LeadDetailsDialog } from '../components/LeadDetailsDialog';
import { LeadEditDialog } from '../components/LeadEditDialog';
import type { Lead } from '@/shared/services/schemas';

type ViewMode = 'table' | 'cards' | 'kanban';
type FilterStatus = 'all' | 'novo' | 'qualificado' | 'contatado' | 'convertido' | 'descartado' | 'privado';

// Usar o tipo Lead da API diretamente
type LeadData = Lead;

export default function LeadsPage() {
  const { currentOrganization } = useOrganization();
  const { isAuthenticated } = useAuth();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [qualityRange, setQualityRange] = useState({ min: 0, max: 100 });
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados para dialogs
  const [showLeadDetails, setShowLeadDetails] = useState(false);
  const [showEditLead, setShowEditLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Use real leads hook with pagination
  const { data: leadsData, isLoading, error } = useLeads({
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    scoreMin: qualityRange.min > 0 ? qualityRange.min : undefined,
    scoreMax: qualityRange.max < 100 ? qualityRange.max : undefined,
    segmento: selectedSegments.length > 0 ? selectedSegments[0] : undefined,
    fonte: selectedSources.length > 0 ? selectedSources[0] : undefined,
  });

  const realLeads = leadsData?.items || [];

  // Use dados reais da API diretamente
  const allLeads: LeadData[] = realLeads;

  console.log('LeadsPage - Dados carregados:', { 
    realLeads, 
    leadsData, 
    isLoading, 
    error: error ? {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: error && typeof error === 'object' && 'status' in error ? error.status : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    } : null 
  });

  // Para dados da API, use os metadados de paginação retornados
  const isUsingApiData = realLeads.length > 0;
  const apiPaginationData = leadsData ? {
    total: leadsData.total || 0,
    page: leadsData.page || currentPage,
    limit: leadsData.limit || itemsPerPage,
    totalPages: leadsData.totalPages || 1,
    hasNext: leadsData.hasNext || false,
    hasPrev: leadsData.hasPrev || false,
  } : null;

  // Para dados da API, aplique filtros e paginação local se necessário
  const filteredLeads = !isUsingApiData ? allLeads.filter(lead => {
    // Filtro por status
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    
    // Filtro por qualidade (usando scoreQualificacao da API)
    if (lead.scoreQualificacao < qualityRange.min || lead.scoreQualificacao > qualityRange.max) return false;
    
    // Filtro de busca (usando campos da API)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (lead.nomeContato && lead.nomeContato.toLowerCase().includes(searchLower)) ||
        (lead.nomeEmpresa && lead.nomeEmpresa.toLowerCase().includes(searchLower)) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
        (lead.cargoContato && lead.cargoContato.toLowerCase().includes(searchLower)) ||
        (lead.segmento && lead.segmento.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }
    
    // Filtro por segmento (usando campo segmento da API)
    if (selectedSegments.length > 0) {
      if (!selectedSegments.includes(lead.segmento || '')) return false;
    }
    
    // Filtro por fonte (usando campo fonte da API)
    if (selectedSources.length > 0 && !selectedSources.includes(lead.fonte || '')) return false;
    
    // Filtro por data
    if (dateRange.from || dateRange.to) {
      const leadDate = new Date(lead.createdAt || '');
      if (dateRange.from && leadDate < new Date(dateRange.from)) return false;
      if (dateRange.to && leadDate > new Date(dateRange.to)) return false;
    }
    
    return true;
  }) : allLeads;

  // Lógica de ordenação para dados da API
  const sortedLeads = !isUsingApiData ? [...filteredLeads].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'nomeContato':
        aValue = a.nomeContato || '';
        bValue = b.nomeContato || '';
        break;
      case 'nomeEmpresa':
        aValue = a.nomeEmpresa || '';
        bValue = b.nomeEmpresa || '';
        break;
      case 'scoreQualificacao':
        aValue = a.scoreQualificacao || 0;
        bValue = b.scoreQualificacao || 0;
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAt || '').getTime();
        bValue = new Date(b.createdAt || '').getTime();
        break;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  }) : filteredLeads;

  // Paginação: API ou local
  const totalPages = isUsingApiData 
    ? (apiPaginationData?.totalPages || 1)
    : Math.ceil(sortedLeads.length / itemsPerPage);
    
  const totalItems = isUsingApiData
    ? (apiPaginationData?.total || 0)
    : sortedLeads.length;

  const paginatedLeads = isUsingApiData 
    ? allLeads // API já retorna dados paginados
    : sortedLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, selectedSegments, selectedSources, qualityRange]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Obter segmentos e fontes únicos para filtros
  const availableSegments = [...new Set(allLeads.map(lead => lead.segmento).filter(Boolean))];

  const availableSources = [...new Set(allLeads.map(lead => lead.fonte).filter(Boolean))];

  const clearAllFilters = () => {
    setFilterStatus('all');
    setQualityRange({ min: 0, max: 100 });
    setSelectedSegments([]);
    setSelectedSources([]);
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
  };

  const exportLeads = () => {
    const leadsToExport = selectedLeads.length > 0 
      ? sortedLeads.filter(lead => selectedLeads.includes(lead.id))
      : sortedLeads;

    const csvData = [
      ['Nome', 'Email', 'Telefone', 'Empresa', 'Cargo', 'Cidade', 'Estado', 'Segmento', 'Qualidade', 'Status', 'Fonte', 'Tags'],
      ...leadsToExport.map(lead => [
        lead.nomeContato || 'Nome não informado',
        lead.email || 'Email não informado',
        lead.telefone || 'Telefone não informado',
        lead.nomeEmpresa || '',
        lead.cargoContato || 'Cargo não informado',
        lead.endereco?.cidade || '',
        lead.endereco?.estado || '',
        lead.segmento || '',
        `${lead.scoreQualificacao || 0}%`,
        getStatusLabel(lead.status || 'novo'),
        lead.fonte || '',
        lead.tags?.join('; ') || ''
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  // Dialog handlers
  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetails(true);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowEditLead(true);
  };

  const handleCloseDialogs = () => {
    setShowLeadDetails(false);
    setShowEditLead(false);
    setSelectedLead(null);
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadgeVariant = (score: number): "default" | "secondary" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    return 'outline';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      // Valores da API
      novo: 'bg-blue-100 text-blue-800 border-blue-200',
      qualificado: 'bg-green-100 text-green-800 border-green-200',
      contatado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      convertido: 'bg-purple-100 text-purple-800 border-purple-200',
      descartado: 'bg-red-100 text-red-800 border-red-200',
      privado: 'bg-gray-100 text-gray-800 border-gray-200',
      // Valores antigos (para compatibilidade)
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      qualified: 'bg-green-100 text-green-800 border-green-200',
      contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      converted: 'bg-purple-100 text-purple-800 border-purple-200',
      discarded: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      // Valores da API
      novo: 'Novo',
      qualificado: 'Qualificado',
      contatado: 'Contatado',
      convertido: 'Convertido',
      descartado: 'Descartado',
      privado: 'Privado',
      // Valores antigos (para compatibilidade)
      new: 'Novo',
      qualified: 'Qualificado',
      contacted: 'Contatado',
      converted: 'Convertido',
      discarded: 'Descartado'
    };
    return labels[status as keyof typeof labels] || 'Desconhecido';
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      scraping: '🕷️',
      imported: '📥',
      manual: '✏️',
      api: '🔌',
      webhook: '🔗'
    };
    return icons[source as keyof typeof icons] || '📋';
  };

  // Estatísticas
  const stats = {
    total: allLeads.length,
    filtered: sortedLeads.length,
    avgQuality: sortedLeads.length > 0 ? Math.round(sortedLeads.reduce((sum, lead) => sum + (lead.scoreQualificacao || 0), 0) / sortedLeads.length) : 0,
    statusCounts: {
      novo: allLeads.filter(l => l.status === 'novo').length,
      qualificado: allLeads.filter(l => l.status === 'qualificado').length,
      contatado: allLeads.filter(l => l.status === 'contatado').length,
      convertido: allLeads.filter(l => l.status === 'convertido').length,
      descartado: allLeads.filter(l => l.status === 'descartado').length,
      privado: allLeads.filter(l => l.status === 'privado').length,
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-2xl mx-auto mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              ❌ Erro ao Carregar Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
              {error && typeof error === 'object' && 'status' in error && (
                <p className="text-xs text-red-600">
                  Status: {error.status}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Possíveis soluções:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Verifique se a API está rodando em http://localhost:3000</li>
                <li>Confirme se você está autenticado</li>
                <li>Verifique a conexão com a internet</li>
                <li>Tente recarregar a página</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                🔄 Recarregar Página
              </Button>
              <Button 
                onClick={() => {
                  import('../../../shared/utils/debug-api').then(({ debugApiConnection }) => {
                    debugApiConnection().then(result => {
                      console.log('Debug result:', result);
                      alert(`Debug result: ${JSON.stringify(result, null, 2)}`);
                    });
                  });
                }}
                variant="outline"
              >
                🔍 Debug API
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📇 Leads Database</h1>
            <p className="text-gray-600 mt-1">
              Gerencie e acesse sua base de leads qualificados
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="text-xs">
                {stats.filtered} de {stats.total} leads
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Qualidade média: {stats.avgQuality}%
              </Badge>
              {/* {realLeads.length === 0 && (
                <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                  Modo Demonstração
                </Badge>
              )} */}
              {realLeads.length > 0 && (
                <Badge className="text-xs bg-green-100 text-green-800 border-green-200">
                  Dados Reais ({realLeads.length} da API)
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300" onClick={exportLeads}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar {selectedLeads.length > 0 ? `(${selectedLeads.length})` : `(${sortedLeads.length})`}
            </Button>
            {/* <Button variant="outline" className="border-gray-300">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar CRM
            </Button> */}
            {/* <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Importar Leads
            </Button> */}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Novos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.statusCounts.novo}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Qualificados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.statusCounts.qualificado}</p>
                </div>
                <Star className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contatados</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.statusCounts.contatado}</p>
                </div>
                <Phone className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Convertidos</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.statusCounts.convertido}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descartados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.statusCounts.descartado}</p>
                </div>
                <X className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="🔍 Buscar por nome, empresa, email, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-gray-300 focus:border-primary-500"
              />
            </div>
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Custo Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(sortedLeads.length * 2.50)}
                  </p>
                </div>
                <Target className="h-6 w-6 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Principais */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({stats.filtered})</SelectItem>
                <SelectItem value="novo">🆕 Novos ({stats.statusCounts.novo || 0})</SelectItem>
                <SelectItem value="qualificado">⭐ Qualificados ({stats.statusCounts.qualificado || 0})</SelectItem>
                <SelectItem value="contatado">📞 Contatados ({stats.statusCounts.contatado || 0})</SelectItem>
                <SelectItem value="convertido">🎯 Convertidos ({stats.statusCounts.convertido || 0})</SelectItem>
                <SelectItem value="descartado">❌ Descartados ({stats.statusCounts.descartado || 0})</SelectItem>
                <SelectItem value="privado">🔒 Privados ({stats.statusCounts.privado || 0})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">📅 Data de Criação</SelectItem>
                <SelectItem value="scoreQualificacao">⭐ Score de Qualidade</SelectItem>
                <SelectItem value="nomeContato">👤 Nome</SelectItem>
                <SelectItem value="nomeEmpresa">🏢 Empresa</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3"
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filtros Avançados
              {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>

            {(filterStatus !== 'all' || selectedSegments.length > 0 || selectedSources.length > 0 || qualityRange.min > 0 || qualityRange.max < 100 || searchTerm || dateRange.from || dateRange.to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar Todos os Filtros
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                onClick={() => setViewMode('table')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                onClick={() => setViewMode('cards')}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                onClick={() => setViewMode('kanban')}
                className="h-8 px-3"
              >
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtros Avançados */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro de Segmento */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Segmentos</label>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {availableSegments.slice(0, 5).map((segment) => (
                      <div key={segment} className="flex items-center">
                        <Checkbox
                          id={`segment-${segment}`}
                          checked={selectedSegments.includes(segment || '')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSegments([...selectedSegments, segment || '']);
                            } else {
                              setSelectedSegments(selectedSegments.filter(s => s !== segment));
                            }
                          }}
                        />
                        <label htmlFor={`segment-${segment}`} className="ml-2 text-sm text-gray-600">
                          {segment} ({allLeads.filter(l => l.segmento === segment).length})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filtro de Fonte */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Fonte dos Dados</label>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {availableSources.map((source) => (
                      <div key={source} className="flex items-center">
                        <Checkbox
                          id={`source-${source}`}
                          checked={selectedSources.includes(source || '')}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSources([...selectedSources, source || '']);
                            } else {
                              setSelectedSources(selectedSources.filter(s => s !== source));
                            }
                          }}
                        />
                        <label htmlFor={`source-${source}`} className="ml-2 text-sm text-gray-600">
                          {getSourceIcon(source || '')} {source} ({allLeads.filter(l => l.fonte === source).length})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Range de Qualidade */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Score de Qualidade: {qualityRange.min}% - {qualityRange.max}%
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Min:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={qualityRange.min}
                        onChange={(e) => setQualityRange({...qualityRange, min: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 w-8">{qualityRange.min}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Max:</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={qualityRange.max}
                        onChange={(e) => setQualityRange({...qualityRange, max: parseInt(e.target.value)})}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 w-8">{qualityRange.max}%</span>
                    </div>
                  </div>
                </div>

                {/* Período */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Período de Criação</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                      className="text-sm"
                      placeholder="Data inicial"
                    />
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                      className="text-sm"
                      placeholder="Data final"
                    />
                  </div>
                </div>
              </div>

              {/* Filtros Ativos */}
              {(selectedSegments.length > 0 || selectedSources.length > 0 || qualityRange.min > 0 || qualityRange.max < 100 || dateRange.from || dateRange.to) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Filtros ativos:</span>
                  {selectedSegments.map(segment => (
                    <Badge key={segment} variant="secondary" className="text-xs">
                      {segment}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setSelectedSegments(selectedSegments.filter(s => s !== segment))}
                      />
                    </Badge>
                  ))}
                  {selectedSources.map(source => (
                    <Badge key={source} variant="secondary" className="text-xs">
                      {getSourceIcon(source)} {source}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setSelectedSources(selectedSources.filter(s => s !== source))}
                      />
                    </Badge>
                  ))}
                  {(qualityRange.min > 0 || qualityRange.max < 100) && (
                    <Badge variant="secondary" className="text-xs">
                      Qualidade: {qualityRange.min}%-{qualityRange.max}%
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setQualityRange({min: 0, max: 100})}
                      />
                    </Badge>
                  )}
                  {(dateRange.from || dateRange.to) && (
                    <Badge variant="secondary" className="text-xs">
                      Período: {dateRange.from || '...'} - {dateRange.to || '...'}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setDateRange({from: '', to: ''})}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações em Massa */}
        {selectedLeads.length > 0 && (
          <Card className="bg-primary-50 border-primary-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-primary-800">
                    {selectedLeads.length} lead(s) selecionado(s)
                  </span>
                  <Badge variant="outline" className="border-primary-300 text-primary-700">
                    Custo total: {formatCurrency(selectedLeads.length * 2.50)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-primary-300 text-primary-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Ligar em Massa
                  </Button>
                  <Button variant="outline" size="sm" className="border-primary-300 text-primary-700">
                    <Mail className="mr-2 h-4 w-4" />
                    Email em Massa
                  </Button>
                  <Button variant="outline" size="sm" className="border-primary-300 text-primary-700">
                    <Tags className="mr-2 h-4 w-4" />
                    Adicionar Tags
                  </Button>
                  <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                    <Zap className="mr-2 h-4 w-4" />
                    Solicitar Acesso
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conteúdo Principal */}
      <div className="bg-white rounded-lg border border-gray-200 min-h-96">
        {/* Visualização em Tabela */}
        {viewMode === 'table' && (
          <div>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedLeads.length === paginatedLeads.length && paginatedLeads.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-semibold">Lead</TableHead>
                  <TableHead className="font-semibold">Empresa</TableHead>
                  <TableHead className="font-semibold">Segmento</TableHead>
                  <TableHead className="font-semibold">Qualidade</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Fonte</TableHead>
                  <TableHead className="font-semibold">Custo</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewLead(lead)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${lead.nomeContato || lead.nomeEmpresa}?size=32`} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                            {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                             lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{lead.nomeContato || 'Nome não informado'}</p>
                          <p className="text-sm text-gray-500">{lead.cargoContato || 'Cargo não informado'}</p>
                          <p className="text-xs text-gray-400">{lead.email || 'Email não informado'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{lead.nomeEmpresa}</p>
                        <p className="text-sm text-gray-500">
                          📍 {lead.endereco?.cidade}, {lead.endereco?.estado}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300">
                        {lead.segmento || 'Não informado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getQualityColor(lead.scoreQualificacao || 0)}`}>
                            {lead.scoreQualificacao}%
                          </span>
                          <Badge variant={getQualityBadgeVariant(lead.scoreQualificacao || 0)} className="text-xs">
                            {(lead.scoreQualificacao || 0) >= 90 ? 'Excelente' : (lead.scoreQualificacao || 0) >= 80 ? 'Alta' : (lead.scoreQualificacao || 0) >= 70 ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <Progress value={lead.scoreQualificacao || 0} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status || '')}>
                        {getStatusLabel(lead.status || '')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getSourceIcon(lead.fonte || '')}</span>
                        <span className="text-sm text-gray-600 capitalize">{lead.fonte || 'Não informado'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-900">
                        -
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Zap className="mr-2 h-4 w-4" />
                            Solicitar Acesso
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Phone className="mr-2 h-4 w-4" />
                            Ligar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LinkedinIcon className="mr-2 h-4 w-4" />
                            Ver LinkedIn
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Tags className="mr-2 h-4 w-4" />
                            Gerenciar Tags
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Star className="mr-2 h-4 w-4" />
                            Adicionar ao Pipeline
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Visualização em Cards */}
        {viewMode === 'cards' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className="border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-primary-300 cursor-pointer"
                  onClick={() => handleViewLead(lead)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://avatar.vercel.sh/${lead.nomeContato || lead.nomeEmpresa}?size=48`} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
                            {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                             lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{lead.nomeEmpresa}</h3>
                          <p className="text-sm text-gray-600">{lead.nomeContato || 'Nome não informado'}</p>
                          <p className="text-xs text-gray-500">{lead.cargoContato || 'Cargo não informado'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          ⭐ {lead.scoreQualificacao}%
                        </Badge>
                        <Badge className={getStatusColor(lead.status || '')}>
                          {getStatusLabel(lead.status || '')}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{lead.email || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{lead.telefone || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{lead.endereco?.cidade}, {lead.endereco?.estado}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span>{lead.segmento}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">{getSourceIcon(lead.fonte)}</span>
                        <span className="capitalize">{lead.fonte}</span>
                      </div>
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {lead.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{lead.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-primary-600 hover:bg-primary-700">
                        <Zap className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Visualização Kanban */}
        {viewMode === 'kanban' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { id: 'novo', title: 'Novos', color: 'bg-blue-50 border-blue-200' },
                { id: 'qualificado', title: 'Qualificados', color: 'bg-green-50 border-green-200' },
                { id: 'contatado', title: 'Contatados', color: 'bg-yellow-50 border-yellow-200' },
                { id: 'convertido', title: 'Convertidos', color: 'bg-purple-50 border-purple-200' },
                { id: 'descartado', title: 'Descartados', color: 'bg-red-50 border-red-200' }
              ].map((column) => {
                const columnLeads = sortedLeads.filter(lead => (lead.status || 'novo') === column.id);
                return (
                  <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4 min-h-96`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {columnLeads.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {columnLeads.slice(0, 10).map((lead) => (
                        <Card
                          key={lead.id}
                          className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewLead(lead)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                                  {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                                   lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate flex-1">{lead.nomeEmpresa}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 truncate">{lead.nomeContato || 'Nome não informado'}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                ⭐ {lead.scoreQualificacao}%
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditLead(lead);
                                }}
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <span>{getSourceIcon(lead.fonte)}</span>
                              <span className="capitalize">{lead.fonte}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {columnLeads.length > 10 && (
                        <div className="text-center py-2">
                          <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                            +{columnLeads.length - 10} mais
                          </Button>
                        </div>
                      )}

                      {columnLeads.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                          <div className="text-4xl mb-2">📭</div>
                          <p className="text-sm">Nenhum lead</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {paginatedLeads.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros ou limpar a busca para ver mais resultados.
            </p>
            <Button onClick={clearAllFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <AdvancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
          isLoading={isLoading}
        />
      )}

      {/* Dialogs */}
      <LeadDetailsDialog
        lead={selectedLead}
        open={showLeadDetails}
        onClose={handleCloseDialogs}
        onEdit={handleEditLead}
      />

      <LeadEditDialog
        lead={selectedLead}
        open={showEditLead}
        onClose={handleCloseDialogs}
        onSave={(updatedLead) => {
          // TODO: Implement lead update API call
          console.log('Lead updated:', updatedLead);
          handleCloseDialogs();
        }}
      />
    </div>
  );
}
