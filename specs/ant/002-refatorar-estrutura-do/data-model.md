# Data Model: Project Structure Refactoring

## Overview
This document defines the conceptual model and relationships for the feature-based architecture refactoring of the LeadsRápido frontend project.

## Core Entities

### Feature Module
**Definition**: A self-contained directory grouping all code related to a specific business functionality.

**Attributes**:
- `name`: String - Business-focused name (e.g., "authentication", "leads", "dashboard")
- `components[]`: Array - React components specific to this feature
- `hooks[]`: Array - Custom React hooks for feature logic
- `pages[]`: Array - Route-level page components
- `services[]`: Array - Business logic and API interaction modules
- `types[]`: Array - TypeScript type definitions
- `index.ts`: Export manifest - Controls public API surface

**Relationships**:
- Can depend on `SharedResource` entities
- Must NOT directly depend on other `FeatureModule` entities
- Exports public interface via `index.ts`
- Contains private implementation details not exposed externally

**Business Rules**:
- Single responsibility: Each feature covers one business domain
- API Control: Only exports through index.ts are considered public
- Independence: Should be developable and testable in isolation
- Naming: Directory name should match business capability

**Examples**:
```
authentication/     # User login, registration, password reset
leads/             # Lead management, filtering, display
companies/         # Company/organization management
campaigns/         # Marketing campaign management
scraping/         # Web scraping configuration and monitoring
pipeline/         # Sales pipeline management
segments/         # Customer segmentation
user-management/  # User roles, permissions, profiles
admin/            # Administrative functions
dashboard/        # Analytics and overview screens
```

### Shared Resource
**Definition**: Code genuinely reused across multiple features with no business domain specificity.

**Attributes**:
- `type`: Enum - component|hook|service|util|type|context
- `name`: String - Descriptive name
- `usedBy[]`: Array - List of features that consume this resource
- `location`: String - Path within shared/ directory structure
- `isStable`: Boolean - Whether API is unlikely to change frequently

**Relationships**:
- Used by multiple `FeatureModule` entities
- Must NOT depend on any specific `FeatureModule`
- Can depend on other `SharedResource` entities
- Can depend on external libraries

**Business Rules**:
- Multi-consumer: Must be used by at least 2 features (ideally 3+)
- Domain-agnostic: No business-specific logic
- Stable API: Breaking changes affect multiple features
- Single purpose: Each shared resource has clear responsibility

**Categories**:
```
shared/
├── components/
│   ├── ui/          # Basic UI components (Button, Input, Modal)
│   ├── layout/      # Layout components (Header, Sidebar, Layout)
│   └── common/      # Common compound components
├── hooks/           # Generic React hooks (useLocalStorage, useApi)
├── contexts/        # Global React contexts (Auth, Theme, Organization)
├── services/        # Shared services (API client, auth service)
├── utils/           # Pure utility functions (date, validation, format)
└── types/           # Shared TypeScript definitions
```

### Migration Task
**Definition**: An atomic operation to move code from current structure to feature-based structure.

**Attributes**:
- `id`: String - Unique identifier
- `sourcePath`: String - Current file/directory location
- `targetPath`: String - Destination in new structure
- `type`: Enum - file|directory
- `dependencies[]`: Array - Other tasks that must complete first
- `status`: Enum - pending|processing|completed|failed
- `category`: Enum - shared|feature|integration|validation

**State Transitions**:
```
pending → processing → completed
        → processing → failed
```

**Business Rules**:
- Dependency Resolution: Cannot start until all dependencies completed
- Atomicity: Each task is all-or-nothing
- Ordering: Dependencies must be processed first
- Validation: Must maintain functionality after completion

**Task Categories**:
- **Shared**: Moving genuinely shared resources first
- **Feature**: Moving feature-specific code after shared dependencies
- **Integration**: Updating main application files (App.tsx, routing)
- **Validation**: Running tests, builds, lint checks

### Component Dependency
**Definition**: A relationship where one code file imports and uses another.

**Attributes**:
- `consumer`: String - File path of the importing code
- `provider`: String - File path of the exported code
- `importType`: Enum - default|named|namespace|dynamic
- `isExternal`: Boolean - Whether provider is from external library
- `strength`: Enum - weak|strong - How tightly coupled the relationship is

**Relationships**:
- Links `FeatureModule` to `SharedResource`
- Links `FeatureModule` components internally
- Must NOT link `FeatureModule` to `FeatureModule` directly

**Business Rules**:
- Circular Prevention: No circular dependencies allowed
- Access Control: Features can only import from shared/ or own directory
- API Boundary: Inter-feature communication only through shared services
- Explicit Dependencies: All imports must be explicit, no implicit globals

## Feature Classification

Based on analysis of existing codebase:

### Authentication Feature
**Scope**: User login, registration, password management, role selection
**Current Files**:
- Pages: LoginPage, RegisterPage, ResetPasswordPage, NewPasswordPage
- Components: auth/ directory components
- Hooks: useAuth, useRegister
- Services: lib/api/auth.ts

### Leads Feature
**Scope**: Lead management, display, filtering, import/export
**Current Files**:
- Pages: LeadsPage
- Components: Lead-related components in various directories
- Hooks: useLeads
- Services: Lead-related API calls

### Companies Feature
**Scope**: Company/organization management
**Current Files**:
- Pages: EmpresasPage, CadastroEmpresaPage
- Components: Company-related components
- Services: Company API endpoints

### Additional Features
- **Campaigns**: CampanhasPage and related components
- **Scraping**: ScrapingPage, WorkerMonitorPage, SearchTermsPage
- **Pipeline**: PipelinePage and pipeline management
- **Segments**: SegmentosPage and segmentation logic
- **User Management**: UsersPage, UserProfilePage, user administration
- **Admin**: Administrative functions, audit logs, system management
- **Dashboard**: Dashboard page and analytics widgets

## Shared Resource Classification

### UI Components (shared/components/ui/)
- All shadcn/ui components (button, input, dialog, etc.)
- Basic form controls and interactive elements
- Layout primitives

### Layout Components (shared/components/layout/)
- AppLayout, AppHeader, AppSidebar
- Navigation and structural components

### Common Components (shared/components/common/)
- AdvancedPagination, ConnectionStatus, EmptyState, ErrorState
- LoadingState, StatsCard, UserAvatar
- Business-agnostic compound components

### Services (shared/services/)
- API client configuration
- Authentication service
- Supabase client
- Health check utilities

### Contexts (shared/contexts/)
- AuthContext, OrganizationContext, SessionContext
- Global state management

### Utilities (shared/utils/)
- Date formatting, validation helpers
- Device detection, general utilities
- Pure functions with no side effects

## Migration Constraints

### Dependency Order
1. **Shared Resources First**: Move to shared/ before any features
2. **Low-Dependency Features**: Features with fewer internal dependencies
3. **High-Dependency Features**: Complex features with many internal relationships
4. **Integration Updates**: App.tsx and routing after all features moved

### Validation Requirements
- All imports must resolve correctly
- TypeScript compilation must succeed
- Existing tests must continue passing
- Lint rules must be satisfied
- Build process must complete successfully

### Rollback Strategy
- Git branch isolation for the entire migration
- Ability to revert entire migration if critical issues discovered
- Incremental validation at each major milestone
- Preservation of all existing functionality

## Success Criteria

### Structural
- [x] All features organized in dedicated directories
- [x] Clear separation between shared and feature-specific code
- [x] Each feature has controlled public API via index.ts
- [x] No cross-feature dependencies (only via shared)

### Functional
- [x] All existing functionality preserved
- [x] No broken imports or build errors
- [x] All tests continue passing
- [x] Performance characteristics maintained

### Maintainability
- [x] New developers can easily locate relevant code
- [x] Feature development can happen in parallel with minimal conflicts
- [x] Clear boundaries for feature ownership
- [x] Consistent structure across all features