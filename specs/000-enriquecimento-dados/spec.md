# Feature Specification: Sistema de Enriquecimento de Dados

**Feature Branch**: `001-enriquecimento-dados`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "ENRIQUECIMENTO DE DADOS - Sistema de enriquecimento de leads com dados externos, investigação de mídia negativa, configuração de providers e monitoramento de estatísticas"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Enriquecer Lead com Dados Externos (Priority: P1)

Um usuário visualiza um lead na plataforma e deseja obter informações adicionais sobre a empresa (localização precisa, dados da empresa, presença online, etc.) para qualificar melhor o lead antes de entrar em contato. O usuário clica em "Enriquecer", seleciona quais tipos de dados deseja obter (localização via Google Maps, pesquisa web via Perplexity, etc.), confirma a operação visualizando o custo estimado, e aguarda enquanto o sistema busca essas informações em fontes externas. Após o processamento, o lead é atualizado com os novos dados, permitindo que o usuário tome decisões mais informadas.

**Why this priority**: Este é o caso de uso primário do sistema - enriquecer leads é a funcionalidade central que entrega valor imediato aos usuários, permitindo qualificação mais rápida e precisa de leads.

**Independent Test**: Pode ser completamente testado selecionando um lead existente, iniciando o enriquecimento com pelo menos um provider ativo, e verificando que os dados retornados são exibidos corretamente no lead. Entrega valor mesmo sem as outras funcionalidades (investigação de mídia, estatísticas, etc.).

**Acceptance Scenarios**:

1. **Given** um lead sem dados de enriquecimento, **When** o usuário clica em "Enriquecer" e seleciona providers disponíveis, **Then** o sistema exibe o custo estimado total e permite confirmação
2. **Given** o usuário confirma o enriquecimento, **When** o processamento é iniciado, **Then** o sistema exibe um indicador de progresso com status de cada provider
3. **Given** o enriquecimento está em processamento, **When** o sistema verifica o status a cada 3 segundos, **Then** o indicador de progresso é atualizado conforme providers completam
4. **Given** todos os providers completaram com sucesso, **When** os resultados são recebidos, **Then** os dados enriquecidos são exibidos no lead com indicação de confidence score e custo consumido
5. **Given** um ou mais providers falharam, **When** o enriquecimento é concluído, **Then** o sistema exibe quais providers tiveram sucesso e quais falharam, com os dados disponíveis

---

### User Story 2 - Investigação de Mídia Negativa (Priority: P2)

Um usuário precisa avaliar riscos reputacionais de uma empresa ou pessoa antes de fechar negócio. No dossiê do lead, o usuário clica em "Investigar Mídia Negativa", confirma a operação após visualizar o custo estimado, e aguarda enquanto o sistema analisa notícias e fontes online automaticamente. Após 1-2 minutos, o usuário visualiza um dashboard completo com distribuição de fontes (positivas, neutras, suspeitas, negativas), um score de risco geral, e uma lista detalhada de fontes analisadas com justificativas, categorias e níveis de confiança/impacto.

**Why this priority**: Funcionalidade de alto valor para due diligence e gestão de riscos, mas depende de leads já existentes. Complementa o enriquecimento básico com análise de reputação.

**Independent Test**: Pode ser testado criando uma investigação para um dossiê existente e verificando que o dashboard de resultados exibe corretamente a distribuição de fontes, risk score, e lista de fontes com suas avaliações. Funciona independentemente das outras features.

**Acceptance Scenarios**:

1. **Given** um dossiê de lead, **When** o usuário clica em "Investigar Mídia Negativa", **Then** o sistema exibe modal de confirmação com custo estimado e tempo estimado (1-2 min)
2. **Given** o usuário confirma a investigação, **When** o processamento é iniciado, **Then** o sistema exibe indicador de carregamento com estimativa de tempo
3. **Given** a investigação está em processamento, **When** o sistema verifica o status a cada 5 segundos, **Then** o indicador reflete o progresso atual
4. **Given** a investigação é concluída, **When** os resultados estão disponíveis, **Then** o sistema exibe dashboard com gráfico de distribuição (positive/neutral/suspect/negative)
5. **Given** o dashboard de resultados, **When** o usuário visualiza, **Then** o sistema exibe risk score geral em formato gauge (0-100) e lista de fontes analisadas
6. **Given** a lista de fontes, **When** o usuário visualiza cada fonte, **Then** cada fonte exibe título, URL, assessment (positive/neutral/suspect/negative), confidence (low/medium/high), impact (low/medium/high), categorias e justificativa

---

### User Story 3 - Configuração de Providers (Administrador) (Priority: P3)

Um administrador do sistema precisa gerenciar quais serviços de enriquecimento estão ativos, definir prioridades de uso, e monitorar a saúde dos providers. Na área administrativa, o usuário acessa a página de Configurações > Providers, visualiza uma tabela com todos os providers disponíveis (nome, tipo, status, prioridade, rate limit, custo, saúde), e pode habilitar/desabilitar providers, ajustar prioridades, e visualizar configurações detalhadas de cada um.

**Why this priority**: Funcionalidade administrativa essencial para controle de custos e qualidade, mas não afeta diretamente o fluxo de enriquecimento para usuários finais. Necessária para operação sustentável do sistema.

**Independent Test**: Pode ser testado acessando a página administrativa, alterando status e prioridade de providers, e verificando que as mudanças são salvas e refletidas na tabela. Funciona independentemente se há enriquecimentos ativos ou não.

**Acceptance Scenarios**:

1. **Given** acesso de administrador, **When** o usuário navega para Configurações > Providers, **Then** o sistema exibe tabela com todos os providers e suas configurações
2. **Given** a tabela de providers, **When** o usuário visualiza, **Then** cada provider exibe nome, tipo (web_search/location/company_data), status (habilitado/desabilitado), prioridade, rate limit, custo por request, e health status
3. **Given** um provider na tabela, **When** o usuário alterna o toggle de habilitado/desabilitado, **Then** o sistema atualiza o status imediatamente
4. **Given** um provider na tabela, **When** o usuário clica em "Editar", **Then** o sistema exibe modal com campos editáveis (prioridade, rate limit)
5. **Given** o modal de edição, **When** o usuário altera valores e clica em "Salvar", **Then** o sistema valida os dados, salva as alterações, e atualiza a tabela
6. **Given** health status de um provider, **When** o status é "active", **Then** exibe badge verde; **When** "degraded", badge amarelo; **When** "inactive", badge vermelho

---

### User Story 4 - Dashboard de Estatísticas de Enriquecimento (Administrador) (Priority: P4)

Um administrador precisa monitorar custos, performance e taxa de sucesso dos providers ao longo do tempo para tomar decisões sobre orçamento e configuração. Na área de Relatórios > Enriquecimento, o usuário seleciona período de análise (últimos 7 dias, 30 dias, ou custom), opcionalmente filtra por provider específico, e visualiza métricas agregadas (total de execuções, taxa de sucesso geral, custo total, duração média), gráficos de tendência ao longo do tempo, e uma tabela detalhada com estatísticas por provider.

**Why this priority**: Funcionalidade de reporting e analytics importante para gestão, mas não crítica para operação diária. Útil para otimização e planejamento, mas sistema funciona sem ela.

**Independent Test**: Pode ser testado acessando o dashboard, selecionando diferentes períodos e filtros, e verificando que métricas e gráficos são exibidos corretamente baseados nos dados históricos. Independente de enriquecimentos ativos no momento.

**Acceptance Scenarios**:

1. **Given** acesso de administrador, **When** o usuário navega para Relatórios > Enriquecimento, **Then** o sistema exibe dashboard com filtros de período (date range picker) e provider opcional
2. **Given** os filtros, **When** o usuário seleciona período e/ou provider e aplica, **Then** o sistema carrega e exibe métricas para o período selecionado
3. **Given** métricas carregadas, **When** o usuário visualiza os cards principais, **Then** exibe total de execuções, taxa de sucesso geral (%), custo total (R$), e providers ativos
4. **Given** o dashboard, **When** o usuário visualiza gráficos, **Then** exibe gráfico de barras com custo por provider e taxa de sucesso por provider
5. **Given** a tabela detalhada, **When** o usuário visualiza, **Then** cada linha exibe provider, total de execuções, taxa de sucesso (%), custo total (R$), e duração média (segundos)
6. **Given** taxa de sucesso na tabela, **When** o valor é >= 95%, **Then** exibe em verde; **When** < 95%, exibe em amarelo/vermelho

---

### Edge Cases

- O que acontece quando um provider falha durante o enriquecimento? O sistema deve continuar com os outros providers e exibir resultados parciais, indicando claramente quais falharam.
- O que acontece se o polling de status falhar? O sistema deve implementar retry com backoff exponencial e, após 3 tentativas falhadas, exibir erro ao usuário com opção de tentar novamente.
- O que acontece quando não há providers habilitados? O botão "Enriquecer" deve estar desabilitado com tooltip explicativo "Nenhum provider ativo. Configure providers em Configurações."
- O que acontece se o usuário navega para outra página enquanto enriquecimento está em processamento? O sistema deve manter o job ativo no background e notificar o usuário quando concluir (via toast ou notificação).
- O que acontece quando o custo estimado ultrapassa o saldo/créditos disponíveis? O sistema deve bloquear a operação e exibir mensagem clara sobre saldo insuficiente.
- O que acontece se a investigação de mídia negativa não encontrar nenhuma fonte? O sistema deve exibir estado vazio com mensagem "Nenhuma fonte encontrada" e sugestão de ampliar busca.
- O que acontece quando múltiplos usuários tentam enriquecer o mesmo lead simultaneamente? O sistema deve enfileirar as solicitações e processar sequencialmente, ou permitir mas rastrear cada execução independentemente.
- O que acontece se o provider retorna dados em formato inesperado? O sistema deve validar a resposta e, em caso de formato inválido, marcar como erro e logar para investigação, sem quebrar a interface.

## Requirements *(mandatory)*

### Functional Requirements

#### Enriquecimento de Leads

- **FR-001**: Sistema DEVE permitir que usuários iniciem enriquecimento de um lead selecionando quais providers utilizar
- **FR-002**: Sistema DEVE exibir custo estimado total antes de confirmar enriquecimento
- **FR-003**: Sistema DEVE implementar polling automático a cada 3 segundos para verificar status de enriquecimento
- **FR-004**: Sistema DEVE exibir indicador de progresso mostrando status de cada provider individualmente
- **FR-005**: Sistema DEVE parar polling quando status for "completed" ou "error"
- **FR-006**: Sistema DEVE exibir dados enriquecidos no lead após conclusão com confidence score e custo consumido
- **FR-007**: Sistema DEVE exibir claramente quais providers tiveram sucesso e quais falharam
- **FR-008**: Sistema DEVE exibir notificação de sucesso quando enriquecimento for concluído com êxito
- **FR-009**: Sistema DEVE exibir notificação de erro quando todos os providers falharem
- **FR-010**: Sistema DEVE exibir notificação de alerta quando enriquecimento for parcialmente concluído (alguns providers falharam)

#### Investigação de Mídia Negativa

- **FR-011**: Sistema DEVE permitir que usuários iniciem investigação de mídia negativa a partir de um dossiê
- **FR-012**: Sistema DEVE exibir custo estimado e tempo estimado (1-2 min) antes de confirmar investigação
- **FR-013**: Sistema DEVE implementar polling automático a cada 5 segundos para verificar status da investigação
- **FR-014**: Sistema DEVE exibir indicador de carregamento com estimativa de tempo durante processamento
- **FR-015**: Sistema DEVE exibir dashboard de resultados com gráfico de distribuição (positive/neutral/suspect/negative) após conclusão
- **FR-016**: Sistema DEVE exibir risk score geral em formato gauge (0-100)
- **FR-017**: Sistema DEVE exibir lista de fontes analisadas com título, URL, assessment, confidence, impact, categorias e justificativa
- **FR-018**: Sistema DEVE permitir filtrar fontes por assessment, confidence e impact
- **FR-019**: Sistema DEVE usar cores semânticas para assessment (positive=verde, neutral=cinza, suspect=amarelo, negative=vermelho)
- **FR-020**: Sistema DEVE exibir estado vazio quando nenhuma fonte for encontrada

#### Configuração de Providers (Admin)

- **FR-021**: Sistema DEVE exibir tabela com todos os providers mostrando nome, tipo, status, prioridade, rate limit, custo e health status
- **FR-022**: Sistema DEVE permitir habilitar/desabilitar providers via toggle na tabela
- **FR-023**: Sistema DEVE permitir editar prioridade e rate limit de providers via modal
- **FR-024**: Sistema DEVE validar que prioridade é número positivo antes de salvar
- **FR-025**: Sistema DEVE atualizar tabela imediatamente após alterações de configuração
- **FR-026**: Sistema DEVE exibir badge de health status com cores semânticas (active=verde, degraded=amarelo, inactive=vermelho)
- **FR-027**: Sistema DEVE exibir notificação de sucesso quando configuração for salva
- **FR-028**: Sistema DEVE exibir notificação de erro quando falha ao salvar configuração

#### Dashboard de Estatísticas (Admin)

- **FR-029**: Sistema DEVE permitir selecionar período de análise via date range picker (padrão: últimos 7 dias)
- **FR-030**: Sistema DEVE permitir filtrar estatísticas por provider específico (opcional)
- **FR-031**: Sistema DEVE exibir cards com métricas principais: total de execuções, taxa de sucesso geral (%), custo total (R$), providers ativos
- **FR-032**: Sistema DEVE exibir gráfico de barras com custo por provider
- **FR-033**: Sistema DEVE exibir gráfico de barras com taxa de sucesso por provider
- **FR-034**: Sistema DEVE exibir tabela detalhada com estatísticas por provider (execuções, taxa de sucesso, custo, duração média)
- **FR-035**: Sistema DEVE usar cores semânticas para taxa de sucesso (>= 95%=verde, < 95%=amarelo/vermelho)
- **FR-036**: Sistema DEVE recarregar dados automaticamente quando filtros de período ou provider forem alterados
- **FR-037**: Sistema DEVE formatar valores monetários em reais (R$) com 2 casas decimais
- **FR-038**: Sistema DEVE formatar duração média em segundos com 1 casa decimal

#### Gerais

- **FR-039**: Sistema DEVE exibir loading skeleton enquanto carrega dados
- **FR-040**: Sistema DEVE implementar retry automático com backoff exponencial em caso de falha de polling (máximo 3 tentativas)
- **FR-041**: Sistema DEVE validar autenticação em todas as requisições (token JWT)
- **FR-042**: Sistema DEVE implementar tratamento de erros com mensagens user-friendly
- **FR-043**: Sistema DEVE manter jobs ativos em background mesmo se usuário navegar para outra página
- **FR-044**: Sistema DEVE desabilitar botão "Enriquecer" quando não há providers habilitados
- **FR-045**: Sistema DEVE exibir tooltip explicativo quando botão estiver desabilitado

### Key Entities

- **Lead**: Representa um lead que pode ser enriquecido. Atributos relevantes: ID, dados básicos (nome, empresa, contato), status de enriquecimento, resultados de enriquecimento (por provider)
- **Enrichment Job**: Representa uma solicitação de enriquecimento. Atributos: ID, lead associado, providers selecionados, status (queued/processing/completed/error), execution IDs, trace ID, custo total, timestamp
- **Enrichment Result**: Resultado de um provider específico. Atributos: provider name, status (success/error), output data, credits consumed, confidence score, timestamp
- **Dossiê**: Conjunto de informações sobre um lead. Atributos: ID, lead associado, investigações de mídia negativa
- **Investigation**: Investigação de mídia negativa. Atributos: ID, dossiê associado, status (pending/running/completed/failed), fontes analisadas, contadores (positive/neutral/suspect/negative), risk score geral, timestamps
- **Investigation Source**: Fonte analisada em investigação. Atributos: URL, título, assessment (positive/neutral/suspect/negative), confidence (low/medium/high), impact (low/medium/high), categorias, justificativa, timestamp
- **Provider**: Serviço de enriquecimento. Atributos: ID, nome, tipo (web_search/location/company_data), habilitado (sim/não), prioridade, configurações, rate limit, custo por request, health status (active/degraded/inactive)
- **Stats Overview**: Estatísticas agregadas de enriquecimento. Atributos: período, estatísticas por provider (execuções, taxa de sucesso, custo, duração média), totais gerais

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 80% dos enriquecimentos P1 concluem em <= 90s para leads com >= 1 provider ativo e retornam dados utilizáveis.
- **SC-002**: >= 95% das execuções registram ao menos um provider com status "success" (execução total ou parcial).
- **SC-003**: Polling/refresco de status apresenta jitter médio <= 4s; falhas de polling recuperam com backoff em <= 3 tentativas em >= 99% dos casos.
- **SC-004**: Notificações de sucesso/erro/partial são exibidas em <= 2s após o último provider concluir.
- **SC-005**: Dashboard de investigação (P2) carrega resultados de até 30 dias em <= 3s e renderiza gráficos em <= 1s adicional.
- **SC-006**: Ações de admin (toggle/edição de provider) persistem e refletem na tabela em <= 600ms; validações impedem gravação de valores inválidos 100% das vezes.
