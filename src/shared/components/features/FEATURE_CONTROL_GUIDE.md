# Sistema de Controle de Features por Tenant

Este sistema permite habilitar/desabilitar funcionalidades específicas para cada tenant, controlando tanto a interface quanto o acesso às funcionalidades.

## Configuração por Tenant

### Vendas.IA (todas as features habilitadas)
```typescript
features: {
  enableCampaigns: true,
  enablePipeline: true,
  enableScraping: true,
  enableAnalytics: true,
  enableMarketplace: true,
  enableBilling: true,
}
```

### Publix.IA (features limitadas)
```typescript
features: {
  enableCampaigns: true,
  enablePipeline: false,        // ❌ Publix não tem pipeline
  enableScraping: true,
  enableAnalytics: false,       // ❌ Publix não tem analytics completo
  enableMarketplace: false,     // ❌ Publix não tem marketplace
  enableBilling: true,
}
```

## Como Usar

### 1. Hook useFeatures

```tsx
import { useFeatures } from '@/shared/hooks/useFeatures';

function MyComponent() {
  const { 
    hasFeature, 
    canUseCampaigns, 
    canUsePipeline,
    requiresFeatures,
    getEnabledFeatures 
  } = useFeatures();

  // Verificação simples
  if (!hasFeature('enableCampaigns')) {
    return <div>Feature não disponível</div>;
  }

  // Verificação múltipla (todas devem estar habilitadas)
  if (!requiresFeatures(['enableCampaigns', 'enableAnalytics'])) {
    return <div>Funcionalidades avançadas não disponíveis</div>;
  }

  // Usando getters convenientes
  return (
    <div>
      {canUseCampaigns && <CampaignsButton />}
      {canUsePipeline && <PipelineButton />}
      
      <div>Features habilitadas: {getEnabledFeatures().join(', ')}</div>
    </div>
  );
}
```

### 2. Componente FeatureGuard

```tsx
import { FeatureGuard } from '@/shared/components/features/FeatureGuard';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* Sempre visível */}
      <DashboardCard title="Leads" />
      <DashboardCard title="Empresas" />

      {/* Condicional - apenas se campanhas estiverem habilitadas */}
      <FeatureGuard feature="enableCampaigns">
        <DashboardCard title="Campanhas" />
      </FeatureGuard>

      {/* Condicional - apenas se pipeline estiver habilitado */}
      <FeatureGuard feature="enablePipeline">
        <DashboardCard title="Pipeline" />
      </FeatureGuard>

      {/* Múltiplas features (AND) */}
      <FeatureGuard features={['enableCampaigns', 'enableAnalytics']}>
        <DashboardCard title="Analytics Avançado" />
      </FeatureGuard>

      {/* Qualquer uma das features (OR) */}
      <FeatureGuard anyFeatures={['enableMarketplace', 'enableBilling']}>
        <DashboardCard title="Vendas" />
      </FeatureGuard>

      {/* Com fallback */}
      <FeatureGuard 
        feature="enableMarketplace"
        fallback={<ComingSoonCard title="Marketplace" />}
      >
        <MarketplaceCard />
      </FeatureGuard>

      {/* Lógica invertida - mostrar quando desabilitado */}
      <FeatureGuard feature="enableBilling" not>
        <UpgradePromptCard />
      </FeatureGuard>

    </div>
  );
}
```

### 3. Navegação Condicional

```tsx
// No AppSidebar.tsx, itens de menu agora têm requiredFeature:
const navigationItems = [
  {
    title: 'Campanhas',
    url: '/app/campanhas',
    icon: Target,
    requiredFeature: 'enableCampaigns'  // ✅ Só aparece se habilitado
  },
  {
    title: 'Pipeline',
    url: '/app/pipeline', 
    icon: Kanban,
    requiredFeature: 'enablePipeline'   // ❌ Oculto no Publix.IA
  },
];

// Seções inteiras podem ser condicionais:
<FeatureGuard feature="enableBilling">
  <SidebarGroup>
    <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
    {/* Conteúdo só aparece se billing estiver habilitado */}
  </SidebarGroup>
</FeatureGuard>
```

### 4. Páginas Protegidas

```tsx
import { RequireFeature } from '@/shared/components/features/FeatureGuard';

function CampaignsPage() {
  return (
    <RequireFeature 
      feature="enableCampaigns"
      errorMessage="O módulo de Campanhas não está disponível no seu plano."
    >
      <div>
        <h1>Campanhas</h1>
        {/* Conteúdo da página */}
      </div>
    </RequireFeature>
  );
}
```

### 5. Render Customizado

```tsx
<FeatureGuard 
  render={(features) => {
    if (features.canUsePipeline && features.canUseCampaigns) {
      return <AdvancedSalesToolbar />;
    } else if (features.canUseCampaigns) {
      return <BasicCampaignsToolbar />;
    } else {
      return <LeadsOnlyToolbar />;
    }
  }}
/>
```

### 6. Debug/Admin - Lista de Features

```tsx
import { FeatureList } from '@/shared/components/features/FeatureGuard';

function AdminPanel() {
  return (
    <div>
      <h2>Status das Features</h2>
      
      {/* Mostrar todas as features */}
      <FeatureList />
      
      {/* Apenas features habilitadas */}
      <FeatureList enabledOnly />
      
      {/* Apenas features desabilitadas */}
      <FeatureList disabledOnly />
    </div>
  );
}
```

## Resultado Prático

### No Vendas.IA (localhost:8080)
- ✅ Todos os menus visíveis
- ✅ Pipeline disponível
- ✅ Analytics completo
- ✅ Marketplace ativo
- ✅ Seção Financeiro visível

### No Publix.IA (localhost:8081)
- ❌ Menu "Pipeline" oculto
- ❌ Menu "Segmentos" oculto (analytics)
- ❌ Menu "Marketplace" oculto  
- ❌ Seção "Financeiro" oculta (parcialmente)
- ✅ Campanhas, Scraping e Leads disponíveis

## Expandindo o Sistema

Para adicionar novas features:

1. **Adicionar no tipo TenantFeatures:**
```typescript
export interface TenantFeatures {
  // ... existing features
  enableAI: boolean;
  enableIntegrations: boolean;
  enableReports: boolean;
}
```

2. **Configurar nos tenant configs:**
```typescript
features: {
  // ... existing features
  enableAI: true,
  enableIntegrations: false,  
  enableReports: true,
}
```

3. **Usar nos componentes:**
```tsx
<FeatureGuard feature="enableAI">
  <AIAssistantPanel />
</FeatureGuard>
```

4. **Adicionar getter conveniente no hook:**
```typescript
// Em useFeatures.ts
canUseAI: hasFeature('enableAI'),
canUseIntegrations: hasFeature('enableIntegrations'),
```

O sistema é totalmente tipado e extensível! 🚀