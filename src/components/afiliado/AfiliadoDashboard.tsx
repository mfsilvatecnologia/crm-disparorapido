/**
 * Task 3.1 - Componente Dashboard de Afiliado (CRM)
 * Página principal de afiliado com métricas e ações rápidas
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CopyIcon, ExternalLinkIcon } from 'lucide-react';

interface AfiliadoDashboardProps {
  affiliateId: string;
}

interface Metricas {
  totalClientesIndicados: number;
  totalClientesAtivos: number;
  totalComissoesPendentes: number;
  totalComissoesRecebidas: number;
  percentualComissao: number;
  taxaConversao: number;
  affiliate_link: string;
  diasAtivo: number;
}

export const AfiliadoDashboard: React.FC<AfiliadoDashboardProps> = ({ affiliateId }) => {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMetricas();
  }, [affiliateId]);

  const fetchMetricas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/afiliados/${affiliateId}/metricas`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMetricas(data);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (metricas?.affiliate_link) {
      navigator.clipboard.writeText(metricas.affiliate_link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!metricas) return <div className="p-8">Erro ao carregar métricas</div>;

  const metricasCards = [
    {
      title: 'Clientes Indicados',
      value: metricas.totalClientesIndicados,
      subtitle: `${metricas.totalClientesAtivos} ativos`,
      color: 'bg-blue-500',
    },
    {
      title: 'Comissões Pendentes',
      value: `R$ ${(metricas.totalComissoesPendentes / 100).toFixed(2)}`,
      subtitle: 'Aguardando repasse',
      color: 'bg-yellow-500',
    },
    {
      title: 'Comissões Recebidas',
      value: `R$ ${(metricas.totalComissoesRecebidas / 100).toFixed(2)}`,
      subtitle: `Percentual: ${metricas.percentualComissao}%`,
      color: 'bg-green-500',
    },
    {
      title: 'Taxa de Conversão',
      value: `${metricas.taxaConversao.toFixed(1)}%`,
      subtitle: `Ativo há ${metricas.diasAtivo} dias`,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header com Link de Afiliação */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">Dashboard de Afiliado</h1>
        <div className="bg-white/20 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Seu Link de Afiliação</p>
            <code className="text-lg font-mono break-all">{metricas.affiliate_link}</code>
          </div>
          <button
            onClick={copyLink}
            className="ml-4 px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50 flex items-center gap-2"
          >
            <CopyIcon size={18} />
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricasCards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`${card.color} text-white p-4 rounded-lg text-center`}>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-sm opacity-90 mt-2">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Clientes nos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{ day: 'Sem 1', clientes: 2 }, { day: 'Sem 2', clientes: 5 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="clientes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comissões Acumuladas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[{ day: 'Seg', comissoes: 100 }, { day: 'Ter', comissoes: 250 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="comissoes" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Ver Comissões Detalhadas
        </button>
        <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Solicitar Repasse
        </button>
        <button className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Editar Perfil
        </button>
      </div>
    </div>
  );
};

export default AfiliadoDashboard;
