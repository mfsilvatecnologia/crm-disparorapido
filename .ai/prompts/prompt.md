# PROMPT MESTRE — Frontend CRM (SaaS Multi-Empresa)

**Objetivo:** implementar, em **React + TypeScript**, o frontend completo para o **Sistema de Lead Generation Multi-Empresa** descrito abaixo, seguindo arquitetura **API-first**. Entregue código de produção, testes e documentação.

## Contexto (resumo do PRD)

* **Origem dos dados:** Web scraping + enrichment → Data Lake de Leads.
* **SaaS multi-empresa (multi-tenancy):** orgs, quotas, cobrança por lead/API, planos (Basic/Professional/Enterprise/White Label).
* **APIs (FastAPI):** autenticação (JWT/OAuth2), leads (listagem, busca, acesso, export), segmentos, organizações/usage (admin).
* **KPIs & métricas:** quotas, custos, qualidade de dados, conversão, uso por organização.
* **Segurança/Compliance:** LGPD, 2FA, rate-limit, IP whitelist, logs de acesso.

## Stack & Padrões (obrigatório)

* **Base:** React 18 + TypeScript + Vite.
* **UI:** TailwindCSS + **shadcn/ui** (Radix) + ícones **lucide-react**. Suporte **tema** (light/dark) e **branding por organização** (white-label via CSS vars).
* **Estado/Servidor:** **TanStack Query** (API cache), **React Hook Form** + **Zod** (forms/validação).
* **Roteamento:** React Router v6.
* **Charts:** Recharts. **Mapas:** React Leaflet (OpenStreetMap) com heatmap de densidade por região.
* **Datas:** Day.js (timezone/locale pt-BR).
* **Tabelas:** TanStack Table (paginação server-side).
* **Build & Qualidade:** ESlint + Prettier + Husky + lint-staged.
* **Testes:** Vitest + Testing Library + Playwright (E2E). **Storybook** para UI.
* **i18n:** react-i18next (pt-BR default, en-US pronto).
* **A11y:** WCAG 2.1 AA (foco visível, aria-\*, contraste).
* **Observabilidade (frontend):** instrumentar eventos (usage, conversão, erros) via provider (ex.: window\.analytics).
* **Feature flags:** mecanismo simples por ambiente (ex.: `import.meta.env` + contexto).

## Contratos de API (tipar tudo)

Implemente um **API Client** tipado (fetch/axios), com interceptadores para **JWT** (attach/refresh/redirect login) e **tratamento de erros** (429/401/403). Use **Zod** para schemas (parse/segurança).

### Endpoints (do PRD)

* **Auth**

  * `POST /auth/login`, `/auth/refresh`, `/auth/logout`
* **Leads**

  * `GET /api/v1/leads` (filtros: texto, segmento, UF, município, qualidade, rating, data atualização, pag/sort)
  * `GET /api/v1/leads/{id}`
  * `POST /api/v1/leads/search` (busca avançada)
  * `POST /api/v1/leads/{id}/access` (registra acesso/custo/uso de quota)
  * `POST /api/v1/leads/bulk-access`
  * `GET /api/v1/leads/export` (CSV)
* **Segments**

  * `GET /api/v1/segments`
  * `GET /api/v1/segments/{id}/stats`
  * `POST /api/v1/segments/{id}/leads`
* **Organizations (Admin)**

  * `GET /api/v1/organizations`, `POST /api/v1/organizations`, `PUT /api/v1/organizations/{id}`
  * `GET /api/v1/organizations/{id}/usage`

### Tipos (TypeScript, derive de Zod)

* `Lead`, `LeadSegment`, `Organization`, `LeadAccess`, `UsageMetrics`, `Subscription`.
* Respostas paginadas (`{ data, total, page, pageSize }`).

## Multi-Tenancy (requisitos de UX/segurança)

* **Selector de Organização** no topo: nome, plano, **quota usada/total**, botão **“Comprar créditos”** (stub).
* **Contexto de Organização** aplicado em **todas** as chamadas (header `X-Org-Id`).
* **RBAC básico:** *admin da plataforma* (gerencia organizações), *admin da org*, *agente de vendas*, *viewer*. Esconda/disable ações por permissão.
* **White-label:** logo, cores e domínios custom (carregar desde `/organizations/{id}` → `settings.theme`).

## Arquitetura de Páginas (rotas + requisitos)

1. **/login**
   Form (email/senha), 2FA opcional, erros claros. Lidar com 401/lockout/rate-limit.
2. **/** (Dashboard)
   Cards: leads disponíveis (com filtros aplicados), quota usada, custo do mês, conversões;
   **Mapa** de densidade por UF/município;
   **Gráficos**: tendência de leads coletados, sucesso de contatos, qualidade média. Atualização a cada 60s (polling) ou WebSocket se disponível.
3. **/leads**
   **Tabela server-side** com filtros avançados, busca, sort, seleção múltipla;
   **Ações em lote:** “Solicitar acesso”, “Marcar interesse”, “Adicionar tags”, “Exportar CSV”;
   **Detalhe em Drawer/Modal:** todos os campos, **timeline** de interações, **score de qualidade**, duplicatas sugeridas, **botões**: “Solicitar acesso” (mostra **custo** e efeito em quota), “Ligar”, “Enviar e-mail”, “Adicionar ao pipeline”.
4. **/segments**
   Lista de segmentos com **stats**; ver detalhes do segmento (keywords, subcategorias, ROI médio) + CTA “Ver leads do segmento”.
5. **/pipeline**
   **Kanban** (stages configuráveis): Novo → Contatado → Qualificado → Proposta → Fechado; drag\&drop; contadores por coluna; atividades do lead.
6. **/sales-tools**

   * **Call Center (VoIP)**: discador (stub de integração), status da chamada, notas rápidas;
   * **E-mail templates**: CRUD + visualização; **Enviar/Testar**;
   * **Follow-up**: agenda (calendar/list), criar lembretes, snooze, webhooks.
7. **/billing**
   Uso por mês: **leads acessados**, **requests API**, **custos**; extratos/recibos (stub).
8. **/settings**
   Perfil, **API Keys** (criar/revogar), **Webhooks** (URL + eventos), **IP Whitelist**, **2FA**, preferências; tema/cores (white-label).
9. **/admin/organizations** (apenas admin plataforma)
   Tabela com busca, criar/editar org (plano, quota, CNPJ, webhooks), **/usage** com gráficos.

## Componentes-chave (implementar em /components)

* **OrgSwitcher**, **QuotaBadge**, **PlanPill**.
* **DataTable** (TanStack Table), **FilterBar** (chips + form), **DateRangePicker**.
* **LeadCard** / **LeadDrawer** (detalhe com tabs: Dados, Histórico, Ações).
* **MapDensity** (Leaflet + heat layer).
* **Charts**: `KpiCard`, `TrendLine`, `BarCompare`, `DonutShare`.
* **PipelineBoard** (D\&D), **CallDialer** (stub), **EmailEditor** (rich text).
* **EmptyState**, **ErrorState**, **Skeletons** (loading), **ConfirmDialog**.
* **AccessCostBadge** (mostra custo por lead e impacto na quota).

## UX de Cobrança/Quotas (must)

* Antes de **/leads/{id}/access** ou **bulk-access**, mostrar **modal de confirmação** com **custo total estimado** e **saldo de créditos**.
* Se quota insuficiente → CTA “Comprar créditos” (flow stub + toast).
* Exibir **custo por lead** (R\$0,50) e **por request API** (R\$0,10) quando relevante.

## Segurança & Compliance (frontend)

* Armazenar **tokens** em **memory** + **refresh** seguro (fallback em cookie httpOnly se disponível via backend).
* Respeitar **LGPD**: banner de consentimento (analytics), preferência de comunicação do lead.
* **Rate-limit UX:** para 429, exibir retry com backoff e mensagem amigável.
* **Masking**: campos sensíveis (ex.: telefone) parcialmente ofuscados até “acesso” ser concedido.

## Performance

* **Rumo a <200ms TTFB API** (backend), mas no frontend: **skeletons/optimistic UI**, **pré-busca** de filtros, **virtualização** de tabela, **code-splitting** por rota, lazy dos módulos pesados (mapas, charts).
* Imagens/logos cacheadas, CSS crítico minificado, prefetch de rota provável.

## Observabilidade (telemetria de produto)

Instrumente eventos: `lead_list_view`, `lead_access_requested`, `bulk_access`, `export_csv`, `pipeline_move`, `call_started`, `email_sent`, `followup_created`, `org_switched`, `quota_warning_shown`.

## Testes (definição mínima)

* **Unitários**: utils, hooks, validações Zod.
* **Integração**: DataTable com filtros server-side, LeadDrawer, Pipeline D\&D.
* **E2E (Playwright)**: login → selecionar org → filtrar leads → solicitar acesso (confirma custo) → mover no pipeline → exportar CSV.
* **Acessibilidade**: checks básicos (axe) em páginas principais.

## Entregáveis (formato da saída)

1. **Estrutura de repositório** (árvore) completa.
2. **Código** de todas as páginas/rotas, componentes e providers.
3. **API client** tipado + schemas Zod.
4. **Config**: Tailwind, shadcn (com tokens), ESLint/Prettier, Vitest, Storybook, Playwright, Husky.
5. **Mocks** (MSW) para todos endpoints do PRD (cenários: sucesso, 401/403/404/429/500).
6. **Docs**: `README.md` com setup, `.env.example`, **guia de theming/white-label**, **guia de contrib** e **mapa de rotas**.
7. **Storybook** com 20+ stories (variações de estado/erro/loading).

## Critérios de aceite (DoD)

* Login/refresh/Logout funcionais; **contexto de organização** ativo e persistido;
* Tabela de leads com filtros combináveis, paginação server-side e seleção em lote;
* **Lead access flow** com cálculo de custo e atualização visual da quota;
* Dashboard com **mapa** e **gráficos** (dados mockáveis);
* Pipeline com D\&D e persistência (mock se necessário);
* Settings com CRUD de API Keys e Webhooks (mockável);
* Admin de Organizações com edição de plano/quota e tela de **usage**;
* i18n (pt-BR/en-US) funcionando; tema claro/escuro; **a11y** validado nas páginas principais;
* Testes: cobertura significativa dos fluxos críticos;
* Build de produção passando e projeto rodando com `pnpm dev` / `pnpm build` / `pnpm test` / `pnpm storybook`.

## Diretrizes de implementação

* Comece pelo **design system** (botões, inputs, tabelas, modais, toasts).
* Depois **layout + rotas + auth** → **Org context** → **Leads** → **Dashboard/Charts** → **Pipeline** → **Sales Tools** → **Billing/Settings** → **Admin**.
* Separe lógicas em **hooks** (`/hooks`) e **services** (`/services/api`).
* Forneça **fixtures** realistas para Storybook e MSW.
* Documente **decisões arquiteturais** em `docs/adr-*.md`.

> Gere agora o projeto completo conforme as especificações acima. Se algo do backend ainda não existir, entregue **MSW mocks** e *feature flags* para alternar entre mock e API real.
