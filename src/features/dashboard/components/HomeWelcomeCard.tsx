import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useTenant } from '@/shared/contexts/TenantContext';

export function HomeWelcomeCard() {
  const navigate = useNavigate();
  const { tenant } = useTenant();

  const features = [
    'Gestão completa de leads',
    'Automação de campanhas',
    'Análise em tempo real',
    'Integração com múltiplos canais',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center">
            <img
              src={tenant.branding.logoLight || tenant.branding.logo}
              alt={tenant.branding.companyName}
              className="h-16 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Bem-vindo ao {tenant.branding.companyName}!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              A plataforma completa para gerenciar seus leads e campanhas
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pb-8">
          {/* Features List */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Comece agora</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Escolha o plano ideal para sua empresa e comece a gerenciar seus leads com eficiência
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => navigate('/app/pricing')}
                className="flex-1 gap-2"
              >
                Explorar Planos
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/app/leads')}
                className="flex-1"
              >
                Ver Leads
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Rápido</h4>
              <p className="text-sm text-blue-700">
                Configure suas campanhas em minutos
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <h4 className="font-semibold text-green-900 mb-2">💡 Inteligente</h4>
              <p className="text-sm text-green-700">
                IA integrada para melhorar resultados
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h4 className="font-semibold text-purple-900 mb-2">📊 Analytics</h4>
              <p className="text-sm text-purple-700">
                Dados em tempo real e insights
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h4 className="font-semibold text-orange-900 mb-2">🔗 Integrado</h4>
              <p className="text-sm text-orange-700">
                Conecte com suas ferramentas favoritas
              </p>
            </div>
          </div>

          {/* Support Text */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            <p>
              Dúvidas? Entre em contato conosco em{' '}
              <a
                href={`mailto:${tenant.branding.supportEmail}`}
                className="text-primary font-semibold hover:underline"
              >
                {tenant.branding.supportEmail}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
