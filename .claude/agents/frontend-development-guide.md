# Frontend Development Guide - LeadsRápido

## Arquitetura de Componentes

### Estrutura de Componentes

```
src/
├── features/[feature-name]/
│   ├── components/          # Componentes específicos da feature
│   │   ├── FeatureComponent.tsx
│   │   └── index.ts        # Export local da feature
│   └── pages/              # Páginas da feature
│       └── FeaturePage.tsx
├── shared/
│   ├── components/
│   │   ├── common/         # Componentes reutilizáveis
│   │   ├── layout/         # Layout da aplicação
│   │   └── ui/             # Componentes UI básicos (shadcn/ui)
│   └── pages/              # Páginas genéricas
```

### Diretrizes de Componentes

#### 1. Quando Criar em `features/[feature]/components/`
- Componente usado apenas dentro de uma feature específica
- Lógica de negócio específica da feature
- Estado local relacionado ao domínio da feature

```typescript
// src/features/leads/components/LeadCard.tsx
export function LeadCard({ lead, onEdit, onDelete }: LeadCardProps) {
  // Lógica específica de leads
}
```

#### 2. Quando Criar em `shared/components/common/`
- Componente usado por 2+ features
- Lógica genérica, sem conhecimento de domínio
- Padrões de UI reutilizáveis

```typescript
// src/shared/components/common/DataTable.tsx
export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // Lógica genérica de tabela
}
```

#### 3. Quando Usar `shared/components/ui/`
- Componentes primitivos (Button, Input, Card)
- Componentes do shadcn/ui
- Building blocks básicos

### Padrões de Import

```typescript
// ✅ Import de components da mesma feature
import { LeadCard } from './LeadCard'
import { LeadForm } from '../components/LeadForm'

// ✅ Import de shared components
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/components/common/DataTable'

// ✅ Import de API pública de outra feature
import { useAuth } from '@/features/authentication'

// ❌ Import interno de outra feature
import { LoginForm } from '@/features/authentication/components/LoginForm'
```

## Estrutura de Páginas

### Organização
- Páginas ficam em `features/[feature]/pages/`
- Páginas genéricas em `shared/pages/`
- Uma página por arquivo, exported como default

### Template de Página

```typescript
// src/features/leads/pages/LeadsPage.tsx
import React from 'react'
import { useLeads } from '../hooks/useLeads'
import { LeadCard } from '../components/LeadCard'
import { Button } from '@/shared/components/ui/button'

export default function LeadsPage() {
  const { leads, isLoading } = useLeads()

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leads</h1>
      <div className="grid gap-4">
        {leads.map(lead => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}
```

## Hooks Pattern

### Hooks por Feature
- Hooks específicos ficam em `features/[feature]/hooks/`
- Hooks compartilhados em `shared/hooks/`

```typescript
// src/features/leads/hooks/useLeads.ts
export function useLeads() {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads
  })

  return { leads, isLoading, error }
}
```

### Export Pattern

```typescript
// src/features/leads/index.ts
export { default as LeadsPage } from './pages/LeadsPage'
export { LeadCard } from './components/LeadCard'
export { useLeads } from './hooks/useLeads'
export type { Lead, CreateLeadData } from './types'
```

## Styling Guidelines

### TailwindCSS Classes
- Use classes utilitárias do Tailwind
- Componentes UI seguem padrão shadcn/ui
- Classes customizadas apenas quando necessário

### Responsive Design
```typescript
// Mobile first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Theme & Colors
- Use variáveis CSS do shadcn/ui
- Cores consistentes: `text-foreground`, `bg-background`
- Estados: `text-muted-foreground`, `bg-muted`

## Estado e Data Management

### React Query
- Usado para server state
- Cache automático e sincronização
- Patterns consistentes

### Local State
- useState para estado local simples
- useReducer para estado complexo
- Context apenas para estado global necessário

### Form State
- React Hook Form para formulários
- Zod para validação
- shadcn/ui form components

## Performance Best Practices

### Code Splitting
```typescript
// Lazy loading de páginas
const LeadsPage = lazy(() => import('./pages/LeadsPage'))

// Dynamic imports para features grandes
const AdminPanel = lazy(() => import('@/features/admin'))
```

### Memoization
```typescript
// Memo para componentes pesados
export const LeadCard = memo(function LeadCard({ lead }: LeadCardProps) {
  // Component logic
})

// useMemo para cálculos custosos
const expensiveValue = useMemo(() => {
  return complexCalculation(data)
}, [data])
```

### Bundle Optimization
- Tree shaking automático
- Import apenas o necessário
- Análise com `npm run build` warnings

## Testing Strategy

### Component Testing
```typescript
// LeadCard.test.tsx
import { render, screen } from '@testing-library/react'
import { LeadCard } from './LeadCard'

test('renders lead information', () => {
  const mockLead = { id: '1', name: 'Test Lead', email: 'test@example.com' }
  render(<LeadCard lead={mockLead} />)

  expect(screen.getByText('Test Lead')).toBeInTheDocument()
  expect(screen.getByText('test@example.com')).toBeInTheDocument()
})
```

### Integration Testing
- Teste fluxos completos de features
- Mock APIs com MSW
- Test user interactions

Esta estrutura garante código organizado, escalável e de fácil manutenção.