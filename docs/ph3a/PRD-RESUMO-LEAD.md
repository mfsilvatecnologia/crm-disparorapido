# PRD — Tela “Resumo do Lead” (Saúde/Perfil/Rastro/Afinidade/Validação)

## 1) Visão geral

Esta tela exibe um **painel de enriquecimento e qualificação de lead** em cards, consolidando sinais de **saúde financeira**, **dados demográficos**, **rastro digital (intenção)**, **afinidade de mercado** e **validação cadastral**, com indicação de **fonte** de dados em cada card.

## 2) Objetivos do produto

* Ajudar time comercial a **priorizar leads** rapidamente (ex.: risco baixo, alta intenção, perfil premium).
* Reduzir trabalho manual de pesquisa (enriquecimento e checagens).
* Entregar visão “em 10 segundos”: **pode comprar? é confiável? está quente? combina com o ICP?**.

## 3) Público-alvo

* SDR/BDR (pré-vendas)
* Closers/Executivos de conta
* Gestores comerciais (revisão de qualidade e pipeline)
* (Opcional) Suporte/Onboarding (validação cadastral)

## 4) Escopo da tela (o que aparece)

A tela é composta por **5 cards**:

1. **Saúde Financeira** (Fonte: DataFraud)
2. **Perfil Enriquecido** (Fonte: DataBusca)
3. **Rastro Digital** (Fonte: DataTag)
4. **Afinidade de Mercado** (Fonte: DataAffinity)
5. **Validação Cadastral** (Fonte: DataBusca)

> Observação UI: Cada card tem cabeçalho com **título + “Fonte”** e, em alguns casos, um **status/badge** no topo direito.

---

## 5) Requisitos funcionais (por card)

### 5.1 Card: Saúde Financeira (Fonte: DataFraud)

**Objetivo:** indicar poder de compra e risco.
**Conteúdo obrigatório:**

* Badge de risco: `Baixo Risco` (com variações: Baixo/Médio/Alto).
* Campo: **Score de Crédito** (ex.: `850`).
* Barra/indicador visual atrelado ao score (faixa).
* Bloco: **Capacidade de Compra** (ex.: `R$ 1.2M - 1.5M`)

  * Subtexto: “Estimativa baseada em renda presumida” (ou lógica equivalente).
* Lista de checks:

  * `Sem restrições no CPF`
  * `Histórico de pagamentos positivo`
    **Regras:**
* Score deve aceitar valores nulos: se não houver, exibir “Não encontrado”.
* Risco deve ser calculado pelo provider ou por regra interna (configurável).
* Capacidade de compra pode ser intervalo (mín-máx) ou “indisponível”.

---

### 5.2 Card: Perfil Enriquecido (Fonte: DataBusca)

**Objetivo:** enriquecer visão de persona e contatos.
**Conteúdo obrigatório:**

* Selo: `Atualizado hoje` (varia por data de atualização).
* Seção **Dados demográficos**:

  * Faixa etária (ex.: `35–40 anos`)
  * Estado civil (ex.: `Casado(a)`)
  * Ocupação provável (ex.: `Diretor / Gerente Sênior`)
* Seção **Contatos adicionais encontrados**:

  * Telefone (ex.: `(11) 3030-XXXX`) + tag `Comercial` + indicador “validado” (ícone OK)
  * E-mail (ex.: `roberto.s@empresa.com`) + tag `Corporativo` + indicador “validado”
    **Regras:**
* Pode haver **0..N contatos**; ordenar por confiabilidade (corporativo > pessoal; comercial > desconhecido).
* Mascarar parcialmente dados sensíveis (telefone e email) conforme política/LGPD.
* Se não houver enriquecimento: mostrar estado vazio (“Sem dados adicionais”).

---

### 5.3 Card: Rastro Digital (Fonte: DataTag)

**Objetivo:** medir intenção/temperatura do lead.
**Conteúdo obrigatório:**

* Status de presença: `Online agora` (quando aplicável).
* Campo **Temperatura do Lead** (ex.: `Muito Alta`) + barra de intensidade.
* Métricas:

  * `Visitas (30d)` (ex.: `12`)
  * `Tempo Médio` (ex.: `5m`)
* Seção **Intenção detectada** com chips/tags:

  * Ex.: `Compra Imediata`, `Alto Padrão`, `Zona Sul`
* Caixa de insight:

  * Ex.: “Visitou a página ‘Financiamento’ 3 vezes na última semana.”
    **Regras:**
* Janela padrão: 30 dias (configurável).
* “Online agora” depende de evento recente (ex.: últimos X minutos).
* Intenções são derivadas de regras/ML e devem ser explicáveis (link “ver detalhes” pode ser backlog).

---

### 5.4 Card: Afinidade de Mercado (Fonte: DataAffinity)

**Objetivo:** estimar match com ICP/oferta.
**Conteúdo obrigatório:**

* Nota/índice (ex.: `A+`).
* Título de classificação: `Perfil Premium`
* Subtexto: `Top 5% compatibilidade` (percentil).
* Seção “Perfil de compra semelhante”:

  * Ex.: `Investidor Imobiliário`
  * Ex.: `Preferência por bairros consolidados`
* Frase de impacto (copy):

  * Ex.: “Este perfil tem 3x mais chances de fechar negócio em imóveis acima de R$ 1M comparado à média.”
    **Regras:**
* Exibir percentil e categoria (A+, A, B…).
* Itens de perfil semelhante: 0..N.

---

### 5.5 Card: Validação Cadastral (Fonte: DataBusca)

**Objetivo:** checar consistência e risco cadastral.
**Conteúdo obrigatório:**

* Linhas de validação:

  * `CPF`: `Regular` (verde) / `Irregular` (vermelho) / `Não encontrado`
  * `Nome da Mãe`: `Confere` / `Não confere` / `Não informado`
  * `Endereço`: `Divergente` (amarelo) / `Confere`
  * `Óbito`: `Não consta` / `Consta`
* Rodapé: “Última validação realizada em DD/MM/AAAA às HH:mm”
  **Regras:**
* Exibir data/hora no fuso do usuário.
* Mostrar divergências com ênfase visual e tooltip (backlog) com o que divergiu.

---

## 6) Estados e comportamentos globais

### 6.1 Carregamento

* Skeleton por card (placeholder de título, badges e linhas).
* Cada card pode carregar independentemente (preferível, por depender de provedores distintos).

### 6.2 Erro

* Se falhar um provider: card exibe “Não foi possível carregar” + ação “Tentar novamente”.
* Não bloquear os demais cards.

### 6.3 Atualização/Refresh

* Ao abrir a tela: buscar dados.
* Botão global (backlog) “Atualizar” para refazer consultas, respeitando rate limit.

---

## 7) Requisitos de dados (modelo sugerido)

Um objeto `lead_insights` por lead:

* `financial_health`:

  * `risk_level` (LOW|MEDIUM|HIGH)
  * `credit_score` (0..1000|null)
  * `purchase_capacity_min`, `purchase_capacity_max` (number|null)
  * `flags[]` (ex.: no_restrictions, positive_history)
  * `source`, `updated_at`
* `enriched_profile`:

  * `age_range`, `marital_status`, `probable_role`
  * `contacts[]`: {type: phone|email, value_masked, label, verified}
  * `source`, `updated_at`
* `digital_trace`:

  * `lead_temperature` (LOW|MEDIUM|HIGH|VERY_HIGH)
  * `visits_30d`, `avg_time_seconds`
  * `intent_tags[]`
  * `online_now` (bool)
  * `insight_text`
  * `source`, `updated_at`
* `market_affinity`:

  * `grade` (A+|A|B|C…)
  * `compatibility_percentile`
  * `segments[]`
  * `closing_lift` (ex.: 3.0)
  * `source`, `updated_at`
* `registry_validation`:

  * `cpf_status`, `mother_name_match`, `address_match`, `death_record`
  * `last_checked_at`
  * `source`

---

## 8) Regras de negócio (mínimas)

* **Prioridade visual**:

  * “Rastro Digital” e “Saúde Financeira” são os sinais mais fortes para priorização (temperatura + risco).
* **Cores/semântica**:

  * Verde = ok/confirmado/regular.
  * Amarelo = atenção/divergente.
  * Vermelho = risco/irregular/alto risco.
* **LGPD**:

  * Mascarar dados pessoais e exibir apenas o necessário para qualificação.

---

## 9) Métricas de sucesso

* % de leads que recebem decisão de prioridade em até X segundos (telemetria de interação).
* Redução de tempo de pesquisa manual por lead.
* Aumento de conversão MQL→SQL e SQL→Won (por cohort usando insights).
* Taxa de uso: cards visualizados por sessão, cliques em “tentar novamente”.

---

## 10) Dependências e integrações

* Provedores: **DataFraud**, **DataBusca**, **DataTag**, **DataAffinity**
* Serviço interno de orquestração: normalização, cache e rate limiting.
* Logs/auditoria de consultas (quem consultou e quando).

---

## 11) Não-escopo (por enquanto)

* Drill-down detalhado de eventos de navegação (“ver detalhes do insight”).
* Edição manual de dados do lead dentro desta tela.
* Exportação/PDF do painel.

---

## 12) Critérios de aceite (checklist)

* [ ] Cada card exibe **título + fonte** corretamente.
* [ ] Cards suportam **loading**, **erro** e **vazio** sem quebrar layout.
* [ ] Score, risco e capacidade de compra exibem valores e formatação monetária corretamente.
* [ ] Contatos adicionais suportam lista dinâmica e mascaramento.
* [ ] Temperatura e métricas 30d exibem números consistentes com a fonte.
* [ ] Chips de intenção aparecem de forma responsiva (quebram linha).
* [ ] Validação cadastral mostra status e “última validação” com data/hora.
* [ ] Tela não bloqueia quando um provider falha.

Se você quiser, eu também escrevo a **especificação de API (endpoints/DTOs)** e um **mapa de eventos de tracking** (analytics) dessa tela.
