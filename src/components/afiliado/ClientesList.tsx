/**
 * Task 3.2 - Componente Listagem de Clientes do Afiliado
 * Mostra todos os clientes indicados pelo afiliado
 */

import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download } from 'lucide-react';

interface ClienteIndicado {
  clienteId: string;
  nomeEmpresa: string;
  dataRegistro: string;
  statusAssinatura: 'ATIVA' | 'CANCELADA' | 'TRIAL';
  valorAssinatura: number;
  plano: string;
  comissaoGerada: number;
}

interface ClientesListProps {
  affiliateId: string;
}

export const ClientesList: React.FC<ClientesListProps> = ({ affiliateId }) => {
  const [clientes, setClientes] = useState<ClienteIndicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
  }, [affiliateId, filtroStatus]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroStatus) params.append('status', filtroStatus);

      const response = await fetch(
        `/api/v1/afiliados/${affiliateId}/clientes?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(
    (cliente) =>
      cliente.nomeEmpresa.toLowerCase().includes(search.toLowerCase()) ||
      cliente.clienteId.includes(search)
  );

  const exportarCSV = () => {
    const csv = [
      ['Nome Empresa', 'Status', 'Valor Assinatura', 'Comissão Gerada', 'Data Registro'].join(','),
      ...clientesFiltrados.map((c) =>
        [
          c.nomeEmpresa,
          c.statusAssinatura,
          `R$ ${(c.valorAssinatura / 100).toFixed(2)}`,
          `R$ ${(c.comissaoGerada / 100).toFixed(2)}`,
          new Date(c.dataRegistro).toLocaleDateString('pt-BR'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clientes_afiliado_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      ATIVA: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800',
      TRIAL: 'bg-blue-100 text-blue-800',
    };
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clientes Indicados ({clientesFiltrados.length})</span>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Barra de Busca e Filtro */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar empresa ou ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={18} />
              Filtros
            </button>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex gap-2">
            {['ATIVA', 'CANCELADA', 'TRIAL'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(filtroStatus === status ? null : status)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filtroStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Nenhum cliente encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead className="text-right">Valor Assinatura</TableHead>
                  <TableHead className="text-right">Comissão</TableHead>
                  <TableHead>Data Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.clienteId}>
                    <TableCell className="font-medium">{cliente.nomeEmpresa}</TableCell>
                    <TableCell>{getStatusBadge(cliente.statusAssinatura)}</TableCell>
                    <TableCell>{cliente.plano}</TableCell>
                    <TableCell className="text-right">
                      R$ {(cliente.valorAssinatura / 100).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      R$ {(cliente.comissaoGerada / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{new Date(cliente.dataRegistro).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClientesList;
