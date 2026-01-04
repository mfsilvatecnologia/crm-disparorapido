# Tasks: Modernização Completa da UI/UX do CRM

**Input**: Design documents from `/specs/002-crm-ui-modernization/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Unit tests são esperados para componentes de design system. Testes de integração para páginas refatoradas. Contract tests N/A (feature 100% frontend).

**Organization**: Tasks organizadas por User Story para permitir implementação e teste independente de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: Qual user story esta tarefa pertence (US1, US2, etc.)
- Caminhos exatos incluídos nas descrições

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Inicialização do projeto e estrutura básica

- [x] T001 [P] Criar estrutura de pastas `src/shared/components/design-system/`
- [x] T002 [P] Criar estrutura de pastas `src/shared/components/command-palette/`
- [x] T003 [P] Criar estrutura de pastas `src/shared/components/tour/`
- [x] T004 [P] Criar arquivo `src/config/design-tokens.ts`
- [x] T005 [P] Criar barrel exports `src/shared/components/design-system/index.ts`
- [x] T006 [P] Criar barrel exports `src/shared/components/command-palette/index.ts`
- [x] T007 [P] Criar barrel exports `src/shared/components/tour/index.ts`
- [x] T008 Criar pasta de testes `src/shared/components/design-system/__tests__/`

**Checkpoint**: Estrutura de pastas criada, pronta para implementação de componentes

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Infraestrutura core que DEVE estar completa antes de QUALQUER user story

**⚠️ CRITICAL**: Nenhum trabalho de user story pode começar até esta fase estar completa

- [x] T009 Atualizar `tailwind.config.ts` com tokens de status colors (lead, opportunity, campaign, contract)
- [x] T010 [P] Atualizar `tailwind.config.ts` com score colors (low, medium, high, excellent)
- [x] T011 [P] Atualizar `tailwind.config.ts` safelist para classes dinâmicas de cor
- [x] T012 Implementar `src/config/design-tokens.ts` com statusColors e scoreColors exportados
- [x] T013 Verificar que fonte Inter está carregando corretamente via tailwind.config.ts

**Checkpoint**: Foundation pronta - implementação de user stories pode começar

---

## Phase 3: User Story 1 - Sistema de Design Base (Priority: P1) 🎯 MVP

**Goal**: Definir tokens de design (cores, tipografia, espaçamento) que serão usados por todos os componentes

**Independent Test**: Inspecionar tokens aplicados em componente de exemplo e verificar consistência

### Tests for User Story 1 ⚠️

> **NOTE: Escrever estes testes PRIMEIRO, garantir que FALHAM antes da implementação**

- [x] T014 [P] [US1] Unit test para design tokens em `src/config/__tests__/design-tokens.test.ts`
- [x] T015 [P] [US1] Unit test para função getScoreConfig em `src/config/__tests__/design-tokens.test.ts`

### Implementation for User Story 1

- [x] T016 [US1] Implementar statusColors completo para todos os 5 entity types (lead, opportunity, campaign, contract, customer)
- [x] T017 [US1] Implementar scoreColors com ranges (0-50, 51-70, 71-89, 90-100)
- [x] T018 [US1] Implementar função getScoreConfig(score: number)
- [x] T019 [US1] Implementar função isValidEntityType type guard
- [x] T020 [US1] Documentar tokens com JSDoc comments

**Checkpoint**: Sistema de design tokens completo e testado. Pronto para componentes.

---

## Phase 4: User Story 2 - Componentes Reutilizáveis Core (Priority: P1) 🎯 MVP

**Goal**: Criar biblioteca de componentes reutilizáveis (StatusBadge, Toolbar, QuickFilters, etc.)

**Independent Test**: Cada componente renderiza corretamente com todas as variantes

### Tests for User Story 2 ⚠️

- [x] T021 [P] [US2] Unit test StatusBadge em `src/shared/components/design-system/__tests__/StatusBadge.test.tsx`
- [x] T022 [P] [US2] Unit test ScoreBadge em `src/shared/components/design-system/__tests__/ScoreBadge.test.tsx`
- [x] T023 [P] [US2] Unit test RelativeTime em `src/shared/components/design-system/__tests__/RelativeTime.test.tsx`
- [x] T024 [P] [US2] Unit test StatsWidget em `src/shared/components/design-system/__tests__/StatsWidget.test.tsx`
- [x] T025 [P] [US2] Unit test QuickFilters em `src/shared/components/design-system/__tests__/QuickFilters.test.tsx`
- [x] T026 [P] [US2] Unit test FilterChip em `src/shared/components/design-system/__tests__/FilterChip.test.tsx`
- [x] T027 [P] [US2] Unit test ViewSwitcher em `src/shared/components/design-system/__tests__/ViewSwitcher.test.tsx`
- [x] T028 [P] [US2] Unit test Toolbar em `src/shared/components/design-system/__tests__/Toolbar.test.tsx`
- [x] T029 [P] [US2] Unit test SmartButton em `src/shared/components/design-system/__tests__/SmartButton.test.tsx`
- [x] T030 [P] [US2] Unit test PageHeader em `src/shared/components/design-system/__tests__/PageHeader.test.tsx`

### Implementation for User Story 2

- [x] T031 [US2] Implementar StatusBadge em `src/shared/components/design-system/StatusBadge.tsx` (FR-005)
- [x] T032 [P] [US2] Implementar ScoreBadge em `src/shared/components/design-system/ScoreBadge.tsx` (FR-014)
- [x] T033 [P] [US2] Implementar RelativeTime em `src/shared/components/design-system/RelativeTime.tsx` (FR-015)
- [x] T034 [US2] Implementar StatsWidget em `src/shared/components/design-system/StatsWidget.tsx` (FR-007)
- [x] T035 [US2] Implementar QuickFilters em `src/shared/components/design-system/QuickFilters.tsx` (FR-008)
- [x] T036 [US2] Implementar FilterChip em `src/shared/components/design-system/FilterChip.tsx` (FR-009)
- [x] T037 [US2] Implementar ViewSwitcher em `src/shared/components/design-system/ViewSwitcher.tsx` (FR-010)
- [x] T038 [US2] Implementar Toolbar (compound component) em `src/shared/components/design-system/Toolbar.tsx` (FR-006)
- [x] T039 [US2] Implementar SmartButton em `src/shared/components/design-system/SmartButton.tsx` (FR-012)
- [x] T040 [US2] Implementar PageHeader em `src/shared/components/design-system/PageHeader.tsx` (FR-013)
- [x] T041 [US2] Atualizar barrel export `src/shared/components/design-system/index.ts` com todos componentes

**Checkpoint**: Todos os 10 componentes core implementados e testados. Prontos para uso nas páginas.

---

## Phase 5: User Story 3 - Refatoração da Página de Leads (Priority: P2)

**Goal**: Modernizar página de Leads como piloto para validar componentes

**Independent Test**: Acessar /app/crm/leads e verificar novo layout com todos componentes do design system

### Tests for User Story 3 ⚠️

- [x] T042 [P] [US3] Integration test LeadsPage em `src/features/leads/__tests__/LeadsPage.integration.test.tsx`

### Implementation for User Story 3

- [x] T043 [US3] Refatorar header de LeadsPage para usar PageHeader com breadcrumbs (FR-016)
- [x] T044 [US3] Adicionar StatsWidget com métricas (Total, Novos, Qualificados, Convertidos) ao header (FR-016)
- [x] T045 [US3] Substituir toolbar existente por Toolbar component (FR-017)
- [x] T046 [US3] Adicionar QuickFilters para status de lead (FR-017)
- [x] T047 [US3] Integrar ViewSwitcher no Toolbar (list, kanban, cards) (FR-017)
- [x] T048 [US3] Substituir todos emojis por ícones Lucide React (FR-018)
- [x] T049 [US3] Simplificar colunas da tabela para essenciais (FR-019)
- [x] T050 [US3] Refatorar LeadDetailsDialog para usar Drawer lateral (FR-020)
- [x] T051 [US3] Integrar StatusBadge na tabela e cards
- [x] T052 [US3] Integrar ScoreBadge para exibir score de qualificação
- [x] T053 [US3] Integrar RelativeTime para "Última Atividade"

**Checkpoint**: Página de Leads completamente modernizada e funcional. Validação visual completa.

---

## Phase 6: User Story 4 - Wizard de Onboarding (Priority: P3)

**Goal**: Sistema de tour guiado para descoberta de features

**Independent Test**: Resetar localStorage e verificar tour aparece na primeira visita

### Tests for User Story 4 ⚠️

- [ ] T054 [P] [US4] Unit test TourProvider em `src/shared/components/tour/__tests__/TourProvider.test.tsx`
- [ ] T055 [P] [US4] Unit test useTour hook em `src/shared/components/tour/__tests__/useTour.test.ts`
- [ ] T056 [P] [US4] Unit test TourSpotlight em `src/shared/components/tour/__tests__/TourSpotlight.test.tsx`

### Implementation for User Story 4

- [x] T057 [US4] Implementar TourProvider com Context API em `src/shared/components/tour/TourProvider.tsx`
- [x] T058 [US4] Implementar useTour hook em `src/shared/components/tour/useTour.ts`
- [x] T059 [US4] Implementar TourSpotlight (overlay com hole) em `src/shared/components/tour/TourSpotlight.tsx` (FR-027)
- [x] T060 [US4] Implementar TourTooltip (popover posicionado) em `src/shared/components/tour/TourTooltip.tsx` (FR-028)
- [x] T061 [US4] Implementar TourProgress (indicador 2/5) em `src/shared/components/tour/TourProgress.tsx` (FR-029)
- [x] T062 [US4] Implementar navegação do tour (next, prev, skip) (FR-030)
- [x] T063 [US4] Implementar persistência em localStorage (FR-031)
- [ ] T064 [US4] Adicionar botão de ajuda para reativar tour (FR-032)
- [x] T065 [US4] Criar tour de Leads em `src/features/leads/tours/leadsTour.ts`
- [x] T066 [US4] Integrar TourProvider no App.tsx
- [x] T067 [US4] Atualizar barrel export `src/shared/components/tour/index.ts`

**Checkpoint**: Sistema de tour funcional. Tour de Leads aparece na primeira visita.

---

## Phase 7: User Story 5 - Command Palette e Navegação Rápida (Priority: P3)

**Goal**: Navegação rápida via Cmd+K e atalhos de teclado

**Independent Test**: Pressionar Cmd+K/Ctrl+K abre palette, digitar "leads" mostra navegação

### Tests for User Story 5 ⚠️

- [ ] T068 [P] [US5] Unit test CommandPalette em `src/shared/components/command-palette/__tests__/CommandPalette.test.tsx`
- [ ] T069 [P] [US5] Unit test useKeyboardShortcuts em `src/shared/components/command-palette/__tests__/useKeyboardShortcuts.test.ts`

### Implementation for User Story 5

- [ ] T070 [US5] Implementar CommandPaletteProvider em `src/shared/components/command-palette/CommandPaletteProvider.tsx`
- [ ] T071 [US5] Implementar CommandPalette UI usando cmdk existente em `src/shared/components/command-palette/CommandPalette.tsx` (FR-033)
- [ ] T072 [US5] Implementar busca fuzzy em comandos (FR-034)
- [ ] T073 [US5] Implementar useKeyboardShortcuts hook em `src/shared/components/command-palette/useKeyboardShortcuts.ts`
- [ ] T074 [US5] Registrar atalhos de navegação G+L, G+C, G+O (FR-035)
- [ ] T075 [US5] Registrar atalhos de criação C+L, C+O (FR-035)
- [ ] T076 [US5] Implementar "/" para focar search (FR-036)
- [ ] T077 [US5] Implementar "?" para mostrar overlay de atalhos (FR-037)
- [ ] T078 [US5] Implementar Esc para fechar modals/drawers (FR-038)
- [ ] T079 [US5] Criar ShortcutsHelp overlay component
- [ ] T080 [US5] Integrar CommandPaletteProvider no App.tsx
- [ ] T081 [US5] Atualizar barrel export `src/shared/components/command-palette/index.ts`

**Checkpoint**: Command palette funcional. Todos atalhos de teclado funcionando.

---

## Phase 8: User Story 6 - Refatoração Customers e Opportunities (Priority: P4)

**Goal**: Aplicar design system em Customers e Opportunities

**Independent Test**: Acessar /app/crm/customers e /app/crm/opportunities e verificar consistência com Leads

### Tests for User Story 6 ⚠️

- [ ] T082 [P] [US6] Integration test CustomersPage em `src/features/customers/__tests__/CustomersPage.integration.test.tsx`
- [ ] T083 [P] [US6] Integration test OpportunitiesPage em `src/features/opportunities/__tests__/OpportunitiesPage.integration.test.tsx`

### Implementation for User Story 6 - Customers

- [ ] T084 [US6] Refatorar CustomersPage header com PageHeader + StatsWidget (Total, Ativos, MRR, Churn) (FR-021)
- [ ] T085 [US6] Adicionar SmartButtons nos cards de customer (Contatos, Contratos, MRR, Oportunidades) (FR-022)
- [ ] T086 [US6] Adicionar FilterChips para segmento, plano, tipo de contrato
- [ ] T087 [US6] Integrar StatusBadge para status do customer
- [ ] T088 [US6] Substituir toolbar existente por Toolbar component

### Implementation for User Story 6 - Opportunities

- [ ] T089 [US6] Refatorar OpportunitiesPage header com PageHeader + pipeline stats bar (FR-023)
- [ ] T090 [US6] Adicionar probability badge nos cards de opportunity (FR-024)
- [ ] T091 [US6] Adicionar expected close date e next action nos cards (FR-024)
- [ ] T092 [US6] Implementar badge de alerta para oportunidades atrasadas (FR-025)
- [ ] T093 [US6] Integrar ViewSwitcher com kanban, list, calendar, forecast
- [ ] T094 [US6] Implementar Kanban view usando @dnd-kit
- [ ] T095 [US6] Substituir toolbar existente por Toolbar component

**Checkpoint**: Customers e Opportunities modernizados e consistentes com Leads.

---

## Phase 9: User Story 7 - Nova Página de Contacts (Priority: P5)

**Goal**: Criar página standalone de Contacts

**Independent Test**: Acessar /app/crm/contacts e verificar listagem global de contatos

### Tests for User Story 7 ⚠️

- [ ] T096 [P] [US7] Integration test ContactsPage em `src/features/contacts/__tests__/ContactsPage.integration.test.tsx`

### Implementation for User Story 7

- [ ] T097 [US7] Criar rota /app/crm/contacts no router (FR-039)
- [ ] T098 [US7] Criar ContactsPage em `src/features/contacts/pages/ContactsPage.tsx` (FR-040)
- [ ] T099 [US7] Implementar listagem de contatos com PageHeader e Toolbar
- [ ] T100 [US7] Implementar importação CSV com mapeamento de colunas (FR-041)
- [ ] T101 [US7] Implementar ícones de canal (email, telefone, LinkedIn) com verificação (FR-043)
- [ ] T102 [US7] Implementar badge "Primário" para contatos primários (FR-044)
- [ ] T103 [US7] Implementar filtros por empresa, cargo, departamento (FR-045)
- [ ] T104 [US7] Implementar link para página do customer correspondente
- [ ] T105 [US7] Criar useContacts hook em `src/features/contacts/hooks/useContacts.ts`

**Checkpoint**: Página de Contacts standalone funcional com importação CSV.

> **Note**: FR-042 (importação LinkedIn via OAuth2) requer integração backend. Criar como tarefa futura.

---

## Phase 10: User Story 8 - Implementação Completa de Contracts (Priority: P6)

**Goal**: CRUD completo de Contracts com alertas de renovação

**Independent Test**: Acessar /app/crm/contracts e verificar criação, edição e alertas funcionais

### Tests for User Story 8 ⚠️

- [ ] T106 [P] [US8] Integration test ContractsPage em `src/features/contracts/__tests__/ContractsPage.integration.test.tsx`
- [ ] T107 [P] [US8] Unit test calculateMRR em `src/features/contracts/__tests__/utils.test.ts`
- [ ] T108 [P] [US8] Unit test calculateContractProgress em `src/features/contracts/__tests__/utils.test.ts`

### Implementation for User Story 8

- [ ] T109 [US8] Refatorar ContractsPage header com PageHeader + StatsWidget (FR-046)
- [ ] T110 [US8] Implementar alert banner para contratos expirando em 7 dias (FR-047)
- [ ] T111 [US8] Implementar ContractForm para criar/editar contratos (FR-048, FR-049)
- [ ] T112 [US8] Implementar ContractCard com progress bar de período (FR-050)
- [ ] T113 [US8] Implementar função calculateMRR em `src/features/contracts/lib/utils.ts` (FR-051)
- [ ] T114 [US8] Implementar função calculateContractProgress em `src/features/contracts/lib/utils.ts`
- [ ] T115 [US8] Integrar ViewSwitcher com list, timeline, calendar (FR-052)
- [ ] T116 [US8] Implementar Timeline view
- [ ] T117 [US8] Implementar Calendar view com datas de renovação
- [ ] T118 [US8] Criar useContracts hook em `src/features/contracts/hooks/useContracts.ts`

**Checkpoint**: Contracts com CRUD completo, alertas e múltiplas visualizações.

---

## Phase 11: User Story 9 - Refatoração de Campaigns (Priority: P7)

**Goal**: Modernizar página de Campaigns com stats funcionais

**Independent Test**: Acessar /app/campaigns e verificar stats com valores reais

### Tests for User Story 9 ⚠️

- [ ] T119 [P] [US9] Integration test CampaignsPage em `src/features/campaigns/__tests__/CampaignsPage.integration.test.tsx`

### Implementation for User Story 9

- [ ] T120 [US9] Refatorar CampaignsPage header com 6 stats (Ativas, Contatos, Abertura, Conversão, ROI, Receita)
- [ ] T121 [US9] Implementar campaign card com métricas inline
- [ ] T122 [US9] Adicionar progress bar em campanhas ativas
- [ ] T123 [US9] Integrar StatusBadge para status de campanha
- [ ] T124 [US9] Substituir toolbar existente por Toolbar component
- [ ] T125 [US9] Exibir data de criação e início nos cards

**Checkpoint**: Campaigns modernizado com stats funcionais.

---

## Phase 12: User Story 10 - Melhorias de UX/Fluxo (Priority: P8)

**Goal**: Melhorias transversais de UX (breadcrumbs, empty states, loading states)

**Independent Test**: Navegar pelo sistema verificando breadcrumbs, empty states e skeletons

### Tests for User Story 10 ⚠️

- [ ] T126 [P] [US10] Unit test EmptyStateIllustrated em `src/shared/components/common/__tests__/EmptyStateIllustrated.test.tsx`
- [ ] T127 [P] [US10] Unit test SkeletonLoader em `src/shared/components/common/__tests__/SkeletonLoader.test.tsx`

### Implementation for User Story 10

- [ ] T128 [US10] Implementar breadcrumbs clicáveis em todas as páginas principais (FR-053)
- [ ] T129 [US10] Implementar BulkActionsToolbar component (FR-054)
- [ ] T130 [US10] Implementar ContextMenu para ações com botão direito (FR-055)
- [ ] T131 [US10] Criar EmptyStateIllustrated com SVG illustrations (FR-056)
- [ ] T132 [US10] Criar ilustrações SVG para empty states (no-leads, no-customers, search-empty)
- [ ] T133 [US10] Implementar SkeletonLoader components (cards, table rows) (FR-057)
- [ ] T134 [US10] Implementar ProgressIndicator para ações assíncronas (FR-058)
- [ ] T135 [US10] Aplicar empty states em todas as páginas de listagem
- [ ] T136 [US10] Aplicar skeleton loaders em todas as páginas de listagem

**Checkpoint**: Melhorias de UX aplicadas em todo o sistema.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Melhorias que afetam múltiplas user stories

- [ ] T137 [P] Rodar `npm run lint` e corrigir todos os erros de linting
- [ ] T138 [P] Rodar `npm run build` e verificar build de produção
- [ ] T139 [P] Verificar Lighthouse score de acessibilidade > 90 em todas as páginas (SC-016)
- [ ] T140 [P] Verificar bundle size < 500KB gzipped para componentes compartilhados (SC-017)
- [ ] T141 Verificar que 0 emojis hardcoded permanecem no código (SC-002)
- [ ] T142 [P] Executar quickstart.md e validar que fluxo funciona
- [ ] T143 Documentar componentes com JSDoc e exemplos de uso
- [ ] T144 Criar tour de Opportunities (dependência: T094 kanban)
- [ ] T145 Criar tour de Customers

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOQUEIA todas as User Stories
    ↓
┌───────────────────────────────────────────────────────────┐
│  User Stories podem iniciar em paralelo após Phase 2:     │
│                                                           │
│  US1 (P1) ──→ US2 (P1) ──→ US3 (P2) ──→ US6 (P4)         │
│                   │                                       │
│                   └──→ US4 (P3)                          │
│                   └──→ US5 (P3)                          │
│                                                           │
│  US7 (P5), US8 (P6), US9 (P7) podem iniciar após US2     │
│                                                           │
│  US10 (P8) depende de todas as refatorações              │
└───────────────────────────────────────────────────────────┘
    ↓
Phase 13 (Polish) - após todas User Stories desejadas
```

### User Story Dependencies

| User Story | Depende de | Pode rodar em paralelo com |
|------------|------------|----------------------------|
| US1 (Design Tokens) | Phase 2 | - |
| US2 (Componentes) | US1 | - |
| US3 (Leads) | US2 | US4, US5 |
| US4 (Tour) | US2 | US3, US5 |
| US5 (Command Palette) | US2 | US3, US4 |
| US6 (Customers/Opportunities) | US3 | US7, US8, US9 |
| US7 (Contacts) | US2 | US6, US8, US9 |
| US8 (Contracts) | US2 | US6, US7, US9 |
| US9 (Campaigns) | US2 | US6, US7, US8 |
| US10 (UX Polish) | US3-US9 | - |

### Within Each User Story

1. Testes DEVEM ser escritos e FALHAR antes da implementação
2. Componentes antes de páginas
3. Hooks antes de componentes que os usam
4. Implementação core antes de integração
5. Story completa antes de passar para próxima prioridade

### Parallel Opportunities

```bash
# Launch all tests for US2 in parallel:
T021, T022, T023, T024, T025, T026, T027, T028, T029, T030

# Launch all component implementations marked [P]:
T032 (ScoreBadge), T033 (RelativeTime) - após T031 (StatusBadge)

# Launch all page refactors for US6 in parallel (diferentes páginas):
T084-T088 (Customers) || T089-T095 (Opportunities)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Design Tokens)
4. Complete Phase 4: US2 (Componentes)
5. Complete Phase 5: US3 (Leads)
6. **STOP and VALIDATE**: Testar Leads página independentemente
7. Deploy/demo se pronto

### Incremental Delivery

| Milestone | User Stories | Value Delivered |
|-----------|--------------|-----------------|
| M1 (MVP) | US1 + US2 + US3 | Design system + Componentes + Leads modernizado |
| M2 | + US4 + US5 | Tour + Command Palette (produtividade) |
| M3 | + US6 | Customers + Opportunities modernizados |
| M4 | + US7 + US8 | Contacts standalone + Contracts completo |
| M5 | + US9 + US10 | Campaigns + Polish final |

### Estimated Task Counts

| Phase | Tasks | Parallel? |
|-------|-------|-----------|
| Setup | 8 | Yes |
| Foundational | 5 | Partial |
| US1 | 7 | Partial |
| US2 | 21 | Yes (tests) |
| US3 | 12 | No |
| US4 | 14 | Partial |
| US5 | 14 | Partial |
| US6 | 14 | Yes (pages) |
| US7 | 10 | No |
| US8 | 13 | Partial |
| US9 | 7 | No |
| US10 | 11 | Partial |
| Polish | 9 | Yes |
| **TOTAL** | **145** | - |

---

## Notes

- [P] tasks = arquivos diferentes, sem dependências
- [Story] label mapeia tarefa para user story específica
- Cada user story deve ser completável e testável independentemente
- Verificar que testes falham antes de implementar
- Commit após cada tarefa ou grupo lógico
- Parar em qualquer checkpoint para validar story independentemente
- Evitar: tarefas vagas, conflitos de arquivo, dependências cross-story que quebram independência

---

*Tasks generated: 2026-01-03*
*Total: 145 tasks across 13 phases*
