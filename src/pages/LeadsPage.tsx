import React, { useState } from 'react';
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
import { useLeads } from '@/hooks/useLeads';
import { formatCurrency } from '@/lib/utils';
import type { Lead } from '@/lib/api/schemas';

export default function LeadsPage() {
  const { currentOrganization } = useOrganization();
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Use real leads hook
  const { data: leadsData, isLoading } = useLeads({
    search: searchTerm,
    limit: 50,
  });

  const leads = leadsData?.items || [];

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
                <p className="text-2xl font-bold">{leadsData?.total || 0}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualificados</p>
                <p className="text-2xl font-bold">
                  {leads.filter(lead => lead.status === 'QUALIFICADO').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Qualidade Média</p>
                <p className="text-2xl font-bold">
                  {leads.length > 0 
                    ? Math.round(leads.reduce((sum, lead) => sum + (lead.scoreQualificacao || 0), 0) / leads.length)
                    : 0}%
                </p>
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
            {leadsData?.total || 0} leads encontrados
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
                        <AvatarImage src={`https://avatar.vercel.sh/${lead.nomeContato}`} />
                        <AvatarFallback>
                          {lead.nomeContato?.split(' ').map(n => n[0]).join('') || 'NN'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{lead.nomeContato || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{lead.cargoContato || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{lead.email || 'N/A'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{lead.nomeEmpresa || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.endereco?.cidade || 'N/A'}, {lead.endereco?.estado || 'N/A'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {lead.segmento || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getQualityColor(lead.scoreQualificacao || 0)}`}>
                          {lead.scoreQualificacao || 0}%
                        </span>
                        <Badge variant={getQualityBadgeVariant(lead.scoreQualificacao || 0)} className="text-xs">
                          {(lead.scoreQualificacao || 0) >= 85 ? 'Alta' : (lead.scoreQualificacao || 0) >= 70 ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <Progress value={lead.scoreQualificacao || 0} className="h-1" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={lead.status === 'QUALIFICADO' ? 'default' : 'secondary'}>
                      {lead.status || 'NOVO'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {formatCurrency(lead.custoAquisicao || 0)}
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