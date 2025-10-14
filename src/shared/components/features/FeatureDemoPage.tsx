import React from 'react';
import { FeatureGuard, FeatureList } from '@/shared/hooks';
import { useFeatures } from '@/shared/hooks/useFeatures';
import { useTenant } from '@/shared/contexts/TenantContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Target, 
  Kanban, 
  BarChart3, 
  ShoppingCart, 
  CreditCard,
  Map,
  Activity
} from 'lucide-react';

/**
 * Demo page to showcase feature control system
 * This page demonstrates different aspects of the tenant-based feature system
 */
export function FeatureDemoPage() {
  const { tenant } = useTenant();
  const { 
    getEnabledFeatures, 
    getDisabledFeatures,
    canUseCampaigns,
    canUsePipeline,
    canUseAnalytics,
    canUseMarketplace
  } = useFeatures();

  const enabledCount = getEnabledFeatures().length;
  const disabledCount = getDisabledFeatures().length;

  return (
    <div className="space-y-6">
      {/* Header with tenant info */}
      <div className="bg-tenant-hero text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Sistema de Features - {tenant.branding.companyName}
        </h1>
        <p className="opacity-90">
          Esta página demonstra como as funcionalidades mudam baseado no tenant atual
        </p>
        <div className="flex gap-4 mt-4">
          <Badge variant="secondary">
            {enabledCount} features ativas
          </Badge>
          <Badge variant="destructive">
            {disabledCount} features desabilitadas
          </Badge>
        </div>
      </div>

      {/* Feature Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Always Available */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads & Empresas</CardTitle>
            <Badge className="ml-auto bg-green-500">Sempre Ativo</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Funcionalidades básicas disponíveis para todos os tenants
            </p>
          </CardContent>
        </Card>

        {/* Campaigns */}
        <FeatureGuard 
          feature="enableCampaigns"
          fallback={
            <Card className="opacity-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Target className="h-4 w-4 mr-2" />
                <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
                <Badge variant="destructive" className="ml-auto">Desabilitado</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Módulo de campanhas não disponível neste tenant
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Target className="h-4 w-4 mr-2 text-green-600" />
              <CardTitle className="text-sm font-medium">Campanhas</CardTitle>
              <Badge className="ml-auto bg-green-500">Ativo</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sistema completo de marketing automation
              </p>
            </CardContent>
          </Card>
        </FeatureGuard>

        {/* Pipeline */}
        <FeatureGuard 
          feature="enablePipeline"
          fallback={
            <Card className="opacity-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <Kanban className="h-4 w-4 mr-2" />
                <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
                <Badge variant="destructive" className="ml-auto">Desabilitado</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Funil de vendas não disponível neste tenant
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Kanban className="h-4 w-4 mr-2 text-green-600" />
              <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
              <Badge className="ml-auto bg-green-500">Ativo</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Gestão completa do funil de vendas
              </p>
            </CardContent>
          </Card>
        </FeatureGuard>

        {/* Analytics */}
        <FeatureGuard 
          feature="enableAnalytics"
          fallback={
            <Card className="opacity-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <BarChart3 className="h-4 w-4 mr-2" />
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <Badge variant="destructive" className="ml-auto">Desabilitado</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analytics avançado não disponível neste tenant
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <Badge className="ml-auto bg-green-500">Ativo</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Análises e segmentação avançada
              </p>
            </CardContent>
          </Card>
        </FeatureGuard>

        {/* Marketplace */}
        <FeatureGuard 
          feature="enableMarketplace"
          fallback={
            <Card className="opacity-50">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <ShoppingCart className="h-4 w-4 mr-2" />
                <CardTitle className="text-sm font-medium">Marketplace</CardTitle>
                <Badge variant="destructive" className="ml-auto">Desabilitado</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Marketplace de leads não disponível neste tenant
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="border-green-200">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <ShoppingCart className="h-4 w-4 mr-2 text-green-600" />
              <CardTitle className="text-sm font-medium">Marketplace</CardTitle>
              <Badge className="ml-auto bg-green-500">Ativo</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Compra de leads verificados
              </p>
            </CardContent>
          </Card>
        </FeatureGuard>

        {/* Scraping - Always enabled but shown for demo */}
        <Card className="border-green-200">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Map className="h-4 w-4 mr-2 text-green-600" />
            <CardTitle className="text-sm font-medium">Scraping</CardTitle>
            <Badge className="ml-auto bg-green-500">Ativo</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coleta automática de dados do Google Maps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Content Based on Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Advanced Features Section */}
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades Avançadas</CardTitle>
            <CardDescription>
              Conteúdo que muda baseado nas features disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            
            <FeatureGuard 
              features={['enableCampaigns', 'enableAnalytics']}
              fallback={
                <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                  <p className="text-sm text-gray-600">
                    Funcionalidades avançadas requerem Campanhas + Analytics
                  </p>
                </div>
              }
            >
              <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Marketing Intelligence Disponível
                </p>
                <p className="text-sm text-green-600">
                  Campanhas automatizadas com analytics em tempo real
                </p>
              </div>
            </FeatureGuard>

            <FeatureGuard 
              anyFeatures={['enablePipeline', 'enableMarketplace']}
              fallback={
                <div className="p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                  <p className="text-sm text-gray-600">
                    Ferramentas de vendas requerem Pipeline ou Marketplace
                  </p>
                </div>
              }
            >
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <p className="text-sm text-blue-800 font-medium">
                  ✅ Ferramentas de Vendas Disponíveis
                </p>
                <p className="text-sm text-blue-600">
                  {canUsePipeline && "Funil de vendas ativo"} 
                  {canUsePipeline && canUseMarketplace && " + "}
                  {canUseMarketplace && "Marketplace de leads ativo"}
                </p>
              </div>
            </FeatureGuard>

            {/* Show upgrade prompt if billing is disabled */}
            <FeatureGuard feature="enableBilling" not>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                <p className="text-sm text-orange-800 font-medium">
                  💡 Upgrade Disponível
                </p>
                <p className="text-sm text-orange-600">
                  Faça upgrade para acessar funcionalidades de cobrança
                </p>
              </div>
            </FeatureGuard>

          </CardContent>
        </Card>

        {/* Feature Status List */}
        <Card>
          <CardHeader>
            <CardTitle>Status Detalhado</CardTitle>
            <CardDescription>
              Lista completa de features por tenant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList className="text-sm" />
          </CardContent>
        </Card>

      </div>

      {/* Custom Render Example */}
      <Card>
        <CardHeader>
          <CardTitle>Render Condicional Avançado</CardTitle>
          <CardDescription>
            Exemplo de lógica complexa baseada em múltiplas features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureGuard 
            render={(features) => {
              if (features.canUseCampaigns && features.canUsePipeline && features.canUseAnalytics) {
                return (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <h3 className="font-semibold text-green-800">🚀 Plano Completo Ativo</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Todas as funcionalidades estão disponíveis. Você tem acesso completo à plataforma.
                    </p>
                  </div>
                );
              } else if (features.canUseCampaigns || features.canUsePipeline) {
                return (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800">📈 Plano Intermediário</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Você tem acesso a ferramentas de vendas básicas. 
                      {!features.canUseAnalytics && " Considere adicionar Analytics para insights avançados."}
                    </p>
                  </div>
                );
              } else {
                return (
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <h3 className="font-semibold text-gray-800">🏁 Plano Básico</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Acesso às funcionalidades essenciais: Leads, Empresas e Scraping.
                    </p>
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>

    </div>
  );
}

export default FeatureDemoPage;