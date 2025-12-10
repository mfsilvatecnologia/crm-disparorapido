# Tasks: Feature-Based Architecture Migration

**Feature**: Refatoração da Estrutura do Projeto para Arquitetura Baseada em Features
**Branch**: `002-refatorar-estrutura-do`
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

Migração completa da estrutura de arquivos do projeto frontend LeadsRápido de uma organização baseada em tipos de arquivo (pages/, components/, hooks/) para uma arquitetura baseada em features. Total de 158 arquivos TypeScript a serem reorganizados em 10 features.

## Dependencies & Execution Order

Tasks are ordered by dependencies. Numbers indicate execution order.

**Legend:**
- `[P]` = Can run in parallel with other [P] tasks at the same level
- No [P] = Must run sequentially

## Task List

### Phase 1: Project Setup & Preparation

**T001**: Validate current project state
- **Files**: `src/**/*`, `package.json`, `tsconfig.json`
- **Action**: Run full test suite and build to establish baseline
- **Commands**: `pnpm test`, `pnpm build`, `pnpm lint`
- **Success**: All tests pass, build succeeds, no lint errors
- **Dependencies**: None

**T002**: Create feature-based directory structure
- **Files**: Create new directories under `src/`
- **Action**: Create complete feature directory structure
- **Structure**:
  ```
  src/features/
    authentication/ (components/, hooks/, pages/, services/, types/, index.ts)
    leads/ (components/, hooks/, pages/, services/, types/, index.ts)
    companies/ (components/, hooks/, pages/, services/, types/, index.ts)
    campaigns/ (components/, hooks/, pages/, services/, types/, index.ts)
    scraping/ (components/, hooks/, pages/, services/, types/, index.ts)
    pipeline/ (components/, hooks/, pages/, services/, types/, index.ts)
    segments/ (components/, hooks/, pages/, services/, types/, index.ts)
    user-management/ (components/, hooks/, pages/, services/, types/, index.ts)
    admin/ (components/, hooks/, pages/, services/, types/, index.ts)
    dashboard/ (components/, hooks/, pages/, services/, types/, index.ts)
  src/shared/
    components/ (ui/, layout/, common/)
    hooks/
    contexts/
    services/
    utils/
    types/
  ```
- **Dependencies**: T001

### Phase 2: Shared Resources Migration (Parallel Execution)

**T003 [P]**: Migrate shared UI components
- **Source**: `src/components/ui/**/*`
- **Target**: `src/shared/components/ui/`
- **Action**: Move all shadcn/ui components maintaining exports
- **Files**: `~25 UI component files`
- **Dependencies**: T002

**T004 [P]**: Migrate layout components
- **Source**: `src/components/layout/**/*`, `src/components/shared/AppLayout.tsx`
- **Target**: `src/shared/components/layout/`
- **Action**: Move AppLayout, AppHeader, AppSidebar and related
- **Files**: `AppLayout.tsx`, `AppHeader.tsx`, `AppSidebar.tsx`
- **Dependencies**: T002

**T005 [P]**: Migrate common components
- **Source**: `src/components/shared/**/*` (except layout)
- **Target**: `src/shared/components/common/`
- **Action**: Move AdvancedPagination, ConnectionStatus, EmptyState, ErrorState, etc.
- **Files**: `AdvancedPagination.tsx`, `ConnectionStatus.tsx`, `EmptyState.tsx`, etc.
- **Dependencies**: T002

**T006 [P]**: Migrate shared contexts
- **Source**: `src/contexts/**/*`
- **Target**: `src/shared/contexts/`
- **Action**: Move AuthContext, OrganizationContext, SessionContext
- **Files**: `AuthContext.tsx`, `OrganizationContext.tsx`, `SessionContext.tsx`
- **Dependencies**: T002

**T007 [P]**: Migrate shared services
- **Source**: `src/lib/api/**/*`, `src/lib/supabase.ts`
- **Target**: `src/shared/services/`
- **Action**: Move API client, Supabase client, health check utilities
- **Files**: `api/client.ts`, `supabase.ts`, health check files
- **Dependencies**: T002

**T008 [P]**: Migrate shared utilities
- **Source**: `src/lib/utils/**/*`
- **Target**: `src/shared/utils/`
- **Action**: Move date formatting, validation helpers, device detection
- **Files**: All utility functions from `lib/utils/`
- **Dependencies**: T002

**T009 [P]**: Migrate shared hooks
- **Source**: Select truly shared hooks from `src/hooks/**/*`
- **Target**: `src/shared/hooks/`
- **Action**: Move hooks used by multiple features (useLocalStorage, useApi, etc.)
- **Files**: Generic hooks identified as genuinely shared
- **Dependencies**: T002

**T010 [P]**: Migrate shared types
- **Source**: `src/types/**/*` (genuinely shared types)
- **Target**: `src/shared/types/`
- **Action**: Move TypeScript types used across features
- **Files**: Shared type definitions
- **Dependencies**: T002

### Phase 3: Feature Migration - Authentication

**T011**: Migrate authentication feature
- **Source**:
  - `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/ResetPasswordPage.tsx`, `src/pages/NewPasswordPage.tsx`
  - `src/components/auth/**/*`
  - `src/hooks/useAuth.ts`, `src/hooks/useRegister.ts`
  - Authentication-related services from `src/lib/api/`
- **Target**: `src/features/authentication/`
- **Action**: Move all authentication-related files and update internal imports
- **Structure**: `pages/`, `components/`, `hooks/`, `services/`, `types/`
- **Dependencies**: T003, T004, T005, T006, T007, T008, T009, T010

**T012**: Create authentication public API
- **File**: `src/features/authentication/index.ts`
- **Action**: Export public authentication components, hooks, and types
- **Exports**: `LoginPage`, `RegisterPage`, `useAuth`, `LoginForm`, etc.
- **Dependencies**: T011

### Phase 4: Feature Migration - Core Features (Parallel where possible)

**T013 [P]**: Migrate leads feature
- **Source**:
  - `src/pages/LeadsPage.tsx`
  - Lead-related components from various directories
  - `src/hooks/useLeads.ts`
  - Lead-related API services
- **Target**: `src/features/leads/`
- **Action**: Group all lead management functionality
- **Dependencies**: T003-T010

**T014 [P]**: Migrate companies feature
- **Source**:
  - `src/pages/EmpresasPage.tsx`, `src/pages/CadastroEmpresaPage.tsx`
  - Company-related components
  - Company-related hooks and services
- **Target**: `src/features/companies/`
- **Action**: Group all company management functionality
- **Dependencies**: T003-T010

**T015 [P]**: Migrate campaigns feature
- **Source**:
  - `src/pages/CampanhasPage.tsx`
  - Campaign-related components
  - Campaign-related hooks and services
- **Target**: `src/features/campaigns/`
- **Action**: Group all campaign functionality
- **Dependencies**: T003-T010

**T016 [P]**: Migrate scraping feature
- **Source**:
  - `src/pages/ScrapingPage.tsx`, `src/pages/WorkerMonitorPage.tsx`, `src/pages/SearchTermsPage.tsx`
  - Scraping-related components
  - Scraping services and hooks
- **Target**: `src/features/scraping/`
- **Action**: Group all web scraping functionality
- **Dependencies**: T003-T010

**T017 [P]**: Migrate pipeline feature
- **Source**:
  - `src/pages/PipelinePage.tsx`
  - Pipeline-related components and services
- **Target**: `src/features/pipeline/`
- **Action**: Group all sales pipeline functionality
- **Dependencies**: T003-T010

**T018 [P]**: Migrate segments feature
- **Source**:
  - `src/pages/SegmentosPage.tsx`
  - Segmentation components and services
- **Target**: `src/features/segments/`
- **Action**: Group all customer segmentation functionality
- **Dependencies**: T003-T010

**T019 [P]**: Migrate user management feature
- **Source**:
  - `src/pages/UsersPage.tsx`, `src/pages/UserProfilePage.tsx`
  - User management components
  - User-related hooks and services
- **Target**: `src/features/user-management/`
- **Action**: Group all user management functionality
- **Dependencies**: T003-T010

**T020 [P]**: Migrate admin feature
- **Source**:
  - Admin-related pages and components
  - Administrative services and hooks
- **Target**: `src/features/admin/`
- **Action**: Group all administrative functionality
- **Dependencies**: T003-T010

**T021**: Migrate dashboard feature
- **Source**:
  - `src/pages/DashboardPage.tsx`
  - `src/components/dashboard/**/*`
  - Dashboard-related hooks and services
- **Target**: `src/features/dashboard/`
- **Action**: Group all dashboard and analytics functionality
- **Dependencies**: T013-T020 (dashboard may reference other features)

### Phase 5: Create Feature Public APIs

**T022 [P]**: Create leads feature public API
- **File**: `src/features/leads/index.ts`
- **Action**: Export public leads components, hooks, and types
- **Dependencies**: T013

**T023 [P]**: Create companies feature public API
- **File**: `src/features/companies/index.ts`
- **Action**: Export public companies components, hooks, and types
- **Dependencies**: T014

**T024 [P]**: Create campaigns feature public API
- **File**: `src/features/campaigns/index.ts`
- **Action**: Export public campaigns components, hooks, and types
- **Dependencies**: T015

**T025 [P]**: Create scraping feature public API
- **File**: `src/features/scraping/index.ts`
- **Action**: Export public scraping components, hooks, and types
- **Dependencies**: T016

**T026 [P]**: Create pipeline feature public API
- **File**: `src/features/pipeline/index.ts`
- **Action**: Export public pipeline components, hooks, and types
- **Dependencies**: T017

**T027 [P]**: Create segments feature public API
- **File**: `src/features/segments/index.ts`
- **Action**: Export public segments components, hooks, and types
- **Dependencies**: T018

**T028 [P]**: Create user management feature public API
- **File**: `src/features/user-management/index.ts`
- **Action**: Export public user management components, hooks, and types
- **Dependencies**: T019

**T029 [P]**: Create admin feature public API
- **File**: `src/features/admin/index.ts`
- **Action**: Export public admin components, hooks, and types
- **Dependencies**: T020

**T030**: Create dashboard feature public API
- **File**: `src/features/dashboard/index.ts`
- **Action**: Export public dashboard components, hooks, and types
- **Dependencies**: T021

### Phase 6: Create Shared Public APIs

**T031 [P]**: Create shared components index
- **File**: `src/shared/components/index.ts`
- **Action**: Export all shared components with organized structure
- **Dependencies**: T003, T004, T005

**T032 [P]**: Create shared hooks index
- **File**: `src/shared/hooks/index.ts`
- **Action**: Export all shared hooks
- **Dependencies**: T009

**T033 [P]**: Create shared contexts index
- **File**: `src/shared/contexts/index.ts`
- **Action**: Export all shared contexts
- **Dependencies**: T006

**T034 [P]**: Create shared services index
- **File**: `src/shared/services/index.ts`
- **Action**: Export all shared services
- **Dependencies**: T007

**T035 [P]**: Create shared utils index
- **File**: `src/shared/utils/index.ts`
- **Action**: Export all shared utilities
- **Dependencies**: T008

**T036 [P]**: Create shared types index
- **File**: `src/shared/types/index.ts`
- **Action**: Export all shared types
- **Dependencies**: T010

### Phase 7: Integration & Main App Updates

**T037**: Update App.tsx imports
- **File**: `src/App.tsx`
- **Action**: Update all imports to use new feature-based structure
- **Import Examples**:
  ```typescript
  import { LoginPage } from '@/features/authentication';
  import { DashboardPage } from '@/features/dashboard';
  import { AppLayout } from '@/shared/components/layout';
  ```
- **Dependencies**: T012, T022-T030, T031-T036

**T038**: Update routing configuration
- **Files**: Main routing files
- **Action**: Update React Router configuration with new import paths
- **Dependencies**: T037

**T039**: Reduce pages directory
- **Action**: Keep only `src/pages/Index.tsx` and `src/pages/NotFound.tsx`
- **Dependencies**: T037, T038

**T040**: Clean up old empty directories
- **Action**: Remove empty directories from old structure
- **Dependencies**: T039

### Phase 8: Validation & Testing

**T041**: Update import paths project-wide
- **Files**: All remaining files with old import paths
- **Action**: Automated search and replace of import paths
- **Tool**: Use find/sed or IDE refactoring tools
- **Dependencies**: T040

**T042**: TypeScript compilation validation
- **Command**: `npx tsc --noEmit`
- **Action**: Verify no TypeScript errors after migration
- **Dependencies**: T041

**T043**: Lint validation
- **Command**: `pnpm lint`
- **Action**: Fix any ESLint errors introduced by migration
- **Dependencies**: T042

**T044**: Test suite validation
- **Command**: `pnpm test`
- **Action**: Update test imports and verify all tests pass
- **Dependencies**: T043

**T045**: Build validation
- **Command**: `pnpm build`
- **Action**: Verify production build succeeds
- **Dependencies**: T044

**T046**: Development server validation
- **Command**: `pnpm dev`
- **Action**: Start dev server and verify application loads correctly
- **Dependencies**: T045

### Phase 9: Final Polish

**T047**: Update tsconfig.json paths (if needed)
- **File**: `tsconfig.json`
- **Action**: Ensure path mapping supports new structure
- **Dependencies**: T046

**T048**: Create shared resource documentation
- **Files**: Add comments/documentation for shared resources
- **Action**: Document what qualifies as shared vs feature-specific
- **Dependencies**: T047

**T049**: Performance validation
- **Action**: Compare bundle size and performance metrics
- **Commands**: Build analysis, lighthouse tests
- **Dependencies**: T048

**T050**: Final validation checklist
- **Action**: Run through validation checklist from quickstart.md
- **Scenarios**:
  - Authentication flow works
  - Dashboard loads correctly
  - Lead management functions
  - All major features accessible
- **Dependencies**: T049

## Parallel Execution Examples

**Phase 2 - Shared Resources (can run simultaneously):**
```bash
# Run these in parallel using Task agent
Task agent1: "Execute T003 - Migrate shared UI components"
Task agent2: "Execute T004 - Migrate layout components"
Task agent3: "Execute T005 - Migrate common components"
Task agent4: "Execute T006 - Migrate shared contexts"
```

**Phase 4 - Feature Migration (can run simultaneously after shared):**
```bash
# Run these in parallel using Task agent
Task agent1: "Execute T013 - Migrate leads feature"
Task agent2: "Execute T014 - Migrate companies feature"
Task agent3: "Execute T015 - Migrate campaigns feature"
Task agent4: "Execute T016 - Migrate scraping feature"
```

## Success Criteria

✅ **Migration Complete When:**
- All 50 tasks completed successfully
- TypeScript compilation passes (`npx tsc --noEmit`)
- All tests pass (`pnpm test`)
- Production build succeeds (`pnpm build`)
- Development server starts without errors (`pnpm dev`)
- All functionality preserved from original application
- New feature-based imports working correctly
- No broken dependencies or circular imports

## Emergency Rollback

If critical issues are discovered:
1. `git checkout main` - Return to original structure
2. Address issues in analysis and planning
3. Re-execute migration with fixes

---
*Generated from: plan.md, data-model.md, research.md, quickstart.md*
*Total estimated tasks: 50 | Parallel execution opportunities: 15+ tasks*