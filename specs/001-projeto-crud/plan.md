# Implementation Plan: Sistema de CRUD de Projetos de Resolução de Problemas

**Branch**: `001-projeto-crud` | **Date**: 2025-12-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-projeto-crud/spec.md`
**Constitution Version**: 2.2.0

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implementar CRUD completo de projetos de resolução de problemas com suporte a três metodologias (MASP, 8D, A3). O sistema permite criação de projetos sem metodologia definida, posterior definição única e imutável da metodologia, e gerenciamento completo do ciclo de vida do projeto através de interfaces React com integração à API backend existente.

**Abordagem Técnica**: Feature-modular React com TanStack Query para server state, React Hook Form + Zod para validação, e comunicação via REST API já documentada. Implementação seguirá test-first com contract tests e integration tests precedendo o desenvolvimento dos componentes.

## Technical Context

**Language/Version**: TypeScript 5.8+, React 18.3+, Node.js 20+ (runtime)
**Primary Dependencies**:
  - TanStack Query v5 (server state management)
  - React Hook Form v7 + Zod v3 (form validation)
  - Axios v1 (HTTP client)
  - Tailwind CSS + shadcn/ui (UI components)
  - React Router v6 (routing)

**Storage**: N/A (frontend - dados via API backend)
**Testing**: Vitest (unit), MSW (contract), Cypress/Playwright (integration)
**Target Platform**: Web (Chrome/Firefox/Safari modern browsers)
**Project Type**: Web frontend (SPA)
**Performance Goals**:
  - Listagem de 100 projetos em <3s
  - Filtros retornam em <500ms
  - Formulários validam em tempo real (<100ms)

**Constraints**:
  - Deve consumir APENAS API backend (sem chamadas diretas terceiros)
  - Cache inteligente (5min stale time)
  - Suporte desktop/tablet/mobile (breakpoints 768px, 1024px)

**Scale/Scope**:
  - ~15 componentes React
  - 6 user stories (P1-P3)
  - 63 functional requirements
  - Integração com API `/api/v1/resolucao-problemas/projetos`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **API-First Backend Authority**: PASS
- API backend já documentada em `docs/ph3a/FRONTEND_GUIDE-RESOLUCAO-PROBLEMAS.md`
- Endpoints: `/api/v1/resolucao-problemas/projetos/*` já especificados
- Nenhuma integração direta com terceiros
- Cliente HTTP (Axios) consome apenas contratos backend

✅ **Test-First Delivery**: PASS
- Contract tests planejados com MSW para mockar API responses
- Integration tests com Cypress para fluxos E2E (criar, definir metodologia, listar, editar)
- Comandos: `npm run test:contract`, `npm run test:integration`, `npm run test:run`
- Sequência: RED (tests fail) → GREEN (implement) → REFACTOR

✅ **Feature-Modular Boundaries**: PASS
- Feature em `src/features/resolucao-problemas/`
- Exports públicos via `src/features/resolucao-problemas/index.ts`
- Componentes compartilhados (badges, forms) só migram para `src/shared` após uso por 3+ features
- Sem imports cross-feature de internals

✅ **Anti-Entropy Simplicity**: PASS
- Scope: MVP com 6 user stories (P1-P3 priorizadas)
- Out of Scope explícito: clonagem, conversão metodologia, workflow etapas, relatórios
- Commits focados: estimados <500 LOC cada (componente isolado por commit)
- Docs executáveis: research.md, data-model.md, contracts/, quickstart.md

✅ **Spec-Driven Change Control**: PASS
- Spec completa e validada em `specs/001-projeto-crud/spec.md`
- Constitution version: 2.2.0
- Change-id: 001-projeto-crud
- Nenhuma exceção necessária

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── resolucao-problemas/
│       ├── index.ts                          # Public API barrel export
│       ├── types/
│       │   ├── projeto.types.ts              # Projeto, ProjetoDetalhado
│       │   ├── etapa.types.ts                # WorkflowEtapa, EtapaMasp, Disciplina8D, SecaoA3
│       │   ├── cliente.types.ts              # Cliente
│       │   ├── responsavel.types.ts          # Responsável, Participante
│       │   └── api.types.ts                  # API request/response types
│       ├── services/
│       │   ├── projetoService.ts             # CRUD operations
│       │   └── apiClient.ts                  # Axios instance com interceptors
│       ├── hooks/
│       │   ├── useProjeto.ts                 # Single projeto query/mutations
│       │   ├── useProjetos.ts                # List projetos query
│       │   ├── useProjetoProgress.ts         # Progress tracking
│       │   └── useDefinirMetodologia.ts      # Methodology definition mutation
│       ├── components/
│       │   ├── projeto/
│       │   │   ├── ProjetoCard.tsx           # Card na listagem
│       │   │   ├── ProjetoList.tsx           # Lista com filtros/paginação
│       │   │   ├── ProjetoDetalhes.tsx       # Tela de detalhes
│       │   │   ├── ProjetoForm.tsx           # Form criação/edição
│       │   │   ├── ProjetoCreateModal.tsx    # Modal criar
│       │   │   ├── ProjetoProgress.tsx       # Indicador progresso
│       │   │   └── ProjetoStatusBadge.tsx    # Badge status
│       │   ├── metodologia/
│       │   │   ├── MetodologiaSelector.tsx   # Dropdown/radio seleção
│       │   │   ├── MetodologiaBadge.tsx      # Badge MASP/8D/A3/Pendente
│       │   │   └── DefinirMetodologiaModal.tsx # Modal definir metodologia
│       │   ├── etapa/
│       │   │   ├── EtapasList.tsx            # Lista etapas
│       │   │   ├── EtapaCard.tsx             # Card etapa individual
│       │   │   ├── EtapaTimeline.tsx         # Timeline visual
│       │   │   └── EtapaStepper.tsx          # Stepper progresso
│       │   └── shared/
│       │       ├── ClienteAutocomplete.tsx   # Selector clientes
│       │       ├── UserSelector.tsx          # Selector responsável
│       │       ├── EmptyState.tsx            # Empty state genérico
│       │       └── ProgressBar.tsx           # Progress bar
│       ├── pages/
│       │   ├── ProjetosIndexPage.tsx         # /projetos - listagem
│       │   ├── ProjetoDetalhesPage.tsx       # /projetos/:id - detalhes
│       │   └── ProjetoNovoPage.tsx           # /projetos/novo - criar
│       └── validators/
│           ├── projetoValidator.ts           # Zod schemas criar/editar
│           └── metodologiaValidator.ts       # Zod schemas metodologia
│
└── shared/                                   # (só após 3+ features usarem)
    └── [nada ainda para esta feature]

tests/
├── contract/
│   └── resolucao-problemas/
│       ├── projetoService.contract.test.ts   # MSW mocks API
│       └── metodologia.contract.test.ts      # MSW mocks metodologia
├── integration/
│   └── resolucao-problemas/
│       ├── criar-projeto.spec.ts             # Cypress E2E criar
│       ├── definir-metodologia.spec.ts       # Cypress E2E definir
│       ├── listar-projetos.spec.ts           # Cypress E2E listar/filtrar
│       └── editar-projeto.spec.ts            # Cypress E2E editar
└── unit/
    └── resolucao-problemas/
        ├── ProjetoForm.test.tsx              # Unit test form validations
        ├── MetodologiaSelector.test.tsx      # Unit test selector
        └── projetoValidator.test.ts          # Unit test Zod schemas
```

**Structure Decision**: Web application (frontend only). Seguindo padrão feature-modular com todos os artefatos da feature isolados em `src/features/resolucao-problemas/`. Public API via barrel export em `index.ts` para permitir imports limpos por outras features futuras.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**N/A** - All Constitution Check items passed. No violations to justify.
