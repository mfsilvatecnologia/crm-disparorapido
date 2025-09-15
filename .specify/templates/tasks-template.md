# Tasks: [NOME DA FEATURE]

**Input**: Documentos de design em `/specs/[nome-feature]/`
**Pré-requisitos**: plan.md (obrigatório), research.md, data-model.md, contracts/

## Fluxo de Execução (main)
```
1. Carregar plan.md da feature
   → Se não existir: ERRO "Plano de implementação não encontrado"
   → Extrair: stack, libs, estrutura
2. Carregar docs opcionais:
   → data-model.md: Extrair entidades → modelar tasks
   → contracts/: Cada arquivo → task de teste de contrato
   → research.md: Decisões → tasks de setup
3. Gerar tasks por categoria:
   → Setup: criar componente, hook, contexto, dependências
   → Testes: unitários (Jest/RTL), integração (fluxos críticos)
   → Core: lógica do componente, integração com API/Supabase
   → Integração: autenticação, contexto global, logging
   → Polish: refino visual, docs, cobertura de testes
4. Regras:
   → Arquivos diferentes = marcar [P] para paralelo
   → Mesmo arquivo = sequencial (sem [P])
   → Testes antes da implementação (TDD)
5. Numerar tasks sequencialmente (T001, T002...)
6. Gerar grafo de dependências
7. Exemplos de execução paralela
8. Validar completude:
   → Todos componentes testados?
   → Hooks/contextos cobertos?
   → Integrações implementadas?
9. Return: SUCCESS (tasks prontas para execução)
```

## Formato: `[ID] [P?] Descrição`
- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências)
- Incluir caminhos exatos dos arquivos (ex: `src/components/MeuComponente.tsx`)

## Convenções de Caminho
- Projeto único: `src/`, testes juntos ou em `__tests__` ao lado do arquivo
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 3.1: Setup
- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Contract test POST /api/users in tests/contract/test_users_post.py
- [ ] T005 [P] Contract test GET /api/users/{id} in tests/contract/test_users_get.py
- [ ] T006 [P] Integration test user registration in tests/integration/test_registration.py
- [ ] T007 [P] Integration test auth flow in tests/integration/test_auth.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T008 [P] User model in src/models/user.py
- [ ] T009 [P] UserService CRUD in src/services/user_service.py
- [ ] T010 [P] CLI --create-user in src/cli/user_commands.py
- [ ] T011 POST /api/users endpoint
- [ ] T012 GET /api/users/{id} endpoint
- [ ] T013 Input validation
- [ ] T014 Error handling and logging

## Phase 3.4: Integration
- [ ] T015 Connect UserService to DB
- [ ] T016 Auth middleware
- [ ] T017 Request/response logging
- [ ] T018 CORS and security headers

## Phase 3.5: Polish
- [ ] T019 [P] Unit tests for validation in tests/unit/test_validation.py
- [ ] T020 Performance tests (<200ms)
- [ ] T021 [P] Update docs/api.md
- [ ] T022 Remove duplication
- [ ] T023 Run manual-testing.md

## Dependencies
- Tests (T004-T007) before implementation (T008-T014)
- T008 blocks T009, T015
- T016 blocks T018
- Implementation before polish (T019-T023)

## Parallel Example
```
# Launch T004-T007 together:
Task: "Contract test POST /api/users in tests/contract/test_users_post.py"
Task: "Contract test GET /api/users/{id} in tests/contract/test_users_get.py"
Task: "Integration test registration in tests/integration/test_registration.py"
Task: "Integration test auth in tests/integration/test_auth.py"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [ ] All contracts have corresponding tests
- [ ] All entities have model tasks
- [ ] All tests come before implementation
- [ ] Parallel tasks truly independent
- [ ] Each task specifies exact file path
- [ ] No task modifies same file as another [P] task