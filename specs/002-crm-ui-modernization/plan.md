# Implementation Plan: Modernização Completa da UI/UX do CRM

**Branch**: `002-crm-ui-modernization` | **Date**: 2026-01-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-crm-ui-modernization/spec.md`
**Constitution Version**: 2.2.0

## Summary

Modernização completa da interface do LeadsRapido CRM, implementando um sistema de design unificado inspirado no Odoo. O projeto inclui:
- **Design System Base**: Tokens de cor, tipografia, espaçamento e componentes primitivos
- **Componentes Reutilizáveis**: StatusBadge, Toolbar, QuickFilters, ViewSwitcher, StatsWidget, Drawer, SmartButtons, PageHeader
- **Refatoração de 6 Páginas CRM**: Leads (piloto), Customers, Opportunities, Contacts, Campaigns, Contracts
- **Features de Produtividade**: Wizard de onboarding, Command Palette (Cmd+K), navegação por atalhos de teclado
- **Melhorias de UX**: Breadcrumbs, bulk actions, empty states, skeleton loaders

Abordagem técnica: extensão do design system existente no Tailwind, criação de componentes React reutilizáveis em `src/shared/components/`, refatoração progressiva das páginas CRM existentes.

## Technical Context

**Language/Version**: TypeScript 5.8+, React 18.3+  
**Primary Dependencies**: Vite 5.4+, Tailwind CSS 3.4+, shadcn/ui (Radix), TanStack Query 5.89, React Hook Form 7.62, Zod 3.25, Lucide React 0.462, cmdk 1.1 (command palette)  
**Storage**: N/A (frontend - dados via API backend através de swagger.json)  
**Testing**: Vitest (npm run test:contract, npm run test:integration, npm run test:run)  
**Target Platform**: Web (browsers modernos: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)  
**Project Type**: Web application (SPA frontend com multi-tenant support)  
**Performance Goals**: FCP < 1.5s em 3G (SC-015), Lighthouse Accessibility > 90 (SC-016), Bundle < 500KB gzipped (SC-017)  
**Constraints**: Sistema multi-tenant via TENANT_PORT, sem secrets no frontend, integração backend-only para third-parties  
**Scale/Scope**: 6 páginas CRM principais, ~30+ componentes reutilizáveis, 10 user stories

## Constitution Check

*GATE: ✅ PASSED - Todas as verificações passam antes de Phase 0*

### I. API-First Backend Authority
✅ **PASSED**: Esta feature é 100% frontend - não requer novos endpoints backend. Todos os dados já são consumidos via contratos existentes em `swagger.json`. Componentes de design system são puramente visuais. A única exceção é persistência de tour state em localStorage (não requer backend).

### II. Test-First Delivery
✅ **PASSED**: Vitest está configurado com suítes de contract, integration e unit tests. Componentes de design system terão:
- **Unit tests**: Cada componente (StatusBadge, Toolbar, etc.) terá testes de renderização e variantes
- **Integration tests**: Páginas refatoradas (Leads, Customers) terão testes de fluxo
- **Contract tests**: N/A para componentes puramente visuais sem chamadas API

Comandos esperados antes de merge:
```bash
npm run test:run      # Unit tests dos componentes
npm run lint          # ESLint
npm run build         # Build de produção
```

### III. Feature-Modular Boundaries
✅ **PASSED**: 
- Componentes de design system vão para `src/shared/components/design-system/` (nova pasta)
- Componentes existentes em `src/shared/components/ui/` (shadcn/ui) são mantidos
- Cada feature (leads, customers, etc.) importa componentes via path `@/shared/components/`
- Não há importações cross-feature de internals
- Command Palette e Tour System são features compartilhadas → `src/shared/components/`

### IV. Anti-Entropy Simplicity
✅ **PASSED**:
- Scope MVP: Apenas componentes listados no spec (15 componentes core)
- Reutilização: Estender shadcn/ui existente, não substituir
- DRY: Tokens de design centralizados no tailwind.config.ts (já iniciado)
- Commits focados: Cada componente em commit separado (< 300 LOC estimado por componente)
- Sem abstrações especulativas: Componentes concretos para necessidades documentadas

### V. Spec-Driven Change Control
✅ **PASSED**:
- **Change-ID**: 002-crm-ui-modernization
- **Constitution Version**: 2.2.0
- **Spec Approved**: spec.md com 10 user stories, 58 functional requirements, 20 success criteria
- **Validation**: Spec segue template OpenSpec com scenarios Gherkin

## Project Structure

### Documentation (this feature)

```text
specs/002-crm-ui-modernization/
├── spec.md              # Feature specification (input)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - decisões técnicas
├── data-model.md        # Phase 1 output - tipos e entidades
├── quickstart.md        # Phase 1 output - guia de implementação
├── contracts/           # Phase 1 output - interfaces TypeScript
│   ├── design-tokens.ts
│   ├── components.ts
│   ├── tour-system.ts
│   └── command-palette.ts
├── checklists/          # Existing checklists
│   └── *.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── shared/
│   ├── components/
│   │   ├── ui/                    # Existing shadcn/ui primitives (unchanged)
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── drawer.tsx
│   │   │   └── ...
│   │   ├── design-system/         # NEW: CRM-specific design components
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   ├── QuickFilters.tsx
│   │   │   ├── FilterChip.tsx
│   │   │   ├── ViewSwitcher.tsx
│   │   │   ├── StatsWidget.tsx
│   │   │   ├── SmartButton.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   ├── ScoreBadge.tsx
│   │   │   ├── RelativeTime.tsx
│   │   │   └── index.ts           # Public API barrel export
│   │   ├── command-palette/       # NEW: Command palette feature
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── useCommandPalette.ts
│   │   │   ├── useKeyboardShortcuts.ts
│   │   │   └── index.ts
│   │   ├── tour/                  # NEW: Feature tour system
│   │   │   ├── TourProvider.tsx
│   │   │   ├── TourStep.tsx
│   │   │   ├── TourSpotlight.tsx
│   │   │   ├── useTour.ts
│   │   │   └── index.ts
│   │   └── common/                # Existing common components
│   │       └── EmptyState.tsx     # To be enhanced
│   └── hooks/
│       └── index.ts
├── features/
│   ├── leads/                     # REFACTOR: Apply new design system
│   │   ├── pages/
│   │   │   └── LeadsPage.tsx      # Modernized with PageHeader, Toolbar, etc.
│   │   └── components/
│   ├── customers/                 # REFACTOR
│   ├── opportunities/             # REFACTOR
│   ├── contacts/                  # NEW PAGE: Standalone contacts
│   ├── contracts/                 # REFACTOR/COMPLETE
│   └── campaigns/                 # REFACTOR
└── config/
    └── design-tokens.ts           # Exported token values (mirrors tailwind)

tests/
├── unit/
│   └── shared/
│       └── design-system/         # Component unit tests
├── integration/
│   └── pages/                     # Page integration tests
└── contract/
    └── ...                        # API contract tests (existing)
```

**Structure Decision**: Frontend SPA com feature-modular architecture. Novos componentes de design system em `src/shared/components/design-system/` para manter separação clara dos primitivos shadcn/ui e permitir evolução independente. Tour e Command Palette como features compartilhadas em suas próprias pastas com public API via `index.ts`.

## Complexity Tracking

> Nenhuma violação da Constitution identificada. Feature segue princípios de simplicidade.

| Aspecto | Decisão | Justificativa |
|---------|---------|---------------|
| Componentes | Extensão shadcn/ui | Reutilizar primitivos existentes (Button, Badge, Drawer) |
| Tour System | react-joyride ou custom | Avaliar na Phase 0 Research |
| Command Palette | cmdk (já instalado) | Biblioteca madura, já presente no projeto |
| Persistência Tour | localStorage | Sem necessidade de backend para estado de UI |

## Phase 0: Research Required

### Unknowns to Clarify

1. **Tour Library**: react-joyride vs intro.js vs custom implementation - qual oferece melhor DX e customização visual?
2. **Kanban DnD**: @dnd-kit (já instalado) é suficiente para Opportunities kanban?
3. **Data Fetching Pattern**: Hooks existentes seguem qual padrão? TanStack Query diretamente?
4. **Keyboard Shortcuts Registry**: Como evitar conflitos com atalhos do browser?
5. **Empty State Illustrations**: SVG inline vs biblioteca de ilustrações?

### Research Tasks

- [ ] Avaliar react-joyride vs shepherd.js vs custom tour
- [ ] Revisar padrão de hooks existentes em features/leads/
- [ ] Verificar implementação atual de @dnd-kit no projeto
- [ ] Definir estratégia de keyboard shortcuts (tinykeys vs custom)

## Phase 1: Design Deliverables

Após Research completa, gerar:

1. **data-model.md**: Tipos TypeScript para DesignToken, StatusBadge, TourStep, CommandItem
2. **contracts/**: Interfaces de componentes e props
3. **quickstart.md**: Guia passo-a-passo para implementar primeiro componente (StatusBadge)

---

*Next Step: Execute Phase 0 Research to resolve unknowns*
