/**
 * Task 3.4 - Componente Formulário de Perfil do Afiliado
 * Permite edição de dados pessoais e configurações de afiliação
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface PerfilAfiliadoFormProps {
  affiliateId: string;
}

interface PerfilData {
  email: string;
  nome: string;
  cpf_cnpj: string;
  cep: string;
  telefone: string;
  renda_anual: number;
  tipo_plano: 'ISENTO' | 'MENSALIDADE';
  split_percentual: number;
}

export const PerfilAfiliadoForm: React.FC<PerfilAfiliadoFormProps> = ({ affiliateId }) => {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPerfil();
  }, [affiliateId]);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/afiliados/${affiliateId}/perfil`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPerfil(data);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (perfil) {
      setPerfil({
        ...perfil,
        [name]: name === 'renda_anual' || name === 'split_percentual' ? parseFloat(value) : value,
      });
      // Limpar erro do campo
      if (errors[name]) {
        setErrors({ ...errors, [name]: '' });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!perfil?.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(perfil.email)) newErrors.email = 'Email inválido';

    if (!perfil?.nome) newErrors.nome = 'Nome é obrigatório';

    if (!perfil?.cpf_cnpj) newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
    else if (!/^\d{11,14}$/.test(perfil.cpf_cnpj.replace(/\D/g, '')))
      newErrors.cpf_cnpj = 'CPF/CNPJ inválido';

    if (!perfil?.cep) newErrors.cep = 'CEP é obrigatório';
    else if (!/^\d{5}(-?\d{3})?$/.test(perfil.cep)) newErrors.cep = 'CEP inválido';

    if (!perfil?.renda_anual || perfil.renda_anual < 5000) {
      newErrors.renda_anual = 'Renda anual mínima: R$ 5.000';
    }

    if (perfil?.split_percentual === undefined || perfil.split_percentual < 0 || perfil.split_percentual > 100) {
      newErrors.split_percentual = 'Percentual deve estar entre 0 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !perfil) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/v1/afiliados/${affiliateId}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(perfil),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!perfil) return <div className="p-8">Erro ao carregar perfil</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagens */}
          {message && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Seção: Dados Pessoais */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={perfil.email}
                  onChange={handleChange}
                  disabled
                  className="bg-gray-100"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <Input
                  type="text"
                  name="nome"
                  value={perfil.nome}
                  onChange={handleChange}
                  placeholder="João Silva"
                />
                {errors.nome && <p className="text-red-600 text-sm mt-1">{errors.nome}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CPF/CNPJ</label>
                <Input
                  type="text"
                  name="cpf_cnpj"
                  value={perfil.cpf_cnpj}
                  onChange={handleChange}
                  placeholder="12345678901"
                  disabled
                  className="bg-gray-100"
                />
                {errors.cpf_cnpj && <p className="text-red-600 text-sm mt-1">{errors.cpf_cnpj}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input
                  type="tel"
                  name="telefone"
                  value={perfil.telefone}
                  onChange={handleChange}
                  placeholder="11 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">CEP</label>
                <Input
                  type="text"
                  name="cep"
                  value={perfil.cep}
                  onChange={handleChange}
                  placeholder="01310-100"
                />
                {errors.cep && <p className="text-red-600 text-sm mt-1">{errors.cep}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Renda Anual Estimada</label>
                <Input
                  type="number"
                  name="renda_anual"
                  value={perfil.renda_anual}
                  onChange={handleChange}
                  placeholder="50000"
                  step="1000"
                />
                {errors.renda_anual && <p className="text-red-600 text-sm mt-1">{errors.renda_anual}</p>}
              </div>
            </div>
          </div>

          {/* Seção: Configuração de Afiliação */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Configuração de Afiliação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Plano</label>
                <select
                  name="tipo_plano"
                  value={perfil.tipo_plano}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                >
                  <option value="ISENTO">Isento (Sem mensalidade)</option>
                  <option value="MENSALIDADE">Mensalidade (R$ 9.90/mês)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Percentual de Comissão (%)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="range"
                    name="split_percentual"
                    min="0"
                    max="100"
                    step="1"
                    value={perfil.split_percentual}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <span className="text-lg font-semibold w-12">{perfil.split_percentual}%</span>
                </div>
                {errors.split_percentual && (
                  <p className="text-red-600 text-sm mt-1">{errors.split_percentual}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Você receberá {perfil.split_percentual}% de cada venda indicada
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={saving} className="px-6">
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={fetchPerfil}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PerfilAfiliadoForm;
