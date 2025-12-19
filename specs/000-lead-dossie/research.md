# Pesquisa & Decisões Técnicas: Dossiê de Leads PH3A

**Feature**: 001-lead-dossie
**Data**: 2025-12-05
**Fase**: 0 - Outline & Research

## Visão Geral

Este documento consolida decisões técnicas, padrões e melhores práticas para a implementação da funcionalidade de Dossiê de Leads com enriquecimento PH3A.

---

## Decisão 1: Gerenciamento de Estado para Dados de Enriquecimento

**Decisão**: Utilizar TanStack Query (React Query) para gerenciamento de estado do servidor

**Justificativa**:
- Cache automático de requisições (reduz chamadas redundantes à API)
- Sincronização automática em segundo plano
- Estados de loading/error integrados
- Invalidação inteligente de cache após mutações (compra de enriquecimento)
- Já utilizado no projeto (`@tanstack/react-query` presente em package.json)
- Suporte nativo para polling/refetch (útil para verificar status de enriquecimentos em progresso)

**Alternativas Consideradas**:
- **Context API + useReducer**: Mais complexo de gerenciar cache e sincronização, requer implementação manual de loading states
- **Redux Toolkit Query**: Mais pesado, adiciona dependência extra, overkill para este escopo
- **SWR**: Similar ao React Query, mas React Query tem melhor suporte para mutações e invalidação de cache

**Padrão de Implementação**:
```typescript
// Exemplo: useDossier.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useDossier = (leadId: string) => {
  return useQuery({
    queryKey: ['dossier', leadId],
    queryFn: () => ph3aService.getDossier(leadId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
  });
};

export const usePurchaseEnrichment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ph3aService.purchaseEnrichment,
    onSuccess: (data, variables) => {
      // Invalida cache do dossiê e saldo de créditos
      queryClient.invalidateQueries({ queryKey: ['dossier', variables.leadId] });
      queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
    },
  });
};
```

---

## Decisão 2: Mascaramento de Dados Sensíveis (LGPD)

**Decisão**: Implementar utilitário de mascaramento no frontend com diferentes níveis baseados em permissões do usuário

**Justificativa**:
- Conformidade com LGPD obrigatória
- Backend já deve retornar dados mascarados para usuários sem permissão total
- Frontend adiciona camada extra de proteção visual
- Permite controle granular de exibição (ex: mostrar 4 últimos dígitos, mascarar email parcialmente)

**Padrão de Implementação**:
```typescript
// utils/lgpdMask.ts
export const maskCPF = (cpf: string): string => {
  // 123.456.789-00 → ***.456.789-**
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**');
};

export const maskPhone = (phone: string): string => {
  // (11) 98765-4321 → (11) ****-4321
  return phone.replace(/(\(\d{2}\)\s)(\d{4,5})-(\d{4})/, '$1****-$3');
};

export const maskEmail = (email: string): string => {
  // exemplo@domain.com → e****o@domain.com
  const [local, domain] = email.split('@');
  const maskedLocal = local[0] + '****' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
};
```

**Alternativas Consideradas**:
- **Mascaramento completo no backend**: Perde flexibilidade de exibição, não permite drill-down para usuários autorizados
- **Biblioteca externa (react-text-mask)**: Adiciona dependência desnecessária, nossa lógica é simples

---

## Decisão 3: Estrutura de Dados para Dossiê (Schema Zod)

**Decisão**: Definir schemas Zod para validação de tipos e integração com React Hook Form

**Justificativa**:
- Validação em runtime (segurança contra mudanças de API)
- Integração nativa com React Hook Form (`@hookform/resolvers`)
- Schemas servem como documentação viva dos contratos
- Type-safety automático (inferência TypeScript)
- Já utilizado no projeto

**Padrão de Implementação**:
```typescript
// types/dossier.ts
import { z } from 'zod';

export const FinancialHealthSchema = z.object({
  creditScore: z.number().min(0).max(1000).nullable(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  purchaseCapacityMin: z.number().nullable(),
  purchaseCapacityMax: z.number().nullable(),
  flags: z.array(z.string()),
  source: z.literal('DataFraud'),
  updatedAt: z.string().datetime(),
});

export const DossierDataSchema = z.object({
  leadId: z.string().uuid(),
  financialHealth: FinancialHealthSchema.nullable(),
  enrichedProfile: EnrichedProfileSchema.nullable(),
  digitalTrace: DigitalTraceSchema.nullable(),
  marketAffinity: MarketAffinitySchema.nullable(),
  registryValidation: RegistryValidationSchema.nullable(),
  expiresAt: z.string().datetime(),
});

export type DossierData = z.infer<typeof DossierDataSchema>;
export type FinancialHealth = z.infer<typeof FinancialHealthSchema>;
```

**Alternativas Consideradas**:
- **TypeScript interfaces simples**: Sem validação em runtime, inseguro
- **io-ts**: Mais verboso, curva de aprendizado maior

---

## Decisão 4: Componentes de Card Reutilizáveis

**Decisão**: Criar componente base `EnrichmentCard` com slots para composição

**Justificativa**:
- DRY: Evita duplicação de lógica de loading/error/fonte
- Consistência visual entre todos os cards
- Facilita manutenção (mudança de layout afeta todos os cards)
- shadcn/ui fornece primitivos (Card, CardHeader, CardContent) que serão extendidos

**Padrão de Implementação**:
```typescript
// components/EnrichmentCard.tsx
interface EnrichmentCardProps {
  title: string;
  source: string;
  updatedAt?: string;
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const EnrichmentCard: React.FC<EnrichmentCardProps> = ({
  title,
  source,
  updatedAt,
  isLoading,
  error,
  isEmpty,
  onRefresh,
  children,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{title}</CardTitle>
          <Badge variant="outline">Fonte: {source}</Badge>
        </div>
        {updatedAt && (
          <p className="text-sm text-muted-foreground">
            Atualizado em {formatDateTime(updatedAt)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading && <LoadingCard />}
        {error && <ErrorState error={error} onRetry={onRefresh} />}
        {isEmpty && <EmptyState message="Dados não disponíveis" />}
        {!isLoading && !error && !isEmpty && children}
      </CardContent>
    </Card>
  );
};
```

**Alternativas Consideradas**:
- **Cards completamente independentes**: Duplicação de código, inconsistência visual
- **HOC (Higher-Order Component)**: Mais complexo, menos legível

---

## Decisão 5: Estratégia de Paginação

**Decisão**: Paginação cursor-based com fallback para offset-based

**Justificativa**:
- Cursor-based ideal para listas dinâmicas (novos leads adicionados frequentemente)
- Previne duplicação/skip de itens durante paginação
- Melhor performance em grandes datasets
- Fallback offset para compatibilidade inicial

**Padrão de Implementação**:
```typescript
// hooks/useLeads.ts
export const useLeads = (filters: LeadFilters) => {
  return useInfiniteQuery({
    queryKey: ['leads', filters],
    queryFn: ({ pageParam }) =>
      leadsService.getLeads({ ...filters, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};

// Componente
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useLeads(filters);

// Infinite scroll ou botão "Carregar mais"
```

**Alternativas Consideradas**:
- **Offset-based simples**: Problemas com dados dinâmicos, pode pular/duplicar itens
- **Paginação tradicional (páginas numeradas)**: Menos eficiente, UX inferior para listas longas

---

## Decisão 6: Tratamento de Erros e Estados Vazios

**Decisão**: Componentes dedicados `ErrorState`, `EmptyState`, `LoadingCard` em `src/shared/components/`

**Justificativa**:
- Consistência de UX em toda a aplicação
- Reutilização (já existem no projeto)
- Mensagens de erro contextuais (não apenas "Erro genérico")
- Loading states impedem cliques acidentais durante requests

**Padrão de Implementação**:
```typescript
// Uso em componente
{isLoading && <LoadingCard />}
{error && (
  <ErrorState
    title="Não foi possível carregar os dados"
    message={error.message}
    action={{ label: 'Tentar novamente', onClick: refetch }}
  />
)}
{!data?.length && (
  <EmptyState
    icon={<FileX className="h-12 w-12" />}
    title="Nenhum lead encontrado"
    description="Comece importando ou criando leads"
    action={{ label: 'Criar Lead', onClick: () => navigate('/leads/new') }}
  />
)}
```

---

## Decisão 7: Formatação de Valores Monetários e Datas

**Decisão**: Utilizar `Intl.NumberFormat` e `date-fns` para formatação

**Justificativa**:
- `Intl.NumberFormat`: Nativo do navegador, suporte a múltiplas moedas, localização automática
- `date-fns`: Leve, tree-shakeable, melhor que moment.js, já utilizado no projeto
- Evita bibliotecas pesadas de formatação

**Padrão de Implementação**:
```typescript
// utils/formatters.ts
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100); // Backend retorna em centavos
};

export const formatCurrencyRange = (min: number, max: number): string => {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
};

export const formatDateTime = (isoString: string): string => {
  return format(parseISO(isoString), "dd/MM/yyyy 'às' HH:mm");
};

export const formatRelativeTime = (isoString: string): string => {
  return formatDistanceToNow(parseISO(isoString), {
    addSuffix: true,
    locale: ptBR
  });
};
```

---

## Decisão 8: Prevenção de Compras Duplicadas

**Decisão**: Validação no backend + indicação visual no frontend

**Justificativa**:
- Backend: Autoridade final, previne race conditions
- Frontend: UX melhor, mostra "Já adquirido" antes do clique
- Dois níveis de proteção (defesa em profundidade)

**Padrão de Implementação**:
```typescript
// Modal de compra
const isPurchased = dossier?.financialHealth !== null;

<EnrichmentPackageCard
  package={financialHealthPackage}
  isPurchased={isPurchased}
  purchasedAt={dossier?.financialHealth?.updatedAt}
  onPurchase={handlePurchase}
  disabled={isPurchased || !hasSufficientCredits}
/>

// Card mostra badge "Adquirido em DD/MM/YYYY" se isPurchased
```

---

## Decisão 9: Mobile Responsividade

**Decisão**: Mobile-first com Tailwind responsive classes

**Justificativa**:
- Tailwind facilita responsive design
- Mobile-first garante performance em dispositivos móveis
- Cards empilham verticalmente em telas pequenas
- Lista de leads muda para layout mais compacto

**Padrão de Implementação**:
```tsx
// Desktop: grid 2 colunas, Mobile: stack
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
  <FinancialHealthCard />
  <EnrichedProfileCard />
</div>

// Lista de leads: cards em mobile, tabela em desktop
<div className="hidden md:block">
  <LeadTable />
</div>
<div className="block md:hidden">
  <LeadCards />
</div>
```

---

## Decisão 10: Histórico de Enriquecimentos

**Decisão**: Timeline component com filtros por tipo e data

**Justificativa**:
- Auditoria: quem comprou, quando, quanto custou
- Transparência para gestão de créditos
- Debugging: identificar compras duplicadas/falhas

**Padrão de Implementação**:
```typescript
// components/EnrichmentHistory.tsx
interface HistoryEntry {
  id: string;
  packageType: EnrichmentPackageType;
  purchasedBy: string;
  purchasedAt: string;
  cost: number;
  status: 'success' | 'failed' | 'pending';
}

// Timeline vertical com shadcn/ui components
```

---

## Resumo de Dependências

| Dependência | Versão Requerida | Uso |
|-------------|------------------|-----|
| `@tanstack/react-query` | ^5.0.0 | Gerenciamento de estado servidor |
| `zod` | ^3.22.0 | Validação de schemas |
| `date-fns` | ^3.0.0 | Formatação de datas |
| `react-hook-form` | ^7.48.0 | Formulários (modal de compra) |
| `@hookform/resolvers` | ^3.3.0 | Integração Zod + RHF |

**Nota**: Todas já estão instaladas no projeto conforme `package.json`

---

## Próximos Passos

1. ✅ Pesquisa completa
2. → Fase 1: Definir data-model.md
3. → Fase 1: Criar contratos de API (OpenAPI)
4. → Fase 1: Criar quickstart.md
5. → Fase 2: Gerar tasks.md (comando `/speckit.tasks`)

