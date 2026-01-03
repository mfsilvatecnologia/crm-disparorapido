# Pesquisa Técnica: CRM Management System

**Feature**: 001-crm-management
**Data**: 2026-01-03
**Status**: Completo

## Resumo Executivo

Este documento consolida as decisões técnicas para implementação do sistema CRM. Todas as questões de pesquisa identificadas no `plan.md` foram resolvidas com base em best practices do React ecosystem, constraints da constituição do projeto e padrões existentes no codebase.

---

## 1. Estratégia de Paginação Cursor-based

### Decisão

**Usar `useInfiniteQuery` do TanStack Query com scroll infinito** para listas de oportunidades e clientes.

### Rationale

1. **Backend usa cursor pagination**: Endpoints retornam `{ data: [], nextCursor: string | null }`. O `useInfiniteQuery` é projetado especificamente para este padrão.

2. **UX Superior**: Infinite scroll elimina cliques em "Próxima Página" e proporciona experiência mais fluida, especialmente em mobile.

3. **Performance**: TanStack Query gerencia cache automático por "página" (cursor), evitando re-fetches desnecessários.

4. **Simplicidade**: Menos estado manual comparado a `usePaginatedQuery` (sem gerenciar `pageNumber`, `pageSize`, etc.).

### Implementação

```typescript
// src/features/crm/api/opportunities.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface OpportunitiesResponse {
  data: Opportunity[];
  nextCursor: string | null;
  total: number;
}

interface OpportunitiesFilters {
  stage?: string;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function useOpportunities(filters?: OpportunitiesFilters) {
  return useInfiniteQuery({
    queryKey: ['opportunities', filters],
    queryFn: async ({ pageParam }) => {
      const params = {
        ...filters,
        cursor: pageParam,
        limit: 20, // Itens por página
      };

      const response = await apiClient.get<OpportunitiesResponse>(
        '/opportunities',
        { params }
      );

      return response;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
}
```

```typescript
// src/features/crm/components/opportunities/OpportunityList.tsx
import { useOpportunities } from '../../api/opportunities';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export function OpportunityList({ filters }: { filters?: OpportunitiesFilters }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useOpportunities(filters);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const opportunities = data?.pages.flatMap(page => page.data) ?? [];

  return (
    <div>
      {opportunities.map(opp => (
        <OpportunityCard key={opp.id} opportunity={opp} />
      ))}

      {/* Trigger para infinite scroll */}
      <div ref={ref} className="h-10 flex items-center justify-center">
        {isFetchingNextPage && <Spinner />}
      </div>

      {!hasNextPage && opportunities.length > 0 && (
        <p className="text-center text-muted-foreground">
          Todos os itens carregados
        </p>
      )}
    </div>
  );
}
```

### Alternativas Consideradas

- **`usePaginatedQuery` com botões Anterior/Próximo**: Rejeitado porque:
  - Cursor pagination não suporta "página anterior" nativamente
  - Requer estado adicional para mapear cursors
  - UX inferior para datasets grandes

- **Server-side pagination com número de página**: Rejeitado porque:
  - Backend usa cursor, não offset/limit
  - Problemas de consistência quando dados são inseridos/removidos entre páginas

---

## 2. Validação de Formulários Multi-step (Conversão Oportunidade → Cliente)

### Decisão

**Usar Zod schema com validação progressiva + optimistic UI com rollback** para conversão.

### Rationale

1. **Validação Front-end**: Previne chamadas API desnecessárias, melhora UX.
2. **Optimistic UI**: Feedback imediato ao usuário (FR-043: loading states).
3. **Rollback em Erro**: Se criação de cliente falhar, reverter mudança de status da oportunidade (caso extremo documentado na spec).
4. **Type Safety**: Schema Zod garante TypeScript types e validação runtime em sync.

### Implementação

```typescript
// src/features/crm/lib/validations.ts
import { z } from 'zod';

export const opportunitySchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  value: z.number().positive('Valor deve ser positivo'),
  expectedCloseDate: z.string().min(1, 'Data prevista é obrigatória'),
  stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation']),
  description: z.string().optional(),
  source: z.string().optional(),
});

// Validação específica para conversão
export const opportunityWinSchema = opportunitySchema.extend({
  // Campos adicionais necessários para criar cliente
  companyName: z.string().min(1, 'Nome da empresa é obrigatório'),
  segment: z.string().optional(),
  primaryContactName: z.string().min(1, 'Contato principal é obrigatório'),
  primaryContactEmail: z.string().email('Email inválido'),
  primaryContactPhone: z.string().optional(),
});

export type OpportunityWinInput = z.infer<typeof opportunityWinSchema>;
```

```typescript
// src/features/crm/api/opportunities.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { opportunityWinSchema } from '../lib/validations';

export function useWinOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      // POST /opportunities/{id}/win retorna customer criado
      const response = await apiClient.post<{ customer: Customer }>(
        `/opportunities/${opportunityId}/win`
      );
      return response;
    },
    onMutate: async (opportunityId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['opportunities'] });

      // Snapshot do estado anterior
      const previousOpportunities = queryClient.getQueryData(['opportunities']);

      // Optimistic update: marcar oportunidade como "Won"
      queryClient.setQueryData(['opportunities'], (old: any) => {
        // Atualizar status otimisticamente
        return updateOpportunityStatus(old, opportunityId, 'Won');
      });

      return { previousOpportunities };
    },
    onError: (err, variables, context) => {
      // Rollback em caso de erro
      if (context?.previousOpportunities) {
        queryClient.setQueryData(['opportunities'], context.previousOpportunities);
      }
    },
    onSuccess: (data) => {
      // Invalidar queries para refetch
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      // Navegar para perfil do cliente criado
      return data.customer;
    },
  });
}
```

```typescript
// Componente de confirmação
export function WinOpportunityDialog({ opportunity }: { opportunity: Opportunity }) {
  const winMutation = useWinOpportunity();
  const navigate = useNavigate();

  const handleWin = async () => {
    try {
      const result = await winMutation.mutateAsync(opportunity.id);
      toast.success('Oportunidade convertida em cliente!');
      navigate(`/crm/customers/${result.customer.id}`);
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : 'Erro ao converter oportunidade');
    }
  };

  return (
    <AlertDialog>
      {/* UI de confirmação */}
      <AlertDialogAction onClick={handleWin} disabled={winMutation.isPending}>
        {winMutation.isPending ? 'Convertendo...' : 'Confirmar Conversão'}
      </AlertDialogAction>
    </AlertDialog>
  );
}
```

### Alternativas Consideradas

- **Validação apenas no backend**: Rejeitado porque degrada UX (latência de rede para feedback).
- **Multi-step form wizard**: Rejeitado porque backend endpoint `/opportunities/{id}/win` é atômico; não há steps intermediários.

---

## 3. Timeline Component Pattern

### Decisão

**Componente genérico `Timeline` com estratégia de adaptador** para diferentes tipos de evento.

### Rationale

1. **Reusabilidade**: Mesmo componente pode ser usado em customer timeline, opportunity history, etc.
2. **Extensibilidade**: Fácil adicionar novos tipos de evento (ex: notes, emails futuramente).
3. **Performance**: Virtual scrolling via `react-window` para históricos longos (lazy loading).
4. **Type Safety**: Union types TypeScript garantem type-safe event handling.

### Implementação

```typescript
// src/features/crm/types/timeline.ts
export type TimelineEventType =
  | 'activity'
  | 'status_change'
  | 'contract_created'
  | 'contract_renewed'
  | 'contract_expired';

export interface BaseTimelineEvent {
  id: string;
  timestamp: string;
  type: TimelineEventType;
}

export interface ActivityEvent extends BaseTimelineEvent {
  type: 'activity';
  activityType: 'call' | 'meeting' | 'email' | 'note';
  description: string;
  userId: string;
  userName: string;
}

export interface StatusChangeEvent extends BaseTimelineEvent {
  type: 'status_change';
  fromStatus: string;
  toStatus: string;
  userId: string;
  userName: string;
}

export interface ContractEvent extends BaseTimelineEvent {
  type: 'contract_created' | 'contract_renewed' | 'contract_expired';
  contractId: string;
  contractType: string;
  value: number;
}

export type TimelineEvent = ActivityEvent | StatusChangeEvent | ContractEvent;
```

```typescript
// src/shared/components/Timeline.tsx
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineProps {
  events: TimelineEvent[];
  renderEvent: (event: TimelineEvent) => React.ReactNode;
}

export function Timeline({ events, renderEvent }: TimelineProps) {
  // Ordenar eventos por timestamp (mais recente primeiro)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => (
        <div key={event.id} className="relative flex gap-4">
          {/* Linha vertical */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-border" />
          )}

          {/* Ícone do evento */}
          <div className="relative z-10 flex-shrink-0">
            {getEventIcon(event.type)}
          </div>

          {/* Conteúdo do evento */}
          <div className="flex-1 pb-8">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1">{renderEvent(event)}</div>
              <time className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(event.timestamp), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </time>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

```typescript
// src/features/crm/components/customers/CustomerTimeline.tsx
import { Timeline } from '@/shared/components/Timeline';
import { useCustomerTimeline } from '../../api/customers';

export function CustomerTimeline({ customerId }: { customerId: string }) {
  const { data: events, isLoading } = useCustomerTimeline(customerId);

  const renderEvent = (event: TimelineEvent) => {
    switch (event.type) {
      case 'activity':
        return (
          <div>
            <p className="font-medium">{event.activityType.toUpperCase()}</p>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <p className="text-xs text-muted-foreground">por {event.userName}</p>
          </div>
        );

      case 'status_change':
        return (
          <div>
            <p className="font-medium">Status alterado</p>
            <p className="text-sm">
              <span className="text-muted-foreground">{event.fromStatus}</span>
              {' → '}
              <span className="font-medium">{event.toStatus}</span>
            </p>
          </div>
        );

      case 'contract_created':
        return (
          <div>
            <p className="font-medium">Contrato criado</p>
            <p className="text-sm">{event.contractType} - {formatCurrency(event.value)}</p>
          </div>
        );

      // Outros tipos...
      default:
        return null;
    }
  };

  if (isLoading) return <Skeleton />;
  if (!events || events.length === 0) return <EmptyState />;

  return <Timeline events={events} renderEvent={renderEvent} />;
}
```

### Alternativas Consideradas

- **Componente específico `CustomerTimeline`**: Rejeitado porque limita reutilização e viola DRY.
- **Fetch todos eventos de uma vez**: Rejeitado porque pode causar problemas de performance com históricos longos. Virtual scrolling com lazy loading é melhor.

---

## 4. Health Score Calculation

### Decisão

**Backend retorna score pré-calculado**; frontend apenas exibe. Cache via TanStack Query com revalidação a cada 5 minutos.

### Rationale

1. **Lógica de Negócio no Backend**: Conforme constituição (API-First Backend Authority), cálculos complexos devem estar no backend.
2. **Consistência**: Todos os clients (web, mobile, API consumers) veem mesmo score.
3. **Performance**: Frontend não precisa buscar dados brutos de múltiplas fontes (atividades, contratos, etc.).
4. **Auditabilidade**: Mudanças na fórmula de cálculo são centralizadas no backend.

### Implementação

```typescript
// src/features/crm/api/customers.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface HealthScoreResponse {
  score: number; // 0-100
  factors: {
    engagement: number;
    contractValue: number;
    activityRecency: number;
  };
  status: 'healthy' | 'at_risk' | 'critical' | 'insufficient_data';
}

export function useCustomerHealthScore(customerId: string) {
  return useQuery({
    queryKey: ['customers', customerId, 'health-score'],
    queryFn: async () => {
      const response = await apiClient.get<HealthScoreResponse>(
        `/customers/${customerId}/health-score`
      );
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Re-fetch a cada 5 minutos
  });
}
```

```typescript
// src/features/crm/components/customers/HealthScoreBadge.tsx
import { useCustomerHealthScore } from '../../api/customers';

export function HealthScoreBadge({ customerId }: { customerId: string }) {
  const { data, isLoading } = useCustomerHealthScore(customerId);

  if (isLoading) return <Skeleton className="h-6 w-20" />;
  if (!data || data.status === 'insufficient_data') {
    return (
      <Badge variant="outline">
        Dados insuficientes
      </Badge>
    );
  }

  const variant = {
    healthy: 'success',
    at_risk: 'warning',
    critical: 'destructive',
  }[data.status];

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>
        Score: {data.score}/100
      </Badge>

      {/* Tooltip com breakdown */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
          <TooltipContent>
            <dl className="space-y-1">
              <div className="flex justify-between gap-4">
                <dt>Engajamento:</dt>
                <dd>{data.factors.engagement}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Valor do Contrato:</dt>
                <dd>{data.factors.contractValue}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Recência de Atividade:</dt>
                <dd>{data.factors.activityRecency}</dd>
              </div>
            </dl>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
```

### Alternativas Consideradas

- **Cálculo no frontend**: Rejeitado porque:
  - Viola constituição (lógica de negócio deve estar no backend)
  - Requer múltiplas chamadas API (atividades, contratos, etc.)
  - Inconsistente entre diferentes clients

---

## 5. State Management para Filtros

### Decisão

**Usar URL query params com sincronização via `useSearchParams` (React Router)** + cache do TanStack Query.

### Rationale

1. **Shareable URLs**: Usuários podem compartilhar links com filtros aplicados.
2. **Browser Navigation**: Botões voltar/avançar funcionam corretamente.
3. **Persistência Natural**: Recarregar página mantém filtros (FR-048).
4. **TanStack Query Integration**: Query params são parte da `queryKey`, invalidando cache automaticamente.
5. **No Extra Storage**: Não precisa gerenciar localStorage/sessionStorage.

### Implementação

```typescript
// src/features/crm/hooks/useOpportunityFilters.ts
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export interface OpportunityFilters {
  stage?: string;
  minValue?: number;
  maxValue?: number;
  dateFrom?: string;
  dateTo?: string;
}

export function useOpportunityFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<OpportunityFilters>(() => ({
    stage: searchParams.get('stage') ?? undefined,
    minValue: searchParams.get('minValue')
      ? Number(searchParams.get('minValue'))
      : undefined,
    maxValue: searchParams.get('maxValue')
      ? Number(searchParams.get('maxValue'))
      : undefined,
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
  }), [searchParams]);

  const setFilters = (newFilters: Partial<OpportunityFilters>) => {
    const params = new URLSearchParams(searchParams);

    // Atualizar params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  return { filters, setFilters, clearFilters };
}
```

```typescript
// src/features/crm/components/opportunities/OpportunityFilters.tsx
import { useOpportunityFilters } from '../../hooks/useOpportunityFilters';

export function OpportunityFilters() {
  const { filters, setFilters, clearFilters } = useOpportunityFilters();

  return (
    <div className="flex gap-4">
      <Select
        value={filters.stage ?? 'all'}
        onValueChange={(stage) =>
          setFilters({ stage: stage === 'all' ? undefined : stage })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Estágio" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="Lead">Lead</SelectItem>
          <SelectItem value="Qualified">Qualificado</SelectItem>
          <SelectItem value="Proposal">Proposta</SelectItem>
          <SelectItem value="Negotiation">Negociação</SelectItem>
        </SelectContent>
      </Select>

      {/* Outros filtros... */}

      <Button variant="outline" onClick={clearFilters}>
        Limpar Filtros
      </Button>
    </div>
  );
}
```

```typescript
// src/features/crm/pages/OpportunitiesPage.tsx
import { useOpportunityFilters } from '../hooks/useOpportunityFilters';
import { useOpportunities } from '../api/opportunities';

export function OpportunitiesPage() {
  const { filters } = useOpportunityFilters();

  // Filtros fazem parte da queryKey, então mudanças invalidam cache
  const { data, isLoading } = useOpportunities(filters);

  return (
    <div>
      <OpportunityFilters />
      <OpportunityList filters={filters} />
    </div>
  );
}
```

### Alternativas Consideradas

- **localStorage**: Rejeitado porque:
  - Não permite compartilhar URLs com filtros
  - Botões voltar/avançar não funcionam
  - Complexo sincronizar entre abas

- **sessionStorage**: Rejeitado pelos mesmos motivos do localStorage.

- **Estado global (Zustand/Redux)**: Rejeitado porque:
  - Over-engineering para filtros simples
  - Viola Anti-Entropy Simplicity
  - URL params são mais idiomáticos para filtros

---

## Dependências Adicionais Necessárias

Com base nas decisões acima, as seguintes dependências devem ser instaladas:

```json
{
  "dependencies": {
    "react-intersection-observer": "^9.5.3",  // Infinite scroll trigger
    "date-fns": "^4.1.0"  // Já instalado - formatação de datas
  },
  "devDependencies": {
    // Todas já instaladas
  }
}
```

**Nota**: `react-window` para virtual scrolling em timeline foi considerado mas adiado para otimização futura (YAGNI). Implementar apenas se performance degradar com >500 eventos.

---

## Resumo de Decisões

| Questão | Decisão | Tecnologia Principal |
|---------|---------|----------------------|
| Paginação | Infinite scroll com cursor | `useInfiniteQuery` + `react-intersection-observer` |
| Validação Multi-step | Zod schema + Optimistic UI | `useMutation` com `onMutate`/`onError` |
| Timeline Component | Componente genérico com adaptadores | Union types + Strategy pattern |
| Health Score | Backend calcula, frontend exibe | `useQuery` com cache 5min |
| Filtros | URL query params | `useSearchParams` + TanStack Query |

---

## Próximos Passos

✅ **Fase 0 Completa** - Todas as questões de pesquisa resolvidas.

**Próxima Fase**: Fase 1 - Criar `data-model.md` e `contracts/` com base nestas decisões.
