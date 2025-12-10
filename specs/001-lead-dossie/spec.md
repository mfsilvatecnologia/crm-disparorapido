# Especificação de Funcionalidade: Dossiê de Leads com Enriquecimento PH3A

**Branch da Funcionalidade**: `001-lead-dossie`
**Criado em**: 2025-12-05
**Status**: Rascunho
**Input**: Descrição do usuário: "criar tela lead-dossie, para mostrar os leads do sistema e com a possibilidade de fazer uma busca de dados da api ph3a que foi implementado no backend para enriquecimento de informações, esse é um recurso pago se a pessoa tiver crédito e com níveis de valores diferenciados conforma a informação, um valor específico para saúde financeira, rastro digital, validação cadastral, etc."

## Cenários de Usuário & Testes *(obrigatório)*

### História de Usuário 1 - Visualizar Lista de Leads (Prioridade: P1)

Como representante de vendas, quero ver uma lista de todos os leads no sistema para que eu possa identificar quais leads trabalhar e priorizar meus esforços de prospecção.

**Por que esta prioridade**: Esta é a base da funcionalidade - os usuários precisam visualizar os leads antes de poder enriquecê-los. Sem isso, nenhuma outra funcionalidade é acessível.

**Teste Independente**: Pode ser totalmente testado fazendo login como um usuário com leads, navegando até a página de dossiê de leads e verificando se uma lista de leads é exibida com informações básicas (nome, número de documento, data de criação, status).

**Cenários de Aceitação**:

1. **Dado** que estou logado com leads no sistema, **Quando** navego para a página de dossiê de leads, **Então** vejo uma lista paginada de leads com informações básicas
2. **Dado** que estou visualizando a lista de leads, **Quando** filtro ou pesquiso leads específicos, **Então** a lista atualiza para mostrar apenas resultados correspondentes
3. **Dado** que o sistema não possui leads, **Quando** navego para a página de dossiê de leads, **Então** vejo uma mensagem de estado vazio me convidando a criar ou importar leads
4. **Dado** que estou visualizando a lista de leads, **Quando** clico em um lead, **Então** vejo informações detalhadas sobre aquele lead

---

### História de Usuário 2 - Verificar Saldo de Créditos para Enriquecimento (Prioridade: P2)

Como gerente de vendas, quero visualizar meu saldo atual de créditos para enriquecimento de leads para que eu possa gerenciar meu orçamento e decidir quais leads enriquecer.

**Por que esta prioridade**: Os usuários precisam de visibilidade sobre seus créditos disponíveis antes de tentar comprar dados de enriquecimento. Isso previne frustração ao tentar compras sem saldo suficiente.

**Teste Independente**: Pode ser testado exibindo o saldo de créditos na página de dossiê de leads e verificando se atualiza corretamente após compras de enriquecimento.

**Cenários de Aceitação**:

1. **Dado** que estou na página de dossiê de leads, **Quando** a página carrega, **Então** vejo meu saldo atual de créditos exibido de forma proeminente
2. **Dado** que tenho créditos disponíveis, **Quando** visualizo as opções de enriquecimento, **Então** vejo o custo de cada pacote de enriquecimento claramente exibido
3. **Dado** que tenho créditos insuficientes, **Quando** tento comprar enriquecimento, **Então** vejo uma mensagem explicando que preciso de mais créditos e opções para comprar mais
4. **Dado** que compro créditos, **Quando** a transação é concluída, **Então** meu saldo exibido atualiza imediatamente

---

### História de Usuário 3 - Comprar Dados de Enriquecimento Individuais (Prioridade: P1)

Como representante de vendas, quero comprar pacotes específicos de dados de enriquecimento (saúde financeira, rastro digital, validação cadastral) para um lead para que eu possa qualificar o lead sem gastar demais em dados desnecessários. Os valores vêm do backend (produtos/pacotes de créditos) — o frontend apenas exibe custos fornecidos pela API.

**Por que esta prioridade**: Esta é a proposta de valor central - permitir que usuários enriqueçam leads com dados PH3A. Os usuários precisam da flexibilidade de comprar apenas os dados que necessitam para controlar custos.

**Teste Independente**: Pode ser testado selecionando um lead, escolhendo um pacote específico de enriquecimento (ex.: saúde financeira), confirmando a compra e verificando se os dados aparecem no perfil do lead e o backend confirma a dedução de créditos.

**Cenários de Aceitação**:

1. **Dado** que estou visualizando um lead sem dados de enriquecimento, **Quando** clico em "Enriquecer Lead", **Então** vejo pacotes de enriquecimento disponíveis com preços individuais retornados pela API
2. **Dado** que seleciono enriquecimento de "Saúde Financeira", **Quando** confirmo a compra, **Então** vejo um modal de confirmação mostrando o custo e quais dados serão recuperados
3. **Dado** que confirmo a compra de enriquecimento, **Quando** a requisição API é bem-sucedida, **Então** os dados de saúde financeira aparecem no perfil do lead e o backend confirma a dedução de créditos (frontend exibe o saldo atualizado retornado)
4. **Dado** que a requisição API de enriquecimento falha, **Quando** ocorre um erro, **Então** vejo uma mensagem de erro, meus créditos não são deduzidos e tenho a opção de tentar novamente
5. **Dado** que já comprei um pacote de enriquecimento para um lead, **Quando** visualizo as opções de enriquecimento, **Então** pacotes comprados anteriormente são marcados como "Já adquirido" com a data da compra

---

### História de Usuário 4 - Visualizar Perfil Enriquecido do Lead (Prioridade: P1)

Como representante de vendas, quero visualizar dados enriquecidos de um lead em cards/seções organizados para que eu possa avaliar rapidamente a qualidade do lead, saúde financeira e probabilidade de conversão.

**Por que esta prioridade**: Isso é essencial para os usuários consumirem e agirem sobre os dados enriquecidos. Sem uma apresentação clara, os dados de enriquecimento não têm valor.

**Teste Independente**: Pode ser testado enriquecendo um lead com múltiplos pacotes e verificando se cada tipo de dado aparece em seu card dedicado com formatação adequada e atribuição de fonte.

**Cenários de Aceitação**:

1. **Dado** que comprei enriquecimento de "Saúde Financeira", **Quando** visualizo o perfil do lead, **Então** vejo um card "Saúde Financeira" com score de crédito, nível de risco, capacidade de compra e fonte de dados claramente rotulados
2. **Dado** que comprei enriquecimento de "Rastro Digital", **Quando** visualizo o perfil do lead, **Então** vejo um card "Rastro Digital" com métricas de visita, temperatura do lead e tags de intenção detectadas
3. **Dado** que comprei enriquecimento de "Validação Cadastral", **Quando** visualizo o perfil do lead, **Então** vejo um card "Validação" com status do CPF, verificação de nome, verificação de endereço e verificação de óbito
4. **Dado** que os dados de enriquecimento estão carregando, **Quando** a requisição API está em andamento, **Então** vejo indicadores de carregamento nos cards relevantes
5. **Dado** que não comprei nenhum enriquecimento, **Quando** visualizo o perfil do lead, **Então** vejo cards de placeholder me convidando a comprar pacotes de enriquecimento

---

### História de Usuário 5 - Comprar Pacote Completo de Enriquecimento (Prioridade: P3)

Como gerente de vendas, quero comprar um pacote completo de enriquecimento (todos os tipos de dados) para um lead com taxa com desconto para que eu possa obter insights abrangentes economizando em custos comparado a compras individuais.

**Por que esta prioridade**: Esta é uma funcionalidade de conveniência que fornece valor através do agrupamento, mas não é essencial para o MVP. Os usuários ainda podem alcançar o mesmo resultado comprando pacotes individuais.

**Teste Independente**: Pode ser testado selecionando a opção "Pacote Completo", confirmando a compra e verificando se todos os tipos de dados de enriquecimento aparecem e o desconto do pacote é aplicado.

**Cenários de Aceitação**:

1. **Dado** que estou visualizando opções de enriquecimento para um lead, **Quando** vejo a lista de pacotes, **Então** vejo uma opção "Pacote Completo" se o backend a expuser, com preço retornado pela API
2. **Dado** que seleciono o "Pacote Completo", **Quando** confirmo a compra, **Então** todos os tipos de dados de enriquecimento são recuperados e o backend confirma a dedução de créditos pelo preço do pacote
3. **Dado** que já comprei alguns pacotes individuais, **Quando** visualizo a opção "Pacote Completo", **Então** o preço exibido reflete o valor calculado pelo backend (frontend não recalcula)

---

### Casos Extremos

- O que acontece quando o número de documento de um lead (CPF/CNPJ) é inválido ou não encontrado na base de dados PH3A?
- Como o sistema lida com retornos parciais de dados da PH3A (alguns campos faltando ou nulos)?
- O que acontece quando os dados de enriquecimento expiram (90 dias conforme o schema)?
- Como o sistema lida com compras de enriquecimento concorrentes para o mesmo lead por diferentes usuários?
- O que acontece quando o saldo de créditos de um usuário se torna insuficiente durante uma requisição de enriquecimento em andamento?
- Como o sistema lida com limites de taxa da API PH3A ou indisponibilidade temporária?
- O que acontece quando os dados de enriquecimento contêm flags negativos (ex.: registro de óbito encontrado, CPF irregular)?
- Como o sistema apresenta dados sensíveis LGPD (mascarados vs exibição completa baseado em permissões)?

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **RF-001**: O sistema DEVE exibir uma lista paginada de todos os leads acessíveis ao usuário atual com informações básicas (nome, número de documento, status, data de criação)
- **RF-002**: O sistema DEVE fornecer capacidades de busca e filtro para a lista de leads (por nome, número de documento, status, tags)
- **RF-003**: O sistema DEVE exibir o saldo atual de créditos do usuário para serviços de enriquecimento PH3A de forma proeminente na página de dossiê de leads
- **RF-004**: O sistema DEVE mostrar opções de pacotes de enriquecimento com preços individuais quando um usuário seleciona um lead para enriquecer, usando valores retornados pela API (produtos/pacotes configurados no backend)
- **RF-005**: O sistema DEVE suportar os seguintes pacotes de enriquecimento com preços diferenciados, com valores fornecidos pelo backend/produtos (frontend não hardcode):
  - Saúde Financeira (Financial Health)
  - Perfil Enriquecido (Enriched Profile)
  - Rastro Digital (Digital Trace)
  - Afinidade de Mercado (Market Affinity)
  - Validação Cadastral (Registry Validation)
  - Pacote Completo (todos os acima com taxa de pacote)
- **RF-006**: O sistema DEVE exibir um modal de confirmação antes de completar uma compra de enriquecimento mostrando o nome do pacote, custo retornado pela API e quais dados serão recuperados
- **RF-007**: O sistema DEVE exibir saldo atualizado retornado pelo backend; a dedução de créditos acontece na API somente após sucesso do enriquecimento PH3A
- **RF-008**: O sistema DEVE refletir reembolso/restauração de créditos informado pelo backend quando a requisição de enriquecimento falhar ou não retornar dados
- **RF-009**: O sistema DEVE exibir dados enriquecidos em cards/seções dedicados organizados por tipo de dado (Saúde Financeira, Perfil, Rastro Digital, Afinidade, Validação)
- **RF-010**: O sistema DEVE mostrar a fonte de dados (ex.: "Fonte: DataFraud", "Fonte: DataBusca") no cabeçalho de cada card de enriquecimento
- **RF-011**: O sistema DEVE exibir a data e hora quando os dados de enriquecimento foram atualizados pela última vez para cada pacote
- **RF-012**: O sistema DEVE exibir estado "Já adquirido" e bloqueio/aviso de recompra conforme indicação do backend para o mesmo pacote/lead (validação de duplicidade/validade feita pela API)
- **RF-013**: O sistema DEVE mostrar uma opção "Atualizar" ou "Renovar" quando o backend indicar dados expirados (ex.: >90 dias), usando o status retornado pela API
- **RF-014**: O sistema DEVE lidar e exibir dados parciais da PH3A de forma elegante, mostrando "Não disponível" ou similar para campos faltantes
- **RF-015**: O sistema DEVE mascarar dados pessoais sensíveis (números de telefone, emails, endereços) de acordo com regras de conformidade LGPD e permissões do usuário
- **RF-016**: O sistema DEVE exibir estados de carregamento para cada card de enriquecimento enquanto dados estão sendo buscados
- **RF-017**: O sistema DEVE exibir estados de erro com opções de retentar quando requisições de enriquecimento falharem
- **RF-018**: O sistema DEVE mostrar indicadores visuais (badges, codificação de cores) para pontos de dados críticos (ex.: "Baixo Risco" em verde, "Alto Risco" em vermelho, CPF "Regular" vs "Irregular")
- **RF-019**: O sistema DEVE fornecer uma opção para comprar créditos adicionais quando o saldo é insuficiente, apontando para os fluxos expostos pelo backend (pacotes/checkout)
- **RF-020**: O sistema DEVE exibir dados de auditoria/histórico retornados pelo backend (usuário, lead, pacote, custo, timestamp) quando disponíveis
- **RF-021**: Os usuários DEVEM poder visualizar o histórico de enriquecimento para cada lead; a fonte de verdade é a API (dossiês e/ou histórico dedicado)
- **RF-022**: O sistema DEVE suportar layout responsivo para dispositivos móveis para visualização de listas de leads e dados de enriquecimento em telas menores
- **RF-023**: O sistema DEVE integrar com a implementação backend da API PH3A existente para recuperação de dados (`POST /ph3a/dossier/consult`, `GET /ph3a/dossier`, `GET /ph3a/dossier/{id}`; opcionalmente `POST /api/v1/ph3a/enrich` quando aplicável)
- **RF-024**: O sistema DEVE validar se o usuário tem créditos suficientes antes de permitir confirmação de compra de enriquecimento, usando saldo retornado por `GET /credits/balance` e regras de preço enviadas pelo backend

### Entidades Principais

- **Lead**: Representa um cliente potencial no sistema, com informações básicas (nome, número de documento, email, telefone) e rastreamento de status
- **Pacote de Enriquecimento**: Representa um pacote de dados comprável da PH3A (tipo, custo em créditos, campos de dados incluídos, provedor de origem)
- **Saldo de Créditos**: Representa os créditos disponíveis do usuário/conta para comprar dados de enriquecimento
- **Transação de Enriquecimento**: Representa uma compra de enriquecimento concluída ou falha (lead, pacote, custo, timestamp, status, usuário)
- **Dados do Dossiê**: Representa os dados enriquecidos recuperados da PH3A para um lead específico, organizados por tipo de dado (saúde financeira, perfil, rastro digital, afinidade, validação) com rastreamento de expiração (validade de 90 dias)

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **CS-001**: Usuários podem visualizar uma lista de leads e navegar para um perfil específico de lead em menos de 5 segundos
- **CS-002**: Usuários podem completar uma compra de enriquecimento (selecionar pacote, confirmar, visualizar resultados) em menos de 30 segundos para um único pacote
- **CS-003**: 95% das requisições de enriquecimento completam com sucesso em até 10 segundos
- **CS-004**: Dados enriquecidos são exibidos em cards organizados e escaneáveis que permitem aos usuários avaliar qualidade do lead em menos de 60 segundos
- **CS-005**: Usuários podem identificar claramente seu saldo de créditos e o custo de cada pacote de enriquecimento antes de tomar uma decisão de compra
- **CS-006**: Zero deduções não autorizadas de créditos (créditos apenas deduzidos quando dados de enriquecimento são recuperados com sucesso)
- **CS-007**: Sistema previne 100% das compras duplicadas de enriquecimento dentro do período de validade de 90 dias
- **CS-008**: Usuários podem identificar fatores críticos de risco (CPF irregular, registro de óbito, score de alto risco) em até 10 segundos de visualizar o perfil do lead
- **CS-009**: Representantes de vendas relatam redução de 40% no tempo gasto pesquisando informações de background do lead
- **CS-010**: Sistema mantém 99,5% de uptime para visualização de lista de leads e fluxos de compra de enriquecimento
