import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff
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
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api/client';
import type { User, CreateUserRequest, UpdateUserRequest } from '@/lib/api/schemas';

const createUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  role: z.enum(['admin', 'org_admin', 'agent', 'viewer', 'user']),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const updateUserSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  role: z.enum(['admin', 'org_admin', 'agent', 'viewer', 'user']).optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type UpdateUserForm = z.infer<typeof updateUserSchema>;

const roleLabels = {
  admin: 'Administrador',
  org_admin: 'Admin da Organização',
  agent: 'Agente',
  viewer: 'Visualizador',
  user: 'Usuário',
};

const roleColors = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  org_admin: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  agent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  // Fetch users with filters
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['users', currentPage, searchTerm, roleFilter],
    queryFn: () => apiClient.getUsers({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      role: roleFilter || undefined,
    }),
  });

  // Create user form
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
    reset: resetCreateForm,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  });

  // Update user form
  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: updateErrors, isSubmitting: isUpdating },
    reset: resetUpdateForm,
    setValue: setUpdateValue,
  } = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetCreateForm();
      setCreateDialogOpen(false);
      toast({
        title: "Usuário criado",
        description: "Novo usuário foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário.",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => 
      apiClient.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      resetUpdateForm();
      setEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "Usuário atualizado",
        description: "Dados do usuário foram atualizados com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Usuário removido",
        description: "Usuário foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover usuário",
        description: error.message || "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    },
  });

  // Activate/Deactivate user mutations
  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, activate }: { id: string; activate: boolean }) =>
      activate ? apiClient.activateUser(id) : apiClient.deactivateUser(id),
    onSuccess: (_, { activate }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: activate ? "Usuário ativado" : "Usuário desativado",
        description: `Usuário foi ${activate ? 'ativado' : 'desativado'} com sucesso.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro ao alterar o status do usuário.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => apiClient.resetUserPassword(id),
    onSuccess: (data) => {
      setResetPasswordUser(null);
      toast({
        title: "Senha resetada",
        description: `Nova senha temporária: ${data.temporaryPassword}`,
        duration: 10000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Ocorreu um erro ao resetar a senha.",
        variant: "destructive",
      });
    },
  });

  const onCreateUser = async (data: CreateUserForm) => {
    createUserMutation.mutate(data as CreateUserRequest);
  };

  const onUpdateUser = async (data: UpdateUserForm) => {
    if (!editingUser) return;
    updateUserMutation.mutate({ id: editingUser.id, data: data as UpdateUserRequest });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUpdateValue('nome', user.nome || '');
    setUpdateValue('email', user.email || '');
    setUpdateValue('telefone', user.telefone || '');
    setUpdateValue('cargo', user.cargo || '');
    setUpdateValue('role', user.role || 'user');
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    const activate = !user.ativo;
    toggleUserStatusMutation.mutate({ id: user.id, activate });
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user);
  };

  const confirmResetPassword = () => {
    if (resetPasswordUser) {
      resetPasswordMutation.mutate(resetPasswordUser.id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar usuários. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-muted-foreground">
              Gerencie usuários, permissões e acesso ao sistema
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário ao sistema
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmitCreate(onCreateUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="create-nome">Nome Completo</Label>
                    <Input
                      id="create-nome"
                      {...registerCreate('nome')}
                      className={createErrors.nome ? 'border-destructive' : ''}
                    />
                    {createErrors.nome && (
                      <p className="text-sm text-destructive">{createErrors.nome.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="create-telefone">Telefone</Label>
                    <Input
                      id="create-telefone"
                      {...registerCreate('telefone')}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-cargo">Cargo</Label>
                    <Input
                      id="create-cargo"
                      {...registerCreate('cargo')}
                      placeholder="Ex: Gerente"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="create-role">Função</Label>
                    <Select onValueChange={(value) => registerCreate('role').onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createErrors.role && (
                      <p className="text-sm text-destructive">{createErrors.role.message}</p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="create-password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="create-password"
                        type={showPassword ? 'text' : 'password'}
                        {...registerCreate('password')}
                        className={createErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {createErrors.password && (
                      <p className="text-sm text-destructive">{createErrors.password.message}</p>
                    )}
                  </div>
                </div>

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
                      'Criar Usuário'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Filtre usuários por nome, email ou função
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as funções</SelectItem>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Usuários ({usersData?.total || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData?.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.nome || user.name || 'Nome não informado'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.cargo && (
                          <div className="text-xs text-muted-foreground">{user.cargo}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={roleColors[user.role || 'user']}
                      >
                        {user.role === 'admin' && <ShieldCheck className="mr-1 h-3 w-3" />}
                        {user.role === 'org_admin' && <ShieldAlert className="mr-1 h-3 w-3" />}
                        {roleLabels[user.role || 'user']}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.ativo ? 'default' : 'destructive'}>
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.ultimoLogin ? 
                          new Date(user.ultimoLogin).toLocaleString('pt-BR') : 
                          'Nunca'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.createdAt ? 
                          new Date(user.createdAt).toLocaleDateString('pt-BR') : 
                          'N/A'
                        }
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
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                            {user.ativo ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <Key className="mr-2 h-4 w-4" />
                            Resetar Senha
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
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

            {(!usersData?.items || usersData.items.length === 0) && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Nenhum usuário encontrado</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm || roleFilter ? 
                    'Tente ajustar os filtros.' : 
                    'Comece criando um novo usuário.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize as informações do usuário
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmitUpdate(onUpdateUser)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="update-nome">Nome Completo</Label>
                  <Input
                    id="update-nome"
                    {...registerUpdate('nome')}
                    className={updateErrors.nome ? 'border-destructive' : ''}
                  />
                  {updateErrors.nome && (
                    <p className="text-sm text-destructive">{updateErrors.nome.message}</p>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="update-email">Email</Label>
                  <Input
                    id="update-email"
                    type="email"
                    {...registerUpdate('email')}
                    className={updateErrors.email ? 'border-destructive' : ''}
                  />
                  {updateErrors.email && (
                    <p className="text-sm text-destructive">{updateErrors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-telefone">Telefone</Label>
                  <Input
                    id="update-telefone"
                    {...registerUpdate('telefone')}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-cargo">Cargo</Label>
                  <Input
                    id="update-cargo"
                    {...registerUpdate('cargo')}
                    placeholder="Ex: Gerente"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="update-role">Função</Label>
                  <Select 
                    value={editingUser?.role || 'user'}
                    onValueChange={(value) => setUpdateValue('role', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {updateErrors.role && (
                    <p className="text-sm text-destructive">{updateErrors.role.message}</p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reset Password Confirmation Dialog */}
        <Dialog 
          open={!!resetPasswordUser} 
          onOpenChange={() => setResetPasswordUser(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetar Senha</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja resetar a senha de {resetPasswordUser?.nome || resetPasswordUser?.email}?
                Uma nova senha temporária será gerada.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordUser(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmResetPassword} disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetando...
                  </>
                ) : (
                  'Resetar Senha'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}