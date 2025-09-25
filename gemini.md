# Gemini AI Agent Guide - LeadsRápido Frontend

## Visão Geral do Sistema

O LeadsRápido é uma aplicação CRM moderna para gestão de leads e automação de scraping, construída com React, TypeScript e arquitetura baseada em features (domain-driven design).

## Arquitetura e Estrutura do Projeto

### Organização Feature-Based

A aplicação segue uma arquitetura de features onde cada domínio de negócio tem sua própria estrutura completa:

```
src/
├── features/                    # Domínios de negócio
│   ├── admin/                  # Administração e configurações
│   ├── authentication/         # Autenticação e autorização
│   ├── campaigns/             # Gestão de campanhas de marketing
│   ├── companies/             # Cadastro e gestão de empresas
│   ├── dashboard/             # Painéis e métricas
│   ├── leads/                 # Gestão de leads e prospects
│   ├── pipeline/              # Funil de vendas e conversão
│   ├── scraping/              # Coleta automatizada de dados
│   ├── segments/              # Segmentação de audiências
│   └── user-management/       # Gestão de usuários e permissões
└── shared/                    # Recursos compartilhados
    ├── components/            # Componentes reutilizáveis
    │   ├── common/           # Componentes genéricos
    │   ├── layout/           # Layout da aplicação
    │   └── ui/               # Sistema de design (shadcn/ui)
    ├── contexts/             # Contextos React globais
    ├── hooks/                # Hooks personalizados compartilhados
    ├── services/             # Serviços de API e integrações
    ├── types/                # Definições de tipos TypeScript
    └── utils/                # Funções utilitárias
```

### Anatomia de uma Feature

Cada feature mantém uma estrutura consistente e autossuficiente:

```
features/exemplo/
├── components/          # UI específica do domínio
│   ├── ExemploCard.tsx
│   ├── ExemploForm.tsx
│   └── index.ts        # Barrel exports
├── hooks/              # Lógica de estado específica
│   ├── useExemplo.ts
│   └── useExemploForm.ts
├── services/           # Comunicação com APIs
│   ├── exemploApi.ts
│   └── exemploQueries.ts
├── types/              # Tipos TypeScript do domínio
│   └── exemplo.ts
├── pages/              # Páginas da feature
│   ├── ExemploPage.tsx
│   └── ExemploListPage.tsx
├── contexts/           # Estado global da feature (se necessário)
│   └── ExemploContext.tsx
└── index.ts            # API pública da feature
```

## Stack Tecnológica

### Frontend
- **React 18**: Biblioteca UI com Concurrent Features
- **TypeScript**: Tipagem estática e IntelliSense
- **Vite**: Build tool moderno e rápido
- **React Router**: Roteamento client-side

### UI e Styling
- **shadcn/ui**: Sistema de componentes baseado em Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Ícones consistentes e otimizados

### Estado e Dados
- **React Query (TanStack Query)**: Server state management
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas e tipos
- **Context API**: Estado global quando necessário

### Backend e Integrações
- **Supabase**: Backend-as-a-Service com PostgreSQL
- **REST APIs**: Comunicação com serviços externos
- **WebSockets**: Atualizações em tempo real

## Diretrizes de Desenvolvimento

### 1. Princípios Arquiteturais

**Separação de Responsabilidades**
- Features isoladas por domínio de negócio
- Componentes shared apenas quando usados por 3+ features
- Lógica de negócio encapsulada em hooks customizados

**Single Responsibility Principle**
- Cada componente tem uma responsabilidade clara
- Hooks focados em uma funcionalidade específica
- Services organizados por recurso de API

**DRY (Don't Repeat Yourself)**
- Reutilização através de componentes shared
- Hooks personalizados para lógica comum
- Utilitários para funções auxiliares

### 2. Padrões de Código

**Nomenclatura**
```typescript
// Componentes: PascalCase
export function LeadCard({ lead }: LeadCardProps) {}

// Hooks: camelCase com prefixo 'use'
export function useLeads() {}

// Types/Interfaces: PascalCase
interface Lead {
  id: string
  name: string
}

// Services: camelCase
export async function fetchLeads() {}

// Constantes: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
```

**Estrutura de Componentes**
```typescript
// Template padrão de componente
interface ComponentProps {
  // Props tipadas
}

export function Component({ prop }: ComponentProps) {
  // 1. Hooks
  // 2. Estado local
  // 3. Efeitos
  // 4. Handlers
  // 5. Renders condicionais

  return (
    // JSX
  )
}
```

### 3. Padrões de Import

```typescript
// ✅ Correto - API pública da feature
import { useAuth, LoginPage } from '@/features/authentication'

// ✅ Correto - Componentes shared
import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/hooks/use-toast'

// ✅ Correto - Bibliotecas externas
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'

// ❌ Evitar - Importação interna de outras features
import { LoginForm } from '@/features/authentication/components/LoginForm'
```

## Funcionalidades por Feature

### Authentication
- **Responsabilidade**: Autenticação, autorização e controle de acesso
- **Componentes**: LoginPage, RegisterPage, PermissionGate, RoleSelector
- **Hooks**: useAuth, usePermissions, useRegister
- **Services**: auth.ts, permissions.ts

### Scraping
- **Responsabilidade**: Automação de coleta de dados
- **Componentes**: ScrapingPage, WorkerMonitorPage, SearchTermsPage
- **Hooks**: useWorkerMonitor, useScrapingJobs
- **Services**: scraping.ts, workers.ts

### Leads
- **Responsabilidade**: Gestão de leads e prospects
- **Componentes**: LeadsPage, LeadCard, LeadForm
- **Hooks**: useLeads, useLeadFilters
- **Services**: leads.ts

### Dashboard
- **Responsabilidade**: Métricas, KPIs e visualizações
- **Componentes**: DashboardPage, MetricCard, Charts
- **Hooks**: useMetrics, useDashboardData
- **Services**: analytics.ts

## Comandos de Desenvolvimento

```bash
# Configuração inicial
npm install              # Instalar dependências
npm run dev             # Servidor de desenvolvimento

# Qualidade de código
npm run lint            # ESLint
npm run type-check      # Verificação de tipos
npm run format          # Prettier

# Build e deploy
npm run build           # Build de produção
npm run preview         # Preview do build

# Testes
npm run test            # Executar testes
npm run test:watch      # Modo watch
npm run test:coverage   # Cobertura de código
```

## Instruções Específicas para Gemini

### Ao Criar Novas Features

1. **Estrutura Completa**: Sempre crie todos os diretórios necessários (components, hooks, services, types, pages, contexts)
2. **Index.ts**: Crie arquivo de barrel exports para API pública
3. **Tipagem**: Use TypeScript rigorosamente, evite `any`
4. **Testes**: Inclua testes unitários para lógica complexa
5. **Documentação**: Comente código quando necessário

### Ao Modificar Features Existentes

1. **Análise**: Entenda a estrutura atual antes de modificar
2. **Consistência**: Mantenha padrões existentes
3. **Refatoração**: Mova arquivos preservando funcionalidade
4. **Imports**: Atualize todos os imports após mudanças
5. **Testes**: Execute testes para validar mudanças

### Padrões de Qualidade

**Componentes React**
- Use functional components com hooks
- Extraia lógica complexa para hooks customizados
- Implemente loading states e error boundaries
- Otimize com memo() quando apropriado

**Gerenciamento de Estado**
- React Query para server state
- useState/useReducer para local state
- Context apenas para estado global necessário
- Evite prop drilling excessivo

**Performance**
- Lazy loading para páginas
- Code splitting para features grandes
- Otimização de imagens
- Memoização de cálculos custosos

**Acessibilidade**
- Use elementos semânticos
- Implemente ARIA attributes
- Garanta navegação por teclado
- Contraste adequado de cores

### Resolução de Problemas

**Erros Comuns**
1. **Schema Validation**: Verifique tipos Zod vs dados da API
2. **Import Errors**: Confirme paths após reorganização
3. **Build Failures**: Execute type-check antes do build
4. **Hydration Issues**: Verifique SSR/client consistency

**Debug Tools**
- React Developer Tools
- Network tab para requisições
- Console para logs de erro
- Source maps para debugging

Esta estrutura promove código maintível, escalável e de alta qualidade para o crescimento sustentável da aplicação LeadsRápido.