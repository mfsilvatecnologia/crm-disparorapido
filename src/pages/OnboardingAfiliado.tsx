/**
 * Task 3.5 - Página de Onboarding de Afiliado
 * Wizard com múltiplos passos para registro de novo afiliado
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle } from 'lucide-react';

type OnboardingStep = 'info' | 'dados' | 'plano' | 'confirmacao' | 'sucesso';

interface OnboardingData {
  email: string;
  senha: string;
  confirmSenha: string;
  nome: string;
  cpf_cnpj: string;
  cep: string;
  renda_anual: number;
  tipo_plano: 'ISENTO' | 'MENSALIDADE';
  split_percentual: number;
}

export const OnboardingAfiliado: React.FC = () => {
  const [step, setStep] = useState<OnboardingStep>('info');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    email: '',
    senha: '',
    confirmSenha: '',
    nome: '',
    cpf_cnpj: '',
    cep: '',
    renda_anual: 0,
    tipo_plano: 'MENSALIDADE',
    split_percentual: 30,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: name === 'renda_anual' || name === 'split_percentual' ? parseFloat(value) : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateStep = (currentStep: OnboardingStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 'info') {
      if (!data.email) newErrors.email = 'Email é obrigatório';
      else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Email inválido';

      if (!data.senha) newErrors.senha = 'Senha é obrigatória';
      else if (data.senha.length < 8) newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';

      if (data.confirmSenha !== data.senha) newErrors.confirmSenha = 'Senhas não coincidem';
    }

    if (currentStep === 'dados') {
      if (!data.nome) newErrors.nome = 'Nome é obrigatório';
      if (!data.cpf_cnpj) newErrors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
      else if (!/^\d{11,14}$/.test(data.cpf_cnpj.replace(/\D/g, '')))
        newErrors.cpf_cnpj = 'CPF/CNPJ inválido';

      if (!data.cep) newErrors.cep = 'CEP é obrigatório';
      else if (!/^\d{5}(-?\d{3})?$/.test(data.cep)) newErrors.cep = 'CEP inválido';

      if (!data.renda_anual || data.renda_anual < 5000) {
        newErrors.renda_anual = 'Renda anual mínima: R$ 5.000';
      }
    }

    if (currentStep === 'plano') {
      if (data.split_percentual < 0 || data.split_percentual > 100) {
        newErrors.split_percentual = 'Percentual deve estar entre 0 e 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = (nextStepName: OnboardingStep) => {
    if (validateStep(step)) {
      setStep(nextStepName);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('plano')) return;

    try {
      setLoading(true);
      const response = await fetch('/api/v1/afiliados/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessData(result.affiliate);
        setStep('sucesso');
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Erro ao registrar afiliado' });
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setErrors({ submit: 'Erro ao registrar afiliado' });
    } finally {
      setLoading(false);
    }
  };

  const steps = ['info', 'dados', 'plano', 'confirmacao', 'sucesso'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((s, idx) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    idx <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {idx + 1}
                </div>
                <span className="text-xs mt-2 text-gray-600">
                  {['Info', 'Dados', 'Plano', 'Confirmação', 'Pronto'][idx]}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${((currentStepIndex) / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === 'info' && 'Crie Sua Conta'}
              {step === 'dados' && 'Seus Dados'}
              {step === 'plano' && 'Escolha seu Plano'}
              {step === 'confirmacao' && 'Confirme seus Dados'}
              {step === 'sucesso' && 'Parabéns!'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Passo 1: Informações de Login */}
            {step === 'info' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">
                  Crie sua conta para começar a ganhar comissões indicando clientes.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={data.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Senha</label>
                  <Input
                    type="password"
                    name="senha"
                    value={data.senha}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errors.senha && <p className="text-red-600 text-sm mt-1">{errors.senha}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirme a Senha</label>
                  <Input
                    type="password"
                    name="confirmSenha"
                    value={data.confirmSenha}
                    onChange={handleChange}
                    placeholder="Repita sua senha"
                  />
                  {errors.confirmSenha && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmSenha}</p>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => nextStep('dados')}
                    className="flex-1"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 2: Dados Pessoais */}
            {step === 'dados' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">Preencha seus dados pessoais.</p>

                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo</label>
                  <Input
                    type="text"
                    name="nome"
                    value={data.nome}
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
                    value={data.cpf_cnpj}
                    onChange={handleChange}
                    placeholder="12345678901"
                  />
                  {errors.cpf_cnpj && <p className="text-red-600 text-sm mt-1">{errors.cpf_cnpj}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">CEP</label>
                  <Input
                    type="text"
                    name="cep"
                    value={data.cep}
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
                    value={data.renda_anual}
                    onChange={handleChange}
                    placeholder="50000"
                    step="1000"
                  />
                  {errors.renda_anual && (
                    <p className="text-red-600 text-sm mt-1">{errors.renda_anual}</p>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={() => setStep('info')} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={() => nextStep('plano')} className="flex-1">
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 3: Escolha de Plano */}
            {step === 'plano' && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-6">Escolha o plano que melhor se adequa a você.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Plano Isento */}
                  <div
                    onClick={() => setData({ ...data, tipo_plano: 'ISENTO' })}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                      data.tipo_plano === 'ISENTO'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-lg mb-2">Plano Isento</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">Grátis</p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ Sem mensalidade</li>
                      <li>✓ Comissão automática</li>
                      <li>✓ Dashboard básico</li>
                    </ul>
                  </div>

                  {/* Plano Mensalidade */}
                  <div
                    onClick={() => setData({ ...data, tipo_plano: 'MENSALIDADE' })}
                    className={`p-6 rounded-lg border-2 cursor-pointer transition relative ${
                      data.tipo_plano === 'MENSALIDADE'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Recomendado
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Plano Mensalidade</h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">R$ 9,90<span className="text-sm">/mês</span></p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✓ Tudo do plano isento +</li>
                      <li>✓ Dashboard avançado</li>
                      <li>✓ Relatórios detalhados</li>
                      <li>✓ Suporte prioritário</li>
                    </ul>
                  </div>
                </div>

                {/* Percentual de Comissão */}
                <div>
                  <label className="block text-sm font-medium mb-2">Percentual de Comissão (%)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="split_percentual"
                      min="0"
                      max="100"
                      step="1"
                      value={data.split_percentual}
                      onChange={handleChange}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold w-16 text-center">{data.split_percentual}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Você receberá {data.split_percentual}% de cada venda indicada
                  </p>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" onClick={() => setStep('dados')} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={() => nextStep('confirmacao')} className="flex-1">
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 4: Confirmação */}
            {step === 'confirmacao' && (
              <div className="space-y-6">
                <p className="text-gray-600">Revise seus dados antes de confirmar o registro.</p>

                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{data.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nome</p>
                    <p className="font-medium">{data.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">CPF/CNPJ</p>
                    <p className="font-medium">{data.cpf_cnpj}</p>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600">Plano</p>
                    <p className="font-medium">
                      {data.tipo_plano === 'ISENTO' ? 'Isento' : 'Mensalidade (R$ 9,90/mês)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Comissão</p>
                    <p className="font-medium">{data.split_percentual}% por cliente indicado</p>
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                    <AlertCircle size={20} />
                    {errors.submit}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('plano')}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Registrando...' : 'Confirmar e Registrar'}
                  </Button>
                </div>
              </div>
            )}

            {/* Passo 5: Sucesso */}
            {step === 'sucesso' && successData && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={40} />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Registro Realizado!</h2>
                  <p className="text-gray-600">
                    Sua conta de afiliado foi criada com sucesso. Comece a indicar clientes agora!
                  </p>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Seu Link de Afiliação</p>
                  <code className="text-lg font-mono break-all text-blue-600">{successData.affiliate_link}</code>
                </div>

                <Button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="w-full"
                >
                  Ir para Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingAfiliado;
