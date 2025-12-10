# Plano de Implementação: Dossiê de Leads com Enriquecimento PH3A

**Branch**: `001-lead-dossie` | **Data**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Especificação de funcionalidade de `/specs/001-lead-dossie/spec.md`

**Nota**: Este plano foi gerado pelo comando `/speckit.plan`. Consulte `.specify/templates/commands/plan.md` para o fluxo de execução.

## Resumo

Criar uma tela de dossiê de leads que exibe uma lista de leads do sistema com capacidade de enriquecer dados através da API PH3A implementada no backend. Este é um recurso pago baseado em créditos, com preços diferenciados por tipo de dados (Saúde Financeira, Perfil Enriquecido, Rastro Digital, Afinidade de Mercado, Validação Cadastral). O sistema deve exibir saldo de créditos, permitir compra de pacotes individuais ou completo, mostrar dados enriquecidos em cards organizados com fonte de dados, e respeitar conformidade LGPD com mascaramento de dados sensíveis.

## Contexto Técnico

**Linguagem/Versão**: TypeScript 5.8+, React 18.3+
**Dependências Primárias**: React Router, TanStack Query (react-query), React Hook Form, Zod, Tailwind CSS, shadcn/ui
**Armazenamento**: Backend REST API (PH3A integration via backend), localStorage para cache de preferências
**Testes**: Vitest (unit), Vitest + MSW (integration), Vitest (contract)
**Plataforma Alvo**: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+), suporte mobile responsivo
**Tipo de Projeto**: Web application (frontend SPA + backend REST)
**Metas de Performance**:
- Carregamento inicial da lista de leads < 1s
- Tempo de resposta para compra de enriquecimento < 3s
- Renderização de cards de dados enriquecidos < 500ms
- Suporte para 100+ leads na lista sem degradação
**Restrições**:
- Sem chamadas diretas à API PH3A (apenas via backend)
- Mascaramento LGPD obrigatório para dados sensíveis
- Integração com sistema de créditos existente
- Prevenção de compras duplicadas (validação no backend)
**Escala/Escopo**:
- ~10 componentes novos
- 5 cards de visualização de dados
- 4-6 endpoints backend (lista leads, saldo créditos, compra enriquecimento, dados dossiê)
- Suporte para milhares de leads com paginação

## Verificação da Constituição

**Versão da Constituição**: 2.2.0

*GATE: Deve passar antes da Fase 0 de pesquisa. Re-verificar após design da Fase 1.*

- ✅ **Autoridade Backend API-First**: Frontend consumirá apenas contratos do backend. Novos endpoints serão especificados antes do trabalho de UI:
  - `GET /leads` e `GET /leads/{id}` - Lista e detalhe de leads
  - `GET /credits/balance` - Saldo de créditos do usuário/empresa
  - `GET /credits/packages` - Pacotes/créditos configurados no produto (preços fornecidos pelo backend)
  - `POST /ph3a/dossier/consult` - Solicitar enriquecimento PH3A (CPF/CNPJ) para um lead
  - `GET /ph3a/dossier` - Listar dossiês consultados (com filtros)
  - `GET /ph3a/dossier/{id}` - Obter dados enriquecidos de um dossiê específico

- ✅ **Entrega Test-First (Contrato + Integração)**:
  - Testes de contrato: Validar schemas de API (usando MSW + Zod schemas)
  - Testes de integração: Fluxos completos (listar leads → comprar enriquecimento → visualizar dados)
  - Sequência: Escrever testes falhando → Implementar → Refatorar
  - Comandos: `npm run test:contract`, `npm run test:integration`, `npm run test:run`

- ✅ **Limites Modulares de Funcionalidade**:
  - Nova feature em `src/features/lead-dossier/`
  - API pública via `src/features/lead-dossier/index.ts`
  - Reutilizar componentes shared de `src/shared/components/` quando aplicável
  - Não acessar internos de outras features (ex: `leads`, `sales`)
  - Integração com sistema de créditos via API pública

- ✅ **Simplicidade Anti-Entropia**:
  - Escopo MVP: Lista + visualização + compra individual
  - Pacote completo é P3 (pode ser fase 2)
  - Sem abstrações especulativas
  - Documentação executável (quickstart.md)
  - Commits focados (<500 LOC quando possível)

- ✅ **Controle de Mudança Orientado a Spec**:
  - Change-id: `001-lead-dossie`
  - Constituição v2.2.0
  - Contratos OpenAPI documentados em `specs/001-lead-dossie/contracts/`
  - Validação antes da implementação

**Status**: ✅ APROVADO - Nenhuma violação detectada

## Estrutura do Projeto

### Documentação (esta funcionalidade)

```text
specs/001-lead-dossie/
├── plan.md              # Este arquivo (comando /speckit.plan)
├── research.md          # Saída Fase 0 (comando /speckit.plan)
├── data-model.md        # Saída Fase 1 (comando /speckit.plan)
├── quickstart.md        # Saída Fase 1 (comando /speckit.plan)
├── contracts/           # Saída Fase 1 (comando /speckit.plan)
│   ├── api-leads.yaml
│   ├── api-credits.yaml
│   └── api-ph3a.yaml
└── tasks.md             # Saída Fase 2 (comando /speckit.tasks - NÃO criado por /speckit.plan)
```

### Código Fonte (raiz do repositório)

```text
src/
├── features/
│   └── lead-dossier/                    # Nova feature
│       ├── components/
│       │   ├── LeadList.tsx            # Lista paginada de leads
│       │   ├── LeadListItem.tsx        # Item individual da lista
│       │   ├── LeadListFilters.tsx     # Filtros e busca
│       │   ├── CreditBalance.tsx       # Exibição saldo créditos
│       │   ├── EnrichmentModal.tsx     # Modal compra enriquecimento
│       │   ├── EnrichmentPackageCard.tsx # Card de pacote individual
│       │   ├── DossierView.tsx         # Visualização completa do dossiê
│       │   ├── FinancialHealthCard.tsx # Card Saúde Financeira
│       │   ├── EnrichedProfileCard.tsx # Card Perfil Enriquecido
│       │   ├── DigitalTraceCard.tsx    # Card Rastro Digital
│       │   ├── MarketAffinityCard.tsx  # Card Afinidade de Mercado
│       │   ├── RegistryValidationCard.tsx # Card Validação Cadastral
│       │   └── EnrichmentHistory.tsx   # Histórico de enriquecimentos
│       ├── hooks/
│       │   ├── useLeads.ts             # Hook para lista de leads
│       │   ├── useCreditBalance.ts     # Hook para saldo créditos
│       │   ├── useEnrichmentPackages.ts # Hook para pacotes disponíveis
│       │   ├── usePurchaseEnrichment.ts # Hook para compra
│       │   ├── useDossier.ts           # Hook para dados dossiê
│       │   └── useEnrichmentHistory.ts # Hook para histórico
│       ├── pages/
│       │   ├── LeadDossierPage.tsx     # Página principal (lista)
│       │   └── LeadDetailPage.tsx      # Página detalhes (dossiê)
│       ├── services/
│       │   ├── leadsService.ts         # Serviço API leads
│       │   ├── creditsService.ts       # Serviço API créditos
│       │   └── ph3aService.ts          # Serviço API PH3A
│       ├── types/
│       │   ├── lead.ts                 # Tipos Lead
│       │   ├── credit.ts               # Tipos Crédito
│       │   ├── enrichment.ts           # Tipos Enriquecimento
│       │   └── dossier.ts              # Tipos Dossiê
│       ├── utils/
│       │   ├── lgpdMask.ts             # Utilitários mascaramento LGPD
│       │   └── formatters.ts           # Formatadores (dinheiro, data, etc)
│       └── index.ts                    # API pública da feature
│
├── shared/
│   └── components/
│       ├── EmptyState.tsx              # Estado vazio (reutilizar)
│       ├── LoadingCard.tsx             # Card loading (reutilizar)
│       └── ErrorBoundary.tsx           # Error boundary (reutilizar)
│
tests/
├── contract/
│   └── lead-dossier/
│       ├── leads-api.contract.test.ts
│       ├── credits-api.contract.test.ts
│       └── ph3a-api.contract.test.ts
│
└── integration/
    └── lead-dossier/
        ├── lead-list-flow.test.ts
        ├── enrichment-purchase-flow.test.ts
        └── dossier-view-flow.test.ts
```

**Decisão de Estrutura**: Seguindo o padrão existente de feature-modular (`src/features/<domain>`), a nova funcionalidade será implementada em `src/features/lead-dossier/` com estrutura padrão: components/, hooks/, pages/, services/, types/, utils/ e index.ts para API pública. Reutilizaremos componentes compartilhados de `src/shared/` onde aplicável (EmptyState, LoadingCard, ErrorBoundary).

## Rastreamento de Complexidade

> **Preencher APENAS se a Verificação da Constituição tiver violações que devem ser justificadas**

_Nenhuma violação detectada - seção vazia_
