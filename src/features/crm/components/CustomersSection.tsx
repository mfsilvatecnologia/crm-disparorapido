import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Search,
  Filter,
  Download,
  Plus,
  Building2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { useCustomers } from '@/features/customers/api/customers';

interface CustomersSectionProps {
  searchTerm?: string;
}

export function CustomersSection({ searchTerm: externalSearchTerm }: CustomersSectionProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Buscar dados reais da API
  const { data, isLoading, fetchNextPage, hasNextPage } = useCustomers({
    search: searchTerm,
    status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
  });

  // Flatten paginated data
  const customers = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: { label: 'Ativo', className: 'bg-green-100 text-green-700 border-green-300' },
      inativo: { label: 'Inativo', className: 'bg-gray-100 text-gray-700 border-gray-300' },
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      active: { label: 'Ativo', className: 'bg-green-100 text-green-700 border-green-300' },
      inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-700 border-gray-300' },
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' }
    };
    const variant = variants[status as keyof typeof variants] || variants.ativo;
    return (
      <Badge variant="outline" className={`${variant.className} font-medium text-xs`}>
        {variant.label}
      </Badge>
    );
  };

  if (isLoading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
            placeholder="Buscar clientes..."
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
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex items-center gap-2">
        {['all', 'active', 'inactive', 'pending'].map((status) => (
          <Badge
            key={status}
            variant={selectedStatus === status ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedStatus(status)}
          >
            {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : 'Pendentes'}
          </Badge>
        ))}
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <Card
            key={customer.id}
            className="border-2 border-green-200 bg-green-50/30 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => navigate(`/app/crm/customers/${customer.id}`)}
          >
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-green-100">
                    <AvatarImage src={`https://avatar.vercel.sh/${customer.nome}`} />
                    <AvatarFallback className="bg-gradient-to-br from-green-100 to-green-200 text-green-700 text-sm font-semibold">
                      {customer.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {customer.nome}
                    </h3>
                    {customer.segmento && (
                      <p className="text-sm text-gray-600">{customer.segmento}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              {/* Status e Cliente Desde */}
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(customer.status)}
                <div className="text-xs text-gray-600">
                  Cliente desde {new Date(customer.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Informações de Contato */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                {customer.email && (
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{customer.telefone}</span>
                  </div>
                )}
                {customer.cnpj && (
                  <div className="flex items-center gap-2 text-xs">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>CNPJ: {customer.cnpj}</span>
                  </div>
                )}
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-1 gap-3 mb-4 pt-4 border-t border-gray-200">
                {customer.healthScore !== null && (
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-bold text-green-600">
                        {customer.healthScore}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Health Score</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/crm/customers/${customer.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/crm/contracts?customerId=${customer.id}`);
                  }}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Contratos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado Vazio */}
      {customers.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mb-4">
            Comece convertendo oportunidades em clientes.
          </p>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      )}
    </div>
  );
}
