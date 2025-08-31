import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  Target
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
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useOrganization } from '@/contexts/OrganizationContext';
import apiClient from '@/lib/api/client';
import { formatCurrency } from '@/lib/utils';
import type { Lead } from '@/lib/api/schemas';

// Mock leads data
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@techsolutions.com.br',
    phone: '+55 11 99999-0001',
    company: 'Tech Solutions LTDA',
    position: 'CTO',
    website: 'https://techsolutions.com.br',
    linkedin: 'https://linkedin.com/in/joaosilva',
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil'
    },
    segment: {
      id: 'tech',
      name: 'Tecnologia',
      description: 'Empresas de tecnologia e software',
      color: '#3b82f6'
    },
    qualityScore: 92,
    tags: ['high-intent', 'enterprise', 'qualified'],
    customFields: {
      employees: '50-200',
      revenue: '$1M-$5M'
    },
    metadata: {
      source: 'linkedin-scraping',
      collectedAt: '2024-01-15T10:30:00Z',
      lastEnrichedAt: '2024-01-15T11:00:00Z',
      confidence: 0.95
    },
    accessCost: 2.50,
    isAccessed: false,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:00:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@inovacaodigital.com.br',
    phone: '+55 11 99999-0002',
    company: 'Inovação Digital',
    position: 'CEO',
    website: 'https://inovacaodigital.com.br',
    address: {
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil'
    },
    segment: {
      id: 'marketing',
      name: 'Marketing Digital',
      description: 'Agências e consultorias de marketing',
      color: '#10b981'
    },
    qualityScore: 87,
    tags: ['decision-maker', 'smb'],
    metadata: {
      source: 'web-scraping',
      collectedAt: '2024-01-15T14:20:00Z',
      confidence: 0.88
    },
    accessCost: 2.50,
    isAccessed: true,
    accessedAt: '2024-01-16T09:15:00Z',
    createdAt: '2024-01-15T14:20:00Z',
    updatedAt: '2024-01-16T09:15:00Z'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@startupxyz.com',
    phone: '+55 11 99999-0003',
    company: 'StartupXYZ',
    position: 'Founder',
    address: {
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil'
    },
    segment: {
      id: 'fintech',
      name: 'Fintech',
      description: 'Startups de tecnologia financeira',
      color: '#f59e0b'
    },
    qualityScore: 76,
    tags: ['startup', 'early-stage'],
    metadata: {
      source: 'crunchbase-api',
      collectedAt: '2024-01-15T16:45:00Z',
      confidence: 0.82
    },
    accessCost: 2.50,
    isAccessed: false,
    createdAt: '2024-01-15T16:45:00Z',
    updatedAt: '2024-01-15T16:45:00Z'
  }
];

export default function LeadsPage() {
  const { currentOrganization } = useOrganization();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock query for leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', currentOrganization?.id, searchTerm],
    queryFn: () => {
      // Simulate API call with filtering
      const filteredLeads = mockLeads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return Promise.resolve({
        data: filteredLeads,
        pagination: {
          page: 1,
          pageSize: 10,
          total: filteredLeads.length
        }
      });
    },
    enabled: !!currentOrganization,
  });

  const leads = leadsData?.data || [];

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getQualityBadgeVariant = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Gerencie e acesse sua base de leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Importar Leads
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, empresa ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selecionados</p>
                <p className="text-2xl font-bold">{selectedLeads.length}</p>
              </div>
              <Eye className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedLeads.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedLeads.length} lead(s) selecionado(s)
                </span>
                <Badge variant="outline">
                  Custo: {formatCurrency(selectedLeads.length * 2.50)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar
                </Button>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Solicitar Acesso
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>
            {leads.length} leads encontrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === leads.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Qualidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${lead.name}`} />
                        <AvatarFallback>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.position}</p>
                        <p className="text-xs text-muted-foreground">{lead.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.address?.city}, {lead.address?.state}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      style={{ borderColor: lead.segment.color, color: lead.segment.color }}
                    >
                      {lead.segment.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getQualityColor(lead.qualityScore)}`}>
                          {lead.qualityScore}%
                        </span>
                        <Badge variant={getQualityBadgeVariant(lead.qualityScore)} className="text-xs">
                          {lead.qualityScore >= 85 ? 'Alta' : lead.qualityScore >= 70 ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <Progress value={lead.qualityScore} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.isAccessed ? 'default' : 'secondary'}>
                      {lead.isAccessed ? 'Acessado' : 'Disponível'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {formatCurrency(lead.accessCost)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                            <Target className="mr-2 h-4 w-4" />
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
                        <DropdownMenuSeparator />
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
        </CardContent>
      </Card>
    </div>
  );
}