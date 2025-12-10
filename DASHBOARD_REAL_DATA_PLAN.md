# Plano: Dashboard com Dados Reais

## Status Atual
O Dashboard está usando dados **mockados** (hardcoded). Precisamos substituir por dados reais da API.

## APIs Disponíveis

### ✅ Já Implementadas no apiClient

1. **Leads**
   - `getLeads()` - Lista de leads com paginação e filtros
   - `getLead(id)` - Detalhes de um lead específico

2. **Empresas**
   - `getEmpresas()` - Lista de empresas
   - `getEmpresasStats()` - Estatísticas de empresas

3. **Analytics**
   - `getAnalytics(period)` - Dados analíticos por período
   - `getUsageMetrics(orgId, period)` - Métricas de uso

4. **Segmentos**
   - `getSegments()` - Lista de segmentos
   - `getSegmentStats()` - Estatísticas por segmento

5. **Pipeline**
   - `getPipelineStages()` - Estágios do pipeline
   - `getPipelineItems()` - Items no pipeline
   - `getPipelineStats()` - Estatísticas do pipeline

6. **Scraping**
   - `getScrapingStats()` - Estatísticas de scraping
   - `getScrapingStatus()` - Status do worker

7. **Campanhas** (via stages)
   - Usar `/api/v1/campaign-stages` endpoints

## Mapeamento: Mock → API Real

### 1. KPI Cards (Topo do Dashboard)

| Mock | API Real | Endpoint |
|------|----------|----------|
| `totalLeads` | `getLeads()` + count | `/api/v1/leads?limit=1` → usar total |
| `qualityAverage` | Calcular avg de scores | `/api/v1/leads` → calc média de `score` |
| `monthGrowth` | `getAnalytics()` | `/api/v1/analytics` → comparar períodos |
| `estimatedROI` | `getPipelineStats()` | `/api/v1/pipeline/stats` → valor_convertido |

### 2. Active Campaigns Widget

**Mock Atual**:
```typescript
mockCampaigns = [
  {
    name: 'B2B Software - SP',
    leadsGenerated: 1247,
    qualityScore: 87,
    progress: 78,
    ...
  }
]
```

**API Real**: `/api/v1/campaign-stages`
```typescript
// Buscar stages com status 'active'
// Contar leads por stage
// Calcular quality score médio
```

### 3. Recent Leads Widget

**Mock Atual**: Array hardcoded

**API Real**:
```typescript
const { data } = await apiClient.getLeads({
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

### 4. Usage Monitor Widget

**Mock Atual**:
```typescript
mockUsage = {
  leadsUsed: 2847,
  leadsLimit: 4000,
  daysRemaining: 12,
  ...
}
```

**API Real**: `/api/v1/organizations/{orgId}/usage`
```typescript
const usage = await apiClient.getUsageMetrics(orgId, {
  from: startOfMonth,
  to: today
});
```

### 5. Performance Insights

**Mock Atual**: Valores hardcoded

**API Real**: Combinar:
- `getAnalytics()` → tendências
- `getPipelineStats()` → conversion rate
- `getSegmentStats()` → performance por segmento

## Implementação

### Fase 1: Criar Hook Central ✅
```typescript
// src/features/dashboard/hooks/useDashboardData.ts
export function useDashboardData() {
  // Agregar todas as queries necessárias
  // Retornar dados formatados
}
```

### Fase 2: Endpoints Necessários

#### 2.1 Dashboard Stats (Criar novo endpoint)
```typescript
GET /api/v1/dashboard/stats

Response:
{
  totalLeads: number,
  qualityAverage: number,
  monthGrowth: number,
  leadsBreakdown: {
    novos: number,
    qualificados: number,
    convertidos: number
  },
  qualityDistribution: {
    alta: number,
    media: number,
    baixa: number
  }
}
```

#### 2.2 Campaigns Summary (Usar existente ou criar)
```typescript
GET /api/v1/campaigns/summary

Response:
{
  active: Campaign[],
  paused: Campaign[],
  completed: Campaign[]
}
```

### Fase 3: Substituir Componentes

#### 3.1 Dashboard.tsx
```typescript
// Antes
const mockCampaigns = [...];
const mockUsage = {...};
const mockRecentLeads = [...];

// Depois
const {
  stats,
  campaigns,
  recentLeads,
  usage,
  isLoading
} = useDashboardData();
```

#### 3.2 Adicionar Loading States
```typescript
if (isLoading) {
  return <DashboardSkeleton />;
}
```

#### 3.3 Adicionar Error States
```typescript
if (error) {
  return <DashboardError onRetry={refetch} />;
}
```

## Priorização

### 🔴 Alta Prioridade (Implementar Primeiro)
1. ✅ **Leads Count** - Já tem endpoint
2. ✅ **Recent Leads** - Já tem endpoint
3. ✅ **Empresas Stats** - Já tem endpoint

### 🟡 Média Prioridade
4. **Usage Metrics** - Precisa configurar
5. **Quality Metrics** - Calcular no frontend
6. **Growth Metrics** - Usar analytics

### 🟢 Baixa Prioridade (Pode ficar mock temporariamente)
7. **Campaigns Widget** - Complexo, muitos dados
8. **Performance Insights** - Cálculos avançados
9. **ROI Estimado** - Requer lógica de negócio

## Estrutura de Arquivos

```
src/features/dashboard/
├── hooks/
│   ├── useDashboardData.ts      # Hook principal (CRIAR)
│   ├── useDashboardStats.ts     # Estatísticas (CRIAR)
│   ├── useDashboardCampaigns.ts # Campanhas (CRIAR)
│   └── useDashboardUsage.ts     # Uso/Limites (CRIAR)
├── services/
│   └── dashboardApi.ts          # API helpers (CRIAR)
├── types/
│   └── dashboard.types.ts       # Tipos (CRIAR)
└── components/
    ├── DashboardSkeleton.tsx    # Loading state (CRIAR)
    └── DashboardError.tsx       # Error state (CRIAR)
```

## Exemplo de Implementação

### useDashboardData.ts
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/services/client';

export function useDashboardData() {
  // Leads recentes
  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['dashboard', 'recent-leads'],
    queryFn: () => apiClient.getLeads({
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  });

  // Stats de empresas
  const { data: empresasStats, isLoading: empresasLoading } = useQuery({
    queryKey: ['dashboard', 'empresas-stats'],
    queryFn: () => apiClient.getEmpresasStats()
  });

  // Combinar e formatar dados
  return {
    stats: {
      totalLeads: leadsData?.total || 0,
      qualityAverage: calculateQualityAvg(leadsData?.items),
      // ... outros stats
    },
    recentLeads: leadsData?.items || [],
    isLoading: leadsLoading || empresasLoading,
    error: null // TODO: handle errors
  };
}

function calculateQualityAvg(leads) {
  if (!leads || leads.length === 0) return 0;
  const sum = leads.reduce((acc, lead) => acc + (lead.score || 0), 0);
  return Math.round(sum / leads.length);
}
```

## Checklist de Implementação

### Preparação
- [ ] Criar tipos TypeScript para Dashboard
- [ ] Criar componentes de Loading e Error
- [ ] Documentar estrutura de dados esperada

### Fase 1: Dados Básicos
- [ ] Implementar useDashboardStats (leads count, quality)
- [ ] Implementar recent leads widget com dados reais
- [ ] Testar com dados reais

### Fase 2: Métricas Avançadas
- [ ] Implementar usage metrics
- [ ] Implementar growth calculations
- [ ] Implementar quality distribution

### Fase 3: Widgets Complexos
- [ ] Migrar campaigns widget para dados reais
- [ ] Migrar performance insights
- [ ] Adicionar cache e otimizações

### Fase 4: Polish
- [ ] Adicionar refresh automático
- [ ] Adicionar filtros de período
- [ ] Adicionar export de dados
- [ ] Testes E2E

## Timeline Sugerido

**Semana 1**: Fases 1 e 2 (Dados básicos e métricas)
**Semana 2**: Fase 3 (Widgets complexos)
**Semana 3**: Fase 4 (Polish e testes)

## Notas Importantes

1. **Backwards Compatibility**: Manter mocks como fallback durante migração
2. **Performance**: Usar React Query para cache e evitar requests duplicados
3. **Loading States**: Sempre mostrar skeleton/loading enquanto carrega
4. **Error Handling**: Mostrar mensagens claras quando API falhar
5. **Testing**: Testar com dados reais E mocks

## Decisões Técnicas

### Por que não fazer tudo de uma vez?
- Reduz risco de bugs
- Permite validar cada parte
- Facilita rollback se necessário

### Por que começar com Leads?
- Endpoint já existe e funciona
- Dados mais simples
- Impacto visual imediato

### Por que deixar Campaigns por último?
- Dados mais complexos
- Múltiplas fontes de dados
- Pode precisar de novos endpoints no backend
