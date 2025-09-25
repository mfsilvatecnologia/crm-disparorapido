import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  TrendingUp,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { useToast } from '@/shared/hooks/use-toast';
import { apiClient } from '@/shared/services/client';
import type { SearchTerm, CreateSearchTerm, UpdateSearchTerm, SearchTermStats } from '@/shared/services/schemas';

// Componente para estatísticas
function StatsCards({ stats }: { stats?: SearchTermStats[] }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalBuscas = stats.reduce((acc, stat) => acc + stat.totalBuscas, 0);
  const totalLeads = stats.reduce((acc, stat) => acc + stat.leadsGerados, 0);
  const taxaMediaSucesso = stats.length > 0 ? stats.reduce((acc, stat) => acc + stat.taxaSucesso, 0) / stats.length : 0;
  const termosAtivos = stats.filter(stat => stat.ultimaExecucao).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Buscas</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalBuscas.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Todas as execuções
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leads Gerados</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Total coletado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(taxaMediaSucesso * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Média geral
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Termos Ativos</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{termosAtivos}</div>
          <p className="text-xs text-muted-foregreen">
            Com execuções recentes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente do formulário
function SearchTermForm({ 
  searchTerm, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}: {
  searchTerm?: SearchTerm;
  onSubmit: (data: CreateSearchTerm | UpdateSearchTerm) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}) {
  const [formData, setFormData] = useState<CreateSearchTerm>({
    termo: searchTerm?.termo || '',
    categoria: searchTerm?.categoria || '',
    descricao: searchTerm?.descricao || '',
    ativo: searchTerm?.ativo ?? true,
  });

  const { data: categorias } = useQuery({
    queryKey: ['search-terms', 'categories'],
    queryFn: () => apiClient.getSearchTermCategories(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="termo">Termo de Busca</Label>
        <Input
          id="termo"
          value={formData.termo}
          onChange={(e) => setFormData(prev => ({ ...prev, termo: e.target.value }))}
          placeholder="Ex: restaurantes, clínicas odontológicas..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoria">Categoria</Label>
        <Select 
          value={formData.categoria} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias?.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {categoria}
              </SelectItem>
            ))}
            <SelectItem value="Alimentação">Alimentação</SelectItem>
            <SelectItem value="Saúde">Saúde</SelectItem>
            <SelectItem value="Serviços">Serviços</SelectItem>
            <SelectItem value="Comércio">Comércio</SelectItem>
            <SelectItem value="Educação">Educação</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição (opcional)</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva o tipo de negócio que este termo deve capturar..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
        />
        <Label htmlFor="ativo">Termo ativo</Label>
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : searchTerm ? 'Atualizar' : 'Criar'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function SearchTermsPage() {
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [ativoFilter, setAtivoFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<SearchTerm | null>(null);
  const [page, setPage] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Normalize filters to avoid unnecessary refetches
  const normalizedFilters = {
    page,
    ...(search && search.trim() && { search: search.trim() }),
    ...(categoriaFilter !== 'all' && { categoria: categoriaFilter }),
    ...(ativoFilter !== 'all' && { ativo: ativoFilter === 'true' }),
  };

  // Queries with optimized caching
  const { data: searchTerms, isLoading } = useQuery({
    queryKey: ['search-terms', normalizedFilters],
    queryFn: () => apiClient.getSearchTerms({
      page,
      limit: 20,
      search: search || undefined,
      categoria: categoriaFilter !== 'all' ? categoriaFilter : undefined,
      ativo: ativoFilter !== 'all' ? ativoFilter === 'true' : undefined,
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: stats } = useQuery({
    queryKey: ['search-terms', 'stats'],
    queryFn: () => apiClient.getSearchTermStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: categorias } = useQuery({
    queryKey: ['search-terms', 'categories'],
    queryFn: () => apiClient.getSearchTermCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes (categorias mudam raramente)
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSearchTerm) => apiClient.createSearchTerm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-terms'] });
      toast({
        title: 'Termo criado',
        description: 'O termo de busca foi criado com sucesso.',
      });
      setIsDialogOpen(false);
      setEditingTerm(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar termo',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSearchTerm }) => 
      apiClient.updateSearchTerm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-terms'] });
      toast({
        title: 'Termo atualizado',
        description: 'O termo de busca foi atualizado com sucesso.',
      });
      setIsDialogOpen(false);
      setEditingTerm(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar termo',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteSearchTerm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-terms'] });
      toast({
        title: 'Termo excluído',
        description: 'O termo de busca foi excluído com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao excluir termo',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: CreateSearchTerm | UpdateSearchTerm) => {
    if (editingTerm) {
      updateMutation.mutate({ id: editingTerm.id, data });
    } else {
      createMutation.mutate(data as CreateSearchTerm);
    }
  };

  const handleEdit = (searchTerm: SearchTerm) => {
    setEditingTerm(searchTerm);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este termo de busca?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca executado';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatForTerm = (termId: string) => {
    return stats?.find(stat => stat.termoId === termId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Termos de Busca</h1>
          <p className="text-muted-foreground">
            Gerencie os termos utilizados para capturar leads no Google Maps
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTerm(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Termo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingTerm ? 'Editar Termo de Busca' : 'Novo Termo de Busca'}
              </DialogTitle>
            </DialogHeader>
            <SearchTermForm
              searchTerm={editingTerm || undefined}
              onSubmit={handleSubmit}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <StatsCards stats={stats} />

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar termos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categorias?.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={ativoFilter} onValueChange={setAtivoFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Ativos</SelectItem>
                <SelectItem value="false">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Termo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Última Execução</TableHead>
                <TableHead className="w-[70px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-28 rounded"></div>
                    </TableCell>
                    <TableCell>
                      <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : searchTerms?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum termo de busca encontrado
                  </TableCell>
                </TableRow>
              ) : (
                searchTerms?.items.map((term) => {
                  const stat = getStatForTerm(term.id);
                  return (
                    <TableRow key={term.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{term.termo}</div>
                          {term.descricao && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {term.descricao}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{term.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={term.ativo ? 'default' : 'secondary'}>
                          {term.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {stat ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">{stat.leadsGerados}</span> leads
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {(stat.taxaSucesso * 100).toFixed(1)}% sucesso
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sem dados</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(stat?.ultimaExecucao)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(term)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(term.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginação */}
      {searchTerms && searchTerms.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {searchTerms.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= searchTerms.totalPages}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}