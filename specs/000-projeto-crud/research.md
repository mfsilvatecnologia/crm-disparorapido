# Research Notes: Sistema de CRUD de Projetos

**Feature**: 001-projeto-crud
**Created**: 2025-12-18
**Phase**: Phase 0 - Research & Technology Decisions

## Overview

This document captures technology decisions, patterns, and best practices researched for implementing the CRUD system for problem-resolution projects. All technical choices are documented with rationale and alternatives considered.

## Technology Decisions

### 1. Server State Management: TanStack Query v5

**Decision**: Use TanStack Query (React Query) v5 for all server state management.

**Rationale**:
- **Declarative data fetching**: Queries and mutations are declarative, reducing boilerplate
- **Automatic caching**: Built-in intelligent caching with configurable stale times (5min for this feature)
- **Optimistic updates**: Native support for optimistic UI updates when defining methodology
- **Query invalidation**: Easy cache invalidation after mutations (create, edit, archive)
- **DevTools**: Excellent debugging experience with TanStack Query DevTools
- **TypeScript support**: First-class TypeScript support with excellent type inference

**Alternatives Considered**:
- **Redux Toolkit + RTK Query**: More boilerplate, overkill for server state when we don't need global client state
- **SWR**: Similar to TanStack Query but less feature-rich and smaller community
- **Zustand + fetch**: Would require manual cache invalidation and loading state management

**Key Patterns**:
```typescript
// Query pattern for listing projects
const useProjetos = (filters) => {
  return useQuery({
    queryKey: ['projetos', filters],
    queryFn: () => projetoService.listar(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation pattern for creating project
const useCreateProjeto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: projetoService.criar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projetos'] })
    },
  })
}
```

### 2. Form Management: React Hook Form v7 + Zod v3

**Decision**: React Hook Form for form state + Zod for schema validation.

**Rationale**:
- **Performance**: Uncontrolled components minimize re-renders
- **TypeScript inference**: Zod schemas auto-generate TypeScript types
- **Validation**: Real-time validation with <100ms response time
- **Integration**: Native integration via `@hookform/resolvers/zod`
- **Developer Experience**: Declarative schema definition reduces validation boilerplate

**Alternatives Considered**:
- **Formik**: More re-renders, larger bundle size, less performant
- **Manual state**: Would require custom validation logic and error state management
- **Yup**: Similar to Zod but TypeScript inference is not as seamless

**Key Patterns**:
```typescript
// Zod schema for project creation
const projetoCreateSchema = z.object({
  titulo: z.string().min(3).max(200),
  descricao: z.string().min(10),
  cliente_id: z.string().uuid(),
  responsavel_id: z.string().uuid(),
  data_inicio: z.date(),
})

type ProjetoCreateInput = z.infer<typeof projetoCreateSchema>

// React Hook Form usage
const { register, handleSubmit, formState: { errors } } = useForm<ProjetoCreateInput>({
  resolver: zodResolver(projetoCreateSchema),
})
```

### 3. HTTP Client: Axios v1

**Decision**: Axios for all HTTP communication with backend API.

**Rationale**:
- **Interceptors**: Easy JWT token injection and refresh logic
- **Error handling**: Centralized error transformation
- **Request/Response transformation**: Automatic date parsing, camelCase conversion
- **Cancellation**: Built-in request cancellation support
- **Browser compatibility**: Works consistently across all target browsers

**Alternatives Considered**:
- **fetch API**: Would require custom interceptor implementation and polyfills
- **ky**: Smaller but less battle-tested, missing some advanced features

**Key Patterns**:
```typescript
// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Transform backend errors to user-friendly messages
    return Promise.reject(transformError(error))
  }
)
```

### 4. UI Components: Tailwind CSS + shadcn/ui

**Decision**: Tailwind CSS for styling + shadcn/ui for component primitives.

**Rationale**:
- **Consistency**: Already in use across the codebase
- **Accessibility**: shadcn/ui components have built-in ARIA attributes
- **Customization**: Components are copied to project (not npm dependency), fully customizable
- **Design tokens**: Tailwind config ensures consistent spacing, colors, typography
- **Responsive**: Built-in responsive utilities (breakpoints at 768px, 1024px)

**Components Needed**:
- Form components: Input, Select, Textarea, DatePicker
- Feedback: Badge, Toast, Alert, ProgressBar
- Layout: Card, Modal, Tabs, Separator
- Navigation: Dropdown, Breadcrumbs

### 5. Routing: React Router v6

**Decision**: React Router v6 for client-side routing.

**Rationale**:
- **Already integrated**: Part of existing codebase
- **Nested routes**: Supports layout nesting for consistent UI
- **Loaders**: Can pre-fetch data for routes (complementary to TanStack Query)
- **Type-safe**: TypeScript support for route params

**Route Structure**:
```
/projetos              → ProjetosIndexPage (list)
/projetos/novo         → ProjetoNovoPage (create)
/projetos/:id          → ProjetoDetalhesPage (details)
/projetos/:id/editar   → [handled by modal on details page]
```

### 6. Testing Strategy

**Decision**: Three-tier testing approach - Contract → Integration → Unit.

**Contract Tests (MSW)**:
- **Tool**: Mock Service Worker (MSW) v2
- **Purpose**: Verify API contract compliance without hitting backend
- **Scope**: All service layer functions (`projetoService.ts`)
- **Run**: `npm run test:contract`

**Integration Tests (Cypress)**:
- **Tool**: Cypress v13 (or Playwright if already in use)
- **Purpose**: E2E user flows across multiple components
- **Scope**:
  - Create project flow
  - Define methodology flow
  - List/filter/pagination
  - Edit project flow
- **Run**: `npm run test:integration`

**Unit Tests (Vitest)**:
- **Tool**: Vitest (fast, Vite-native)
- **Purpose**: Isolated component and validator testing
- **Scope**:
  - Form validation logic
  - Zod schema tests
  - Component rendering (RTL)
- **Run**: `npm run test:unit` or `npm run test:run`

## Architecture Patterns

### Feature-Modular Structure

**Decision**: Isolate all feature code in `src/features/resolucao-problemas/`.

**Rationale**:
- **Encapsulation**: All related code co-located (types, hooks, components, services)
- **Discoverability**: Easy to find all code related to this feature
- **Reusability**: Public API via `index.ts` barrel export enables clean imports
- **Maintainability**: Feature can be refactored or removed without affecting other features

**Public API Pattern**:
```typescript
// src/features/resolucao-problemas/index.ts
export { ProjetosIndexPage, ProjetoDetalhesPage } from './pages'
export { useProjeto, useProjetos } from './hooks'
export type { Projeto, ProjetoDetalhado, Metodologia } from './types'
```

**Import Pattern**:
```typescript
// Other features import via public API only
import { useProjetos, type Projeto } from '@/features/resolucao-problemas'
// ❌ NEVER: import { ProjetoCard } from '@/features/resolucao-problemas/components/projeto/ProjetoCard'
```

### Methodology Immutability Pattern

**Decision**: Enforce methodology immutability at UI and type level.

**Rationale**:
- **Requirement**: FR-020 and FR-043 specify methodology is immutable once defined
- **Type Safety**: TypeScript types prevent accidental mutations
- **UI Enforcement**: Form fields disabled, no edit button when methodology defined

**Implementation**:
```typescript
type ProjetoSemMetodologia = {
  id: string
  titulo: string
  metodologia: null
  pode_definir_metodologia: true
}

type ProjetoComMetodologia = {
  id: string
  titulo: string
  metodologia: 'MASP' | '8D' | 'A3'
  pode_definir_metodologia: false
}

type Projeto = ProjetoSemMetodologia | ProjetoComMetodologia
```

### Progressive Enhancement for Etapas

**Decision**: Render etapas generically, specialize only when needed.

**Rationale**:
- **MVP scope**: Initial implementation doesn't require methodology-specific etapa forms
- **Future-proof**: Generic EtapaCard can display MASP/8D/A3 etapas without changes
- **Simplicity**: Avoid premature abstraction

**Pattern**:
```typescript
// Generic etapa rendering
<EtapaCard
  titulo={etapa.titulo}
  status={etapa.status}
  descricao={etapa.descricao}
  ordem={etapa.ordem}
/>

// Future: Methodology-specific details can be added without breaking existing code
{etapa.tipo === 'MASP' && <MaspEtapaDetails etapa={etapa} />}
```

## Performance Considerations

### Caching Strategy

**Decision**: 5-minute stale time for project queries, immediate invalidation on mutations.

**Rationale**:
- Projects don't change frequently (not real-time data)
- 5 minutes balances freshness with reduced network requests
- Mutations trigger immediate refetch for affected queries

**Configuration**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
```

### Pagination & Filtering

**Decision**: Server-side pagination with 20 items/page default, client-side filtering optimization.

**Rationale**:
- **Performance goal**: <3s for 100 projects, <500ms filters
- Backend handles pagination to reduce payload size
- Frontend applies additional filters on cached data when possible

**Pattern**:
```typescript
const useProjetos = (filters) => {
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: ['projetos', { page, ...filters }],
    queryFn: () => projetoService.listar({ page, limit: 20, ...filters }),
    keepPreviousData: true, // Smooth pagination transitions
  })
  return { ...query, page, setPage }
}
```

## Integration Points

### Backend API Contract

**Documented in**: `docs/ph3a/FRONTEND_GUIDE-RESOLUCAO-PROBLEMAS.md`

**Key Endpoints**:
- `GET /api/v1/resolucao-problemas/projetos` - List projects
- `POST /api/v1/resolucao-problemas/projetos` - Create project
- `GET /api/v1/resolucao-problemas/projetos/:id` - Get project details
- `PUT /api/v1/resolucao-problemas/projetos/:id` - Update project
- `POST /api/v1/resolucao-problemas/projetos/:id/metodologia` - Define methodology
- `PUT /api/v1/resolucao-problemas/projetos/:id/arquivar` - Archive project

**Data Flow**:
```
User Action → Component → Hook (useMutation) → Service Layer → Axios → Backend API
                ↓
          TanStack Query invalidates cache
                ↓
          Components re-render with fresh data
```

### Authentication

**Decision**: JWT token from existing auth system, injected via Axios interceptor.

**Pattern**:
```typescript
// Assumes token is stored in localStorage or httpOnly cookie
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Error Handling

### User-Facing Errors

**Decision**: Transform backend errors to user-friendly messages, display via toast notifications.

**Pattern**:
```typescript
const transformError = (error: AxiosError) => {
  if (error.response?.status === 400) {
    return new Error('Dados inválidos. Verifique o formulário.')
  }
  if (error.response?.status === 409) {
    return new Error('Metodologia já foi definida para este projeto.')
  }
  return new Error('Erro ao processar solicitação. Tente novamente.')
}
```

### Validation Errors

**Decision**: Display validation errors inline on form fields, prevent submission until valid.

**Pattern**:
```typescript
<Input
  {...register('titulo')}
  error={errors.titulo?.message}
  helperText={errors.titulo ? 'Título deve ter entre 3 e 200 caracteres' : ''}
/>
```

## Development Workflow

### Test-First Sequence

1. **Write Contract Test**: Define expected API behavior with MSW
2. **Run Test (RED)**: Test fails (service not implemented)
3. **Implement Service**: Write service function to match contract
4. **Run Test (GREEN)**: Test passes
5. **Write Integration Test**: E2E flow with Cypress
6. **Run Test (RED)**: Test fails (components not implemented)
7. **Implement Components**: Build React components
8. **Run Test (GREEN)**: Test passes
9. **Refactor**: Optimize, extract reusable logic

### Commit Strategy

**Decision**: Small, focused commits (<500 LOC each) with component isolation.

**Pattern**:
```
commit: "Add projeto types and Zod validators"
commit: "Add projetoService with contract tests"
commit: "Add useProjeto and useProjetos hooks"
commit: "Add ProjetoForm component with validation"
commit: "Add ProjetoList with filtering and pagination"
commit: "Add integration tests for create flow"
```

## Open Questions

**None** - All technical context is defined. No NEEDS CLARIFICATION markers remain.

## Next Steps

Proceed to **Phase 1** to generate:
1. `data-model.md` - TypeScript type definitions
2. `contracts/` - API contract specifications
3. `quickstart.md` - Setup and development instructions
