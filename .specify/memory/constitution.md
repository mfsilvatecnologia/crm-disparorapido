<!-- Sync Impact Report
Version change: 2.1.1 → 2.2.0
Modified principles: Template placeholders → API-First Backend Authority; Test-First Delivery (Contract + Integration); Feature-Modular Boundaries; Anti-Entropy Simplicity; Spec-Driven Change Control
Added sections: Core Principles (populated), Additional Constraints: Technical Standards & Quality, Development Workflow & Quality Gates, Governance (clarified)
Removed sections: None
Templates requiring updates: ✅ .specify/templates/plan-template.md (constitution gates aligned); ✅ .specify/templates/tasks-template.md (tests-first guidance); ✅ .specify/templates/spec-template.md (reviewed, no change required); ⚠ .specify/templates/commands (directory absent; add if commands introduced)
Follow-up TODOs: TODO(RATIFICATION_DATE): Original adoption date not documented; confirm historic ratification.
-->
# LeadsRapido Frontend Constitution

## Core Principles

### I. API-First Backend Authority
Frontend work MUST consume backend contracts only—no direct third-party calls or secret handling in the client. New capabilities start with a documented API contract (`swagger.json` or OpenSpec delta) and backend implementation before UI. Typed clients MUST derive from shared schemas, and any missing endpoint blocks feature work until the contract is defined and validated.

### II. Test-First Delivery (Contract + Integration)
Test-Driven Development is mandatory: write failing contract tests (`npm run test:contract`) and integration flows (`npm run test:integration`) before implementation, then follow Red → Green → Refactor. Critical paths (auth, payments, data writes) require contract + integration coverage; unit tests cover branching logic. Work cannot be accepted without green suites after the failing-first phase.

### III. Feature-Modular Boundaries
The codebase stays feature-based: each domain lives in `src/features/<domain>` with a public API via `index.ts`. Cross-feature imports MUST use the public API, and shared code only graduates to `src/shared` after proven reuse by 3+ features. Barrel exports stay current, and new shared utilities require a clear ownership and consumer list.

### IV. Anti-Entropy Simplicity
YAGNI and DRY are enforced: ship the smallest viable slice, avoid speculative abstractions, and delete dead code/documents. Prefer inline JSDoc and executable docs (plans, tasks, quickstarts) over theory; theoretical docs >100 lines or duplicated content are rejected. Keep commits focused (<500 LOC, <=8 files when possible) and favor refactors that reduce surface area.

### V. Spec-Driven Change Control
All delivery is spec-led. New capabilities or behavioral shifts require an OpenSpec change (proposal + deltas) before implementation. Plans/tasks must cite the change-id and the constitution version, and the Constitution Check records any exceptions with mitigation/rollback. No code ships without aligning research/plan/tasks to the approved spec and passing validation (`openspec validate --strict` when applicable).

## Additional Constraints: Technical Standards & Quality

- Stack: TypeScript + React 18 + Vite; UI via Tailwind + shadcn/ui; server state via TanStack Query; forms via React Hook Form + Zod; logging via pino; backend access through the published REST contracts in `swagger.json`.
- Security: No secrets or third-party credentials in the frontend; all integrations terminate in the backend. Use environment variables only for non-sensitive toggles.
- Testing commands expected before merge: `npm run test:contract`, `npm run test:integration`, `npm run test:run`, `npm run lint`, `npm run build`.
- Multi-tenant dev uses `TENANT_PORT` overrides per `package.json` scripts; keep per-tenant variations behind configuration, not forks.

## Development Workflow & Quality Gates

1) Start from an approved OpenSpec change with a change-id; if missing, block work and create the proposal.  
2) Populate `plan.md` using the plan template, completing the Constitution Check (API-first, test-first sequencing, feature boundaries, anti-entropy scope, spec alignment).  
3) Phase order: research/design (if needed) → contract tests (fail) → integration tests (fail) → implementation → refactor → demo.  
4) Code review MUST verify: no direct external calls, tests written first and passing, imports respect feature boundaries/public APIs, scope trimmed to MVP, docs/tasks/specs updated to match shipped behavior.  
5) Before release: contracts/specs updated, tasks marked complete, and CI green across lint/build/test suites.

## Governance

- This constitution supersedes other practice guides. Any exception must be documented in the plan’s Constitution Check with owner and expiry.  
- Amendments require a Sync Impact Report, semantic version bump (MAJOR: removals/breaking governance; MINOR: new/expanded principles; PATCH: clarifications), and updates to dependent templates.  
- Ratification occurs when maintainers approve the constitution change; recorded in this file. Last Amended tracks the most recent accepted edit.  
- Compliance reviews: PRs and specs must state the constitution version used; deviations without mitigation are blockers.

**Version**: 2.2.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-05
