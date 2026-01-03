ios/ or android/
# Implementation Plan: Sistema de Enriquecimento de Dados

**Branch**: `001-enriquecimento-dados` | **Date**: 2025-12-18 | **Spec**: `/specs/001-enriquecimento-dados/spec.md`
**Input**: Feature specification from `/specs/001-enriquecimento-dados/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement UI flows for enriquecimento de leads (P1), investigação de mídia negativa (P2), administração de providers (P3) e dashboard de estatísticas (P4) consumindo contratos REST existentes/novos definidos em `swagger.json` (ou delta). Frontend em TypeScript + React 18 + Vite com Tailwind/shadcn/ui, TanStack Query para estado de servidor e RHF+Zod para formulários. Polling controlado (3s enriquecimento, 5s investigação) com backoff e notificações em tempo quase real conforme critérios SC-001..SC-006.

## Technical Context

**Language/Version**: TypeScript 5.8+, React 18.3, Vite 5 (per repo); Node 20 runtime for tooling.  
**Primary Dependencies**: React 18, Vite, Tailwind CSS + shadcn/ui, TanStack Query, React Hook Form + Zod, pino logging; backend REST per `swagger.json`.  
**Storage**: N/A (frontend-only; data via backend APIs).  
**Testing**: Vitest suites run via `npm run test:contract`, `npm run test:integration`, `npm run test:run`; lint `npm run lint`; build `npm run build`.  
**Target Platform**: Web SPA served via Vite build.  
**Project Type**: Web (frontend only).  
**Performance Goals**: Meet SC-001..SC-006 (progress/UI latency <2s, dashboard load <=3s, admin save <=600ms).  
**Constraints**: API-first (no direct 3rd-party calls), no secrets in client, feature boundaries in `src/features/<domain>`, tests-first, follow spec-driven change control.  
**Scale/Scope**: Moderate dashboards/forms for leads/providers; polling for long-running jobs; multi-provider enrichment per lead.

## Constitution Check

- API-First Backend Authority: PASS — UI will consume/extend REST contracts; no client-side provider calls or secrets; any missing endpoints must be added to `swagger.json` before UI.
- Test-First Delivery: PASS — contract + integration tests planned to fail first using `npm run test:contract` and `npm run test:integration`; success criteria SC-001..SC-006 guide assertions.
- Feature-Modular Boundaries: PASS — new UI lives in `src/features/enrichment` with public API barrel; shared utilities only via `src/shared` if reused across >=3 features.
- Anti-Entropy Simplicity: PASS — scope limited to stories P1–P4; defer speculative provider analytics beyond stated metrics; commit sizes kept small and aligned to flows.
- Spec-Driven Change Control: PASS — working against `/specs/001-enriquecimento-dados/spec.md` under constitution v2.2.0; any OpenSpec deltas recorded alongside change-id for this branch.

## Project Structure

### Documentation (this feature)

```text
specs/001-enriquecimento-dados/
├── plan.md          # /speckit.plan output
├── research.md      # Phase 0 output
├── data-model.md    # Phase 1 output
├── quickstart.md    # Phase 1 output
├── contracts/       # Phase 1 output
└── tasks.md         # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── enrichment/          # new feature module (P1–P4 flows)
│   └── ...existing domains  # admin, leads, etc.
├── shared/                  # only for cross-feature reuse
├── lib/                     # cross-cutting infra (keep stable)
├── config/                  # app config
└── test/                    # helpers

tests/
├── contract/                # contract tests for APIs
├── integration/             # end-to-end/flow tests
└── unit/
```

**Structure Decision**: Single frontend project; new domain `src/features/enrichment` with barrel `index.ts` and subfolders `components/`, `services/`, `hooks/`, `pages/`, `types/` plus tests under `tests/contract/enrichment` and `tests/integration/enrichment`.

## Complexity Tracking

No constitution violations identified; table not required.
