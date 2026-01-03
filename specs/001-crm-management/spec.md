# Especificação de Funcionalidade: Sistema de Gestão CRM

**Branch da Funcionalidade**: `001-crm-management`
**Criado em**: 2026-01-03
**Status**: Rascunho
**Entrada**: Descrição do usuário: "implementar feature customer, contacts, opportunities, contracts conforme referencia backend no @swagger.json: Customer Activities, Opportunities, Customer Contacts, Customers, Customer Contracts"

## Cenários de Usuário & Testes *(obrigatório)*

### História de Usuário 1 - Gerenciar Oportunidades de Clientes (Prioridade: P1)

Representantes de vendas precisam acompanhar oportunidades de negócio potenciais desde o contato inicial até a conversão (ganho/perda). Este é o fluxo central de geração de receita que impulsiona o negócio.

**Por que esta prioridade**: Este é o pipeline primário de receita. Sem o rastreamento de oportunidades, as equipes de vendas não conseguem gerenciar seus leads de forma eficaz ou prever receitas. Isso entrega valor comercial imediato ao habilitar funcionalidade básica de CRM.

**Teste Independente**: Pode ser totalmente testado criando uma oportunidade, atualizando seus detalhes e marcando como ganha ou perdida. Entrega valor imediato fornecendo um ciclo de vida completo de oportunidades sem dependências de outros módulos.

**Cenários de Aceitação**:

1. **Dado que** estou visualizando o painel de oportunidades, **Quando** clico em "Criar Oportunidade", **Então** posso inserir detalhes da oportunidade (nome, valor, estágio, data prevista de fechamento) e salvá-la
2. **Dado que** tenho uma oportunidade existente, **Quando** visualizo os detalhes da oportunidade, **Então** vejo todas as informações incluindo estágio, valor, informações de contato e histórico de atividades
3. **Dado que** estou visualizando uma oportunidade no estágio "Negociação", **Quando** clico em "Marcar como Ganha", **Então** o status da oportunidade muda para "Ganha", um registro de cliente é criado automaticamente e sou redirecionado para o perfil do novo cliente
4. **Dado que** estou visualizando uma oportunidade, **Quando** clico em "Marcar como Perdida", **Então** posso selecionar um motivo de perda e o status da oportunidade muda para "Perdida"
5. **Dado que** estou na página de lista de oportunidades, **Quando** aplico filtros (estágio, faixa de valor, intervalo de datas), **Então** a lista atualiza para mostrar apenas oportunidades correspondentes
6. **Dado que** estou visualizando a lista de oportunidades, **Quando** rolo até o final, **Então** a próxima página de oportunidades carrega automaticamente (paginação baseada em cursor)

---

### História de Usuário 2 - Gerenciar Informações de Clientes (Prioridade: P2)

Gerentes de conta precisam manter perfis abrangentes de clientes, incluindo informações da empresa, rastreamento de status e linha do tempo histórica para fornecer serviço personalizado e identificar contas em risco.

**Por que esta prioridade**: Uma vez que oportunidades são convertidas em clientes, gerenciar esses relacionamentos torna-se crítico. Isso se baseia em P1 ao habilitar gestão de clientes pós-venda. Sem isso, oportunidades convertidas não têm para onde ir.

**Teste Independente**: Pode ser testado visualizando listas de clientes, acessando detalhes de clientes, atualizando informações de clientes e alterando status de clientes. Entrega valor habilitando gestão de contas de clientes de forma independente.

**Cenários de Aceitação**:

1. **Dado que** estou visualizando o painel de clientes, **Quando** aplico filtros (status, faixa de pontuação de saúde, segmento), **Então** a lista atualiza para mostrar apenas clientes correspondentes
2. **Dado que** estou visualizando um perfil de cliente, **Quando** clico em "Editar", **Então** posso atualizar informações da empresa (nome, segmento, detalhes de cobrança) e salvar as alterações
3. **Dado que** estou visualizando um perfil de cliente, **Quando** clico em "Alterar Status", **Então** posso selecionar um novo status (Ativo, Em Risco, Cancelado, Pausado) e o status atualiza imediatamente
4. **Dado que** estou visualizando um perfil de cliente, **Quando** rolo até a seção de linha do tempo, **Então** vejo um histórico cronológico de todas as atividades, alterações de contrato e atualizações de status
5. **Dado que** estou visualizando um perfil de cliente, **Quando** verifico a pontuação de saúde, **Então** vejo uma pontuação calculada com base em engajamento, valor do contrato e recência de atividade
6. **Dado que** estou na lista de clientes, **Quando** rolo até o final, **Então** a próxima página carrega com mais clientes (paginação)

---

### História de Usuário 3 - Gerenciar Contatos de Clientes (Prioridade: P3)

Equipes de vendas e contas precisam manter múltiplos pontos de contato para cada cliente (contato principal, tomadores de decisão, líderes técnicos) para garantir comunicação eficaz em toda a organização.

**Por que esta prioridade**: Clientes tipicamente têm múltiplas partes interessadas. Isso aprimora P2 ao adicionar gestão de contatos, mas a gestão básica de clientes pode funcionar sem isso inicialmente.

**Teste Independente**: Pode ser testado adicionando contatos a um cliente, marcando contatos principais, atualizando informações de contato e removendo contatos. Entrega valor habilitando gestão de clientes com múltiplos contatos.

**Cenários de Aceitação**:

1. **Dado que** estou visualizando um perfil de cliente, **Quando** clico em "Adicionar Contato", **Então** posso inserir detalhes do contato (nome, email, telefone, função, departamento) e salvar o contato
2. **Dado que** estou visualizando a lista de contatos de um cliente, **Quando** vejo múltiplos contatos, **Então** um contato é marcado visualmente como "Contato Principal"
3. **Dado que** estou visualizando a lista de contatos de um cliente, **Quando** clico em "Definir como Principal" em um contato não-principal, **Então** esse contato se torna o principal e o contato principal anterior é desmarcado
4. **Dado que** estou visualizando um contato, **Quando** clico em "Editar", **Então** posso atualizar informações do contato e salvar as alterações
5. **Dado que** estou visualizando um contato, **Quando** clico em "Remover", **Então** vejo um diálogo de confirmação e o contato é removido após confirmação

---

### História de Usuário 4 - Rastrear Atividades de Clientes (Prioridade: P4)

Equipes precisam registrar e revisar todas as interações com clientes (chamadas, reuniões, emails, notas) para manter contexto e garantir continuidade quando diferentes membros da equipe interagem com o mesmo cliente.

**Por que esta prioridade**: O rastreamento de atividades aprimora a gestão de clientes, mas não é crítico para funcionalidade básica de CRM. Fornece contexto histórico e melhora a coordenação da equipe.

**Teste Independente**: Pode ser testado criando atividades para um cliente, visualizando histórico de atividades, atualizando atividades e removendo atividades. Entrega valor fornecendo rastreamento de interações.

**Cenários de Aceitação**:

1. **Dado que** estou visualizando um perfil de cliente, **Quando** clico em "Registrar Atividade", **Então** posso selecionar o tipo de atividade (chamada, reunião, email, nota), inserir detalhes, definir data/hora e salvar a atividade
2. **Dado que** estou visualizando a lista de atividades de um cliente, **Quando** a página carrega, **Então** vejo atividades ordenadas por data (mais recente primeiro) com tipo, descrição e timestamp
3. **Dado que** estou visualizando uma atividade, **Quando** clico em "Editar", **Então** posso atualizar detalhes da atividade e salvar as alterações
4. **Dado que** estou visualizando uma atividade, **Quando** clico em "Excluir", **Então** vejo um diálogo de confirmação e a atividade é soft-deletada após confirmação
5. **Dado que** estou visualizando a linha do tempo do cliente, **Quando** rolo pelo histórico, **Então** vejo atividades intercaladas com outros eventos do cliente (mudanças de status, contratos)

---

### História de Usuário 5 - Gerenciar Contratos de Clientes (Prioridade: P5)

Gerentes de conta precisam rastrear contratos de clientes incluindo termos, datas de renovação e valores para gerenciar proativamente renovações e prevenir cancelamentos.

**Por que esta prioridade**: A gestão de contratos é importante para negócios baseados em assinatura, mas se baseia na gestão de clientes. É valioso, mas não essencial para operações básicas de CRM.

**Teste Independente**: Pode ser testado criando contratos para clientes, visualizando detalhes de contratos, rastreando datas de renovação e processando renovações. Entrega valor habilitando gestão do ciclo de vida de contratos.

**Cenários de Aceitação**:

1. **Dado que** estou visualizando um perfil de cliente, **Quando** clico em "Adicionar Contrato", **Então** posso inserir detalhes do contrato (tipo, valor, data de início, data de término, ciclo de cobrança) e salvar o contrato
2. **Dado que** estou visualizando os contratos de um cliente, **Quando** a página carrega, **Então** vejo todos os contratos com status (ativo, expirado, renovado) e datas-chave
3. **Dado que** estou visualizando o painel de contratos, **Quando** acesso "Próximos de Renovação", **Então** vejo contratos expirando nos próximos 90 dias ordenados por data de renovação
4. **Dado que** estou visualizando um contrato próximo de renovação, **Quando** clico em "Renovar Contrato", **Então** posso definir novos termos, datas e valor, e salvar a renovação
5. **Dado que** estou visualizando um contrato, **Quando** clico em "Editar", **Então** posso atualizar termos do contrato (exceto datas para contratos ativos) e salvar as alterações
6. **Dado que** estou visualizando a lista de renovações, **Quando** filtro por dias até renovação, **Então** a lista atualiza para mostrar apenas contratos correspondentes ao período

---

### Casos Extremos

- **Conversão de Oportunidade para Cliente**: O que acontece ao marcar uma oportunidade como "Ganha" mas a criação do cliente falha? O sistema deve reverter a alteração de status da oportunidade e exibir mensagem de erro.
- **Exclusão de Contato Principal**: O que acontece ao tentar excluir o contato principal? O sistema deve prevenir exclusão e solicitar ao usuário que atribua um novo contato principal primeiro.
- **Estados de Dados Vazios**: Como o sistema lida com clientes sem contatos, sem atividades ou sem contratos? Exibir estados vazios úteis com botões de chamada para ação claros.
- **Limites de Paginação**: O que acontece ao paginar por milhares de registros? O sistema deve usar paginação baseada em cursor para lidar com grandes conjuntos de dados eficientemente.
- **Atualizações Concorrentes**: O que acontece quando dois usuários atualizam o mesmo cliente/oportunidade simultaneamente? O sistema deve usar bloqueio otimista ou last-write-wins com notificação.
- **Sobreposição de Contratos**: O que acontece ao adicionar um novo contrato com datas que sobrepõem contratos ativos existentes? O sistema deve avisar mas permitir (alguns negócios têm múltiplos contratos simultâneos).
- **Oportunidades Órfãs**: O que acontece quando uma oportunidade é marcada como ganha mas o ID do cliente não é retornado? O sistema deve registrar erro, manter oportunidade em estado "conversão pendente" e notificar administrador.
- **Cálculo de Pontuação de Saúde**: O que acontece quando um cliente não tem atividade recente ou dados? O sistema deve exibir mensagem "Dados insuficientes" ao invés de uma pontuação.
- **Operações em Massa**: Como o sistema lida com filtragem de 10.000+ oportunidades ou clientes? A filtragem no lado do cliente deve ser desabilitada; toda filtragem deve acontecer no lado do servidor.
- **Recuperação de Oportunidade Perdida**: Uma oportunidade perdida pode ser reaberta? O sistema deve permitir mudança de status de volta para estágios ativos com trilha de auditoria.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

#### Gestão de Oportunidades

- **RF-001**: O sistema DEVE permitir aos usuários criar novas oportunidades com campos obrigatórios (nome, valor, data prevista de fechamento) e campos opcionais (descrição, estágio, origem)
- **RF-002**: O sistema DEVE exibir lista de oportunidades com paginação baseada em cursor e suportar filtragem por estágio, faixa de valor e intervalo de datas
- **RF-003**: O sistema DEVE permitir aos usuários visualizar informações detalhadas da oportunidade incluindo todos os campos, histórico de atividades e contatos associados
- **RF-004**: O sistema DEVE permitir aos usuários atualizar informações da oportunidade exceto campos gerados pelo sistema (ID, data de criação)
- **RF-005**: O sistema DEVE permitir aos usuários marcar oportunidades como "Ganha", o que dispara criação automática de cliente e redireciona para perfil do cliente
- **RF-006**: O sistema DEVE permitir aos usuários marcar oportunidades como "Perdida" com seleção obrigatória de motivo de perda
- **RF-007**: O sistema DEVE prevenir modificações em oportunidades com status "Ganha" ou "Perdida" exceto para reversão de status
- **RF-008**: O sistema DEVE exibir o pipeline de estágios de oportunidade visualmente (ex: Lead, Qualificado, Proposta, Negociação, Ganho/Perdido)

#### Gestão de Clientes

- **RF-009**: O sistema DEVE exibir lista de clientes com paginação e suportar filtragem por status, faixa de pontuação de saúde e segmento de cliente
- **RF-010**: O sistema DEVE permitir aos usuários visualizar informações detalhadas do cliente incluindo detalhes da empresa, contatos, atividades e contratos
- **RF-011**: O sistema DEVE permitir aos usuários atualizar informações do cliente (nome, segmento, detalhes de cobrança, notas)
- **RF-012**: O sistema DEVE permitir aos usuários alterar status do cliente (Ativo, Em Risco, Cancelado, Pausado) com mudança de status registrada na linha do tempo
- **RF-013**: O sistema DEVE exibir linha do tempo do cliente mostrando histórico cronológico de atividades, mudanças de status e eventos de contrato
- **RF-014**: O sistema DEVE calcular e exibir pontuação de saúde do cliente baseada em métricas de engajamento, valor do contrato e recência de atividade
- **RF-015**: O sistema DEVE prevenir exclusão de clientes com contratos ativos
- **RF-016**: O sistema DEVE criar registros de cliente automaticamente quando oportunidades são marcadas como "Ganha"

#### Gestão de Contatos de Clientes

- **RF-017**: O sistema DEVE permitir aos usuários adicionar contatos aos clientes com campos (nome, email, telefone, função, departamento)
- **RF-018**: O sistema DEVE exibir todos os contatos associados a um cliente
- **RF-019**: O sistema DEVE permitir aos usuários designar um contato como "Contato Principal" por cliente
- **RF-020**: O sistema DEVE permitir aos usuários atualizar informações do contato
- **RF-021**: O sistema DEVE permitir aos usuários remover contatos de clientes (soft delete)
- **RF-022**: O sistema DEVE prevenir remoção do contato principal sem primeiro designar um novo contato principal
- **RF-023**: O sistema DEVE validar formato de email e formato de número de telefone na criação/atualização de contato
- **RF-024**: O sistema DEVE definir automaticamente o primeiro contato adicionado como principal se nenhum principal existir

#### Gestão de Atividades de Clientes

- **RF-025**: O sistema DEVE permitir aos usuários registrar atividades para clientes com campos (tipo, descrição, data/hora)
- **RF-026**: O sistema DEVE suportar tipos de atividade: Chamada, Reunião, Email, Nota
- **RF-027**: O sistema DEVE exibir atividades do cliente ordenadas por data (mais recente primeiro)
- **RF-028**: O sistema DEVE permitir aos usuários atualizar detalhes da atividade
- **RF-029**: O sistema DEVE permitir aos usuários excluir atividades (soft delete com trilha de auditoria)
- **RF-030**: O sistema DEVE incluir atividades na visualização de linha do tempo do cliente
- **RF-031**: O sistema DEVE exibir contagem de atividades e data da atividade mais recente no perfil do cliente

#### Gestão de Contratos de Clientes

- **RF-032**: O sistema DEVE permitir aos usuários criar contratos para clientes com campos (tipo, valor, data de início, data de término, ciclo de cobrança, termos)
- **RF-033**: O sistema DEVE exibir todos os contratos de um cliente com indicadores de status (ativo, expirado, renovado)
- **RF-034**: O sistema DEVE exibir contratos próximos de renovação (dentro de 90 dias) em painel dedicado de renovações
- **RF-035**: O sistema DEVE permitir aos usuários renovar contratos criando novo contrato vinculado ao contrato anterior
- **RF-036**: O sistema DEVE permitir aos usuários atualizar detalhes do contrato com restrições em mudanças de datas para contratos ativos
- **RF-037**: O sistema DEVE calcular status do contrato automaticamente baseado na data atual e datas do contrato
- **RF-038**: O sistema DEVE suportar filtragem do painel de renovações por dias até renovação
- **RF-039**: O sistema DEVE prevenir exclusão de contratos ativos
- **RF-040**: O sistema DEVE incluir eventos de contrato (criado, renovado, expirado) na linha do tempo do cliente

#### Requisitos Cross-Módulo

- **RF-041**: O sistema DEVE manter consistência de dados quando oportunidades são convertidas em clientes
- **RF-042**: O sistema DEVE exibir mensagens de erro amigáveis ao usuário quando operações falharem
- **RF-043**: O sistema DEVE mostrar estados de carregamento durante operações de busca de dados
- **RF-044**: O sistema DEVE validar campos obrigatórios antes de enviar formulários
- **RF-045**: O sistema DEVE exibir diálogos de confirmação para ações destrutivas (excluir, mudanças de status)
- **RF-046**: O sistema DEVE lidar com erros de rede graciosamente com opções de retry
- **RF-047**: O sistema DEVE suportar design responsivo para viewports mobile e desktop
- **RF-048**: O sistema DEVE persistir preferências de filtro e ordenação por sessão de usuário

### Entidades Chave

- **Oportunidade**: Representa negócios potenciais com estágios desde contato inicial até ganho/perda. Contém valor, data prevista de fechamento, estágio, origem, descrição e contatos associados.
- **Cliente**: Representa empresas/organizações que foram convertidas de oportunidades ou adicionadas diretamente. Contém informações da empresa, status, segmento, pontuação de saúde, detalhes de cobrança.
- **Contato**: Representa pessoas individuais associadas a clientes. Contém informações pessoais (nome, email, telefone), função, departamento e designação de principal.
- **Atividade**: Representa interações com clientes. Contém tipo (chamada, reunião, email, nota), descrição, data/hora e usuário que registrou.
- **Contrato**: Representa acordos formais com clientes. Contém tipo, valor, datas (início, término), ciclo de cobrança, termos, status e histórico de renovação.

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários conseguem criar e rastrear oportunidades através do pipeline completo de vendas em menos de 5 minutos por oportunidade
- **CS-002**: Equipes de vendas conseguem converter oportunidades em clientes com um único clique, com registros de clientes criados em até 2 segundos
- **CS-003**: Gerentes de conta conseguem visualizar linha do tempo completa do cliente (atividades, contratos, mudanças de status) em uma única página rolável sem navegação
- **CS-004**: Usuários conseguem identificar clientes em risco usando pontuações de saúde em até 3 cliques do painel
- **CS-005**: Notificações de renovação de contrato aparecem automaticamente 90 dias antes da expiração sem necessidade de monitoramento manual
- **CS-006**: Sistema lida com paginação de 10.000+ oportunidades/clientes sem degradação de performance (menos de 1 segundo de carregamento de página)
- **CS-007**: 95% dos usuários completam com sucesso sua primeira conversão de oportunidade para cliente sem assistência
- **CS-008**: Gestão de contatos permite que equipes mantenham uma média de 5-10 contatos por cliente eficientemente
- **CS-009**: Registro de atividade leva menos de 30 segundos por entrada com auto-save prevenindo perda de dados
- **CS-010**: Operações de filtro e busca retornam resultados em até 1 segundo para conjuntos de dados de até 50.000 registros
- **CS-011**: Usuários mobile conseguem realizar todas as funções principais de CRM (visualizar, criar, atualizar) em telas com largura mínima de 375px
- **CS-012**: Zero incidentes de perda de dados durante processo de conversão de oportunidade para cliente (100% de integridade transacional)

## Premissas

1. **Autenticação & Autorização**: Usuários já estão autenticados e autorizados via autenticação existente do sistema. Permissões/roles de usuários são gerenciados externamente a esta funcionalidade.
2. **Disponibilidade da API Backend**: Os endpoints da API backend descritos estão completamente implementados, testados e disponíveis no momento da implementação do frontend.
3. **Validação de Dados**: A validação do lado do servidor é abrangente e o frontend primariamente fornece validação de experiência do usuário (não validação de segurança).
4. **Moeda & Localização**: Valores monetários são armazenados e exibidos em USD ($) por padrão. Formatos de data seguem o padrão ISO 8601 com formatação de exibição baseada no locale do navegador.
5. **Atualizações em Tempo Real**: O sistema NÃO requer atualizações em tempo real (WebSocket/SSE). Usuários atualizam ou navegam para ver alterações feitas por outros.
6. **Anexos de Arquivos**: Documentos de contrato e anexos de atividades estão fora do escopo para esta implementação inicial.
7. **Integração de Email**: O sistema registra atividades de email manualmente; NÃO integra com clientes de email (Gmail, Outlook) para registro automático.
8. **Importação/Exportação em Massa**: Operações em massa (importação/exportação CSV) estão fora do escopo para implementação inicial.
9. **Analytics Avançado**: Painéis de relatórios e analytics além de pontuações básicas de saúde estão fora do escopo.
10. **Integrações de Terceiros**: Integração com sistemas CRM externos, automação de marketing ou software de contabilidade está fora do escopo.

## Fora do Escopo

- Campos customizados e configuração de campos por usuários finais
- Integração de email/calendário para registro automático de atividades
- Painéis avançados de relatórios e analytics
- Funcionalidade de importação/exportação em massa
- Gestão de documentos e anexos de arquivo
- Automação de workflow e triggers
- Integração com sistemas de terceiros (contabilidade, automação de marketing)
- Aplicativos nativos mobile (apenas web responsivo)
- Modo offline e sincronização de dados
- Sistemas avançados de permissões (nível de campo, nível de registro)
- Suporte multi-moeda além de USD
- Configuração customizada de estágios de oportunidade/cliente
- Insights e recomendações baseados em IA
- Integração de videochamada
- Integração de redes sociais
- Algoritmos de pontuação de leads além da pontuação básica de saúde
