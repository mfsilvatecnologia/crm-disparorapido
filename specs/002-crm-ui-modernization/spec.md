# Feature Specification: Modernização Completa da UI/UX do CRM

**Feature Branch**: `002-crm-ui-modernization`
**Created**: 2026-01-03
**Status**: Draft
**Input**: User description: "Modernização Completa da UI/UX do CRM - Sistema de Design Inspirado em Odoo

## Contexto
O LeadsRapido é um CRM com páginas funcionais mas inconsistentes visualmente. Queremos transformá-lo em um sistema moderno inspirado no Odoo e outros CRMs de mercado, com foco em produtividade e usabilidade.

## Objetivos
1. Criar sistema de design unificado inspirado no Odoo
2. Implementar componentes reutilizáveis (StatusBadge, Toolbar, QuickFilters, etc)
3. Refatorar todas as páginas do CRM (Leads, Customers, Opportunities, Contacts, Campaigns, Contracts)
4. Adicionar wizard de onboarding para ensinar fluxo de cada tela
5. Implementar sistema de navegação rápida com atalhos de teclado
6. Melhorar organização do fluxo entre telas com quick actions"

## User Scenarios & Testing

### User Story 1 - Sistema de Design Base (Priority: P1)

Como desenvolvedor do LeadsRapido, preciso de um sistema de design unificado para garantir consistência visual e produtividade no desenvolvimento de componentes em todas as páginas do CRM.

**Why this priority**: É a fundação de todas as outras melhorias. Sem um sistema de design consistente, os componentes reutilizáveis não terão padrões visuais coerentes, resultando em inconsistências e retrabalho.

**Independent Test**: Pode ser testado inspecionando tokens de design (cores, tipografia, espaçamento) aplicados em componentes base e verificando que todos seguem os mesmos padrões definidos.

**Acceptance Scenarios**:

1. **Given** o sistema de design não existe, **When** os tokens são aplicados, **Then** todas as cores primárias, secundárias, success, warning, error e neutral estão disponíveis e consistentes
2. **Given** componentes precisam de espaçamento, **When** tokens de spacing são aplicados, **Then** o sistema de 4px base é respeitado em todos os componentes
3. **Given** texto precisa ser formatado, **When** tipografia é aplicada, **Then** a escala modular com Inter font family é usada consistentemente
4. **Given** componentes precisam de bordas e sombras, **When** tokens de border radius e shadow são aplicados, **Then** os valores padronizados são utilizados

---

### User Story 2 - Componentes Reutilizáveis Core (Priority: P1)

Como desenvolvedor, preciso de componentes reutilizáveis (StatusBadge, Toolbar, QuickFilters, ViewSwitcher, etc) para evitar duplicação de código e garantir experiência consistente.

**Why this priority**: Componentes reutilizáveis são prerequisitos para refatorar as páginas. Desenvolver primeiro permite validar o sistema de design e criar uma biblioteca sólida antes de aplicar nas páginas reais.

**Independent Test**: Pode ser testado criando uma página de exemplo (Storybook ou similar) que demonstra cada componente isoladamente com suas variações (sizes, variants, estados).

**Acceptance Scenarios**:

1. **Given** preciso exibir status de um lead, **When** uso StatusBadge component, **Then** o status é exibido com cores, ícones e labels consistentes
2. **Given** preciso de uma barra de ferramentas, **When** uso Toolbar component, **Then** search, filtros e view switcher são posicionados consistentemente
3. **Given** preciso filtrar rapidamente dados, **When** uso QuickFilters component, **Then** botões visuais com contadores aparecem permitindo filtros com um clique
4. **Given** preciso alternar visualizações, **When** uso ViewSwitcher component, **Then** posso alternar entre list/kanban/cards com feedback visual claro
5. **Given** preciso exibir métricas, **When** uso StatsWidget component, **Then** métricas são apresentadas de forma compacta e escaneável

---

### User Story 3 - Refatoração da Página de Leads (Piloto) (Priority: P2)

Como usuário do CRM, preciso da página de Leads modernizada para ter uma experiência visual limpa, profissional e produtiva ao gerenciar minha base de leads.

**Why this priority**: Leads é a página mais madura e complexa, servindo como piloto perfeito para validar componentes e padrões antes de aplicar em outras páginas. É também a página mais usada, gerando impacto rápido.

**Independent Test**: Pode ser testado acessando /app/crm/leads e verificando que header, toolbar, filtros, tabela e visualizações alternativas seguem o novo design system.

**Acceptance Scenarios**:

1. **Given** estou na página de leads, **When** visualizo o header, **Then** vejo breadcrumbs, título, métricas compactas (widget único) e ações principais claramente visíveis
2. **Given** preciso filtrar leads, **When** uso QuickFilters, **Then** vejo botões visuais para status (Novos, Qualificados, Contatados, etc) com contadores
3. **Given** preciso buscar um lead, **When** uso a barra de busca, **Then** ela está sempre visível no toolbar sem necessidade de expandir
4. **Given** visualizo a tabela, **When** analiso as colunas, **Then** vejo apenas colunas essenciais (Lead/Empresa, Segmento, Score, Status, Última Atividade, Ações)
5. **Given** preciso ver detalhes de um lead, **When** clico em um item, **Then** um drawer lateral abre mostrando informações completas sem cobrir toda a tela
6. **Given** uso emojis no sistema atual, **When** a página é modernizada, **Then** todos emojis são substituídos por ícones profissionais da Lucide React

---

### User Story 4 - Wizard de Onboarding (Feature Tour) (Priority: P3)

Como novo usuário do sistema, preciso de um wizard interativo que me guie pelos recursos de cada tela para descobrir funcionalidades rapidamente sem precisar de treinamento formal.

**Why this priority**: Com a interface modernizada, usuários novos e existentes precisam descobrir as novas funcionalidades. Um tour guiado reduz curva de aprendizado e aumenta adoção de features.

**Independent Test**: Pode ser testado como novo usuário (ou resetando estado de tours) e verificando que cada página oferece tour contextual com spotlight, tooltips e progresso visual.

**Acceptance Scenarios**:

1. **Given** acesso uma página pela primeira vez, **When** a página carrega, **Then** recebo opção de iniciar tour guiado ou pular
2. **Given** inicio um tour, **When** passo pelas etapas, **Then** vejo spotlight nos elementos chave com tooltips explicativos
3. **Given** estou no passo 2 de 5, **When** visualizo o tour, **Then** vejo indicador de progresso (2/5) e opções de avançar, voltar ou pular
4. **Given** completo um tour, **When** retorno à página, **Then** o tour não aparece novamente mas posso reativá-lo manualmente
5. **Given** pulo um tour, **When** visito a página novamente, **Then** posso iniciar o tour através de um botão de ajuda
6. **Given** estou na página de Leads, **When** faço o tour, **Then** aprendo sobre filtros, views, bulk actions e score de qualificação
7. **Given** estou na página de Opportunities, **When** faço o tour, **Then** aprendo sobre pipeline, forecast e probabilidade

---

### User Story 5 - Command Palette e Navegação Rápida (Priority: P3)

Como usuário avançado do CRM, preciso de navegação rápida por teclado e command palette para acessar páginas, ações e buscar registros sem usar o mouse.

**Why this priority**: Usuários que trabalham diariamente no CRM se beneficiam enormemente de atalhos de teclado e navegação rápida, aumentando produtividade significativamente após a curva de aprendizado inicial.

**Independent Test**: Pode ser testado pressionando Cmd+K/Ctrl+K e verificando que a paleta de comandos abre com busca fuzzy funcional e atalhos de teclado registrados.

**Acceptance Scenarios**:

1. **Given** estou em qualquer página, **When** pressiono Cmd+K (Mac) ou Ctrl+K (Windows/Linux), **Then** command palette abre com foco na busca
2. **Given** command palette está aberto, **When** digito "leads", **Then** vejo resultados fuzzy incluindo "Go to Leads", "Create New Lead", e leads recentes
3. **Given** estou em qualquer página, **When** pressiono "G" seguido de "L", **Then** navego para página de Leads
4. **Given** estou em qualquer página, **When** pressiono "C" seguido de "L", **Then** abro dialog/drawer para criar novo lead
5. **Given** estou em qualquer página, **When** pressiono "?", **Then** vejo overlay com todos os atalhos de teclado disponíveis
6. **Given** estou em qualquer página, **When** pressiono "/", **Then** foco vai para barra de busca da página atual
7. **Given** estou visualizando detalhes em drawer, **When** pressiono "Esc", **Then** drawer fecha

---

### User Story 6 - Refatoração Páginas Customers e Opportunities (Priority: P4)

Como usuário, preciso das páginas de Customers e Opportunities modernizadas com headers informativos, filtros visuais e componentes padronizados para ter experiência consistente com a página de Leads.

**Why this priority**: Após validar componentes em Leads (P2), aplicar em outras páginas principais garante consistência e benefícios similares de produtividade.

**Independent Test**: Pode ser testado acessando /app/crm/customers e /app/crm/opportunities e verificando que seguem os mesmos padrões de layout, toolbar e componentes da página de Leads.

**Acceptance Scenarios**:

**Customers:**
1. **Given** estou na página de customers, **When** visualizo header, **Then** vejo stats (Total, Ativos, MRR, Churn) em widget compacto
2. **Given** visualizo card de cliente, **When** analiso informações, **Then** vejo smart buttons (Contatos, Contratos, MRR, Oportunidades) com contadores clicáveis
3. **Given** preciso filtrar clientes, **When** uso FilterChips, **Then** posso filtrar por segmento, plano e tipo de contrato

**Opportunities:**
4. **Given** estou na página de opportunities, **When** visualizo header, **Then** vejo pipeline stats bar com valor total, ponderado e previsão
5. **Given** visualizo kanban de oportunidades, **When** analiso um card, **Then** vejo valor, probabilidade badge, expected close date e next action
6. **Given** uma oportunidade está atrasada, **When** visualizo o card, **Then** vejo badge de alerta indicando atraso
7. **Given** preciso alternar visualizações, **When** uso view switcher, **Then** posso escolher entre kanban, list, calendar e forecast

---

### User Story 7 - Nova Página de Contacts Standalone (Priority: P5)

Como usuário, preciso de uma página dedicada de Contacts (não apenas componente filho de Customer) para gerenciar contatos globalmente, importar em massa e verificar canais de comunicação.

**Why this priority**: Atualmente Contacts não existe como página standalone, limitando gestão global de contatos. Esta é uma funcionalidade completamente nova (não refatoração).

**Independent Test**: Pode ser testado acessando nova rota /app/crm/contacts e verificando que lista todos contatos, permite importação CSV/LinkedIn e exibe informações de canais.

**Acceptance Scenarios**:

1. **Given** navego para /app/crm/contacts, **When** a página carrega, **Then** vejo lista global de todos os contatos do sistema
2. **Given** estou na página de contacts, **When** clico em "Importar CSV", **Then** posso fazer upload de arquivo CSV com mapeamento de colunas
3. **Given** estou na página de contacts, **When** clico em "Importar LinkedIn", **Then** posso conectar e importar contatos do LinkedIn
4. **Given** visualizo um contato, **When** analiso canais, **Then** vejo ícones para email (com verificação), telefone e LinkedIn
5. **Given** um contato é primário, **When** visualizo na lista, **Then** vejo badge "Primário" destacado
6. **Given** preciso filtrar contatos, **When** uso filtros, **Then** posso filtrar por empresa, cargo e departamento
7. **Given** clico no nome de uma empresa, **When** link é acionado, **Then** navego para página do customer correspondente

---

### User Story 8 - Implementação Completa de Contracts (Priority: P6)

Como usuário, preciso gerenciar contratos com CRUD completo, alertas de renovação e visualizações (list, timeline, calendar) para controlar datas de vencimento e valores recorrentes.

**Why this priority**: Contracts atualmente é apenas placeholder. Implementação completa é importante mas menos urgente que páginas core do CRM (Leads, Customers, Opportunities).

**Independent Test**: Pode ser testado acessando /app/crm/contracts e verificando criação, edição, listagem e alertas de renovação funcionais.

**Acceptance Scenarios**:

1. **Given** estou na página de contracts, **When** visualizo header, **Then** vejo stats (Total, Ativos, MRR Total, Renovações próximas 30d)
2. **Given** tenho contratos expirando em 7 dias, **When** acesso a página, **Then** vejo alert banner destacado com contagem e link para lista
3. **Given** preciso criar contrato, **When** clico em "Novo Contrato", **Then** preencho formulário com cliente, valor, datas, periodicidade
4. **Given** visualizo card de contrato, **When** analiso informações, **Then** vejo número do contrato, cliente, valor total, MRR, datas início/renovação
5. **Given** contrato está próximo de renovação, **When** visualizo card, **Then** vejo badge warning indicando dias restantes
6. **Given** contrato está ativo, **When** visualizo progresso, **Then** vejo barra de progresso indicando quanto do período já decorreu
7. **Given** preciso visualizar timeline, **When** alterno para view timeline, **Then** vejo contratos organizados cronologicamente por datas
8. **Given** preciso ver calendário, **When** alterno para view calendar, **Then** vejo datas de renovação marcadas no calendário

---

### User Story 9 - Refatoração da Página de Campaigns (Priority: P7)

Como usuário, preciso da página de Campaigns modernizada com stats funcionais, templates e workflow visual para criar e gerenciar campanhas de marketing efetivamente.

**Why this priority**: Campaigns já tem interface rica mas stats estão zerados. Refatoração melhora usabilidade mas não é funcionalidade core do CRM.

**Independent Test**: Pode ser testado acessando /app/campaigns e verificando que stats refletem dados reais e campaign cards mostram métricas inline.

**Acceptance Scenarios**:

1. **Given** estou na página de campaigns, **When** visualizo header, **Then** vejo 6 stats principais (Ativas, Total Contatos, Taxa Abertura, Taxa Conversão, ROI, Receita) com valores reais
2. **Given** visualizo campaign card, **When** analiso métricas, **Then** vejo contatos, enviados, taxa abertura, taxa conversão inline
3. **Given** campanha está ativa, **When** visualizo card, **Then** vejo progress bar indicando progresso da campanha
4. **Given** preciso criar campanha, **When** inicio criação, **Then** posso escolher entre templates pré-definidos
5. **Given** visualizo campaign card, **When** analiso datas, **Then** vejo data de criação e quando foi iniciada

---

### User Story 10 - Melhorias de UX/Fluxo (Priority: P8)

Como usuário, preciso de melhorias gerais de UX incluindo quick actions contextuais, breadcrumb navigation, empty states amigáveis e loading states consistentes para experiência fluida.

**Why this priority**: São melhorias incrementais que refinam a experiência mas dependem das refatorações anteriores estarem completas.

**Independent Test**: Pode ser testado navegando pelo sistema e verificando presença de breadcrumbs, empty states com ilustrações e loading states com skeletons.

**Acceptance Scenarios**:

1. **Given** estou em qualquer página, **When** visualizo topo, **Then** vejo breadcrumbs clicáveis mostrando hierarquia (Dashboard > CRM > Leads)
2. **Given** seleciono múltiplos itens em lista, **When** seleção está ativa, **Then** vejo toolbar de bulk actions aparecer
3. **Given** clico com botão direito em item, **When** menu abre, **Then** vejo actions contextuais disponíveis
4. **Given** acesso página vazia (sem dados), **When** página carrega, **Then** vejo ilustração SVG, mensagem clara e CTA para próxima ação
5. **Given** dados estão carregando, **When** visualizo lista, **Then** vejo skeleton loaders no lugar dos cards/linhas
6. **Given** ação está em progresso, **When** aguardo conclusão, **Then** vejo progress indicator
7. **Given** página carrega com dados do cache, **When** dados reais chegam, **Then** transição é suave (optimistic update)

---

### Edge Cases

- **Sistema de Design**: O que acontece se novos tokens de design precisarem ser adicionados após componentes já implementados? Como garantir retrocompatibilidade?
- **Wizard/Tour**: O que acontece se usuário fecha navegador no meio de um tour? Como retomar ou resetar?
- **Command Palette**: Como lidar com busca de leads/clientes quando há milhares de registros? Implementar paginação ou limite?
- **Keyboard Shortcuts**: Como evitar conflitos com atalhos do navegador ou do sistema operacional?
- **Responsividade**: Como adaptar componentes complexos (Kanban, Forecast) para mobile? Simplificar ou criar versão alternativa?
- **Performance**: Como garantir que re-renderizações de componentes não degradem performance em listas grandes?
- **Acessibilidade**: Como garantir que todos atalhos de teclado e interactions são acessíveis via screen reader?
- **Migração**: Como lidar com usuários que já personalizaram views/filtros no sistema antigo? Migrar automaticamente ou resetar?

## Requirements

### Functional Requirements

**Sistema de Design Base:**
- **FR-001**: Sistema DEVE definir paleta de cores semântica incluindo primary, success, warning, error e neutral com variações de intensidade (50, 100, 500, 600, 700, 900)
- **FR-002**: Sistema DEVE definir escala de tipografia modular com fonte Inter incluindo tamanhos (xs, sm, base, lg, xl, 2xl, 3xl, 4xl) e pesos (normal, medium, semibold, bold)
- **FR-003**: Sistema DEVE definir sistema de espaçamento com base de 4px (1, 2, 3, 4, 6, 8, 12, 16 unidades)
- **FR-004**: Sistema DEVE definir tokens de border radius (sm, md, lg, xl) e shadows (sm, md, lg, xl)

**Componentes Reutilizáveis:**
- **FR-005**: Sistema DEVE fornecer componente StatusBadge que aceita status de Lead, Opportunity, Customer, Campaign e Contract e exibe cor, ícone e label correspondentes
- **FR-006**: Sistema DEVE fornecer componente Toolbar que organiza search input, filtros e view switcher horizontalmente
- **FR-007**: Sistema DEVE fornecer componente StatsWidget que exibe métricas em formato compacto com divisores visuais
- **FR-008**: Sistema DEVE fornecer componente QuickFilters que renderiza botões de filtro com contadores opcionais
- **FR-009**: Sistema DEVE fornecer componente FilterChip que abre dropdown com opções selecionáveis (single ou multiple)
- **FR-010**: Sistema DEVE fornecer componente ViewSwitcher que alterna entre visualizações (list, kanban, cards, calendar, timeline)
- **FR-011**: Sistema DEVE fornecer componente Drawer (slide-over) que substitui modais centralizados para exibição de detalhes
- **FR-012**: Sistema DEVE fornecer componente SmartButtons (inspirado Odoo) que mostra contador e navega ao clicar
- **FR-013**: Sistema DEVE fornecer componente PageHeader que padroniza breadcrumbs, título, stats e ações
- **FR-014**: Sistema DEVE fornecer componente ScoreBadge que exibe score numérico com cor baseada em faixa (0-50 vermelho, 51-70 amarelo, 71-89 azul, 90-100 verde)
- **FR-015**: Sistema DEVE fornecer componente RelativeTime que exibe tempo relativo formatado (ex: "há 2 horas", "ontem")

**Refatoração de Páginas:**
- **FR-016**: Página de Leads DEVE usar PageHeader com breadcrumbs, título "Leads", stats widget e ações (Importar, Exportar, Novo Lead)
- **FR-017**: Página de Leads DEVE usar Toolbar com search sempre visível, QuickFilters para status e ViewSwitcher
- **FR-018**: Página de Leads DEVE substituir todos emojis por ícones Lucide React equivalentes
- **FR-019**: Tabela de Leads DEVE exibir apenas colunas essenciais: Lead/Empresa, Segmento, Score, Status, Última Atividade, Ações
- **FR-020**: Detalhes de Lead DEVEM abrir em Drawer lateral ao invés de modal centralizado
- **FR-021**: Página de Customers DEVE exibir stats (Total, Ativos, MRR, Churn) em widget compacto
- **FR-022**: Cards de Customer DEVEM incluir SmartButtons para Contatos, Contratos, MRR e Oportunidades
- **FR-023**: Página de Opportunities DEVE exibir pipeline stats bar com valor total, valor ponderado e previsão de fechamento
- **FR-024**: Cards de Opportunity DEVEM exibir probability badge, expected close date e next action
- **FR-025**: Sistema DEVE exibir badge de alerta quando expected close date já passou

**Wizard de Onboarding:**
- **FR-026**: Sistema DEVE oferecer tour guiado em cada página principal na primeira visita
- **FR-027**: Tour DEVE destacar elementos com spotlight visual escurecendo resto da tela
- **FR-028**: Tour DEVE exibir tooltips explicativos em cada passo
- **FR-029**: Tour DEVE exibir indicador de progresso (ex: "3/7")
- **FR-030**: Tour DEVE permitir navegação (avançar, voltar, pular)
- **FR-031**: Sistema DEVE persistir estado de tours completados no localStorage
- **FR-032**: Usuário DEVE poder reativar tour através de botão de ajuda mesmo após conclusão

**Command Palette e Navegação:**
- **FR-033**: Sistema DEVE abrir command palette ao pressionar Cmd+K (Mac) ou Ctrl+K (Windows/Linux)
- **FR-034**: Command palette DEVE implementar busca fuzzy em páginas, ações e registros
- **FR-035**: Sistema DEVE registrar atalhos de teclado: G+L (Leads), G+C (Customers), G+O (Opportunities), C+L (Create Lead), C+O (Create Opportunity)
- **FR-036**: Sistema DEVE focar search ao pressionar "/" em qualquer página
- **FR-037**: Sistema DEVE exibir overlay de atalhos ao pressionar "?"
- **FR-038**: Sistema DEVE fechar drawers/modals ao pressionar "Esc"

**Página de Contacts:**
- **FR-039**: Sistema DEVE criar rota /app/crm/contacts com página standalone
- **FR-040**: Página de Contacts DEVE listar todos os contatos do sistema independente de customer
- **FR-041**: Página de Contacts DEVE permitir importação de contatos via upload de CSV
- **FR-042**: Sistema DEVE permitir importação de contatos do LinkedIn via integração OAuth2 oficial da API do LinkedIn
- **FR-043**: Lista de Contacts DEVE exibir ícones de canal (email, telefone, LinkedIn) com indicador de verificação
- **FR-044**: Contatos primários DEVEM exibir badge "Primário"
- **FR-045**: Sistema DEVE permitir filtrar contatos por empresa, cargo e departamento

**Página de Contracts:**
- **FR-046**: Página de Contracts DEVE exibir stats (Total, Ativos, MRR Total, Renovações 30d)
- **FR-047**: Sistema DEVE exibir alert banner quando houver contratos expirando em 7 dias ou menos
- **FR-048**: Sistema DEVE permitir criar, editar, visualizar e deletar contratos
- **FR-049**: Formulário de contrato DEVE incluir campos: cliente, número, valor total, MRR, data início, data renovação, periodicidade, tipo
- **FR-050**: Cards de contrato DEVEM exibir progress bar indicando período decorrido do contrato
- **FR-051**: Sistema DEVE calcular MRR baseado em valor total e periodicidade (anual/12, mensal, trimestral/3)
- **FR-052**: Página de Contracts DEVE oferecer views: list, timeline, calendar

**Melhorias de UX:**
- **FR-053**: Sistema DEVE exibir breadcrumbs clicáveis em todas as páginas
- **FR-054**: Sistema DEVE exibir bulk actions toolbar ao selecionar múltiplos itens
- **FR-055**: Sistema DEVE exibir actions menu contextual ao clicar com botão direito em item
- **FR-056**: Sistema DEVE exibir empty state com ilustração SVG, mensagem e CTA quando página não tem dados
- **FR-057**: Sistema DEVE exibir skeleton loaders durante carregamento de listas
- **FR-058**: Sistema DEVE exibir progress indicators durante ações assíncronas

### Key Entities

**Design Tokens:**
- **DesignToken**: Representa token de design (cor, espaçamento, tipografia, etc) com nome, valor e categoria. Centraliza todos os valores de design system.

**UI Components:**
- **StatusBadge**: Componente visual para exibir status com cor, ícone e label. Aceita variantes (solid, soft, outline) e tamanhos (sm, md, lg).
- **Toolbar**: Container horizontal que organiza search, filtros e actions. Usado consistentemente em todas as páginas de listagem.
- **StatsWidget**: Exibe métricas em formato compacto com ícones, valores, mudanças percentuais e progresso opcional.
- **Drawer**: Painel lateral deslizante para exibir detalhes sem cobrir página inteira. Substitui modais centralizados.
- **SmartButton**: Botão com contador que navega para página relacionada ao clicar. Exemplo: "3 Contratos" leva para contratos do cliente.

**Feature Tour:**
- **TourStep**: Representa um passo do tour com target element, tooltip content, posição e ações.
- **TourState**: Estado persistido do tour incluindo tour_id, completed (boolean), current_step, skipped (boolean).

**Command Palette:**
- **CommandItem**: Item de comando com label, ação, atalho de teclado, categoria e ícone.
- **KeyboardShortcut**: Atalho registrado com combinação de teclas, ação e descrição.

**Contacts:**
- **Contact**: Representa contato com nome, cargo, departamento, email, telefone, LinkedIn, is_primary, email_verified, customer_id (foreign key).

**Contracts:**
- **Contract**: Representa contrato com customer_id, número, valor_total, mrr, data_inicio, data_renovacao, periodicidade (mensal/trimestral/anual), tipo, status (ativo/inativo/suspenso/cancelado).

## Success Criteria

### Measurable Outcomes

**Consistência Visual:**
- **SC-001**: 100% das páginas principais (Leads, Customers, Opportunities, Contacts, Campaigns, Contracts) utilizam componentes do design system
- **SC-002**: 0 emojis hardcoded permanecem no código frontend
- **SC-003**: Todos os status badges seguem paleta de cores padronizada (verificável por inspeção visual e code review)

**Produtividade do Desenvolvedor:**
- **SC-004**: Tempo para criar nova página seguindo padrões reduz em 40% comparado ao tempo atual (medido por análise de commits/PRs)
- **SC-005**: Componentes reutilizáveis são utilizados em pelo menos 80% das novas features desenvolvidas após implementação

**Descoberta de Features (Feature Discovery):**
- **SC-006**: 80% dos usuários completam pelo menos um tour guiado na primeira semana de uso
- **SC-007**: 60% dos usuários usam command palette (Cmd+K) pelo menos uma vez por sessão após descobri-lo
- **SC-008**: Taxa de descoberta de filtros avançados aumenta de 30% para 70% (medido por analytics)

**Eficiência do Usuário:**
- **SC-009**: Tempo médio para aplicar filtro em página de leads reduz de 8 segundos para 3 segundos (com QuickFilters)
- **SC-010**: Tempo médio para navegar entre páginas principais reduz de 5 segundos (clicks) para 2 segundos (atalhos de teclado) para usuários que adotam atalhos
- **SC-011**: 90% dos usuários conseguem completar tarefas principais (criar lead, filtrar clientes, ver pipeline) na primeira tentativa sem ajuda

**Satisfação do Usuário:**
- **SC-012**: System Usability Scale (SUS) score aumenta de baseline atual para >80 pontos
- **SC-013**: 85% dos usuários avaliam nova interface como "melhor" ou "muito melhor" que a anterior (survey pós-implementação)
- **SC-014**: Tickets de suporte relacionados a UI/UX reduzem em 40% nos primeiros 3 meses

**Performance:**
- **SC-015**: First Contentful Paint (FCP) de páginas refatoradas fica abaixo de 1.5 segundos em conexão 3G
- **SC-016**: Lighthouse score de acessibilidade fica acima de 90 para todas as páginas principais
- **SC-017**: Bundle size de componentes compartilhados não excede 500KB gzipped

**Adoção de Funcionalidades:**
- **SC-018**: 70% dos usuários experimentam pelo menos 2 visualizações alternativas (list/kanban/cards) em páginas que oferecem
- **SC-019**: Uso de filtros aumenta em 50% após implementação de QuickFilters e FilterChips
- **SC-020**: 50% dos usuários que fazem tour completo de uma página retornam para usar a feature explicada dentro de 7 dias
