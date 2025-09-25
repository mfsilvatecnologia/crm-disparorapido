# Claude AI Agent Guide - LeadsRápido Frontend

## Sobre o Projeto

O LeadsRápido é uma aplicação CRM para gestão de leads e scraping de dados, desenvolvida com React, TypeScript e arquitetura feature-based.

## Arquitetura do Projeto

### Estrutura Feature-Based

```
src/
├── features/                    # Features organizadas por domínio
│   ├── admin/                  # Administração do sistema
│   ├── authentication/         # Sistema de autenticação
│   ├── campaigns/             # Gestão de campanhas
│   ├── companies/             # Gestão de empresas
│   ├── dashboard/             # Dashboard principal
│   ├── leads/                 # Gestão de leads
│   ├── pipeline/              # Pipeline de vendas
│   ├── scraping/              # Sistema de scraping
│   ├── segments/              # Segmentação de leads
│   └── user-management/       # Gestão de usuários
└── shared/                    # Código compartilhado entre features
    ├── components/            # Componentes genéricos reutilizáveis
    ├── contexts/             # Contextos globais
    ├── hooks/                # Hooks compartilhados
    ├── services/             # Services compartilhados
    ├── types/                # Types compartilhados
    └── utils/                # Utilitários compartilhados
```

### Estrutura de Features

Cada feature deve seguir esta estrutura consistente:

```
features/[feature-name]/
├── components/          # Componentes específicos da feature
├── hooks/              # Hooks específicos da feature
├── services/           # Services/API calls específicos
├── types/              # Types específicos
├── pages/              # Páginas da feature (quando aplicável)
├── contexts/           # Contextos específicos (quando necessário)
└── index.ts            # Exports centralizados
```

## Diretrizes de Desenvolvimento

### 1. Organização por Domínio
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

### 4. Padrões de Import

```typescript
// ✅ Bom - Import da API pública da feature
import { useAuth, LoginPage } from '@/features/authentication'

// ✅ Bom - Import de shared
import { Button } from '@/shared/components/ui/button'

// ❌ Evitar - Import interno de outra feature
import { useAuth } from '@/features/authentication/hooks/useAuth'
```

## Mapeamento de Features

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

## Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Tailwind CSS
- **Estado**: React Query, Context API
- **Formulários**: React Hook Form, Zod
- **Roteamento**: React Router
- **Backend**: Supabase

## Comandos Principais

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm run test

# Linting
npm run lint

# Type checking
npm run type-check
```

## Instruções para Claude

### Ao Desenvolver Novas Features

1. **Estrutura**: Crie a estrutura completa da feature com todos os diretórios necessários
2. **Componentes**: Coloque componentes específicos em `features/[name]/components/`
3. **Shared**: Use `shared/` apenas para código reutilizado por 3+ features
4. **Exports**: Sempre crie/atualize o `index.ts` da feature
5. **Imports**: Use a API pública das features, não imports internos

### Ao Refatorar

1. **Análise**: Entenda a estrutura atual antes de fazer mudanças
2. **Migração**: Mova arquivos mantendo funcionalidade
3. **Imports**: Atualize todos os imports após mudanças
4. **Testes**: Execute testes após refatoração
5. **Build**: Verifique se o build está funcionando

### Padrões de Código

- **Componentes**: Use PascalCase, export default para páginas
- **Hooks**: Use camelCase com prefixo `use`
- **Types**: Use PascalCase, prefira interfaces
- **Services**: Use camelCase, funções async/await
- **Styles**: Tailwind classes, sem CSS customizado desnecessário

### Debugging

1. **Schema Validation**: Verifique tipos Zod quando houver erros de validação
2. **Imports**: Confira paths quando houver erros de import
3. **Build**: Use `npm run build` para verificar erros de tipo
4. **Network**: Use DevTools para debugar requisições API

Esta estrutura garante escalabilidade, manutenibilidade e facilita o desenvolvimento em equipe.