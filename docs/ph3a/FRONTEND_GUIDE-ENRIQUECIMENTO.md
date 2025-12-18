# Guia de Implementação Frontend - Arquitetura de Enriquecimento

**Data**: 2025-12-18
**Versão**: 1.0
**Backend Branch**: `021-arquitetura-de-enriquecimento`

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Endpoints Disponíveis](#endpoints-disponíveis)
3. [Fluxos de Tela](#fluxos-de-tela)
4. [Componentes UI Recomendados](#componentes-ui-recomendados)
5. [Estados e Gerenciamento](#estados-e-gerenciamento)
6. [Exemplos de Código](#exemplos-de-código)
7. [Considerações de UX](#considerações-de-ux)
8. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral

A arquitetura de enriquecimento permite que empresas enriqueçam leads com dados externos, realizem investigações de mídia negativa, configurem providers e monitorem custos/performance.

### Principais Funcionalidades

1. **Enriquecimento de Leads** - Adicionar dados externos aos leads (localização, dados empresariais, etc.)
2. **Investigação de Mídia Negativa** - Análise automática de notícias e fontes sobre empresas/pessoas
3. **Configuração de Providers** - Gerenciar providers de enriquecimento (habilitar/desabilitar, prioridade, custos)
4. **Monitoramento de Stats** - Visualizar custos, performance e taxa de sucesso dos providers

### Arquitetura de Comunicação

```
Frontend (React) → API REST → Workers (RabbitMQ) → External Providers
                ↓
            Polling para status
```

**⚠️ IMPORTANTE**: Enriquecimentos e investigações são **assíncronos** (retornam 202 Accepted). O frontend deve implementar **polling** para verificar o status.

---

## 🔌 Endpoints Disponíveis

### 1. Enriquecimento de Leads

#### POST `/api/v1/leads-advanced/:id/enrich`
Solicita enriquecimento de um lead específico.

**Request:**
```json
{
  "providerNames": ["perplexity", "google_maps"],
  "complexity": "simple"  // opcional: "simple" | "complex"
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "executionIds": ["uuid-1", "uuid-2"],
    "status": "queued",
    "traceId": "trace-abc123"
  },
  "message": "Job de enriquecimento criado com sucesso"
}
```

**Headers de autenticação:**
```
Authorization: Bearer {token}
```

---

#### GET `/api/v1/leads-advanced/:id/enrichment`
Consulta o status de enriquecimento de um lead.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "leadId": "lead-uuid",
    "status": "completed",  // "pending" | "processing" | "completed" | "error"
    "providersUsed": ["perplexity", "google_maps"],
    "results": [
      {
        "providerName": "perplexity",
        "status": "success",
        "outputData": {
          "summary": "Empresa de tecnologia...",
          "sources": ["url1", "url2"]
        },
        "creditsConsumed": 1,
        "confidenceScore": 85
      },
      {
        "providerName": "google_maps",
        "status": "success",
        "outputData": {
          "formattedAddress": "Rua Exemplo, 123 - São Paulo, SP",
          "coordinates": { "lat": -23.550520, "lng": -46.633308 }
        },
        "creditsConsumed": 5,
        "confidenceScore": 95
      }
    ],
    "totalCredits": 6,
    "overallScore": 90,
    "traceId": "trace-abc123"
  }
}
```

---

### 2. Investigação de Mídia Negativa

#### POST `/api/v1/negative-media/investigations`
Cria uma investigação de mídia negativa.

**Request:**
```json
{
  "dossierId": "dossier-uuid",
  "searchTemplateId": "template-uuid",  // opcional
  "complexity": "complex"  // opcional
}
```

**Response (202 Accepted):**
```json
{
  "success": true,
  "data": {
    "id": "investigation-uuid",
    "dossierId": "dossier-uuid",
    "status": "pending",
    "positiveCount": 0,
    "neutralCount": 0,
    "suspectCount": 0,
    "negativeCount": 0,
    "overallRiskScore": null,
    "traceId": "trace-def456"
  }
}
```

---

#### GET `/api/v1/negative-media/investigations/:id`
Consulta o status de uma investigação.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "investigation-uuid",
    "dossierId": "dossier-uuid",
    "status": "completed",  // "pending" | "running" | "completed" | "failed"
    "sources": [
      {
        "url": "https://example.com/noticia",
        "title": "Empresa XYZ investigada por...",
        "assessment": "negative",  // "positive" | "neutral" | "suspect" | "negative"
        "confidence": "high",      // "low" | "medium" | "high"
        "impact": "high",          // "low" | "medium" | "high"
        "categories": ["fraude", "corrupcao"],
        "justification": "A notícia relata investigação por fraude...",
        "analyzedAt": "2025-12-18T10:30:00Z"
      }
    ],
    "positiveCount": 2,
    "neutralCount": 5,
    "suspectCount": 1,
    "negativeCount": 3,
    "overallRiskScore": 45,  // 0-100, quanto maior o risco
    "metadata": {},
    "createdAt": "2025-12-18T10:00:00Z",
    "updatedAt": "2025-12-18T10:35:00Z",
    "completedAt": "2025-12-18T10:35:00Z"
  }
}
```

---

### 3. Configuração de Providers

#### GET `/api/v1/enrichment/providers`
Lista providers de enriquecimento ativos.

**Query Parameters:**
- `type` (opcional): Filtrar por tipo (`web_search`, `location`, `company_data`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "provider-uuid-1",
      "name": "perplexity",
      "type": "web_search",
      "enabled": true,
      "priority": 1,
      "config": {
        "apiKeyRef": "PERPLEXITY_API_KEY",
        "model": "sonar",
        "temperature": 0.3
      },
      "rateLimitPerMinute": 60,
      "costPerRequestCents": 1,
      "healthStatus": "active"  // "active" | "degraded" | "inactive"
    },
    {
      "id": "provider-uuid-2",
      "name": "google_maps",
      "type": "location",
      "enabled": true,
      "priority": 2,
      "config": {
        "apiKeyRef": "GOOGLE_MAPS_API_KEY"
      },
      "rateLimitPerMinute": 100,
      "costPerRequestCents": 5,
      "healthStatus": "active"
    }
  ],
  "message": "Providers obtidos com sucesso"
}
```

---

#### PATCH `/api/v1/enrichment/providers/:id`
Atualiza configuração de um provider.

**Request:**
```json
{
  "enabled": false,           // opcional
  "priority": 3,             // opcional
  "rateLimitPerMinute": 50,  // opcional
  "config": {                // opcional
    "temperature": 0.5
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "provider-uuid-1",
    "name": "perplexity",
    "enabled": false,
    "priority": 3,
    // ... campos atualizados
  },
  "message": "Provider atualizado com sucesso"
}
```

---

### 4. Monitoramento de Estatísticas

#### GET `/api/v1/admin/enrichment/stats`
Obtém estatísticas de uso e custos dos providers.

**Query Parameters:**
- `startDate` (opcional): Data inicial ISO 8601 (padrão: 7 dias atrás)
- `endDate` (opcional): Data final ISO 8601 (padrão: hoje)
- `providerName` (opcional): Filtrar por provider específico

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2025-12-11T00:00:00Z",
      "endDate": "2025-12-18T23:59:59Z"
    },
    "providers": [
      {
        "providerName": "perplexity",
        "totalExecutions": 150,
        "successCount": 145,
        "errorCount": 5,
        "successRate": 96.67,  // percentual
        "totalCostCents": 150,  // R$ 1,50
        "avgDurationMs": 2500,
        "avgConfidenceScore": 85
      },
      {
        "providerName": "google_maps",
        "totalExecutions": 200,
        "successCount": 198,
        "errorCount": 2,
        "successRate": 99.0,
        "totalCostCents": 1000,  // R$ 10,00
        "avgDurationMs": 1200,
        "avgConfidenceScore": 95
      }
    ],
    "totalCostCents": 1150,  // R$ 11,50
    "totalExecutions": 350,
    "overallSuccessRate": 98.0
  },
  "message": "Estatísticas obtidas com sucesso"
}
```

---

## 🖥️ Fluxos de Tela

### Fluxo 1: Enriquecer Lead

```
[Lista de Leads]
    ↓ (Clique em "Enriquecer")
[Modal: Selecionar Providers]
    ↓ (Confirmação)
[POST /leads-advanced/:id/enrich]
    ↓ (202 Accepted)
[Loading State com Polling]
    ↓ (GET /leads-advanced/:id/enrichment a cada 3s)
[Exibir Resultados]
    ↓
[Atualizar detalhes do lead]
```

**Componentes necessários:**
1. Botão "Enriquecer" na lista/detalhes do lead
2. Modal de seleção de providers (checkboxes)
3. Loading indicator com progresso
4. Card de resultados de enriquecimento
5. Toast de notificações

---

### Fluxo 2: Investigação de Mídia Negativa

```
[Detalhes do Dossiê]
    ↓ (Clique em "Investigar Mídia")
[Modal: Confirmar Investigação]
    ↓ (Confirmação)
[POST /negative-media/investigations]
    ↓ (202 Accepted)
[Loading State com Polling]
    ↓ (GET /negative-media/investigations/:id a cada 5s)
[Dashboard de Resultados]
    ├─ Gráfico de Distribuição (Positive/Neutral/Suspect/Negative)
    ├─ Overall Risk Score (gauge)
    └─ Lista de Fontes Analisadas
```

**Componentes necessários:**
1. Botão "Investigar Mídia Negativa" no dossiê
2. Modal de confirmação com custo estimado
3. Loading com estimativa de tempo (1-2 min)
4. Dashboard de resultados:
   - Gráfico de pizza/barras (distribuição)
   - Gauge de risco (0-100)
   - Lista de fontes com cards
   - Badge de assessment (positive/neutral/suspect/negative)
   - Badge de confidence (low/medium/high)
   - Badge de impact (low/medium/high)

---

### Fluxo 3: Configuração de Providers (Admin)

```
[Sidebar] → [Configurações] → [Providers]
    ↓
[GET /enrichment/providers]
    ↓
[Tabela de Providers]
    ├─ Nome, Tipo, Status (toggle)
    ├─ Priority (número editável)
    ├─ Rate Limit (exibir)
    ├─ Custo por Request (exibir)
    └─ Health Status (badge)

[Clique em "Editar"]
    ↓
[Modal de Edição]
    ├─ Toggle "Habilitado"
    ├─ Input "Prioridade"
    └─ Botão "Salvar"

[PATCH /enrichment/providers/:id]
    ↓ (200 OK)
[Atualizar Tabela]
```

**Componentes necessários:**
1. Página de configuração de providers
2. Tabela com colunas: Nome, Tipo, Status, Prioridade, Rate Limit, Custo, Health
3. Toggle de habilitar/desabilitar
4. Modal de edição
5. Badge de health status (verde/amarelo/vermelho)

---

### Fluxo 4: Dashboard de Estatísticas (Admin)

```
[Sidebar] → [Relatórios] → [Enriquecimento]
    ↓
[Filtros]
    ├─ Date Range Picker (startDate, endDate)
    └─ Select Provider (opcional)

[GET /admin/enrichment/stats?startDate=...&endDate=...]
    ↓
[Dashboard]
    ├─ Cards de Métricas Principais
    │   ├─ Total Execuções
    │   ├─ Taxa de Sucesso Geral
    │   ├─ Custo Total
    │   └─ Duração Média
    │
    ├─ Tabela de Providers
    │   └─ Detalhes por provider
    │
    └─ Gráficos
        ├─ Linha: Execuções ao longo do tempo
        ├─ Barras: Custo por provider
        └─ Barras: Success Rate por provider
```

**Componentes necessários:**
1. Página de dashboard de estatísticas
2. Date range picker
3. Select de providers
4. Cards de métricas (KPIs)
5. Tabela de estatísticas por provider
6. Gráficos (Chart.js, Recharts, ou similar)

---

## 🎨 Componentes UI Recomendados

### 1. EnrichmentButton

Botão para iniciar enriquecimento de um lead.

```tsx
interface EnrichmentButtonProps {
  leadId: string;
  onSuccess?: (result: EnrichmentResult) => void;
  onError?: (error: Error) => void;
}

<EnrichmentButton
  leadId="lead-uuid"
  onSuccess={(result) => console.log(result)}
/>
```

**Estado interno:**
- `idle` | `selecting` | `loading` | `success` | `error`

---

### 2. EnrichmentStatusCard

Card exibindo o status de enriquecimento.

```tsx
interface EnrichmentStatusCardProps {
  leadId: string;
  autoRefresh?: boolean;  // polling automático
  refreshInterval?: number;  // ms (padrão: 3000)
}

<EnrichmentStatusCard
  leadId="lead-uuid"
  autoRefresh={true}
  refreshInterval={3000}
/>
```

**Exibe:**
- Status geral (pending/processing/completed/error)
- Progresso por provider
- Dados enriquecidos (quando completo)
- Custo total
- Confidence score

---

### 3. NegativeMediaDashboard

Dashboard completo de investigação de mídia negativa.

```tsx
interface NegativeMediaDashboardProps {
  investigationId: string;
  autoRefresh?: boolean;
}

<NegativeMediaDashboard
  investigationId="investigation-uuid"
  autoRefresh={true}
/>
```

**Seções:**
1. Header com status e risk score
2. Gráfico de distribuição
3. Lista de fontes analisadas
4. Filtros (por assessment, confidence, impact)

---

### 4. ProviderConfigTable

Tabela de configuração de providers (admin).

```tsx
interface ProviderConfigTableProps {
  onProviderUpdate?: (provider: Provider) => void;
}

<ProviderConfigTable
  onProviderUpdate={(provider) => console.log('Updated:', provider)}
/>
```

**Ações:**
- Toggle enable/disable
- Editar prioridade
- Visualizar configurações
- Badge de health status

---

### 5. EnrichmentStatsChart

Gráficos de estatísticas de enriquecimento.

```tsx
interface EnrichmentStatsChartProps {
  startDate: Date;
  endDate: Date;
  providerName?: string;
  chartType: 'line' | 'bar' | 'pie';
}

<EnrichmentStatsChart
  startDate={new Date('2025-12-11')}
  endDate={new Date('2025-12-18')}
  chartType="line"
/>
```

---

## 🔄 Estados e Gerenciamento

### Polling Pattern (React Hook)

```tsx
// hooks/useEnrichmentStatus.ts
import { useState, useEffect } from 'react';

interface UseEnrichmentStatusOptions {
  leadId: string;
  enabled?: boolean;
  interval?: number;
  onComplete?: (data: EnrichmentStatus) => void;
}

export function useEnrichmentStatus({
  leadId,
  enabled = true,
  interval = 3000,
  onComplete
}: UseEnrichmentStatusOptions) {
  const [data, setData] = useState<EnrichmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/v1/leads-advanced/${leadId}/enrichment`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch status');

        const result = await response.json();
        setData(result.data);
        setLoading(false);

        // Parar polling se completou ou deu erro
        if (result.data.status === 'completed' || result.data.status === 'error') {
          if (onComplete) onComplete(result.data);
          return; // Stop polling
        }
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    // Fetch inicial
    fetchStatus();

    // Setup polling
    const intervalId = setInterval(() => {
      if (data?.status !== 'completed' && data?.status !== 'error') {
        fetchStatus();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [leadId, enabled, interval, onComplete, data?.status]);

  return { data, loading, error };
}
```

**Uso:**
```tsx
function EnrichmentStatus({ leadId }: { leadId: string }) {
  const { data, loading, error } = useEnrichmentStatus({
    leadId,
    enabled: true,
    interval: 3000,
    onComplete: (data) => {
      toast.success('Enriquecimento concluído!');
    }
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <StatusBadge status={data.status} />
      <ProviderResults results={data.results} />
    </div>
  );
}
```

---

### State Management (Context API ou Zustand)

```tsx
// stores/enrichmentStore.ts
import create from 'zustand';

interface EnrichmentStore {
  activeJobs: Map<string, EnrichmentJob>;
  addJob: (leadId: string, job: EnrichmentJob) => void;
  removeJob: (leadId: string) => void;
  updateJobStatus: (leadId: string, status: EnrichmentStatus) => void;
}

export const useEnrichmentStore = create<EnrichmentStore>((set) => ({
  activeJobs: new Map(),

  addJob: (leadId, job) => set((state) => ({
    activeJobs: new Map(state.activeJobs).set(leadId, job)
  })),

  removeJob: (leadId) => set((state) => {
    const newJobs = new Map(state.activeJobs);
    newJobs.delete(leadId);
    return { activeJobs: newJobs };
  }),

  updateJobStatus: (leadId, status) => set((state) => {
    const job = state.activeJobs.get(leadId);
    if (!job) return state;

    const updatedJob = { ...job, status };
    return {
      activeJobs: new Map(state.activeJobs).set(leadId, updatedJob)
    };
  })
}));
```

---

## 💻 Exemplos de Código

### Exemplo 1: Enriquecer Lead

```tsx
// components/EnrichLeadButton.tsx
import { useState } from 'react';
import { Button, Modal, Checkbox } from '@/components/ui';
import { useEnrichmentStore } from '@/stores/enrichmentStore';

interface EnrichLeadButtonProps {
  leadId: string;
  onSuccess?: () => void;
}

export function EnrichLeadButton({ leadId, onSuccess }: EnrichLeadButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['perplexity', 'google_maps']);
  const [loading, setLoading] = useState(false);
  const { addJob } = useEnrichmentStore();

  const handleEnrich = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/leads-advanced/${leadId}/enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          providerNames: selectedProviders,
          complexity: 'simple'
        })
      });

      if (!response.ok) throw new Error('Failed to enrich lead');

      const result = await response.json();

      // Adicionar job à store para tracking
      addJob(leadId, {
        executionIds: result.data.executionIds,
        status: result.data.status,
        traceId: result.data.traceId
      });

      setIsOpen(false);
      toast.success('Enriquecimento iniciado com sucesso!');

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Erro ao enriquecer lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <IconEnrich className="mr-2" />
        Enriquecer
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Selecione os Providers</h2>

        <div className="space-y-2">
          <Checkbox
            checked={selectedProviders.includes('perplexity')}
            onChange={(checked) => {
              if (checked) {
                setSelectedProviders([...selectedProviders, 'perplexity']);
              } else {
                setSelectedProviders(selectedProviders.filter(p => p !== 'perplexity'));
              }
            }}
          >
            Perplexity (Web Search) - R$ 0,01/request
          </Checkbox>

          <Checkbox
            checked={selectedProviders.includes('google_maps')}
            onChange={(checked) => {
              if (checked) {
                setSelectedProviders([...selectedProviders, 'google_maps']);
              } else {
                setSelectedProviders(selectedProviders.filter(p => p !== 'google_maps'));
              }
            }}
          >
            Google Maps (Localização) - R$ 0,05/request
          </Checkbox>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleEnrich}
            loading={loading}
            disabled={selectedProviders.length === 0}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </>
  );
}
```

---

### Exemplo 2: Dashboard de Investigação

```tsx
// components/NegativeMediaDashboard.tsx
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface NegativeMediaDashboardProps {
  investigationId: string;
}

export function NegativeMediaDashboard({ investigationId }: NegativeMediaDashboardProps) {
  const [data, setData] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestigation = async () => {
      try {
        const response = await fetch(`/api/v1/negative-media/investigations/${investigationId}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (!response.ok) throw new Error('Failed to fetch investigation');

        const result = await response.json();
        setData(result.data);
        setLoading(false);

        // Continue polling se ainda está processando
        if (result.data.status === 'running' || result.data.status === 'pending') {
          setTimeout(fetchInvestigation, 5000);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchInvestigation();
  }, [investigationId]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;

  const chartData = [
    { name: 'Positivas', value: data.positiveCount, color: '#10b981' },
    { name: 'Neutras', value: data.neutralCount, color: '#6b7280' },
    { name: 'Suspeitas', value: data.suspectCount, color: '#f59e0b' },
    { name: 'Negativas', value: data.negativeCount, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Investigação de Mídia Negativa</h2>
        <StatusBadge status={data.status} />
      </div>

      {/* Risk Score Gauge */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Risk Score Geral</h3>
        <div className="flex items-center justify-center">
          <RiskGauge value={data.overallRiskScore || 0} />
        </div>
      </div>

      {/* Distribuição de Fontes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Distribuição de Fontes</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lista de Fontes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Fontes Analisadas ({data.sources.length})</h3>
        <div className="space-y-4">
          {data.sources.map((source) => (
            <SourceCard key={source.url} source={source} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: InvestigationSource }) {
  const assessmentColors = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-gray-100 text-gray-800',
    suspect: 'bg-yellow-100 text-yellow-800',
    negative: 'bg-red-100 text-red-800'
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-blue-600 hover:underline">
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
          </h4>
          <p className="text-sm text-gray-600 mt-2">{source.justification}</p>
        </div>

        <div className="ml-4 space-y-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${assessmentColors[source.assessment]}`}>
            {source.assessment.toUpperCase()}
          </span>
          <div className="text-xs text-gray-500">
            <div>Confiança: <strong>{source.confidence}</strong></div>
            <div>Impacto: <strong>{source.impact}</strong></div>
          </div>
        </div>
      </div>

      {source.categories.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {source.categories.map((category) => (
            <span key={category} className="px-2 py-1 bg-gray-100 rounded text-xs">
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Exemplo 3: Dashboard de Estatísticas

```tsx
// pages/admin/EnrichmentStats.tsx
import { useState } from 'react';
import { DateRangePicker } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EnrichmentStatsPage() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await fetch(`/api/v1/admin/enrichment/stats?${params}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const result = await response.json();
      setStats(result.data);
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header com Filtros */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Estatísticas de Enriquecimento</h1>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Execuções"
          value={stats.totalExecutions}
          icon={<IconActivity />}
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${stats.overallSuccessRate.toFixed(1)}%`}
          icon={<IconCheck />}
          variant={stats.overallSuccessRate >= 95 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Custo Total"
          value={`R$ ${(stats.totalCostCents / 100).toFixed(2)}`}
          icon={<IconDollar />}
        />
        <MetricCard
          title="Providers Ativos"
          value={stats.providers.length}
          icon={<IconServer />}
        />
      </div>

      {/* Gráfico de Custo por Provider */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Custo por Provider</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.providers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="providerName" />
              <YAxis label={{ value: 'Custo (centavos)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => `R$ ${(value / 100).toFixed(2)}`} />
              <Bar dataKey="totalCostCents" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Detalhada */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Detalhes por Provider</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Provider</th>
              <th className="text-right p-2">Execuções</th>
              <th className="text-right p-2">Taxa de Sucesso</th>
              <th className="text-right p-2">Custo Total</th>
              <th className="text-right p-2">Duração Média</th>
            </tr>
          </thead>
          <tbody>
            {stats.providers.map((provider) => (
              <tr key={provider.providerName} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{provider.providerName}</td>
                <td className="p-2 text-right">{provider.totalExecutions}</td>
                <td className="p-2 text-right">
                  <span className={provider.successRate >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                    {provider.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="p-2 text-right">R$ {(provider.totalCostCents / 100).toFixed(2)}</td>
                <td className="p-2 text-right">{provider.avgDurationMs ? `${(provider.avgDurationMs / 1000).toFixed(1)}s` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🎨 Considerações de UX

### 1. Feedback de Processamento Assíncrono

**❌ Não fazer:**
```tsx
// Apenas mostrar "Loading..." sem contexto
<button disabled>Loading...</button>
```

**✅ Fazer:**
```tsx
// Mostrar progresso e estimativa
<div>
  <ProgressBar value={60} />
  <p>Enriquecendo lead... (estimativa: 30 segundos)</p>
  <p>Providers processados: 2/3</p>
</div>
```

---

### 2. Indicação de Custos

Sempre exibir o custo estimado **antes** de iniciar uma operação:

```tsx
<Modal>
  <h3>Enriquecer Lead</h3>
  <p>Providers selecionados:</p>
  <ul>
    <li>✓ Perplexity - R$ 0,01</li>
    <li>✓ Google Maps - R$ 0,05</li>
  </ul>
  <p className="font-bold">Custo estimado: R$ 0,06</p>
  <Button>Confirmar e Enriquecer</Button>
</Modal>
```

---

### 3. Notificações em Tempo Real

Usar toasts para feedback imediato:

```tsx
// Sucesso
toast.success('Enriquecimento concluído! 2/2 providers bem-sucedidos.');

// Parcialmente concluído
toast.warning('Enriquecimento parcial: 1/2 providers falharam.');

// Erro
toast.error('Falha ao enriquecer lead. Tente novamente.');
```

---

### 4. Estados Vazios

```tsx
// Quando não há dados de enriquecimento
<EmptyState
  icon={<IconEnrich />}
  title="Nenhum enriquecimento realizado"
  description="Enriqueça este lead com dados externos para obter mais informações."
  action={<EnrichLeadButton leadId={leadId} />}
/>
```

---

### 5. Badge de Health Status

Usar cores semânticas para health status dos providers:

```tsx
function HealthBadge({ status }: { status: 'active' | 'degraded' | 'inactive' }) {
  const variants = {
    active: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    inactive: 'bg-red-100 text-red-800'
  };

  const labels = {
    active: '✓ Ativo',
    degraded: '⚠ Degradado',
    inactive: '✗ Inativo'
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${variants[status]}`}>
      {labels[status]}
    </span>
  );
}
```

---

### 6. Loading Skeleton

Usar skeletons enquanto carrega dados:

```tsx
function EnrichmentCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-20 bg-gray-200 rounded"></div>
    </div>
  );
}
```

---

## ✅ Checklist de Implementação

### Fase 1: Enriquecimento Básico
- [ ] Criar hook `useEnrichmentStatus` com polling
- [ ] Implementar botão "Enriquecer Lead"
- [ ] Modal de seleção de providers
- [ ] Card de exibição de resultados
- [ ] Loading state com progresso
- [ ] Toast notifications
- [ ] Integração com API `/leads-advanced/:id/enrich`
- [ ] Integração com API `/leads-advanced/:id/enrichment`

### Fase 2: Investigação de Mídia Negativa
- [ ] Botão "Investigar Mídia Negativa" no dossiê
- [ ] Modal de confirmação com custo
- [ ] Hook `useInvestigationStatus` com polling
- [ ] Dashboard de resultados da investigação
- [ ] Gráfico de distribuição (positive/neutral/suspect/negative)
- [ ] Gauge de risk score
- [ ] Lista de fontes analisadas
- [ ] Filtros por assessment, confidence, impact
- [ ] Integração com API `/negative-media/investigations`

### Fase 3: Configuração de Providers (Admin)
- [ ] Página de configuração de providers
- [ ] Tabela de providers com colunas completas
- [ ] Toggle enable/disable inline
- [ ] Modal de edição de provider
- [ ] Badge de health status
- [ ] Validação de prioridade (número positivo)
- [ ] Integração com API `GET /enrichment/providers`
- [ ] Integração com API `PATCH /enrichment/providers/:id`

### Fase 4: Dashboard de Estatísticas (Admin)
- [ ] Página de dashboard de estatísticas
- [ ] Date range picker com presets (7 dias, 30 dias, custom)
- [ ] Select de providers para filtro
- [ ] Cards de métricas principais (KPIs)
- [ ] Gráfico de linha: Execuções ao longo do tempo
- [ ] Gráfico de barras: Custo por provider
- [ ] Gráfico de barras: Success rate por provider
- [ ] Tabela detalhada de estatísticas
- [ ] Exportação de dados (CSV/Excel)
- [ ] Integração com API `/admin/enrichment/stats`

### Fase 5: Polimentos e Testes
- [ ] Loading skeletons em todos os componentes
- [ ] Estados vazios (empty states)
- [ ] Error boundaries
- [ ] Retry automático em caso de falha
- [ ] Otimização de re-renders (React.memo, useMemo)
- [ ] Acessibilidade (ARIA labels, keyboard navigation)
- [ ] Responsividade mobile
- [ ] Testes unitários dos hooks
- [ ] Testes de integração dos fluxos principais
- [ ] Documentação de componentes (Storybook)

---

## 🔗 Links Úteis

- **API Base URL**: `http://localhost:3000/api/v1` (dev) ou `https://api.leadsrapido.com/api/v1` (prod)
- **Swagger Docs**: `http://localhost:3000/api-docs`
- **Backend Repository**: `leadsrapido_backend/`
- **Spec Original**: `specs/021-arquitetura-de-enriquecimento/spec.md`
- **Tasks Backend**: `specs/021-arquitetura-de-enriquecimento/tasks.md`

---

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Consultar a documentação da API (Swagger)
2. Verificar logs do backend (traceId para rastreamento)
3. Revisar o CLAUDE.md do backend para padrões de arquitetura

---

**Última Atualização**: 2025-12-18
**Versão do Backend**: Branch `021-arquitetura-de-enriquecimento`
**Status**: ✅ Pronto para implementação no frontend
