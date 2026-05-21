/**
 * Task 3.3 - Componente Histórico de Comissões
 * Mostra todas as comissões do afiliado com status de repasse
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Comissao {
  id: string;
  clienteId: string;
  nomeEmpresa: string;
  valor: number;
  percentual: number;
  dataGeracao: string;
  status: 'PENDENTE' | 'PROCESSADA' | 'REPASSE_REALIZADO' | 'FALHA';
  dataRepasse?: string;
  motivo?: string;
}

interface ComissoesListProps {
  affiliateId: string;
}

export const ComissoesList: React.FC<ComissoesListProps> = ({ affiliateId }) => {
  const [comissoes, setComissoes] = useState<Comissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchComissoes();
  }, [affiliateId, filtroStatus]);

  const fetchComissoes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroStatus) params.append('status', filtroStatus);

      const response = await fetch(
        `/api/v1/afiliados/${affiliateId}/comissoes?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setComissoes(data);
      }
    } catch (error) {
      console.error('Erro ao buscar comissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'REPASSE_REALIZADO':
        return <CheckCircle className="text-green-500" size={18} />;
      case 'PENDENTE':
        return <Clock className="text-yellow-500" size={18} />;
      case 'FALHA':
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Clock className="text-blue-500" size={18} />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: 'bg-yellow-100 text-yellow-800',
      PROCESSADA: 'bg-blue-100 text-blue-800',
      REPASSE_REALIZADO: 'bg-green-100 text-green-800',
      FALHA: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalPendente = comissoes
    .filter((c) => c.status === 'PENDENTE')
    .reduce((acc, c) => acc + c.valor, 0);

  const totalRecebido = comissoes
    .filter((c) => c.status === 'REPASSE_REALIZADO')
    .reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Comissões Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">R$ {(totalPendente / 100).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Comissões Recebidas</p>
              <p className="text-2xl font-bold text-green-600">R$ {(totalRecebido / 100).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Total</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {((totalPendente + totalRecebido) / 100).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Comissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            {['PENDENTE', 'PROCESSADA', 'REPASSE_REALIZADO', 'FALHA'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(filtroStatus === status ? null : status)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filtroStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          {/* Tabela */}
          {loading ? (
            <div className="p-4 text-center">Carregando...</div>
          ) : comissoes.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Nenhuma comissão encontrada</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Geração</TableHead>
                    <TableHead>Data Repasse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comissoes.map((comissao) => (
                    <TableRow key={comissao.id}>
                      <TableCell className="font-medium">{comissao.nomeEmpresa}</TableCell>
                      <TableCell className="text-right font-semibold">
                        R$ {(comissao.valor / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>{comissao.percentual}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(comissao.status)}
                          <Badge className={getStatusColor(comissao.status)}>
                            {comissao.status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(comissao.dataGeracao).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        {comissao.dataRepasse
                          ? new Date(comissao.dataRepasse).toLocaleDateString('pt-BR')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aviso de Comissões Falhas */}
      {comissoes.some((c) => c.status === 'FALHA') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Atenção: Comissões com Falha</h3>
          <p className="text-red-700 text-sm mb-4">
            Algumas comissões falharam ao ser repassadas. Entre em contato com o suporte para resolver.
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Contactar Suporte
          </button>
        </div>
      )}
    </div>
  );
};

export default ComissoesList;
