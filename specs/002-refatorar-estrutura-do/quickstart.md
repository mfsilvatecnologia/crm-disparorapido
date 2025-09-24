# Quickstart: Feature-Based Architecture Migration

## Overview
This guide provides step-by-step instructions to validate the feature-based architecture refactoring and understand the new project structure.

## Prerequisites
- Node.js 18+ installed
- pnpm or npm package manager
- Git repository access
- Basic familiarity with React and TypeScript

## Quick Validation Steps

### 1. Project Setup
```bash
# Navigate to project root
cd /path/to/leadsrapido_frontend

# Install dependencies
pnpm install

# Verify all dependencies are installed correctly
pnpm list
```

### 2. Build Verification
```bash
# Run development build
pnpm dev

# Verify application starts without errors
# Open http://localhost:5173 in browser
# Confirm login page loads correctly

# Stop dev server (Ctrl+C) and run production build
pnpm build

# Verify build completes successfully
ls -la dist/
```

### 3. Test Validation
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Verify test results show:
# - All existing tests pass
# - Coverage metrics maintained
# - No import resolution errors
```

### 4. Code Quality Checks
```bash
# Run linting
pnpm lint

# Verify no linting errors
# Fix any auto-fixable issues

# Check TypeScript compilation
npx tsc --noEmit

# Verify no TypeScript errors
```

## New Project Structure Navigation

### Understanding the New Layout
```
src/
├── features/              # 🆕 Business feature modules
│   ├── authentication/    # Login, registration, password management
│   │   ├── components/    # AuthForm, LoginForm, etc.
│   │   ├── pages/         # LoginPage, RegisterPage, etc.
│   │   ├── hooks/         # useAuth, useRegister
│   │   ├── services/      # Authentication API calls
│   │   ├── types/         # Auth-specific TypeScript types
│   │   └── index.ts       # Public API exports
│   ├── leads/             # Lead management functionality
│   ├── companies/         # Company/organization management
│   ├── campaigns/         # Marketing campaigns
│   ├── scraping/          # Web scraping and monitoring
│   ├── pipeline/          # Sales pipeline management
│   ├── segments/          # Customer segmentation
│   ├── user-management/   # User roles and profiles
│   ├── admin/             # Administrative functions
│   └── dashboard/         # Analytics and overview
├── shared/               # 🆕 Genuinely reusable code
│   ├── components/       # UI components, layout, common widgets
│   ├── hooks/           # Generic React hooks
│   ├── contexts/        # Global React contexts
│   ├── services/        # Shared API client, utilities
│   ├── utils/           # Pure utility functions
│   └── types/           # Shared TypeScript definitions
├── pages/               # 📦 Reduced to special pages only
│   ├── Index.tsx        # Landing/redirect page
│   └── NotFound.tsx     # 404 error page
├── App.tsx              # 🔄 Updated with new imports
└── main.tsx             # Unchanged
```

### Key Changes from Previous Structure

**Before** (Layer-based):
```
src/
├── components/          # All components mixed together
├── pages/              # All pages in one directory
├── hooks/              # All hooks together
├── lib/                # Mixed utilities and services
└── contexts/           # Global contexts
```

**After** (Feature-based):
- Related code grouped by business functionality
- Clear separation between shared and feature-specific code
- Controlled public APIs via index.ts files
- Predictable structure across all features

### Finding Code in the New Structure

**To find authentication-related code**:
```bash
# All auth code is in one place
ls src/features/authentication/

# Public API exports
cat src/features/authentication/index.ts
```

**To find shared UI components**:
```bash
# UI components used across multiple features
ls src/shared/components/ui/
ls src/shared/components/common/
```

**To understand feature dependencies**:
```bash
# Each feature's public API
find src/features -name "index.ts" -exec echo "=== {} ===" \; -exec cat {} \; -exec echo \;
```

## Development Workflows

### Adding New Feature-Specific Code
```bash
# Example: Adding a new component to leads feature
touch src/features/leads/components/LeadExportDialog.tsx

# Implement the component
# Add to feature's public API if needed
echo "export { LeadExportDialog } from './components/LeadExportDialog';" >> src/features/leads/index.ts
```

### Using Feature Code in App
```typescript
// Import from feature's public API
import { LeadsPage, useLeads } from '@/features/leads';
import { LoginPage, useAuth } from '@/features/authentication';

// Import shared resources
import { Button } from '@/shared/components/ui/Button';
import { apiClient } from '@/shared/services/api';
```

### Adding Shared Code
```bash
# Example: Adding a new shared utility
touch src/shared/utils/formatCurrency.ts

# Implement the utility
# Export from shared utils index
echo "export { formatCurrency } from './formatCurrency';" >> src/shared/utils/index.ts
```

## Common Import Patterns

### Within a Feature (Relative Imports)
```typescript
// In src/features/authentication/pages/LoginPage.tsx
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { validateCredentials } from '../services/authService';
```

### From Shared Resources (Absolute Imports)
```typescript
// From any feature
import { Button, Input } from '@/shared/components/ui';
import { useLocalStorage } from '@/shared/hooks';
import { formatDate } from '@/shared/utils';
```

### Between Features (Through Shared Only)
```typescript
// ❌ DON'T: Direct feature-to-feature imports
import { LeadCard } from '@/features/leads/components/LeadCard';

// ✅ DO: Through shared services or contexts
import { useAuth } from '@/shared/contexts/AuthContext';
```

## Verification Checklist

After migration, verify these scenarios work correctly:

### 🔐 Authentication Flow
- [ ] Login page loads and accepts credentials
- [ ] Registration process completes
- [ ] Password reset functionality works
- [ ] Protected routes redirect correctly
- [ ] Logout clears session properly

### 📊 Dashboard Access
- [ ] Dashboard loads with proper data
- [ ] Charts and widgets render correctly
- [ ] Quick actions are functional
- [ ] Navigation works between sections

### 👥 Lead Management
- [ ] Leads page displays data table
- [ ] Filtering and sorting work
- [ ] Lead creation/editing functions
- [ ] Export functionality operates

### 🏢 Company Management
- [ ] Company listing page loads
- [ ] Company creation form works
- [ ] Company details can be edited
- [ ] Company selection functions properly

### 🔧 Admin Functions
- [ ] Admin page requires proper permissions
- [ ] User management functions work
- [ ] Audit logs display correctly
- [ ] System settings are accessible

## Troubleshooting

### Common Issues and Solutions

**Build Errors: Cannot resolve module**
```bash
# Check if import paths are correct
# Verify index.ts files export the required items
# Use absolute paths for shared imports, relative for feature-internal
```

**TypeScript Errors: Module not found**
```bash
# Verify TypeScript path mapping in tsconfig.json
# Check that @/ alias points to src/
# Ensure all index.ts files have proper exports
```

**Runtime Errors: Component not found**
```bash
# Verify component is exported in feature's index.ts
# Check that import statement matches exact export name
# Confirm component file exists in expected location
```

**Tests Failing: Import errors**
```bash
# Update test files to use new import paths
# Verify test utilities can resolve new structure
# Check that mocks are updated for new paths
```

### Getting Help

1. **Check the structure**: Use `tree src/` to see current organization
2. **Verify exports**: Look at index.ts files to see what's available
3. **Follow patterns**: Use existing imports as examples
4. **Validate incrementally**: Run tests and builds frequently during changes

## Success Indicators

✅ **Migration Successful When**:
- All builds complete without errors
- All existing tests pass
- Application functions identically to before migration
- New feature development is easier and more organized
- Code is easier to locate and understand
- Team can work on different features with fewer conflicts

The refactored structure should make development more efficient while maintaining all existing functionality.