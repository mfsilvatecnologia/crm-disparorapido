# Roadmap de Desenvolvimento Frontend - LeadsRápido

## 📊 STATUS ATUAL - SETEMBRO 2025

### ✅ SPRINTS CONCLUÍDOS
- **SPRINT 1: CORE USER MANAGEMENT & AUTH** ✅ **CONCLUÍDO**
- **SPRINT 4: SEARCH & SCRAPING ENGINE** ✅ **CONCLUÍDO**

### 📋 PROGRESSO ATUAL
- **Páginas implementadas**: 5/17 (29%)
- **Componentes criados**: 9/60+ (15%)
- **Milestones alcançados**: 2/3 (67%)

### 🎯 PRÓXIMO SPRINT
**SPRINT 2: ENTERPRISE MANAGEMENT** - EmpresasPage, SegmentosPage, PipelinePage

---

## Sumário Executivo

Este documento apresenta um roadmap detalhado para o desenvolvimento das 17 páginas faltantes no frontend, organizado em 6 sprints de 6 dias cada, priorizando valor de negócio e dependências técnicas.

**Total de sprints**: 6 sprints de 6 dias  
**Total de páginas**: 17 páginas principais  
**Total de componentes**: 40+ componentes compartilhados  
**Cronograma**: 36 dias úteis (7-8 semanas)  
**Estratégia**: Valor incremental a cada sprint

---

## 🎯 SPRINT 1: CORE USER MANAGEMENT & AUTH (6 dias)
**🔥 Valor de Negócio**: CRÍTICO | **⚡ Complexidade**: MÉDIA | **🔗 Dependências**: Base para outras funcionalidades

### Objetivos do Sprint
- Estabelecer funcionalidades essenciais de usuário e autenticação
- Criar base sólida para gerenciamento de perfis
- Implementar reset de senha funcional

### 📋 Páginas a Desenvolver
1. ✅ **ResetPasswordPage** `/reset-password` *(2 dias)* - CONCLUÍDO
2. ✅ **UserProfilePage** `/app/profile` *(2 dias)* - CONCLUÍDO
3. ✅ **UsersPage** `/app/users` *(2 dias)* - CONCLUÍDO

### 🧩 Componentes Compartilhados Necessários
```typescript
// Componentes Base para Sprint 1 - CONCLUÍDOS
✅ UserAvatar          // Avatar inteligente com iniciais e status
✅ LoadingState        // Estados de carregamento reutilizáveis  
✅ ErrorState          // Estados de erro com retry
✅ EmptyState          // Estados vazios personalizáveis
✅ PasswordInput       // Input de senha com indicador de força
- ProfileForm           // Formulário de edição de perfil (integrado na página)
- PasswordResetForm     // Formulário de reset de senha (integrado na página)
- UserCard             // Card para exibição de usuários (integrado na página)
- RoleSelector         // Seletor de roles (integrado na página)
```

### 📅 Estimativa de Esforço
- **Dia 1-2**: ResetPasswordPage + integração com backend
  - Implementar formulário de reset
  - Integração com AuthController
  - Validação de token
  - Interface para nova senha
- **Dia 3-4**: UserProfilePage + ProfileForm
  - Formulário de edição de perfil
  - Upload de foto de perfil
  - Configurações pessoais
  - Histórico de atividades
- **Dia 5-6**: UsersPage + componentes de administração
  - Lista de usuários com filtros
  - CRUD de usuários
  - Gestão de roles
  - Ações em lote

### ✅ Critérios de Aceite
- [x] Usuário consegue resetar senha via email
- [x] Usuário consegue editar seu perfil completo
- [x] Admin consegue visualizar e gerenciar usuários
- [x] Sistema de roles funcionando corretamente
- [x] Todas as validações funcionando
- [x] Responsividade em todas as telas
- [ ] Testes unitários com cobertura > 80%

### ⚠️ Riscos e Mitigações
- **Risco**: Integração complexa com backend para auth
- **Mitigação**: Começar com mocks se necessário, usar schemas existentes
- **Risco**: Complexidade do sistema de permissões
- **Mitigação**: Implementar roles básicos primeiro, expandir depois

### 📊 Métricas de Sucesso
- Taxa de conclusão do reset de senha > 90%
- Tempo para editar perfil < 2 minutos
- Zero erros críticos de autenticação

---

## 🎯 SPRINT 2: ENTERPRISE MANAGEMENT (6 dias)
**🔥 Valor de Negócio**: ALTO | **⚡ Complexidade**: MÉDIA-ALTA | **🔗 Dependências**: Usuários estabelecidos

### Objetivos do Sprint
- Completar o módulo de empresas já iniciado
- Criar funcionalidades de segmentação
- Estabelecer base para pipeline

### 📋 Páginas a Desenvolver
1. **EmpresasPage** `/app/empresas` *(2 dias)*
2. **SegmentosPage** `/app/segments` *(2 dias)*
3. **PipelinePage** `/app/pipeline` *(2 dias)*

### 🧩 Componentes Compartilhados Necessários
```typescript
// Componentes para Sprint 2
- EmpresaCard          // Card de empresa com ações
- EmpresaFilters       // Filtros avançados para empresas
- EmpresaDetails       // Detalhes da empresa
- SegmentForm          // Formulário para criar/editar segmentos
- SegmentCard          // Card de segmento com métricas
- PipelineBoard        // Kanban board para pipeline
- StageCard            // Card de estágio do pipeline
- DragDropProvider     // Provider para drag & drop
- LeadCard             // Card de lead no pipeline
```

### 📅 Estimativa de Esforço
- **Dia 1-2**: EmpresasPage + integração com dados existentes
  - Lista de empresas com filtros
  - Integração com CadastroEmpresaPage existente
  - Edição inline de empresas
  - Histórico de interações
- **Dia 3-4**: SegmentosPage + sistema de segmentação
  - CRUD de segmentos
  - Critérios de segmentação
  - Visualização de leads por segmento
  - Métricas de performance
- **Dia 5-6**: PipelinePage + kanban board básico
  - Board com drag & drop
  - Estágios customizáveis
  - Métricas por estágio
  - Filtros e busca

### ✅ Critérios de Aceite
- [ ] Listagem e filtros de empresas funcionais
- [ ] CRUD completo de segmentos
- [ ] Pipeline visual com drag & drop básico
- [ ] Integração com dados de leads existentes
- [ ] Performance otimizada para grandes listas
- [ ] Métricas em tempo real por segmento
- [ ] Responsividade em dispositivos móveis

### ⚠️ Riscos e Mitigações
- **Risco**: Complexidade do drag & drop no pipeline
- **Mitigação**: Usar @dnd-kit (já instalado), começar simples
- **Risco**: Performance com muitos leads no pipeline
- **Mitigação**: Implementar virtualização, paginação

### 📊 Métricas de Sucesso
- Tempo de gestão de pipeline < 2 minutos
- Drag & drop funcionando em 95% dos casos
- Carregamento de listas < 1 segundo

---

## 🎯 SPRINT 3: SALES & CAMPAIGN TOOLS (6 dias)
**🔥 Valor de Negócio**: ALTO | **⚡ Complexidade**: ALTA | **🔗 Dependências**: Empresas e Pipeline

### Objetivos do Sprint
- Implementar ferramentas de vendas
- Criar sistema de campanhas
- Integrar ferramentas de leads

### 📋 Páginas a Desenvolver
1. **SalesToolsPage** `/app/sales-tools` *(1 dia)*
2. **CampanhasPage** `/app/campanhas` *(2 dias)*
3. **CampanhaDetailsPage** `/app/campanhas/:id` *(2 dias)*
4. **LeadToolsPage** `/app/leads/tools` *(1 dia)*

### 🧩 Componentes Compartilhados Necessários
```typescript
// Componentes para Sprint 3
- SalesTemplate        // Templates de vendas
- CampaignCard         // Card de campanha
- CampaignForm         // Formulário de campanha
- CampaignMetrics      // Métricas da campanha
- TemplateEditor       // Editor de templates
- EmailComposer        // Compositor de email integrado
- ScheduleSelector     // Seletor de agendamento
- RecipientsList       // Lista de destinatários
- LeadToolbar          // Barra de ferramentas para leads
- BulkActions          // Ações em lote
- LeadEnrichment       // Ferramenta de enriquecimento
- EmailValidator       // Validador de emails
```

### 📅 Estimativa de Esforço
- **Dia 1**: SalesToolsPage + templates básicos
  - Templates de vendas pré-definidos
  - Biblioteca de scripts
  - Personalizações básicas
- **Dia 2-3**: CampanhasPage + CRUD campanhas
  - Lista de campanhas
  - Formulário de criação
  - Configurações básicas
  - Status e controles
- **Dia 4-5**: CampanhaDetailsPage + métricas
  - Dashboard de campanha
  - Métricas detalhadas
  - Lista de destinatários
  - Histórico de envios
- **Dia 6**: LeadToolsPage + integração
  - Ferramentas de enriquecimento
  - Validação de contatos
  - Análise de qualidade

### ✅ Critérios de Aceite
- [ ] Templates de vendas funcionais
- [ ] CRUD completo de campanhas
- [ ] Métricas em tempo real das campanhas
- [ ] Ferramentas de leads integradas
- [ ] Ações em lote para leads
- [ ] Editor de templates intuitivo
- [ ] Agendamento de campanhas
- [ ] Integração com dados de leads existentes

### ⚠️ Riscos e Mitigações
- **Risco**: Integração complexa com sistema de email
- **Mitigação**: Fase inicial sem email real, focar em templates e estrutura
- **Risco**: Editor de templates muito complexo
- **Mitigação**: Usar editor simples, expandir posteriormente

### 📊 Métricas de Sucesso
- Taxa de conversão de campanhas > 15%
- Tempo para criar campanha < 5 minutos
- Taxa de abertura de templates > 25%

---

## 🎯 SPRINT 4: SEARCH & SCRAPING ENGINE (6 dias)
**🔥 Valor de Negócio**: MUITO ALTO | **⚡ Complexidade**: ALTA | **🔗 Dependências**: Lead tools estabelecidos

### Objetivos do Sprint
- Implementar sistema de busca e scraping
- Criar interface para termos de pesquisa
- Integrar com workers existentes

### 📋 Páginas a Desenvolver
1. ✅ **SearchTermsPage** `/app/search-terms` *(3 dias)* - CONCLUÍDO
2. ✅ **ScrapingPage** `/app/scraping` *(3 dias)* - CONCLUÍDO

### 🧩 Componentes Compartilhados Necessários
```typescript
// Componentes para Sprint 4
- SearchTermForm       // Formulário para termos de busca
- SearchTermsTable     // Tabela de termos
- TermPerformance      // Métricas de performance por termo
- CategoryManager      // Gerenciador de categorias
- ScrapingJobCard      // Card de job de scraping
- ScrapingMetrics      // Métricas de scraping
- JobQueue             // Visualização da fila de jobs
- RealTimeStatus       // Status em tempo real
- ProgressIndicator    // Indicador de progresso avançado
- SegmentTemplates     // Templates por segmento
- GeographicFilters    // Filtros geográficos
- ProxyConfig          // Configuração de proxy
```

### 📅 Estimativa de Esforço
- **Dia 1-3**: SearchTermsPage + gerenciamento completo
  - CRUD de termos de busca
  - Sistema de categorias
  - Performance tracking
  - Filtros geográficos
  - Agendamento de buscas
- **Dia 4-6**: ScrapingPage + integração com workers
  - Interface de controle de scraping
  - Monitor de jobs em tempo real
  - Templates por segmento
  - Configurações avançadas
  - Integração com WorkerMonitorPage

### ✅ Critérios de Aceite
- [x] CRUD completo para termos de pesquisa
- [x] Sistema de categorias funcionando
- [x] Interface de monitoramento de scraping
- [x] Métricas detalhadas de performance
- [x] Integração com WorkerMonitorPage existente
- [x] Controles para iniciar/parar jobs
- [x] Templates por segmento implementados
- [x] Real-time updates funcionando

### ⚠️ Riscos e Mitigações
- **Risco**: Complexidade da integração com workers
- **Mitigação**: Reutilizar código do WorkerMonitorPage existente
- **Risco**: Performance com muitos jobs simultâneos
- **Mitigação**: Implementar paginação e filtros eficientes

### 📊 Métricas de Sucesso
- Precisão de scraping > 95%
- Tempo de configuração de job < 3 minutos
- Zero timeouts em jobs de scraping

---

## 🎯 SPRINT 5: ADMIN & INTEGRATIONS (6 dias)
**🔥 Valor de Negócio**: MÉDIO-ALTO | **⚡ Complexidade**: MÉDIA | **🔗 Dependências**: Sistema base estabelecido

### Objetivos do Sprint
- Completar funcionalidades administrativas
- Implementar sistema de integrações
- Criar feature toggles

### 📋 Páginas a Desenvolver
1. **AdminOrganizationsPage** `/app/admin/organizations` *(2 dias)*
2. **FeatureTogglesPage** `/app/admin/features` *(2 dias)*
3. **ChatwootIntegrationPage** `/app/integrations/chatwoot` *(2 dias)*

### 🧩 Componentes Compartilhados Necessários
```typescript
// Componentes para Sprint 5
- OrganizationCard     // Card de organização com métricas
- OrganizationMetrics  // Métricas detalhadas da org
- FeatureToggle        // Toggle individual de feature
- ToggleHistory        // Histórico de mudanças
- RolloutConfig        // Configuração de rollout
- IntegrationCard      // Card de integração
- WebhookForm          // Formulário para webhooks
- ApiKeyManager        // Gerenciador de chaves API
- AuditLog             // Log de auditoria
- ConfigurationPanel   // Painel de configuração
```

### 📅 Estimativa de Esforço
- **Dia 1-2**: AdminOrganizationsPage + métricas
  - Lista de organizações
  - Métricas por organização
  - Ações administrativas
  - Relatórios de uso
- **Dia 3-4**: FeatureTogglesPage + sistema de toggles
  - Lista de feature flags
  - Controles de ativação
  - Rollout gradual
  - Histórico de mudanças
- **Dia 5-6**: ChatwootIntegrationPage + webhooks
  - Configuração de webhook
  - Mapeamento de dados
  - Teste de integração
  - Logs de sincronização

### ✅ Critérios de Aceite
- [ ] Admin pode gerenciar todas as organizações
- [ ] Sistema de feature toggles funcional
- [ ] Integração básica com Chatwoot
- [ ] Webhooks configuráveis
- [ ] Logs de auditoria visíveis
- [ ] Rollout gradual funcionando
- [ ] Métricas por organização precisas

### ⚠️ Riscos e Mitigações
- **Risco**: Complexidade das integrações externas
- **Mitigação**: Começar com configuração básica, expandir posteriormente
- **Risco**: Segurança das chaves API
- **Mitigação**: Implementar criptografia, logs de acesso

### 📊 Métricas de Sucesso
- Uptime de integrações > 99%
- Tempo de configuração de integração < 10 minutos
- Zero vazamentos de dados sensíveis

---

## 🎯 SPRINT 6: BILLING & SETTINGS (6 dias)
**🔥 Valor de Negócio**: CRÍTICO PARA MONETIZAÇÃO | **⚡ Complexidade**: ALTA | **🔗 Dependências**: Todas as funcionalidades anteriores

### Objetivos do Sprint
- Implementar sistema de cobrança completo
- Finalizar configurações do sistema
- Preparar para lançamento

### 📋 Páginas a Desenvolver
1. **BillingPage** `/app/billing` *(3 dias)*
2. **SettingsPage** `/app/settings` *(3 dias)*

### 🧩 Componentes Compartilhados Necessários
```typescript
// Componentes para Sprint 6
- PlanCard             // Card de plano de assinatura
- BillingHistory       // Histórico de cobrança
- UsageMetrics         // Métricas de uso detalhadas
- PaymentForm          // Formulário de pagamento
- InvoiceViewer        // Visualizador de faturas
- SettingsForm         // Formulário de configurações
- ThemeCustomizer      // Customizador de tema
- NotificationSettings // Configurações de notificação
- SystemPreferences    // Preferências do sistema
- SecuritySettings     // Configurações de segurança
```

### 📅 Estimativa de Esforço
- **Dia 1-3**: BillingPage + integração de pagamento
  - Planos de assinatura
  - Histórico de pagamentos
  - Métricas de uso
  - Gestão de faturas
  - Upgrade/downgrade de planos
- **Dia 4-6**: SettingsPage + customizações avançadas
  - Configurações gerais
  - Customização de tema
  - Notificações
  - Integrações
  - Configurações de segurança

### ✅ Critérios de Aceite
- [ ] Sistema de billing completo e funcional
- [ ] Múltiplos planos de assinatura
- [ ] Histórico de pagamentos preciso
- [ ] Configurações abrangentes
- [ ] Customização de tema
- [ ] Sistema de notificações
- [ ] Integração com gateway de pagamento
- [ ] Métricas de uso em tempo real

### ⚠️ Riscos e Mitigações
- **Risco**: Integração complexa com gateway de pagamento
- **Mitigação**: Usar biblioteca estabelecida (Stripe), começar com sandbox
- **Risco**: Segurança de dados de pagamento
- **Mitigação**: Seguir padrões PCI, não armazenar dados sensíveis

### 📊 Métricas de Sucesso
- Taxa de conversão para pagante > 25%
- Tempo para completar pagamento < 3 minutos
- Zero falhas críticas no sistema de billing

---

## 📊 RESUMO EXECUTIVO DO ROADMAP

### 🎯 Distribuição de Valor por Sprint
1. **Sprint 1**: Base sólida (CRÍTICO) - Fundação do sistema
2. **Sprint 2**: Core business (ALTO) - Funcionalidades principais
3. **Sprint 3**: Revenue generation (ALTO) - Ferramentas de vendas
4. **Sprint 4**: Diferencial competitivo (MUITO ALTO) - Automação inteligente
5. **Sprint 5**: Escalabilidade (MÉDIO-ALTO) - Admin e integrações
6. **Sprint 6**: Monetização (CRÍTICO) - Sustentabilidade financeira

### 🧩 Componentes Reutilizáveis por Sprint
- **Sprint 1**: 7 componentes (User management)
- **Sprint 2**: 9 componentes (Business logic)
- **Sprint 3**: 12 componentes (Sales tools)
- **Sprint 4**: 12 componentes (Data intelligence)
- **Sprint 5**: 10 componentes (Administration)
- **Sprint 6**: 10 componentes (Monetization)

**Total**: 60+ componentes compartilhados principais

### 📈 Evolução de Complexidade
```
Sprint 1: Média  ███████░░░
Sprint 2: Média-Alta ████████░░
Sprint 3: Alta ████████░░
Sprint 4: Alta ██████████
Sprint 5: Média ███████░░░
Sprint 6: Alta █████████░
```

### 🚀 Marcos de Entrega (Milestones)

#### Milestone 1 - Sprint 1 ✅ CONCLUÍDO
**"Base de Usuários e Auth"**
- ✅ Sistema de usuários completo
- ✅ Autenticação e autorização funcionais
- ✅ Gerenciamento de perfis
- **Valor**: Base sólida para todas as funcionalidades

#### Milestone 2 - Sprint 4 ✅ CONCLUÍDO
**"Automação Inteligente"**
- ✅ Sistema de search terms ativo
- ✅ Scraping automatizado funcionando
- ✅ Ferramentas de lead intelligence
- **Valor**: Diferencial competitivo estabelecido

#### Milestone 3 - Sprint 6 (Dia 36)
**"Produto Completo"**
- ✅ Sistema de billing ativo
- ✅ Todas as configurações implementadas
- ✅ Integrações funcionais
- **Valor**: Produto pronto para scale comercial

---

## 📊 Métricas de Sucesso por Sprint

### Sprint 1 - User Management
- **Performance**: Carregamento de páginas < 2s
- **Usabilidade**: Taxa de conclusão do onboarding > 90%
- **Qualidade**: Cobertura de testes > 80%

### Sprint 2 - Enterprise Management
- **Performance**: Listagem de empresas < 1s
- **Usabilidade**: Tempo de gestão de pipeline < 2min
- **Qualidade**: Zero bugs críticos no drag & drop

### Sprint 3 - Sales Tools
- **Performance**: Criação de campanha < 30s
- **Usabilidade**: Taxa de conversão de campanhas > 15%
- **Qualidade**: Templates funcionando 100%

### Sprint 4 - Automation
- **Performance**: Jobs de scraping com 95% de precisão
- **Usabilidade**: Configuração de scraping < 3min
- **Qualidade**: Zero timeouts críticos

### Sprint 5 - Admin & Integrations
- **Performance**: Uptime de integrações > 99%
- **Usabilidade**: Configuração de integração < 10min
- **Qualidade**: Logs de auditoria 100% precisos

### Sprint 6 - Monetization
- **Performance**: Processamento de pagamento < 5s
- **Usabilidade**: Taxa de conversão para pagante > 25%
- **Qualidade**: Zero falhas no sistema de billing

---

## ⚠️ Dependências Críticas

### Técnicas
- ✅ API endpoints alinhados com schemas existentes
- ✅ Sistema de permissões bem definido
- ✅ Infraestrutura de workers estável
- ❓ Gateway de pagamento configurado (Sprint 6)

### Negócio
- ✅ Definições de roles e permissões
- ❓ Planos de assinatura definidos (Sprint 6)
- ❓ Integrações terceirizadas aprovadas (Sprint 5)
- ✅ Templates de email/comunicação

### Recursos
- ✅ Time de desenvolvimento disponível
- ❓ Designer para review de UX
- ❓ QA para testes de integração
- ✅ DevOps para deploy e monitoramento

---

## 🛡️ Plano de Contingência

### Estratégias de Risco
1. **Rollback Plan**: Cada página tem fallback para "Em desenvolvimento"
2. **Feature Flags**: Implementadas no Sprint 5 para controle granular
3. **Performance Monitoring**: Métricas em tempo real desde Sprint 1
4. **User Feedback**: Sistema de feedback integrado em cada página

### Planos B por Sprint
- **Sprint 1**: Se auth complexo, implementar versão simplificada
- **Sprint 2**: Se drag & drop falhar, usar interface simples
- **Sprint 3**: Se integração email falhar, focar em templates
- **Sprint 4**: Se scraping falhar, implementar interface manual
- **Sprint 5**: Se integrações falharem, criar mocks funcionais
- **Sprint 6**: Se billing falhar, implementar versão freemium

---

## 🎯 Próximos Passos Imediatos

### Pré-Sprint 1 (Preparação)
1. **Semana -1**: 
   - [ ] Validar schemas de API com backend
   - [ ] Configurar ambiente de desenvolvimento
   - [ ] Criar design system inicial
   - [ ] Configurar pipeline CI/CD

2. **Dia -1**: 
   - [ ] Sprint planning detalhado
   - [ ] Definir Definition of Done
   - [ ] Preparar ambiente de testes
   - [ ] Kickoff com toda a equipe

### Durante os Sprints
1. **Daily**: Standup de 15min com foco em blockers
2. **Mid-Sprint**: Review de progresso e ajustes
3. **End Sprint**: Demo, retrospective e planning

### Pós-Sprint 6 (Lançamento)
1. **Semana +1**: 
   - [ ] Deploy em produção
   - [ ] Monitoramento intensivo
   - [ ] Coleta de feedback de usuários
   - [ ] Análise de métricas

---

## 📋 Checklist Final de Entrega

### Funcionalidades ✅
- [ ] 17 páginas implementadas e funcionais
- [ ] 60+ componentes reutilizáveis criados
- [ ] Sistema de autenticação completo
- [ ] Integração com todos os endpoints do backend
- [ ] Sistema de billing funcional

### Qualidade ✅
- [ ] Cobertura de testes > 80% em componentes críticos
- [ ] Performance: todas as páginas < 2s de carregamento
- [ ] Responsividade: funcionando em mobile, tablet, desktop
- [ ] Acessibilidade: seguindo padrões WCAG básicos
- [ ] SEO: meta tags e estrutura adequadas

### Documentação ✅
- [ ] Documentação técnica de componentes
- [ ] Guia de usuário básico
- [ ] Documentação de APIs
- [ ] Runbook para operação

### Deploy ✅
- [ ] Ambiente de produção configurado
- [ ] Monitoramento e alertas ativos
- [ ] Backup e recuperação testados
- [ ] SSL e segurança configurados

---

**Este roadmap está otimizado para maximizar valor de negócio enquanto mantém a qualidade técnica e a experiência do usuário. Cada sprint é independente mas contribui para o objetivo maior de criar uma plataforma completa de geração e gestão de leads.**

**Estimativa Total**: 36 dias úteis | 6 sprints | 17 páginas | 60+ componentes