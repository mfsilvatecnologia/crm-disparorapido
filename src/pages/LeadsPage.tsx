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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useLeads } from '@/hooks/useLeads';
import { formatCurrency } from '@/lib/utils';

type ViewMode = 'table' | 'cards' | 'kanban';
type FilterStatus = 'all' | 'new' | 'qualified' | 'contacted' | 'converted' | 'discarded';

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: { city: string; state: string };
  segment: { name: string };
  qualityScore: number;
  accessCost: number;
  isAccessed: boolean;
  createdAt: string;
  status: 'new' | 'qualified' | 'contacted' | 'converted' | 'discarded';
  source: string;
  lastContact?: Date;
  tags?: string[];
}

export default function Leads2Page() {
  const { currentOrganization } = useOrganization();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [qualityRange, setQualityRange] = useState({ min: 0, max: 100 });
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Use real leads hook
  const { data: leadsData, isLoading, error } = useLeads({
    search: searchTerm,
    limit: 200,
  });

  const realLeads = leadsData?.items || [];

  // Dados de demonstração completos
  const demoLeads: LeadData[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao.silva@techsolutions.com.br',
      phone: '(11) 99999-9999',
      company: 'Tech Solutions LTDA',
      position: 'CEO & Founder',
      address: { city: 'São Paulo', state: 'SP' },
      segment: { name: 'Tecnologia' },
      qualityScore: 95,
      accessCost: 2.50,
      isAccessed: false,
      createdAt: new Date().toISOString(),
      status: 'new',
      source: 'scraping',
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['decisor', 'startup']
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria.santos@inovacorp.com',
      phone: '(11) 88888-8888',
      company: 'InovaCorp Startup',
      position: 'CTO',
      address: { city: 'Rio de Janeiro', state: 'RJ' },
      segment: { name: 'Startup' },
      qualityScore: 92,
      accessCost: 2.50,
      isAccessed: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      status: 'qualified',
      source: 'imported',
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['tech-lead', 'inovação']
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@consultingpro.com.br',
      phone: '(11) 77777-7777',
      company: 'Consulting Pro Group',
      position: 'Diretor Executivo',
      address: { city: 'Belo Horizonte', state: 'MG' },
      segment: { name: 'Consultoria' },
      qualityScore: 88,
      accessCost: 2.50,
      isAccessed: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      status: 'contacted',
      source: 'manual',
      lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      tags: ['enterprise', 'consultoria']
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      email: 'ana.oliveira@fintech.io',
      phone: '(11) 66666-6666',
      company: 'Fintech Brasil',
      position: 'COO',
      address: { city: 'Curitiba', state: 'PR' },
      segment: { name: 'Fintech' },
      qualityScore: 97,
      accessCost: 2.50,
      isAccessed: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      status: 'converted',
      source: 'api',
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      tags: ['fintech', 'decisor', 'convertido']
    },
    {
      id: '5',
      name: 'Carlos Pereira',
      email: 'carlos.pereira@ecommerceplus.com',
      phone: '(11) 55555-5555',
      company: 'E-commerce Plus',
      position: 'Founder & CEO',
      address: { city: 'Porto Alegre', state: 'RS' },
      segment: { name: 'E-commerce' },
      qualityScore: 75,
      accessCost: 2.50,
      isAccessed: false,
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      status: 'contacted',
      source: 'webhook',
      lastContact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['e-commerce', 'growth']
    },
    {
      id: '6',
      name: 'Luciana Rodrigues',
      email: 'luciana@healthtech.com.br',
      phone: '(21) 99999-1111',
      company: 'HealthTech Solutions',
      position: 'Diretora de Produtos',
      address: { city: 'Rio de Janeiro', state: 'RJ' },
      segment: { name: 'HealthTech' },
      qualityScore: 91,
      accessCost: 2.50,
      isAccessed: true,
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      status: 'qualified',
      source: 'scraping',
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['healthtech', 'produto']
    },
    {
      id: '7',
      name: 'Rafael Mendes',
      email: 'rafael@agritech.agr.br',
      phone: '(16) 88888-2222',
      company: 'AgriTech Inovação',
      position: 'VP de Tecnologia',
      address: { city: 'Ribeirão Preto', state: 'SP' },
      segment: { name: 'AgriTech' },
      qualityScore: 84,
      accessCost: 2.50,
      isAccessed: false,
      createdAt: new Date(Date.now() - 518400000).toISOString(),
      status: 'new',
      source: 'imported',
      tags: ['agritech', 'inovação']
    },
    {
      id: '8',
      name: 'Patricia Lima',
      email: 'patricia.lima@edtech.edu.br',
      phone: '(11) 77777-3333',
      company: 'EdTech Learning',
      position: 'Cofundadora',
      address: { city: 'São Paulo', state: 'SP' },
      segment: { name: 'EdTech' },
      qualityScore: 89,
      accessCost: 2.50,
      isAccessed: false,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      status: 'qualified',
      source: 'manual',
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['edtech', 'education', 'founder']
    }
  ];

  // Use dados reais se disponíveis, senão use demo
  const allLeads = realLeads.length > 0 ? realLeads.map(lead => ({
    ...lead,
    status: ['new', 'qualified', 'contacted', 'converted', 'discarded'][Math.floor(Math.random() * 5)] as any,
    source: ['scraping', 'imported', 'manual', 'api', 'webhook'][Math.floor(Math.random() * 5)],
  })) : demoLeads;

  console.log('Leads2Page - Dados carregados:', { realLeads, demoLeads, allLeads, isLoading, error });

  // Lógica de filtros avançados
  const filteredLeads = allLeads.filter(lead => {
    // Filtro por status
    if (filterStatus !== 'all' && lead.status !== filterStatus) return false;
    
    // Filtro por qualidade
    if (lead.qualityScore < qualityRange.min || lead.qualityScore > qualityRange.max) return false;
    
    // Filtro de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        lead.name?.toLowerCase().includes(searchLower) ||
        lead.company?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.position?.toLowerCase().includes(searchLower) ||
        (typeof lead.segment === 'object' ? lead.segment?.name?.toLowerCase().includes(searchLower) : false);
      if (!matchesSearch) return false;
    }
    
    // Filtro por segmento
    if (selectedSegments.length > 0) {
      const segmentName = typeof lead.segment === 'object' ? lead.segment?.name : lead.segment;
      if (!selectedSegments.includes(segmentName || '')) return false;
    }
    
    // Filtro por fonte
    if (selectedSources.length > 0 && !selectedSources.includes(lead.source || '')) return false;
    
    // Filtro por data
    if (dateRange.from || dateRange.to) {
      const leadDate = new Date(lead.createdAt || '');
      if (dateRange.from && leadDate < new Date(dateRange.from)) return false;
      if (dateRange.to && leadDate > new Date(dateRange.to)) return false;
    }
    
    return true;
  });

  // Lógica de ordenação
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name || '';
        bValue = b.name || '';
        break;
      case 'company':
        aValue = a.company || '';
        bValue = b.company || '';
        break;
      case 'qualityScore':
        aValue = a.qualityScore || 0;
        bValue = b.qualityScore || 0;
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
  });

  // Paginação
  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeads = sortedLeads.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, selectedSegments, selectedSources, qualityRange]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Obter segmentos e fontes únicos para filtros
  const availableSegments = [...new Set(allLeads.map(lead => 
    typeof lead.segment === 'object' ? lead.segment?.name : lead.segment
  ).filter(Boolean))];

  const availableSources = [...new Set(allLeads.map(lead => lead.source).filter(Boolean))];

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
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.company || '',
        lead.position || '',
        lead.address?.city || '',
        lead.address?.state || '',
        typeof lead.segment === 'object' ? lead.segment?.name || '' : lead.segment || '',
        `${lead.qualityScore || 0}%`,
        getStatusLabel(lead.status),
        lead.source || '',
        (lead as any).tags?.join('; ') || ''
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
    avgQuality: sortedLeads.length > 0 ? Math.round(sortedLeads.reduce((sum, lead) => sum + lead.qualityScore, 0) / sortedLeads.length) : 0,
    statusCounts: {
      new: allLeads.filter(l => l.status === 'new').length,
      qualified: allLeads.filter(l => l.status === 'qualified').length,
      contacted: allLeads.filter(l => l.status === 'contacted').length,
      converted: allLeads.filter(l => l.status === 'converted').length,
      discarded: allLeads.filter(l => l.status === 'discarded').length,
    }
  };

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
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-gray-300" onClick={exportLeads}>
              <FileDown className="mr-2 h-4 w-4" />
              Exportar {selectedLeads.length > 0 ? `(${selectedLeads.length})` : `(${sortedLeads.length})`}
            </Button>
            <Button variant="outline" className="border-gray-300">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar CRM
            </Button>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Importar Leads
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card className="border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Novos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.statusCounts.new}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.statusCounts.qualified}</p>
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
                  <p className="text-2xl font-bold text-yellow-600">{stats.statusCounts.contacted}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{stats.statusCounts.converted}</p>
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
                  <p className="text-2xl font-bold text-red-600">{stats.statusCounts.discarded}</p>
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
                <SelectItem value="new">🆕 Novos ({stats.statusCounts.new})</SelectItem>
                <SelectItem value="qualified">⭐ Qualificados ({stats.statusCounts.qualified})</SelectItem>
                <SelectItem value="contacted">📞 Contatados ({stats.statusCounts.contacted})</SelectItem>
                <SelectItem value="converted">🎯 Convertidos ({stats.statusCounts.converted})</SelectItem>
                <SelectItem value="discarded">❌ Descartados ({stats.statusCounts.discarded})</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">📅 Data de Criação</SelectItem>
                <SelectItem value="qualityScore">⭐ Score de Qualidade</SelectItem>
                <SelectItem value="name">👤 Nome</SelectItem>
                <SelectItem value="company">🏢 Empresa</SelectItem>
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
                          {segment} ({allLeads.filter(l => (typeof l.segment === 'object' ? l.segment?.name : l.segment) === segment).length})
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
                          {getSourceIcon(source || '')} {source} ({allLeads.filter(l => l.source === source).length})
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
                  <TableRow key={lead.id} className="border-gray-100 hover:bg-gray-50">
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://avatar.vercel.sh/${lead.name}?size=32`} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                            {lead.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'NN'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.position}</p>
                          <p className="text-xs text-gray-400">{lead.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{lead.company}</p>
                        <p className="text-sm text-gray-500">
                          📍 {lead.address?.city}, {lead.address?.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-300">
                        {typeof lead.segment === 'object' ? lead.segment?.name : lead.segment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${getQualityColor(lead.qualityScore)}`}>
                            {lead.qualityScore}%
                          </span>
                          <Badge variant={getQualityBadgeVariant(lead.qualityScore)} className="text-xs">
                            {lead.qualityScore >= 90 ? 'Excelente' : lead.qualityScore >= 80 ? 'Alta' : lead.qualityScore >= 70 ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                        <Progress value={lead.qualityScore} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(lead.status)}>
                        {getStatusLabel(lead.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getSourceIcon(lead.source)}</span>
                        <span className="text-sm text-gray-600 capitalize">{lead.source}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(lead.accessCost)}
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
                          {!lead.isAccessed && (
                            <DropdownMenuItem>
                              <Zap className="mr-2 h-4 w-4" />
                              Solicitar Acesso
                            </DropdownMenuItem>
                          )}
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
                <Card key={lead.id} className="border-gray-200 hover:shadow-lg transition-all duration-200 hover:border-primary-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://avatar.vercel.sh/${lead.name}?size=48`} />
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-sm">
                            {lead.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'NN'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{lead.company}</h3>
                          <p className="text-sm text-gray-600">{lead.name}</p>
                          <p className="text-xs text-gray-500">{lead.position}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className="text-xs">
                          ⭐ {lead.qualityScore}%
                        </Badge>
                        <Badge className={getStatusColor(lead.status)}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{lead.address?.city}, {lead.address?.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4 flex-shrink-0" />
                        <span>{typeof lead.segment === 'object' ? lead.segment?.name : lead.segment}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">{getSourceIcon(lead.source)}</span>
                        <span className="capitalize">{lead.source}</span>
                      </div>
                      {(lead as any).tags && (lead as any).tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {(lead as any).tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {(lead as any).tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(lead as any).tags.length - 3}
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
                { id: 'new', title: 'Novos', color: 'bg-blue-50 border-blue-200', count: stats.statusCounts.new },
                { id: 'qualified', title: 'Qualificados', color: 'bg-green-50 border-green-200', count: stats.statusCounts.qualified },
                { id: 'contacted', title: 'Contatados', color: 'bg-yellow-50 border-yellow-200', count: stats.statusCounts.contacted },
                { id: 'converted', title: 'Convertidos', color: 'bg-purple-50 border-purple-200', count: stats.statusCounts.converted },
                { id: 'discarded', title: 'Descartados', color: 'bg-red-50 border-red-200', count: stats.statusCounts.discarded }
              ].map((column) => {
                const columnLeads = sortedLeads.filter(lead => lead.status === column.id);
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
                        <Card key={lead.id} className="border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                                  {lead.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'NN'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium truncate flex-1">{lead.company}</span>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 truncate">{lead.name}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                ⭐ {lead.qualityScore}%
                              </Badge>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <span>{getSourceIcon(lead.source)}</span>
                              <span className="capitalize">{lead.source}</span>
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
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Itens por página:</span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-600">
                Mostrando {startIndex + 1}-{Math.min(endIndex, sortedLeads.length)} de {sortedLeads.length} leads
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 6, currentPage - 3)) + i;
                  if (page > totalPages) return null;
                  
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
