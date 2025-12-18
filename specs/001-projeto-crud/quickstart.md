# Quickstart Guide: Sistema de CRUD de Projetos

**Feature**: 001-projeto-crud
**Branch**: `001-projeto-crud`
**Last Updated**: 2025-12-18

## Overview

This guide helps developers set up, develop, test, and deploy the Project CRUD feature for the problem-resolution system. Follow the steps sequentially for the smoothest experience.

## Prerequisites

- **Node.js**: 20+ (check with `node --version`)
- **npm**: 9+ (check with `npm --version`)
- **Git**: Configured with your credentials
- **Backend API**: Running on `http://localhost:3000` (see `leadsrapido_backend/CLAUDE.md`)
- **VS Code** (recommended): With ESLint, Prettier, TypeScript extensions

## Initial Setup

### 1. Clone and Checkout Feature Branch

```bash
cd /home/johnny/Documentos/CLIENTES/M-F-SILVA/leadsrapido/leadsrapido_frontend

# Checkout the feature branch
git checkout 001-projeto-crud

# Pull latest changes
git pull origin 001-projeto-crud
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm run lint -- --version
```

### 3. Environment Configuration

Ensure the `.env.local` file exists with the correct API URL:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

If the file doesn't exist, create it:

```bash
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > .env.local
```

### 4. Verify Backend is Running

```bash
# Check backend health
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

If backend is not running, start it:

```bash
cd ../leadsrapido_backend
npm run dev:api
```

## Development Workflow

### Running the Development Server

```bash
# Start Vite dev server (default: http://localhost:5173)
npm run dev
```

Open browser to `http://localhost:5173/projetos` to see the project list page.

### File Structure Overview

```
src/features/resolucao-problemas/
├── index.ts                    # Public API (import from here in other features)
├── types/                      # TypeScript type definitions
│   ├── projeto.types.ts
│   ├── etapa.types.ts
│   ├── cliente.types.ts
│   └── api.types.ts
├── services/                   # API communication layer
│   ├── projetoService.ts       # CRUD operations
│   └── apiClient.ts            # Axios instance
├── hooks/                      # React hooks for data fetching
│   ├── useProjeto.ts           # Single project query
│   ├── useProjetos.ts          # List projects query
│   └── useDefinirMetodologia.ts # Define methodology mutation
├── components/                 # React components
│   ├── projeto/                # Project-related components
│   ├── metodologia/            # Methodology selection components
│   └── etapa/                  # Workflow stage components
├── pages/                      # Route pages
│   ├── ProjetosIndexPage.tsx   # /projetos
│   ├── ProjetoDetalhesPage.tsx # /projetos/:id
│   └── ProjetoNovoPage.tsx     # /projetos/novo
└── validators/                 # Zod validation schemas
    ├── projetoValidator.ts
    └── metodologiaValidator.ts
```

### Making Code Changes

Follow this sequence for test-first development:

1. **Write Contract Test** (MSW mock):
   ```bash
   # Create test file
   touch tests/contract/resolucao-problemas/projetoService.contract.test.ts
   ```

2. **Run Test (RED)**:
   ```bash
   npm run test:contract
   # Test should fail (not implemented yet)
   ```

3. **Implement Service Layer**:
   ```bash
   # Implement the function in service layer
   # src/features/resolucao-problemas/services/projetoService.ts
   ```

4. **Run Test (GREEN)**:
   ```bash
   npm run test:contract
   # Test should pass
   ```

5. **Write Integration Test** (Cypress):
   ```bash
   # Create E2E test
   touch tests/integration/resolucao-problemas/criar-projeto.spec.ts
   ```

6. **Implement UI Components**:
   ```bash
   # Build React components and pages
   ```

7. **Run Integration Test**:
   ```bash
   npm run test:integration
   ```

8. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Add project creation flow with tests"
   ```

## Testing

### Contract Tests (MSW)

Contract tests verify that the frontend service layer correctly consumes the backend API contract.

```bash
# Run all contract tests
npm run test:contract

# Run specific contract test file
npm run test:contract -- projetoService.contract.test.ts

# Watch mode for development
npm run test:contract -- --watch
```

**Example Contract Test**:
```typescript
// tests/contract/resolucao-problemas/projetoService.contract.test.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { projetoService } from '@/features/resolucao-problemas/services/projetoService'

const server = setupServer(
  http.post('/api/v1/resolucao-problemas/projetos', () => {
    return HttpResponse.json({
      id: '123',
      titulo: 'Test Project',
      metodologia: null,
      pode_definir_metodologia: true,
      // ... other fields
    }, { status: 201 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('criar projeto returns created project', async () => {
  const result = await projetoService.criar({
    titulo: 'Test Project',
    descricao: 'Test description',
    // ... other fields
  })
  expect(result.id).toBe('123')
  expect(result.metodologia).toBeNull()
})
```

### Integration Tests (Cypress)

Integration tests verify complete user flows across multiple components.

```bash
# Run all integration tests (headless)
npm run test:integration

# Open Cypress UI for interactive testing
npm run test:integration:open

# Run specific test file
npm run test:integration -- --spec "tests/integration/resolucao-problemas/criar-projeto.spec.ts"
```

**Example Integration Test**:
```typescript
// tests/integration/resolucao-problemas/criar-projeto.spec.ts
describe('Create Project Flow', () => {
  it('should create a project without methodology', () => {
    cy.visit('/projetos')
    cy.findByRole('button', { name: /novo projeto/i }).click()

    // Fill form
    cy.findByLabelText(/título/i).type('Investigar defeitos na linha')
    cy.findByLabelText(/descrição/i).type('Análise de defeitos recorrentes')
    cy.findByLabelText(/cliente/i).select('Cliente XYZ')
    cy.findByLabelText(/responsável/i).select('João Silva')
    cy.findByLabelText(/data início/i).type('2025-12-18')

    // Submit
    cy.findByRole('button', { name: /criar projeto/i }).click()

    // Verify success
    cy.findByText(/projeto criado com sucesso/i).should('be.visible')
    cy.findByText('Investigar defeitos na linha').should('be.visible')

    // Verify methodology is pending
    cy.findByText(/metodologia pendente/i).should('be.visible')
  })
})
```

### Unit Tests (Vitest)

Unit tests verify isolated component and utility function behavior.

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- ProjetoForm.test.tsx

# Coverage report
npm run test:coverage
```

### Running All Tests

```bash
# Run full test suite (contract + integration + unit)
npm run test:run
```

## Code Quality

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Type Checking

```bash
# Run TypeScript compiler check
npm run type-check
```

### Formatting

```bash
# Format code with Prettier
npm run format
```

## Common Development Tasks

### Adding a New Component

1. Create component file in appropriate directory:
   ```bash
   touch src/features/resolucao-problemas/components/projeto/ProjetoCard.tsx
   ```

2. Write the component with TypeScript:
   ```typescript
   import type { Projeto } from '../../types/projeto.types'

   interface ProjetoCardProps {
     projeto: Projeto
     onSelect?: (id: string) => void
   }

   export function ProjetoCard({ projeto, onSelect }: ProjetoCardProps) {
     return (
       <div className="border rounded-lg p-4">
         <h3>{projeto.titulo}</h3>
         {/* ... */}
       </div>
     )
   }
   ```

3. Export via barrel export if public API:
   ```typescript
   // src/features/resolucao-problemas/index.ts
   export { ProjetoCard } from './components/projeto/ProjetoCard'
   ```

### Adding a New Hook

1. Create hook file:
   ```bash
   touch src/features/resolucao-problemas/hooks/useProjeto.ts
   ```

2. Implement with TanStack Query:
   ```typescript
   import { useQuery } from '@tanstack/react-query'
   import { projetoService } from '../services/projetoService'

   export function useProjeto(id: string) {
     return useQuery({
       queryKey: ['projeto', id],
       queryFn: () => projetoService.buscarPorId(id),
       enabled: !!id,
     })
   }
   ```

### Adding a New Validator

1. Create validator file:
   ```bash
   touch src/features/resolucao-problemas/validators/projetoValidator.ts
   ```

2. Define Zod schema:
   ```typescript
   import { z } from 'zod'

   export const projetoCreateSchema = z.object({
     titulo: z.string().min(3).max(200),
     descricao: z.string().min(10),
     cliente_id: z.string().uuid(),
     responsavel_id: z.string().uuid(),
     data_inicio: z.string().datetime().or(z.date()),
   })

   export type ProjetoCreateInput = z.infer<typeof projetoCreateSchema>
   ```

## API Integration

### Axios Configuration

The Axios instance is pre-configured with:
- **Base URL**: From `VITE_API_BASE_URL` env variable
- **JWT Interceptor**: Automatically adds `Authorization: Bearer <token>` header
- **Error Transformation**: Converts backend errors to user-friendly messages
- **Date Parsing**: Auto-parses ISO 8601 date strings to Date objects

**Usage**:
```typescript
import { apiClient } from '../services/apiClient'

const response = await apiClient.get('/resolucao-problemas/projetos')
// Auth header automatically added
```

### Testing with MSW

MSW (Mock Service Worker) intercepts HTTP requests during tests:

1. Define handlers in `tests/contract/mocks/handlers.ts`
2. Handlers return mock responses matching API contract
3. Tests run without hitting real backend

**Benefits**:
- Fast tests (no network latency)
- Isolated tests (no backend dependencies)
- Contract verification (ensures frontend matches API spec)

## Debugging

### React Query DevTools

TanStack Query DevTools are enabled in development:

1. Run `npm run dev`
2. Open browser to `http://localhost:5173`
3. Click the "React Query" icon in bottom-right corner
4. Inspect queries, mutations, and cache state

### Browser DevTools

- **Console**: Check for errors and warnings
- **Network Tab**: Inspect API requests/responses
- **React DevTools**: Inspect component tree and props

### VS Code Debugging

Add breakpoints in VS Code and run:

```bash
# Start dev server in debug mode
npm run dev:debug
```

Then attach VS Code debugger (F5).

## Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

Build output is in `dist/` directory.

## Troubleshooting

### Issue: TypeScript errors after pulling changes

**Solution**: Rebuild TypeScript definitions:
```bash
npm run type-check
```

### Issue: Tests failing with "Cannot find module"

**Solution**: Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Issue: Backend API not responding

**Solution**: Ensure backend is running:
```bash
cd ../leadsrapido_backend
npm run dev:api
```

### Issue: Port 5173 already in use

**Solution**: Kill process or use different port:
```bash
# Option 1: Kill process
lsof -ti:5173 | xargs kill -9

# Option 2: Use different port
VITE_PORT=5174 npm run dev
```

### Issue: Cypress tests failing in headless mode

**Solution**: Run in headed mode to see what's happening:
```bash
npm run test:integration:open
```

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check linting errors |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run type-check` | TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run test:contract` | Run contract tests (MSW) |
| `npm run test:integration` | Run E2E tests (Cypress) |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run test:run` | Run all tests |
| `npm run test:coverage` | Generate coverage report |

## Next Steps

1. ✅ Read the [spec.md](./spec.md) to understand requirements
2. ✅ Review [data-model.md](./data-model.md) for type definitions
3. ✅ Check [contracts/projetos-api.yaml](./contracts/projetos-api.yaml) for API contract
4. ⏭️ Generate tasks with `/speckit.tasks` command
5. ⏭️ Start implementing following test-first workflow

## Support

- **Project Lead**: Check `CLAUDE.md` for project structure
- **Constitution**: See `.specify/memory/constitution.md` for development principles
- **API Docs**: See `docs/ph3a/FRONTEND_GUIDE-RESOLUCAO-PROBLEMAS.md`

---

**Last Updated**: 2025-12-18
**Maintained by**: LeadsRapido Frontend Team
