import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  FileText,
  MapPin,
  Mail,
  Phone,
  Loader2,
  Building,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { apiClient } from '@/lib/api/client';
import type { Empresa, CreateEmpresaDTO } from '@/lib/api/schemas';

const createEmpresaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos').max(18, 'CNPJ inválido'),
  email: z.string().email('Email inválido'),
  segmento: z.string().optional(),
  volume_auditorias_mensal: z.string().optional(),
  recursos_interesse: z.array(z.string()).optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

const updateEmpresaSchema = createEmpresaSchema;

type CreateEmpresaForm = z.infer<typeof createEmpresaSchema>;
type UpdateEmpresaForm = z.infer<typeof updateEmpresaSchema>;

const segmentosDisponiveis = [
  'Tecnologia',
  'Saúde', 
  'Educação',
  'Financeiro',
  'Varejo',
  'Manufatura',
  'Serviços',
  'Consultoria',
  'Agronegócio',
  'Outros'
];

const recursosDisponiveis = [
  'Auditoria Interna',
  'Consultoria Fiscal',
  'Compliance',
  'Due Diligence',
  'Gestão de Riscos',
  'Auditoria Externa',
  'Controladoria',
  'Governança Corporativa'
];

export default function EmpresasPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentoFilter, setSegmentoFilter] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [viewingEmpresa, setViewingEmpresa] = useState<Empresa | null>(null);

  // Fetch empresas
  const { data: empresasData, isLoading, error } = useQuery({
    queryKey: ['empresas', currentPage, searchTerm, segmentoFilter],
    queryFn: () => apiClient.getEmpresas({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      segmento: segmentoFilter || undefined,
    }),
  });

  // Stats query
  const { data: stats } = useQuery({
    queryKey: ['empresas', 'stats'],
    queryFn: () => apiClient.getEmpresasStats(),
  });

  // Create empresa form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreateForm,
    watch: watchCreate,
    setValue: setCreateValue,
  } = useForm<CreateEmpresaForm>({
    resolver: zodResolver(createEmpresaSchema),
  });

  // Update empresa form
  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
    reset: resetUpdateForm,
    setValue: setUpdateValue,
    watch: watchUpdate,
  } = useForm<UpdateEmpresaForm>({
    resolver: zodResolver(updateEmpresaSchema),
  });

  // Create empresa mutation
  const createEmpresaMutation = useMutation({
    mutationFn: (data: CreateEmpresaDTO) => apiClient.createEmpresa(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      resetCreateForm();
      setCreateDialogOpen(false);
      toast({
        title: "Empresa criada",
        description: "Nova empresa foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar empresa",
        description: error.message || "Ocorreu um erro ao criar a empresa.",
        variant: "destructive",
      });
    },
  });

  // Update empresa mutation
  const updateEmpresaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateEmpresaDTO }) => 
      apiClient.updateEmpresa(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      resetUpdateForm();
      setEditDialogOpen(false);
      setEditingEmpresa(null);
      toast({
        title: "Empresa atualizada",
        description: "Dados da empresa foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar empresa",
        description: error.message || "Ocorreu um erro ao atualizar a empresa.",
        variant: "destructive",
      });
    },
  });

  // Delete empresa mutation
  const deleteEmpresaMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteEmpresa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas'] });
      toast({
        title: "Empresa removida",
        description: "Empresa foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover empresa",
        description: error.message || "Ocorreu um erro ao remover a empresa.",
        variant: "destructive",
      });
    },
  });

  const onCreateEmpresa = async (data: CreateEmpresaForm) => {
    createEmpresaMutation.mutate(data as CreateEmpresaDTO);
  };

  const onUpdateEmpresa = async (data: UpdateEmpresaForm) => {
    if (!editingEmpresa) return;
    updateEmpresaMutation.mutate({ id: editingEmpresa.id, data: data as CreateEmpresaDTO });
  };

  const handleEditEmpresa = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setUpdateValue('nome', empresa.nome);
    setUpdateValue('cnpj', empresa.cnpj);
    setUpdateValue('email', empresa.email);
    setUpdateValue('segmento', empresa.segmento || '');
    setUpdateValue('volume_auditorias_mensal', empresa.volume_auditorias_mensal || '');
    setUpdateValue('recursos_interesse', empresa.recursos_interesse || []);
    setUpdateValue('rua', empresa.rua || '');
    setUpdateValue('numero', empresa.numero || '');
    setUpdateValue('bairro', empresa.bairro || '');
    setUpdateValue('cidade', empresa.cidade || '');
    setUpdateValue('estado', empresa.estado || '');
    setUpdateValue('cep', empresa.cep || '');
    setEditDialogOpen(true);
  };

  const handleViewEmpresa = (empresa: Empresa) => {
    setViewingEmpresa(empresa);
    setViewDialogOpen(true);
  };

  const handleDeleteEmpresa = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja remover a empresa "${nome}"?`)) {
      deleteEmpresaMutation.mutate(id);
    }
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (cep: string) => {
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  if (isLoading) {
    return <LoadingState message="Carregando empresas..." />;
  }

  if (error) {
    return (
      <ErrorState 
        title="Erro ao carregar empresas"
        message="Não foi possível carregar a lista de empresas"
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['empresas'] })}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Gestão de Empresas
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua base de empresas prospect e clientes
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Empresa</DialogTitle>
              <DialogDescription>
                Adicione uma nova empresa ao sistema
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitCreate(onCreateEmpresa)} className="space-y-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="business">Negócio</TabsTrigger>
                  <TabsTrigger value="address">Endereço</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="create-nome">Nome da Empresa</Label>
                      <Input
                        id="create-nome"
                        {...registerCreate('nome')}
                        className={createErrors.nome ? 'border-destructive' : ''}
                      />
                      {createErrors.nome && (
                        <p className="text-sm text-destructive">{createErrors.nome.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-cnpj">CNPJ</Label>
                      <Input
                        id="create-cnpj"
                        {...registerCreate('cnpj')}
                        placeholder="00.000.000/0000-00"
                        className={createErrors.cnpj ? 'border-destructive' : ''}
                      />
                      {createErrors.cnpj && (
                        <p className="text-sm text-destructive">{createErrors.cnpj.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-email">Email</Label>
                      <Input
                        id="create-email"
                        type="email"
                        {...registerCreate('email')}
                        className={createErrors.email ? 'border-destructive' : ''}
                      />
                      {createErrors.email && (
                        <p className="text-sm text-destructive">{createErrors.email.message}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-segmento">Segmento</Label>
                      <Select onValueChange={(value) => setCreateValue('segmento', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o segmento" />
                        </SelectTrigger>
                        <SelectContent>
                          {segmentosDisponiveis.map((segmento) => (
                            <SelectItem key={segmento} value={segmento}>
                              {segmento}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-volume">Volume Mensal de Auditorias</Label>
                      <Select onValueChange={(value) => setCreateValue('volume_auditorias_mensal', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o volume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 auditorias</SelectItem>
                          <SelectItem value="6-10">6-10 auditorias</SelectItem>
                          <SelectItem value="11-20">11-20 auditorias</SelectItem>
                          <SelectItem value="20+">20+ auditorias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Recursos de Interesse</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {recursosDisponiveis.map((recurso) => (
                        <div key={recurso} className="flex items-center space-x-2">
                          <Checkbox
                            id={`create-${recurso}`}
                            onCheckedChange={(checked) => {
                              const current = watchCreate('recursos_interesse') || [];
                              if (checked) {
                                setCreateValue('recursos_interesse', [...current, recurso]);
                              } else {
                                setCreateValue('recursos_interesse', current.filter(r => r !== recurso));
                              }
                            }}
                          />
                          <Label 
                            htmlFor={`create-${recurso}`} 
                            className="text-sm font-normal"
                          >
                            {recurso}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="create-rua">Rua</Label>
                      <Input
                        id="create-rua"
                        {...registerCreate('rua')}
                        placeholder="Nome da rua"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-numero">Número</Label>
                      <Input
                        id="create-numero"
                        {...registerCreate('numero')}
                        placeholder="123"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-bairro">Bairro</Label>
                      <Input
                        id="create-bairro"
                        {...registerCreate('bairro')}
                        placeholder="Nome do bairro"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-cidade">Cidade</Label>
                      <Input
                        id="create-cidade"
                        {...registerCreate('cidade')}
                        placeholder="Nome da cidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-estado">Estado</Label>
                      <Select onValueChange={(value) => setCreateValue('estado', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="AL">AL</SelectItem>
                          <SelectItem value="AP">AP</SelectItem>
                          <SelectItem value="AM">AM</SelectItem>
                          <SelectItem value="BA">BA</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="DF">DF</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                          <SelectItem value="GO">GO</SelectItem>
                          <SelectItem value="MA">MA</SelectItem>
                          <SelectItem value="MT">MT</SelectItem>
                          <SelectItem value="MS">MS</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PB">PB</SelectItem>
                          <SelectItem value="PR">PR</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                          <SelectItem value="PI">PI</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="RN">RN</SelectItem>
                          <SelectItem value="RS">RS</SelectItem>
                          <SelectItem value="RO">RO</SelectItem>
                          <SelectItem value="RR">RR</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="SE">SE</SelectItem>
                          <SelectItem value="TO">TO</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="create-cep">CEP</Label>
                      <Input
                        id="create-cep"
                        {...registerCreate('cep')}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Empresa'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Empresas</p>
                <p className="text-2xl font-bold">{stats?.total || empresasData?.total || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prospects Ativas</p>
                <p className="text-2xl font-bold">{stats?.prospects || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">{stats?.conversionRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Adicionadas Hoje</p>
                <p className="text-2xl font-bold">{stats?.today || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre empresas por nome, CNPJ ou segmento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={segmentoFilter} onValueChange={setSegmentoFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por segmento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os segmentos</SelectItem>
                {segmentosDisponiveis.map((segmento) => (
                  <SelectItem key={segmento} value={segmento}>
                    {segmento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Empresas Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Empresas ({empresasData?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Volume Mensal</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasData?.items?.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{empresa.nome}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {empresa.email}
                      </div>
                      {empresa.cidade && empresa.estado && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {empresa.cidade}, {empresa.estado}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm">{formatCNPJ(empresa.cnpj)}</code>
                  </TableCell>
                  <TableCell>
                    {empresa.segmento && (
                      <Badge variant="outline">
                        {empresa.segmento}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {empresa.volume_auditorias_mensal && (
                      <Badge variant="secondary">
                        {empresa.volume_auditorias_mensal}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(empresa.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewEmpresa(empresa)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEmpresa(empresa)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEmpresa(empresa.id, empresa.nome)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remover
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(!empresasData?.items || empresasData.items.length === 0) && (
            <EmptyState
              icon={Building2}
              title="Nenhuma empresa encontrada"
              description={
                searchTerm || segmentoFilter
                  ? 'Tente ajustar os filtros para encontrar empresas.'
                  : 'Comece adicionando sua primeira empresa ao sistema.'
              }
              action={{
                label: 'Nova Empresa',
                onClick: () => setCreateDialogOpen(true)
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* View Empresa Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {viewingEmpresa?.nome}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos da empresa
            </DialogDescription>
          </DialogHeader>

          {viewingEmpresa && (
            <div className="space-y-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="business">Negócio</TabsTrigger>
                  <TabsTrigger value="address">Endereço</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.nome}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">CNPJ</Label>
                      <p className="text-sm mt-1 font-mono">{formatCNPJ(viewingEmpresa.cnpj)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Data de Criação</Label>
                      <p className="text-sm mt-1">{new Date(viewingEmpresa.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Segmento</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.segmento || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Volume Mensal</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.volume_auditorias_mensal || 'Não informado'}</p>
                    </div>
                  </div>
                  
                  {viewingEmpresa.recursos_interesse && viewingEmpresa.recursos_interesse.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Recursos de Interesse</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {viewingEmpresa.recursos_interesse.map((recurso) => (
                          <Badge key={recurso} variant="secondary">
                            {recurso}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="address" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Rua</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.rua || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Número</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.numero || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Bairro</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.bairro || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Cidade</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.cidade || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Estado</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.estado || 'Não informado'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">CEP</Label>
                      <p className="text-sm mt-1">{viewingEmpresa.cep ? formatCEP(viewingEmpresa.cep) : 'Não informado'}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}