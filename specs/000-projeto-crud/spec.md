# Feature Specification: Sistema de CRUD de Projetos de Resolução de Problemas

**Feature Branch**: `001-projeto-crud`
**Created**: 2025-12-18
**Status**: Draft
**Input**: User description: "resolucao de problemas, somente CRUD de projetos, leia @docs/ph3a/FRONTEND_GUIDE-RESOLUCAO-PROBLEMAS.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar Novo Projeto (Priority: P1)

Um gestor de qualidade precisa iniciar um novo projeto de resolução de problemas para investigar defeitos recorrentes em uma linha de produção. Ele acessa o sistema, preenche as informações básicas do problema (cliente, título, descrição) e cria o projeto. A metodologia será escolhida posteriormente, permitindo tempo para análise e decisão sobre qual abordagem (MASP, 8D ou A3) é mais adequada.

**Why this priority**: Este é o ponto de entrada do sistema. Sem a capacidade de criar projetos, nenhuma funcionalidade posterior pode ser utilizada. É a base do MVP.

**Independent Test**: Pode ser testado abrindo a interface de criação de projeto, preenchendo os campos obrigatórios (cliente, título, descrição do problema) e verificando se o projeto é criado com sucesso, aparece na listagem com status "Pendente Metodologia" e permite definir metodologia posteriormente.

**Acceptance Scenarios**:

1. **Given** o gestor está autenticado no sistema, **When** ele clica no botão "Novo Projeto", **Then** um modal/tela de criação é exibido com campos para Cliente, Título, Descrição do Problema, Impacto e Responsável (sem seleção de metodologia)
2. **Given** o formulário de criação está aberto, **When** ele preenche todos os campos obrigatórios (Cliente, Título com mínimo 5 caracteres, Descrição com mínimo 20 caracteres) e submete, **Then** o projeto é criado com metodologia NULL e o usuário é redirecionado para a tela de detalhes
3. **Given** o formulário de criação está aberto, **When** ele tenta submeter sem preencher campos obrigatórios, **Then** mensagens de validação são exibidas indicando os campos faltantes
4. **Given** um projeto sem metodologia foi criado, **When** o usuário acessa a tela de detalhes, **Then** o projeto exibe um card de destaque "Definir Metodologia" para iniciar o workflow

---

### User Story 2 - Definir Metodologia do Projeto (Priority: P1)

Após criar o projeto com as informações básicas, o gestor de qualidade precisa analisar o contexto do problema e decidir qual metodologia (MASP, 8D ou A3) é mais adequada. Ele acessa o projeto, revisa as informações e seleciona a metodologia que guiará a resolução do problema. O sistema então inicializa automaticamente as etapas correspondentes à metodologia escolhida.

**Why this priority**: Sem definir a metodologia, o projeto não pode avançar para as etapas de trabalho. É essencial para transformar um projeto criado em um projeto ativo e funcional.

**Independent Test**: Pode ser testado criando um projeto sem metodologia, acessando-o, selecionando uma metodologia (ex: MASP), e verificando que as 8 etapas MASP são inicializadas com a primeira em "em_andamento".

**Acceptance Scenarios**:

1. **Given** um projeto foi criado sem metodologia definida, **When** o usuário acessa a tela de detalhes, **Then** um card/banner de destaque exibe "Definir Metodologia" com botão de ação
2. **Given** o usuário está na tela de projeto sem metodologia, **When** ele clica em "Definir Metodologia", **Then** um modal apresenta as 3 opções (MASP, 8D, A3) com descrição resumida de cada uma
3. **Given** o modal de seleção está aberto, **When** o usuário seleciona MASP e confirma, **Then** o sistema cria 8 etapas MASP sequenciais, marca a primeira como "em_andamento" e atualiza o projeto
4. **Given** o modal de seleção está aberto, **When** o usuário seleciona 8D e confirma, **Then** o sistema cria 9 disciplinas 8D sequenciais e marca d0-planejamento como "em_andamento"
5. **Given** o modal de seleção está aberto, **When** o usuário seleciona A3 e confirma, **Then** o sistema cria 7 seções A3 editáveis em paralelo, todas com status "rascunho"
6. **Given** a metodologia foi definida, **When** o usuário retorna à listagem de projetos, **Then** o projeto exibe a metodologia escolhida (badge MASP/8D/A3)

---

### User Story 3 - Visualizar Lista de Projetos (Priority: P1)

Um gestor de qualidade precisa visualizar todos os projetos de resolução de problemas da empresa para acompanhar o progresso, identificar projetos que precisam de atenção e acessar informações rapidamente.

**Why this priority**: Visualizar projetos existentes é essencial para qualquer operação CRUD e permite que os usuários validem a criação de projetos (Story 1). É necessário para o MVP.

**Independent Test**: Pode ser testado criando alguns projetos de teste e verificando se todos aparecem na listagem com suas informações principais (título, metodologia, status, cliente).

**Acceptance Scenarios**:

1. **Given** o usuário está autenticado, **When** ele acessa a página de projetos, **Then** uma lista de todos os projetos é exibida mostrando título, metodologia, status, cliente e responsável
2. **Given** a lista de projetos está sendo exibida, **When** o usuário aplica filtros por metodologia (MASP/8D/A3) ou status, **Then** apenas os projetos que atendem aos critérios são mostrados
3. **Given** a lista possui mais de 20 projetos, **When** o usuário rola até o final da página, **Then** um botão "Carregar mais" permite visualizar projetos adicionais (paginação)
4. **Given** não existem projetos cadastrados, **When** o usuário acessa a listagem, **Then** uma mensagem de estado vazio é exibida com botão para criar o primeiro projeto

---

### User Story 4 - Visualizar Detalhes do Projeto (Priority: P2)

Um analista de qualidade precisa acessar todas as informações detalhadas de um projeto específico, incluindo dados do problema, cliente, participantes, progresso das etapas e histórico de atividades.

**Why this priority**: Permite que os usuários consultem informações completas dos projetos criados, essencial para acompanhamento e tomada de decisão. Complementa as funcionalidades básicas do MVP.

**Independent Test**: Pode ser testado clicando em um projeto existente na listagem e verificando se todas as informações são exibidas corretamente (dados do projeto, etapas, participantes, progresso).

**Acceptance Scenarios**:

1. **Given** o usuário está na listagem de projetos, **When** ele clica em um projeto específico, **Then** a tela de detalhes é exibida com informações completas: título, descrição do problema, impacto, metodologia (ou "Pendente" se não definida), status, datas, cliente e responsável
2. **Given** a tela de detalhes está aberta e o projeto tem metodologia, **When** o sistema carrega as etapas do workflow, **Then** uma visualização do progresso (stepper ou timeline) mostra todas as etapas com seus respectivos status (rascunho, em_andamento, concluído)
3. **Given** a tela de detalhes está aberta e o projeto NÃO tem metodologia, **When** o sistema renderiza a view, **Then** um card de destaque "Definir Metodologia" substitui a área de etapas
4. **Given** a tela de detalhes está aberta, **When** o usuário visualiza a seção de participantes, **Then** todos os membros da equipe são listados com seus papéis (líder, membro, especialista, aprovador, champion)
5. **Given** a tela de detalhes está aberta, **When** o projeto possui indicadores de progresso, **Then** um resumo visual mostra a porcentagem de conclusão e etapa atual

---

### User Story 5 - Editar Projeto Existente (Priority: P2)

Um gestor de qualidade percebe que informações do projeto mudaram (novo responsável, descrição atualizada do problema, mudança de impacto) e precisa atualizar os dados sem perder o histórico de trabalho.

**Why this priority**: Permite correção de erros e atualização de informações ao longo do ciclo de vida do projeto. É uma funcionalidade esperada em qualquer CRUD.

**Independent Test**: Pode ser testado abrindo um projeto existente, modificando campos editáveis (título, descrição, responsável) e verificando se as alterações são salvas e refletidas na listagem e detalhes.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de detalhes de um projeto, **When** ele clica no botão "Editar Projeto", **Then** um formulário de edição é exibido com os valores atuais preenchidos
2. **Given** o formulário de edição está aberto, **When** o usuário modifica campos permitidos (título, descrição do problema, impacto, responsável) e salva, **Then** as alterações são persistidas e a tela de detalhes reflete as mudanças
3. **Given** o formulário de edição está aberto, **When** o usuário remove informações obrigatórias e tenta salvar, **Then** mensagens de validação impedem o salvamento
4. **Given** o projeto não possui metodologia definida, **When** o usuário edita e salva o projeto, **Then** o projeto continua sem metodologia até que seja explicitamente definida

---

### User Story 6 - Arquivar Projeto (Priority: P3)

Um gestor de qualidade precisa arquivar projetos que foram cancelados, descontinuados ou que não serão mais trabalhados, mantendo o registro histórico mas removendo da visualização principal.

**Why this priority**: Funcionalidade importante para organização e limpeza, mas não essencial para o MVP inicial. Projetos podem permanecer com status "cancelado" até que esta funcionalidade seja implementada.

**Independent Test**: Pode ser testado selecionando um projeto, executando a ação de arquivamento com justificativa, e verificando que o projeto não aparece mais na listagem padrão mas pode ser recuperado através de filtros específicos.

**Acceptance Scenarios**:

1. **Given** o usuário está visualizando um projeto, **When** ele seleciona a opção "Arquivar Projeto", **Then** um modal de confirmação solicita uma justificativa com mínimo de 10 caracteres
2. **Given** o modal de arquivamento está aberto, **When** o usuário fornece uma justificativa válida e confirma, **Then** o projeto recebe status "arquivado" e é removido da listagem padrão
3. **Given** um projeto foi arquivado, **When** o usuário aplica filtro "Incluir arquivados", **Then** os projetos arquivados aparecem na listagem com indicador visual diferenciado
4. **Given** o usuário tenta arquivar um projeto, **When** a justificativa tem menos de 10 caracteres, **Then** o sistema exibe erro de validação e impede o arquivamento

---

### Edge Cases

- O que acontece quando o usuário tenta criar um projeto para um cliente que não possui cadastro ativo?
- Como o sistema se comporta quando múltiplos usuários tentam editar o mesmo projeto simultaneamente?
- O que acontece quando o usuário perde conexão durante o preenchimento do formulário de criação?
- Como o sistema lida com títulos ou descrições extremamente longos (próximos ao limite máximo)?
- O que acontece quando o usuário tenta arquivar um projeto que já está arquivado?
- Como o sistema se comporta ao carregar projetos com grande volume de dados (muitas etapas, evidências)?
- O que acontece quando todas as metodologias são filtradas ao mesmo tempo na listagem?
- Como o sistema gerencia a navegação entre páginas quando um projeto é deletado/arquivado da listagem?
- O que acontece quando um projeto permanece por muito tempo sem metodologia definida (ex: mais de 30 dias)?
- Como o sistema se comporta quando o usuário tenta definir metodologia em um projeto que já possui uma definida?
- O que acontece durante a definição de metodologia se o backend está processando e a conexão é perdida?
- Como a listagem exibe projetos sem metodologia? Aparece como "Pendente", null, ou outro indicador?
- O que acontece quando múltiplos usuários tentam definir metodologia no mesmo projeto simultaneamente?
- Como o sistema impede a re-definição de metodologia após já estar definida?
- O que acontece se o usuário tentar editar um projeto e alterar manualmente o campo metodologia via API direta?

## Requirements *(mandatory)*

### Functional Requirements

#### Criação de Projetos

- **FR-001**: O sistema DEVE permitir que usuários autenticados criem novos projetos de resolução de problemas
- **FR-002**: O sistema DEVE validar que o título do projeto possui entre 5 e 200 caracteres
- **FR-003**: O sistema DEVE validar que a descrição do problema possui no mínimo 20 caracteres
- **FR-004**: O sistema DEVE exigir seleção obrigatória de Cliente (via dropdown ou autocomplete)
- **FR-005**: O sistema DEVE permitir seleção opcional de Responsável (usuário do sistema)
- **FR-006**: O sistema DEVE permitir entrada opcional de campo Impacto (texto livre)
- **FR-007**: O sistema DEVE criar o projeto com campo metodologia NULL (não definida) por padrão
- **FR-008**: O sistema DEVE registrar data de abertura automaticamente no momento da criação
- **FR-009**: O sistema DEVE definir status inicial do projeto como "rascunho" quando criado sem metodologia

#### Definição de Metodologia

- **FR-010**: O sistema DEVE permitir definição de metodologia APENAS em projetos que ainda não possuem metodologia definida
- **FR-011**: O sistema DEVE exibir modal de seleção com as 3 metodologias (MASP, 8D, A3) e descrição resumida de cada uma
- **FR-012**: Ao selecionar metodologia MASP, o sistema DEVE criar automaticamente 8 etapas sequenciais e marcar a primeira como "em_andamento"
- **FR-013**: Ao selecionar metodologia 8D, o sistema DEVE criar automaticamente 9 disciplinas sequenciais e marcar d0-planejamento como "em_andamento"
- **FR-014**: Ao selecionar metodologia A3, o sistema DEVE criar automaticamente 7 seções editáveis em paralelo, todas com status "rascunho"
- **FR-015**: O sistema DEVE impedir definição de metodologia se o projeto já possui metodologia definida
- **FR-016**: O sistema DEVE impedir definição de metodologia se o projeto já estiver concluído ou arquivado
- **FR-017**: Ao tentar definir metodologia em projeto que já possui uma, o sistema DEVE exibir mensagem de erro clara
- **FR-018**: Durante definição de metodologia, o sistema DEVE implementar loading state indicando processamento em andamento
- **FR-019**: O sistema DEVE tratar erros de definição de metodologia e exibir mensagens específicas ao usuário
- **FR-020**: Uma vez definida a metodologia, o campo deve ser tratado como IMUTÁVEL no projeto

#### Listagem de Projetos

- **FR-021**: O sistema DEVE exibir lista de todos os projetos com informações resumidas: título, metodologia (ou "Pendente" se NULL), status, cliente, responsável
- **FR-022**: O sistema DEVE permitir filtrar projetos por metodologia (MASP, 8D, A3) e incluir opção "Pendente" para projetos sem metodologia
- **FR-023**: O sistema DEVE permitir filtrar projetos por status (rascunho, em_andamento, concluído, cancelado, arquivado)
- **FR-024**: O sistema DEVE permitir filtrar projetos por cliente (dropdown ou autocomplete)
- **FR-025**: O sistema DEVE implementar paginação com limite de 20 projetos por página por padrão
- **FR-026**: O sistema DEVE exibir badges visuais diferenciados para cada metodologia (cores/ícones distintos)
- **FR-027**: O sistema DEVE exibir badge visual específico "Pendente" para projetos sem metodologia definida (cor neutra/cinza)
- **FR-028**: O sistema DEVE exibir badges visuais diferenciados para cada status
- **FR-029**: Quando não houver projetos cadastrados, o sistema DEVE exibir estado vazio com botão para criar primeiro projeto
- **FR-030**: O sistema DEVE permitir ordenação da lista por data de criação (mais recentes primeiro, por padrão)

#### Visualização de Detalhes

- **FR-031**: O sistema DEVE exibir todas as informações do projeto: id, título, metodologia (ou "Pendente"), status, cliente, responsável, descrição do problema, impacto, versão, datas de abertura e encerramento
- **FR-032**: O sistema DEVE exibir informações do cliente: nome, CNPJ (se disponível)
- **FR-033**: O sistema DEVE exibir informações do responsável: nome, email (se disponível)
- **FR-034**: O sistema DEVE listar todos os participantes do projeto com seus respectivos papéis
- **FR-035**: Quando o projeto possui metodologia definida, o sistema DEVE exibir visualização de progresso das etapas/disciplinas/seções
- **FR-036**: Quando o projeto possui metodologia definida, o sistema DEVE mostrar indicador de porcentagem de conclusão baseado nas etapas concluídas
- **FR-037**: Quando o projeto possui metodologia definida, o sistema DEVE exibir timeline ou stepper visual mostrando etapa atual e status de cada etapa
- **FR-038**: Quando o projeto possui metodologia definida, o sistema DEVE fornecer navegação rápida para acessar detalhes de cada etapa
- **FR-039**: Quando o projeto NÃO possui metodologia, o sistema DEVE exibir card de destaque "Definir Metodologia" no lugar da área de etapas

#### Edição de Projetos

- **FR-040**: O sistema DEVE permitir edição de projetos existentes através de formulário pré-preenchido
- **FR-041**: O sistema DEVE permitir edição dos campos: título, descrição do problema, impacto, responsável
- **FR-042**: O sistema DEVE impedir alteração do cliente associado após criação do projeto
- **FR-043**: O sistema DEVE impedir alteração da metodologia após já estar definida
- **FR-044**: O sistema DEVE validar as mesmas regras de criação durante edição (tamanhos mínimos/máximos)
- **FR-045**: O sistema DEVE permitir alteração de status manualmente entre: rascunho, em_andamento, concluído, cancelado
- **FR-046**: O sistema DEVE registrar timestamp de última atualização ao salvar edições
- **FR-047**: O sistema DEVE exibir mensagens de sucesso ao salvar alterações
- **FR-048**: O sistema DEVE exibir mensagens de erro detalhadas quando validações falharem

#### Arquivamento de Projetos

- **FR-049**: O sistema DEVE permitir arquivamento de projetos através de ação "Arquivar Projeto"
- **FR-050**: O sistema DEVE solicitar justificativa obrigatória com mínimo de 10 caracteres para arquivamento
- **FR-051**: O sistema DEVE exibir modal de confirmação antes de executar arquivamento
- **FR-052**: Ao arquivar, o sistema DEVE alterar status do projeto para "arquivado"
- **FR-053**: O sistema DEVE ocultar projetos arquivados da listagem padrão
- **FR-054**: O sistema DEVE permitir visualização de projetos arquivados através de filtro específico
- **FR-055**: O sistema DEVE exibir indicador visual diferenciado para projetos arquivados (quando filtro ativado)
- **FR-056**: Projetos arquivados DEVEM permanecer acessíveis para visualização (somente leitura)

#### Integração com API Backend

- **FR-057**: O sistema DEVE utilizar autenticação JWT Bearer token em todas as requisições à API
- **FR-058**: O sistema DEVE implementar interceptor para adicionar token automaticamente aos headers
- **FR-059**: O sistema DEVE redirecionar para login quando receber resposta 401 (não autorizado)
- **FR-060**: O sistema DEVE tratar erros de API e exibir mensagens amigáveis ao usuário
- **FR-061**: O sistema DEVE implementar loading states durante requisições assíncronas
- **FR-062**: O sistema DEVE implementar cache inteligente de projetos listados (5 minutos de stale time)
- **FR-063**: O sistema DEVE invalidar cache após criação, edição, definição de metodologia ou arquivamento de projetos

### Key Entities

- **Projeto**: Representa um projeto de resolução de problemas. Atributos principais: id (UUID), empresa_id, cliente_id, metodologia (MASP/8D/A3 ou NULL se não definida), título, descrição do problema, impacto, status (rascunho/em_andamento/concluído/cancelado/arquivado), versão, responsável_id, data_abertura, data_encerramento, timestamps de criação e atualização

- **Cliente**: Representa o cliente associado ao projeto. Atributos: id, nome, CNPJ. Relacionamento: um Cliente pode ter múltiplos Projetos

- **Responsável**: Representa o usuário responsável pelo projeto. Atributos: id, nome, email. Relacionamento: um Responsável pode ter múltiplos Projetos

- **Participante**: Representa membros da equipe do projeto. Atributos: id, nome, email, papel (líder/membro/especialista/aprovador/champion). Relacionamento: um Projeto pode ter múltiplos Participantes

- **WorkflowEtapa**: Representa as etapas/disciplinas/seções do projeto (polimórfica conforme metodologia). Atributos: id, projeto_id, tipo de etapa (etapa_masp/disciplina_8d/secao_a3), status, datas de início e fim, aprovações. Relacionamento: um Projeto possui múltiplas WorkflowEtapas (criadas apenas após definição de metodologia)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários podem criar um novo projeto básico (sem metodologia) em menos de 1 minuto
- **SC-002**: Usuários podem definir metodologia para um projeto existente em menos de 30 segundos
- **SC-003**: A listagem de projetos carrega e exibe até 100 projetos em menos de 3 segundos
- **SC-004**: Filtros de metodologia e status retornam resultados instantaneamente (menos de 500ms)
- **SC-005**: 95% dos usuários conseguem localizar um projeto específico na listagem em menos de 30 segundos
- **SC-006**: Formulários de criação e edição exibem validações de campo em tempo real (feedback imediato)
- **SC-007**: Sistema exibe mensagens de erro claras e acionáveis em 100% dos casos de validação falha
- **SC-008**: Zero perda de dados durante operações de criação, edição e definição de metodologia (100% de persistência confiável)
- **SC-009**: Interface responsiva funciona corretamente em dispositivos desktop, tablet e mobile (breakpoints 768px, 1024px)
- **SC-010**: Redução de 50% no tempo necessário para iniciar um novo projeto de resolução de problemas comparado ao processo manual anterior (criação rápida sem metodologia + definição posterior)
- **SC-011**: 90% dos usuários completam criação de projeto na primeira tentativa sem erros de validação
- **SC-012**: 85% dos usuários definem metodologia logo após criar o projeto (no mesmo dia)
- **SC-013**: Sistema impede 100% das tentativas de redefinir metodologia em projetos que já possuem uma definida

## Assumptions

- A autenticação JWT já está implementada e funcional no sistema
- A API backend de Resolução de Problemas já está desenvolvida e disponível conforme documentação em `docs/ph3a/FRONTEND_GUIDE-RESOLUCAO-PROBLEMAS.md`
- Os endpoints de API seguem o padrão `/api/v1/resolucao-problemas/projetos`
- A API backend suporta criação de projetos com metodologia NULL
- A API backend possui endpoint para definir metodologia (uma única vez por projeto)
- A API backend valida e impede alteração de metodologia após já estar definida
- O cadastro de Clientes já existe e possui endpoint para listagem/autocomplete
- O cadastro de Usuários já existe e possui endpoint para seleção de responsáveis
- As metodologias (MASP, 8D, A3) seguem as definições já estabelecidas no backend
- O sistema já possui um componente de notificação toast configurado (ex: react-hot-toast)
- O projeto utiliza React Query ou similar para gerenciamento de estado assíncrono
- Tailwind CSS ou biblioteca similar está configurada para estilização
- Não há necessidade de controle de permissões granular nesta fase (todos os usuários autenticados podem criar/editar projetos)
- Projetos podem permanecer indefinidamente sem metodologia definida (não há prazo ou expiração)
- Para usar outra metodologia em um projeto existente, é necessário criar um novo projeto (clonagem será feature futura)

## Dependencies

- **Backend API**: Depende da API de Resolução de Problemas estar funcional e acessível
- **Autenticação**: Depende do sistema de autenticação JWT estar implementado
- **Cadastro de Clientes**: Depende do módulo de clientes para seleção no formulário
- **Cadastro de Usuários**: Depende do módulo de usuários para seleção de responsável
- **React Query** (ou Tanstack Query): Para gerenciamento de cache e requisições
- **Axios**: Para cliente HTTP de comunicação com API
- **React Hook Form**: Para gerenciamento de formulários
- **Zod**: Para validação de schemas
- **React Router**: Para navegação entre páginas

## Out of Scope

Esta especificação NÃO inclui:

- Funcionalidades de workflow de etapas (navegação, preenchimento, conclusão de etapas)
- Ferramentas de qualidade (Ishikawa, 5 Porquês, 5W2H, Pareto)
- Upload e gestão de evidências
- Gestão de ações e planos de ação
- Indicadores e KPIs
- Geração de relatórios PDF
- Certificados de conclusão
- Notificações e alertas
- Histórico de alterações e auditoria detalhada (além do timestamp de atualização)
- Exportação de dados
- Importação em lote de projetos
- Templates de projetos
- **Clonagem de projetos** (feature futura para criar novo projeto baseado em existente)
- **Conversão/alteração de metodologia** (uma vez definida, metodologia é imutável; clonagem com nova metodologia será feature futura)
- Integração com sistemas externos
- Dashboard analítico de projetos
- Gestão de permissões granulares por projeto
- Notificação/alerta para projetos sem metodologia por muito tempo
- Desfazer definição de metodologia (operação irreversível)
