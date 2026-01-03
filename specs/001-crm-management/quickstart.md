# Quickstart: CRM Management Feature

**Feature**: 001-crm-management
**Stack**: React 18 + TypeScript + TanStack Query + React Hook Form + Zod + shadcn/ui

## Visão Geral

Este guia fornece tudo que você precisa para começar a desenvolver na feature CRM Management.

## Setup Local

### 1. Instalação de Dependências

```bash
# Instalar dependências do projeto
npm install

# Dependências adicionais para CRM (se necessário)
npm install react-intersection-observer
```

### 2. Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Backend em Execução

Certifique-se de que o backend está rodando:

```bash
# Em terminal separado, navegar para backend
cd ../leadsrapido_backend

# Executar backend
npm run dev:api
```

Verifique se o swagger está acessível: `http://localhost:3000/docs`

## Estrutura das Features

O sistema CRM é composto por **5 features independentes**:

```text
src/features/
├── opportunities/           # Gestão de Oportunidades
│   ├── index.ts             # Public API
│   ├── types/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── hooks/
│
├── customers/               # Gestão de Clientes
│   ├── index.ts             # Public API
│   ├── types/
│   ├── api/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── hooks/
│
├── contacts/                # Contatos de Clientes
│   ├── index.ts             # Public API
│   ├── types/
│   ├── api/
│   ├── components/
│   └── lib/
│
├── activities/              # Atividades de Clientes
│   ├── index.ts             # Public API
│   ├── types/
│   ├── api/
│   ├── components/
│   └── lib/
│
└── contracts/               # Contratos de Clientes
    ├── index.ts             # Public API
    ├── types/
    ├── api/
    ├── components/
    ├── pages/
    └── lib/
```

**Cada feature é independente** com seu próprio:
- Types e interfaces
- API hooks (TanStack Query)
- Componentes React
- Validações Zod
- Páginas/rotas (quando aplicável)

**Cross-feature imports** apenas via Public API (`index.ts`)

## Comandos Úteis

### Desenvolvimento

```bash
# Executar app em dev mode
npm run dev

# Executar com tenant específico
npm run dev:vendas-ia  # Porta 3000
npm run dev:publix     # Porta 3001
```

### Testes

```bash
# Executar todos os testes
npm run test:run

# Testes em watch mode
npm run test

# Testes de contrato (validar API)
npm run test:contract

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

### Linting e Build

```bash
# Linter
npm run lint

# Build para produção
npm run build
```

## Exemplo de Uso: API Hooks

### 1. Hook Básico de Listagem

```typescript
// src/features/opportunities/pages/OpportunitiesPage.tsx
import { OpportunityList } from '../components/OpportunityList';
import { useOpportunityFilters } from '../hooks/useOpportunityFilters';

export function OpportunitiesPage() {
  const { filters } = useOpportunityFilters({ stage: 'Qualificado' });
  return <OpportunityList filters={filters} showPipeline />;
}
```

### 2. Hook de Mutação (Create)

```typescript
// src/features/opportunities/pages/OpportunitiesPage.tsx (trecho)
import { OpportunityForm } from '../components/OpportunityForm';
import { useCreateOpportunity } from '../api/opportunities';

const createMutation = useCreateOpportunity();

<OpportunityForm
  onSubmit={(data) => createMutation.mutateAsync(data)}
  isSubmitting={createMutation.isPending}
  submitLabel="Criar oportunidade"
/>;
```

### 3. Infinite Scroll (Paginação Cursor-based)

```typescript
// src/features/opportunities/components/OpportunityList.tsx (trecho)
const loaderRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (!loaderRef.current || !hasNextPage) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isFetchingNextPage) {
      fetchNextPage();
    }
  });
  observer.observe(loaderRef.current);
  return () => observer.disconnect();
}, [fetchNextPage, hasNextPage, isFetchingNextPage]);
```

## Padrões de Código

### 1. Public API por Feature

Cada feature expõe apenas o necessário via `index.ts`:

```typescript
// src/features/opportunities/index.ts
export type { Opportunity, OpportunityStage, OpportunityStatus } from './types/opportunity';
export {
  useOpportunities,
  useCreateOpportunity,
  useWinOpportunity,
  useLoseOpportunity
} from './api/opportunities';
export { OpportunitiesPage } from './pages/OpportunitiesPage';
export { OpportunityDetailPage } from './pages/OpportunityDetailPage';

// Componentes internos NÃO são exportados
// OpportunityList, OpportunityForm, etc. são privados à feature
```

```typescript
// src/features/customers/index.ts
export type { Customer, CustomerStatus, CustomerSegment } from './types/customer';
export type { TimelineEvent } from './types/timeline';
export {
  useCustomers,
  useCustomer,
  useCustomerTimeline,
  useHealthScore
} from './api/customers';
export { CustomersPage } from './pages/CustomersPage';
export { CustomerDetailPage } from './pages/CustomerDetailPage';
```

### 2. Cross-Feature Imports

**✅ CORRETO** - Via Public API:

```typescript
// src/features/opportunities/components/WinOpportunityDialog.tsx
import { Customer } from '@/features/customers';
import { useCustomers } from '@/features/customers';

export function WinOpportunityDialog({ opportunityId }: Props) {
  const winMutation = useWinOpportunity();

  const handleWin = async () => {
    const result = await winMutation.mutateAsync(opportunityId);
    const customer: Customer = result.customer;
    // ... navegar para perfil do cliente
  };
}
```

**❌ ERRADO** - Importar internals:

```typescript
// NUNCA FAZER ISSO!
import { CustomerDetail } from '@/features/customers/components/CustomerDetail';
import { customerSchema } from '@/features/customers/lib/validations';
```

### 3. Shared Utilities

Para código **realmente compartilhado** (3+ features):

```typescript
// src/shared/lib/crm/formatters.ts
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Usado por: opportunities, customers, contracts
```

```typescript
// src/features/opportunities/components/OpportunityCard.tsx
import { formatCurrency } from '@/shared/lib/crm/formatters';

export function OpportunityCard({ opportunity }: Props) {
  return <div>{formatCurrency(opportunity.valorEstimado)}</div>;
}
```

### 4. Validação com Zod

```typescript
// src/features/opportunities/lib/validations.ts
import { z } from 'zod';

export const opportunitySchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  valorEstimado: z.number().positive('Valor deve ser positivo'),
  // ... outros campos
});

export type OpportunityInput = z.infer<typeof opportunitySchema>;
```

### 5. Formatação

```typescript
// src/shared/lib/crm/formatters.ts (compartilhado)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
}
```

### 6. Padrões de Erro e UX

**Mensagens de Erro (RF-042)**

Todas as mensagens de erro devem seguir estas diretrizes:

1. **Idioma**: Sempre em português brasileiro
2. **Tom**: Amigável, sem jargão técnico
3. **Ação**: Indicar próximo passo claro para o usuário
4. **Formato**: Usar toast notifications (via shadcn/ui Sonner)

**Exemplos**:

- ✅ BOM: "Não foi possível salvar a oportunidade. Verifique sua conexão e tente novamente."
- ❌ RUIM: "Error 500: Internal Server Error"

- ✅ BOM: "Este contato não pode ser removido pois é o contato principal. Defina outro contato como principal primeiro."
- ❌ RUIM: "Validation failed: isPrimary constraint violation"

**Implementação**:

```typescript
// Usar toast do shadcn/ui
import { toast } from '@/components/ui/use-toast';

// Ao capturar erro de API mutation
catch (error) {
  toast({
    variant: "destructive",
    title: "Erro ao salvar",
    description: "Não foi possível salvar as alterações. Tente novamente.",
  });
}

// Para sucesso
toast({
  title: "Oportunidade criada",
  description: "A oportunidade foi salva com sucesso.",
});
```

**Estados de Carregamento (RF-043)**:

- Usar skeletons para listas e cards
- Usar spinners para ações de formulário
- Mostrar indicador de loading durante paginação infinita

**Retry de Rede (RF-046)**:

TanStack Query já implementa retry automático:

```typescript
// Configuração padrão (já aplicada no query client):
{
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
}
```

## Testes TDD

### 1. Testes de Contrato (Red → Green → Refactor)

```bash
# Passo 1: Escrever teste que falha (RED)
npm run test:contract -- opportunities.contract

# Passo 2: Implementar até teste passar (GREEN)
# ... implementar código ...

# Passo 3: Refatorar mantendo testes verdes (REFACTOR)
npm run test:contract -- opportunities.contract
```

### 2. Testes de Integração

```typescript
// tests/integration/crm/opportunity-to-customer.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { OpportunityDetailPage } from '@/features/crm/pages/OpportunityDetailPage';

describe('Opportunity to Customer Conversion', () => {
  it('deve converter oportunidade em cliente ao clicar "Marcar como Ganha"', async () => {
    render(<OpportunityDetailPage opportunityId="test-id" />);

    // Clicar no botão "Marcar como Ganha"
    const winButton = screen.getByRole('button', { name: /marcar como ganha/i });
    await userEvent.click(winButton);

    // Confirmar no diálogo
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    await userEvent.click(confirmButton);

    // Verificar redirecionamento para página do cliente
    await waitFor(() => {
      expect(window.location.pathname).toMatch(/\/crm\/customers\/[\w-]+/);
    });
  });
});
```

## Debugging

### 1. React Query Devtools

```tsx
// App.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <>
      {/* ... app */}
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
```

### 2. Ver Cache do TanStack Query

```typescript
import { useQueryClient } from '@tanstack/react-query';

export function DebugButton() {
  const queryClient = useQueryClient();

  const handleClick = () => {
    console.log('Query Cache:', queryClient.getQueryCache().getAll());
  };

  return <Button onClick={handleClick}>Debug Cache</Button>;
}
```

## Resolução de Problemas

### Backend não está respondendo

```bash
# Verificar se backend está rodando
curl http://localhost:3000/api/health

# Verificar logs do backend
cd ../leadsrapido_backend
npm run dev:api
```

### Erros de CORS

```bash
# Backend deve ter CORS configurado para localhost:5173 (Vite default)
# Verificar arquivo de configuração do Fastify
```

### Testes de contrato falhando

```bash
# Verificar se backend está em conformidade com swagger.json
# Comparar schemas esperados vs. responses reais
npm run test:contract -- --reporter=verbose
```

## Recursos Adicionais

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Vitest Docs](https://vitest.dev/)
- Backend Swagger: `http://localhost:3000/docs`

## Próximos Passos

1. ✅ Ler `spec.md` para entender requisitos
2. ✅ Ler `plan.md` para entender arquitetura
3. ✅ Ler `research.md` para decisões técnicas
4. ✅ Ler `data-model.md` para tipos e validações
5. ⏭️ Executar `/speckit.tasks` para gerar plano de implementação
6. ⏭️ Implementar seguindo metodologia TDD

## Convenções do Projeto

- **Commits**: Usar conventional commits (`feat:`, `fix:`, `refactor:`, etc.)
- **Branches**: Feature branch já criada: `001-crm-management`
- **PRs**: Incluir testes, lint passing, build successful
- **Constituição**: Seguir princípios em `.specify/memory/constitution.md` v2.2.0

---

**Dúvidas?** Consulte a documentação ou abra uma issue no repositório.
