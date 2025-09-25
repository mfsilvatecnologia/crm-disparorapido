# LeadsRápido Frontend - Estrutura do Projeto

## Arquitetura Feature-Based

O projeto segue uma arquitetura baseada em features, onde cada funcionalidade tem sua própria estrutura completa:

```
src/
├── features/                    # Features organizadas por domínio
│   ├── admin/                  # Administração do sistema
│   │   ├── components/         # Componentes específicos de admin
│   │   ├── hooks/             # Hooks específicos de admin
│   │   ├── services/          # Services específicos de admin
│   │   ├── types/             # Types específicos de admin
│   │   └── index.ts           # Exports centralizados
│   ├── authentication/        # Sistema de autenticação
│   │   ├── components/        # Componentes de auth (PermissionGate, etc)
│   │   ├── hooks/             # Hooks de auth (useAuth, usePermissions)
│   │   ├── pages/             # Páginas de auth (Login, Register, etc)
│   │   ├── services/          # Services de auth (auth.ts, permissions.ts)
│   │   ├── types/             # Types de auth
│   │   └── index.ts           # Exports centralizados
│   ├── campaigns/             # Gestão de campanhas
│   ├── companies/             # Gestão de empresas
│   ├── dashboard/             # Dashboard principal
│   ├── landing/               # Página inicial/landing
│   ├── leads/                 # Gestão de leads
│   ├── pipeline/              # Pipeline de vendas
│   ├── scraping/              # Sistema de scraping
│   │   ├── pages/             # ScrapingPage, SearchTermsPage, WorkerMonitorPage
│   │   ├── hooks/             # useWorkerMonitor
│   │   └── services/          # Services de scraping
│   ├── segments/              # Segmentação de leads
│   └── user-management/       # Gestão de usuários
└── shared/                    # Código compartilhado entre features
    ├── components/            # Componentes genéricos reutilizáveis
    │   ├── common/           # Componentes comuns (EmptyState, etc)
    │   ├── layout/           # Layout da aplicação (AppHeader, etc)
    │   └── ui/               # Componentes UI básicos (Button, etc)
    ├── contexts/             # Contextos globais
    ├── hooks/                # Hooks compartilhados
    ├── services/             # Services compartilhados (client.ts, etc)
    ├── types/                # Types compartilhados
    ├── utils/                # Utilitários compartilhados
    └── pages/                # Páginas genéricas (NotFound)
```

## Princípios da Arquitetura

### 1. Separação por Domínio
- Cada feature é uma unidade autossuficiente
- Componentes, hooks, services e types relacionados ficam juntos
- Reduz acoplamento entre features

### 2. Exports Centralizados
- Cada feature tem um `index.ts` que exporta sua API pública
- Facilita imports e refatorações
- Exemplo: `import { LoginPage, useAuth } from '@/features/authentication'`

### 3. Shared vs Feature-Specific
- **Shared**: Código usado por múltiplas features
- **Feature**: Código específico de um domínio

### 4. Estrutura Consistente
Cada feature deve ter:
- `components/` - Componentes específicos da feature
- `hooks/` - Hooks específicos da feature
- `services/` - Services/API calls específicos
- `types/` - Types específicos
- `pages/` - Páginas da feature (quando aplicável)
- `contexts/` - Contextos específicos (quando necessário)
- `index.ts` - Exports centralizados

## Mapeamento de Responsabilidades

| Feature | Responsabilidade | Componentes Principais |
|---------|------------------|------------------------|
| `authentication` | Login, registro, permissões | LoginPage, PermissionGate, useAuth |
| `dashboard` | Visão geral, métricas | Dashboard, MetricCard, KpiCard |
| `leads` | Gestão de leads | LeadsPage, useLeads |
| `scraping` | Coleta de dados | ScrapingPage, WorkerMonitorPage |
| `admin` | Administração sistema | AdminPage, UserManagement |
| `companies` | Gestão de empresas | EmpresasPage, CadastroEmpresaPage |
| `campaigns` | Gestão de campanhas | CampanhasPage |
| `pipeline` | Pipeline de vendas | PipelinePage |
| `segments` | Segmentação | SegmentosPage |
| `user-management` | Gestão usuários | UsersPage |
| `landing` | Página inicial | Index, HeroSection |

## Diretrizes de Desenvolvimento

### Quando Criar Nova Feature
- Funcionalidade tem domínio próprio bem definido
- Mais de 3-4 componentes relacionados
- Logic business específica
- Pode ser desenvolvida independentemente

### Quando Usar Shared
- Componente usado em 3+ features
- Utility genérico
- Service que acessa recursos globais
- Types usados em múltiplas features

### Imports
```typescript
// ✅ Bom - Import da API pública da feature
import { useAuth, LoginPage } from '@/features/authentication'

// ✅ Bom - Import de shared
import { Button } from '@/shared/components/ui/button'

// ❌ Evitar - Import interno de outra feature
import { useAuth } from '@/features/authentication/hooks/useAuth'
```

Esta arquitetura garante escalabilidade, manutenibilidade e facilita o trabalho em equipe.