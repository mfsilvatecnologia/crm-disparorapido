# Plano de Implementação: Refatoração da Estrutura do Projeto para Arquitetura Baseada em Features

**Branch**: `002-refatorar-estrutura-do` | **Data**: 2025-09-24 | **Spec**: [spec.md](./spec.md)
**Input**: Especificação da feature em `/specs/002-refatorar-estrutura-do/spec.md`

## Fluxo de Execução (comando /plan)
```
1. Carregar spec da feature do Input
   → ✅ Spec carregada de specs/002-refatorar-estrutura-do/spec.md
2. Preencher Contexto Técnico (detectar dúvidas, stack, dependências)
   → ✅ Projeto React/TypeScript, Vite, Tailwind detectado
   → ✅ Estrutura atual src/ analisada
3. Avaliar seção de Checagem da Constituição
   → ✅ Refatoração estrutural alinhada com princípios de componentização
   → ✅ Sem violações detectadas
   → Atualizar progresso: Checagem inicial ✅
4. Executar Fase 0 → research.md
   → ✅ Pesquisa de padrões de arquitetura por features
5. Executar Fase 1 → contratos, data-model.md, quickstart.md
   → ✅ Estrutura de migração documentada
6. Reavaliar Constituição
   → ✅ Design mantém princípios de componentização e reutilização
   → Atualizar progresso: Pós-design ✅
7. Planejar Fase 2 → Descrever abordagem de geração de tasks
   → ✅ Estratégia de migração definida
8. PARAR - Pronto para comando /tasks ✅
```

## Resumo
Refatoração completa da estrutura de arquivos do projeto frontend LeadsRápido de uma organização baseada em tipos de arquivo (pages/, components/, hooks/) para uma arquitetura baseada em features, onde cada funcionalidade agrupa todos seus recursos relacionados em um módulo dedicado. A migração será executada de uma só vez para evitar estados inconsistentes.

## Contexto Técnico
**Linguagem/Versão**: TypeScript 5+, React 18+
**Dependências Principais**: React, Vite, Tailwind, Supabase, React Router, React Hook Form, Radix UI
**Armazenamento**: Supabase (quando aplicável)
**Testes**: Jest, React Testing Library, Vitest
**Plataforma Alvo**: Web moderna (Chrome, Firefox, Edge)

**Estrutura Atual Detectada**:
```
src/
  components/ (admin/, auth/, dashboard/, landing/, layout/, shared/, ui/)
  contexts/ (AuthContext, OrganizationContext, SessionContext)
  hooks/ (useApiToken, useAudit, useLeads, etc.)
  lib/ (api/, supabase, utils)
  pages/ (14+ páginas principais)
  types/ (auth.ts)
```

**Estrutura Alvo**:
```
src/
  features/ (authentication/, leads/, companies/, campaigns/, etc.)
  shared/ (components/, hooks/, contexts/, services/, utils/, types/)
  pages/ (Index.tsx, NotFound.tsx apenas)
```

## Estrutura Recomendada
```
src/
  features/
    authentication/
      components/
      pages/
      hooks/
      services/
      types/
      index.ts
    leads/
      components/
      pages/
      hooks/
      services/
      index.ts
    [outras features...]
  shared/
    components/
      layout/
      ui/ (shadcn/ui components)
      common/
    hooks/
    contexts/
    services/
    utils/
    types/
  pages/ (apenas páginas especiais)
  App.tsx
  main.tsx
```

## Comandos Úteis
- Instalar dependências: `pnpm install`
- Rodar dev: `pnpm dev`
- Rodar testes: `pnpm test`
- Lint: `pnpm lint`

## Checagem da Constituição
- [x] Componentização e reutilização: Mantida com melhor organização
- [x] Testes automatizados (TDD): Preservados na nova estrutura
- [x] Uso de Tailwind para estilos: Não afetado pela refatoração
- [x] Padronização de código (ESLint/Prettier): Mantida
- [x] Logs e tratamento de erros: Preservados

## Observações
**Project Type**: Web application - frontend React com estrutura complexa
**Performance Goals**: Nenhum impacto na performance - apenas reorganização estrutural
**Constraints**: Migração completa de uma só vez, manter todos imports funcionando
**Scale/Scope**: 160+ arquivos a serem reorganizados, 14+ features identificadas

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**: ✅
- Projects: 1 (frontend React)
- Using framework directly? ✅ (React, Vite, Tailwind sem wrappers)
- Single data model? ✅ (refatoração estrutural, não modelo de dados)
- Avoiding patterns? ✅ (não introduz novos patterns complexos)

**Architecture**: ✅
- Feature-based organization alinhada com boas práticas React
- Separação clara entre features e recursos compartilhados
- Pontos de entrada bem definidos (index.ts por feature)

**Testing (NON-NEGOTIABLE)**: ✅
- Testes existentes serão preservados e reorganizados
- Estrutura de testes mantida funcionando
- TDD continua aplicável para novas features

**Observability**: ✅
- Sistema de logging existente preservado
- Estrutura não afeta observabilidade

**Versioning**: ✅
- Refatoração interna, sem mudança de API pública
- Versionamento do projeto mantido

## Project Structure

### Documentation (this feature)
```
specs/002-refatorar-estrutura-do/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Current: Single React project structure
src/
├── features/           # NEW: Feature-based organization
│   ├── authentication/
│   ├── leads/
│   ├── companies/
│   ├── campaigns/
│   ├── scraping/
│   ├── pipeline/
│   ├── segments/
│   ├── user-management/
│   ├── admin/
│   └── dashboard/
├── shared/            # NEW: Truly shared resources
│   ├── components/
│   ├── hooks/
│   ├── contexts/
│   ├── services/
│   ├── utils/
│   └── types/
├── pages/            # REDUCED: Only special pages
└── [existing files]  # PRESERVED: App.tsx, main.tsx, etc.
```

**Structure Decision**: Web application (Option 2) with feature-based frontend organization

## Phase 0: Outline & Research

**Research Tasks Completed**:

1. **Feature-based Architecture Patterns**:
   - **Decision**: Vertical slices por funcionalidade de negócio
   - **Rationale**: Melhora manutenibilidade, reduce coupling, facilita desenvolvimento em equipe
   - **Alternatives considered**: Organização por camadas (atual), modular monolith

2. **React Feature Organization Best Practices**:
   - **Decision**: Cada feature com próprio index.ts exportando recursos públicos
   - **Rationale**: Controla superfície de API, facilita refactoring interno
   - **Alternatives considered**: Exports diretos, barrel exports complexos

3. **Shared vs Feature-Specific Resources**:
   - **Decision**: Shared apenas para recursos genuinamente reutilizados (UI components, utils gerais)
   - **Rationale**: Evita false sharing, mantém features independentes
   - **Alternatives considered**: Tudo compartilhado, nada compartilhado

4. **Import Path Strategy**:
   - **Decision**: Manter imports relativos dentro de features, absolutos para shared
   - **Rationale**: Balance entre localidade e clareza de dependências
   - **Alternatives considered**: Todos relativos, todos absolutos

**Research Complete**: ✅ Todas decisões arquiteturais definidas

## Phase 1: Design & Contracts

### Data Model (Refactoring Structure)
**Entities na Refatoração**:

- **Feature Module**: Diretório contendo componentes, hooks, páginas, serviços de uma funcionalidade
  - **Campos**: name, components[], hooks[], pages[], services[], index.ts
  - **Relacionamentos**: pode depender de shared/, não de outras features diretamente
  - **Regras**: Exports públicos apenas via index.ts

- **Shared Resource**: Recurso genuinamente reutilizado entre múltiplas features
  - **Campos**: type (component|hook|service|util|type), usedBy[], location
  - **Relacionamentos**: usado por múltiplas features
  - **Regras**: Não pode depender de features específicas

- **Migration Task**: Operação de mover arquivo de localização atual para nova estrutura
  - **Campos**: sourcePath, targetPath, type, dependencies[]
  - **Estado**: pending -> processing -> completed
  - **Regras**: Dependências devem ser resolvidas primeiro

### API Contracts
**Não Aplicável**: Esta refatoração é puramente estrutural, não há APIs ou contratos externos a definir.

### Test Strategy
**Preservação de Testes**:
- Testes existentes em `src/test/` mantidos
- Imports atualizados automaticamente
- Estrutura de testes preservada
- Coverage mantida

### Agent Context Update
Updated agent context with current refactoring project structure and patterns.

**Output**: ✅ research.md complete, data-model.md complete, quickstart.md planned, no contracts needed

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
1. **Análise de Dependências**: Mapear todos os imports entre arquivos
2. **Agrupamento por Feature**: Identificar arquivos que pertencem a cada feature
3. **Identificação de Shared**: Encontrar recursos verdadeiramente compartilhados
4. **Ordem de Migração**: Dependências primeiro, depois dependentes
5. **Criação de Structure**: Criar diretórios da nova estrutura
6. **File Migration**: Mover arquivos mantendo funcionalidade
7. **Import Updates**: Atualizar todos os imports para nova estrutura
8. **Index Creation**: Criar index.ts para cada feature
9. **App.tsx Updates**: Atualizar imports principais
10. **Validation**: Verificar builds e testes

**Ordering Strategy**:
- **Preparação**: Criar estrutura de diretórios [P]
- **Shared First**: Mover recursos compartilhados primeiro
- **Features**: Migrar features por ordem de dependência
- **Integration**: Atualizar arquivos principais (App.tsx, main.tsx)
- **Validation**: Testes e builds

**Estimated Output**: ~35-40 tarefas numeradas e ordenadas considerando dependências

**IMPORTANT**: Esta fase será executada pelo comando /tasks, NÃO pelo /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, builds, lint validation)

## Complexity Tracking
*No violations detected - refactoring aligns with constitutional principles*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning approach described (/plan command)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (None)

---
*Based on Constitution v2.1.1 - See `.specify/memory/constitution.md`*