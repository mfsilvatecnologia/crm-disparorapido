# Research: Modernização UI/UX do CRM

**Branch**: `002-crm-ui-modernization` | **Date**: 2026-01-03 | **Phase**: 0
**Input**: Technical Context from `plan.md`

---

## 1. Tour Library Selection

### Decision: **Custom Implementation** (baseada em Radix Primitives)

### Rationale

Após análise das opções disponíveis, a implementação customizada oferece melhor controle e integração com o design system existente:

1. **react-joyride**: Popular mas pesada (~30KB), estilo difícil de customizar para match com shadcn/ui
2. **shepherd.js**: Framework-agnostic mas requer wrapper React, mais overhead
3. **intro.js**: Legado, não TypeScript-first, estilo datado
4. **Custom com Radix**: Componentes já presentes (Dialog, Popover, Tooltip), full controle visual

### Alternatives Considered

| Library | Bundle | TypeScript | Customização | Veredicto |
|---------|--------|------------|--------------|-----------|
| react-joyride | ~30KB | ✅ | Média (CSS overrides) | Rejeitado: overhead para features que não usaremos |
| shepherd.js | ~25KB | ✅ | Alta (themes) | Rejeitado: requer wrapper, não React-native |
| Custom + Radix | ~0KB extra | ✅ | Total | **Escolhido**: usa primitivos existentes |

### Implementation Approach

```tsx
// Tour System usando Radix Primitives existentes
// - Portal para spotlight overlay (Radix Portal)
// - Popover para tooltips de steps (já existe em ui/popover.tsx)
// - localStorage para persistência de estado
// - Animações via Tailwind (fade-in, slide-up já definidas)
```

### Components Required

1. `TourProvider.tsx` - Context + state management
2. `TourSpotlight.tsx` - Overlay escuro com hole para elemento destacado
3. `TourTooltip.tsx` - Popover posicionado com conteúdo do step
4. `useTour.ts` - Hook para controlar tour programaticamente

---

## 2. Drag and Drop for Kanban

### Decision: **Usar @dnd-kit** (já instalado)

### Rationale

O projeto já possui `@dnd-kit/core`, `@dnd-kit/sortable` e `@dnd-kit/utilities` instalados. A implementação atual em `StageBoard.tsx` usa botões up/down simples, mas para Opportunities Kanban precisamos de drag real.

### Alternatives Considered

| Option | Status | Veredicto |
|--------|--------|-----------|
| Botões up/down (atual) | Implementado | Simples mas ruim UX para kanban |
| @dnd-kit | Instalado, não usado | **Escolhido**: moderno, acessível, performático |
| react-beautiful-dnd | Descontinuado | Rejeitado: não mais mantido |

### Implementation Approach

```tsx
// Para Opportunities Kanban (P4 - User Story 6)
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

// Cada coluna = Sortable container
// Cards = Sortable items
// Cross-column drag = custom collision detection
```

---

## 3. Command Palette Implementation

### Decision: **Estender cmdk existente** com global keyboard listener

### Rationale

O componente `Command` já existe em `src/shared/components/ui/command.tsx` usando cmdk. Apenas precisamos:

1. Criar wrapper global `CommandPalette.tsx`
2. Adicionar keyboard listener para Cmd+K / Ctrl+K
3. Registrar comandos de navegação e ações

### Current State

- ✅ `cmdk` instalado (v1.1.1)
- ✅ `CommandDialog`, `CommandInput`, `CommandList`, `CommandItem` disponíveis
- ✅ Já usado em `EmpresaSelector.tsx` (prova de conceito funcional)
- ❌ Não há listener global de teclado
- ❌ Não há registro centralizado de comandos

### Implementation Approach

```tsx
// src/shared/components/command-palette/CommandPalette.tsx
// - Wrap CommandDialog existente
// - useEffect para registrar keydown listener (Cmd+K)
// - Context para registrar comandos dinamicamente por página
// - Busca fuzzy nativa do cmdk

// src/shared/components/command-palette/useKeyboardShortcuts.ts
// - Registry de atalhos (G+L, G+C, C+L, etc.)
// - Evitar conflitos com browser usando event.preventDefault() seletivo
// - Sequências de teclas com timeout (ex: G seguido de L em 500ms)
```

### Keyboard Shortcuts Strategy

Para evitar conflitos com browser:
- Usar sequências (G → L) ao invés de combos
- Cmd+K é safe (só conflita com Spotlight do Mac, aceitável)
- "/" para focus search é padrão (Gmail, GitHub)
- "?" para help overlay é padrão (GitHub, Twitter)
- Esc é universal para fechar

---

## 4. Data Fetching Pattern

### Decision: **Seguir padrão existente** de TanStack Query hooks

### Rationale

O padrão em `useLeads.ts` está bem estabelecido:

```tsx
// Padrão existente:
export const leadKeys = {
  all: ['leads'] as const,
  lists: () => [...leadKeys.all, 'list'] as const,
  list: (filters) => [...leadKeys.lists(), filters] as const,
};

export function useLeads(params?) {
  return useQuery({
    queryKey: leadKeys.list(normalizedParams),
    queryFn: () => apiClient.getLeads(normalizedParams),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
```

### Guidelines for New Hooks

1. Query keys organizados por feature em objeto `{feature}Keys`
2. Parâmetros normalizados (remover undefined/null)
3. staleTime padrão: 2min para listas, 5min para detalhes
4. Retry inteligente (não retry em 4xx)
5. Hooks separados para list vs detail vs mutations

---

## 5. Empty State Illustrations

### Decision: **SVG Inline customizado** por contexto

### Rationale

O EmptyState atual (`src/shared/components/common/EmptyState.tsx`) aceita um ícone Lucide. Para a modernização, precisamos de ilustrações mais expressivas.

### Alternatives Considered

| Option | Bundle | Customização | Veredicto |
|--------|--------|--------------|-----------|
| undraw.co SVGs | 0KB (inline) | Alta (cores via currentColor) | **Escolhido** |
| Lottie animations | ~50KB+ | Média | Rejeitado: overhead para empty states |
| Lucide icons (atual) | 0KB extra | Baixa | Manter para estados simples |

### Implementation Approach

```tsx
// Manter EmptyState atual para casos simples (com ícone Lucide)
// Criar EmptyStateIllustrated para casos elaborados

interface EmptyStateIllustratedProps {
  illustration: 'no-data' | 'no-leads' | 'no-customers' | 'search-empty';
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

// SVGs inline em src/shared/components/design-system/illustrations/
// - Cores via CSS variables (--primary, --muted)
// - Tamanho responsivo via width/height props
```

---

## 6. Design Tokens Strategy

### Decision: **Centralizar no tailwind.config.ts** (já iniciado)

### Rationale

O `tailwind.config.ts` já tem tokens parciais definidos:
- Cores: primary (50-900), success, warning, danger, gray
- Spacing: baseado em 4px
- Border radius: sm, md, lg via CSS variable
- Animações: fade-in, slide-up, glow

### What's Missing

1. **Semânticas de status**: Mapear cores para status de CRM
2. **Score ranges**: Cores para faixas de score (0-50, 51-70, 71-89, 90-100)
3. **Typografia scale**: Sizes completos (já usa Inter)

### Implementation Approach

```ts
// Adicionar ao tailwind.config.ts
colors: {
  status: {
    novo: '#6366F1',      // primary
    qualificado: '#10B981', // success
    contatado: '#F59E0B',  // warning
    convertido: '#059669', // green-600
    descartado: '#EF4444', // danger
  },
  score: {
    low: '#EF4444',    // 0-50: vermelho
    medium: '#F59E0B', // 51-70: amarelo
    high: '#0EA5E9',   // 71-89: azul
    excellent: '#10B981', // 90-100: verde
  }
}
```

---

## 7. Component Architecture

### Decision: **Composable primitives + compound components**

### Rationale

Seguir padrão shadcn/ui de componentes compostos:

```tsx
// Exemplo: Toolbar compound component
<Toolbar>
  <Toolbar.Search placeholder="Buscar leads..." />
  <Toolbar.Filters>
    <QuickFilter status="novo" count={12} />
    <QuickFilter status="qualificado" count={8} />
  </Toolbar.Filters>
  <Toolbar.ViewSwitcher views={['list', 'kanban', 'cards']} />
  <Toolbar.Actions>
    <Button>Novo Lead</Button>
  </Toolbar.Actions>
</Toolbar>
```

### Benefits

1. Flexibilidade de composição
2. Tipo-safe via TypeScript
3. Consistente com padrão Radix/shadcn
4. Fácil de testar (cada parte isolada)

---

## 8. Performance Considerations

### Decision: **Virtualization para listas grandes**

### Rationale

Para listas com 1000+ items (Leads, Contacts), usar @tanstack/react-virtual:

```tsx
// Já tem @tanstack/react-table instalado
// @tanstack/react-virtual é do mesmo ecosystem

import { useVirtualizer } from '@tanstack/react-virtual';

// Aplicar em:
// - LeadsPage table view (se > 100 items visíveis)
// - ContactsPage list view
// - Command Palette search results
```

### Not Required For

- Kanban (máx ~50 cards por coluna típico)
- StatsWidget (sempre poucos items)
- QuickFilters (máx 10-15 opções)

---

## Summary of Decisions

| Topic | Decision | Dependency Needed |
|-------|----------|-------------------|
| Tour System | Custom + Radix | Nenhuma nova |
| Drag & Drop | @dnd-kit | Já instalado |
| Command Palette | Estender cmdk | Já instalado |
| Data Fetching | TanStack Query (padrão existente) | Já instalado |
| Illustrations | SVG inline | Nenhuma |
| Design Tokens | Tailwind config | Nenhuma |
| Virtualization | @tanstack/react-virtual | **Adicionar** (opcional Phase 1) |

---

## Next Steps

1. ✅ Research complete - Todas as decisões documentadas
2. → **Phase 1**: Gerar data-model.md com tipos TypeScript
3. → **Phase 1**: Gerar contracts/ com interfaces de componentes
4. → **Phase 1**: Gerar quickstart.md para primeiro componente

---

*Research completed: 2026-01-03*
