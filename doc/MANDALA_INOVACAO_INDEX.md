# Mandala da Inovação - Índice de Documentação

> **Status:** Especificação completa - Pronto para implementação
> **Data:** 2025-10-19
> **Próximo passo:** Iniciar Fase 1 do desenvolvimento (ELO 1 - Busca)

---

## 📚 Documentação Disponível

### 1. [Especificação da Feature](./MANDALA_INOVACAO_SPEC.md)

**Descrição:** Documento completo com visão geral, arquitetura, modelos de dados e funcionalidades.

**Conteúdo:**
- 📋 Visão Geral e Objetivos
- 🏗️ Arquitetura completa da feature
- 📊 Modelos de dados (TypeScript types)
- 🎨 Componentes principais
- 🤖 Integração com IA (Mastra Agents)
- 🎯 Funcionalidades por tela
- 📱 Responsividade
- 🔒 Segurança e Validação
- 🧪 Estratégia de testes
- 🚀 Fases de implementação
- 🎨 Design System

**Para quem:** Product Managers, Tech Leads, Desenvolvedores

---

### 2. [Wireframes e Fluxos](./MANDALA_INOVACAO_WIREFRAMES.md)

**Descrição:** Wireframes textuais ASCII de todas as telas principais e fluxos de usuário.

**Conteúdo:**
- 📐 Wireframes de cada tela (Dashboard, ELO pages, Canvas pages)
- 🔄 Fluxos de usuário completos
- 🎨 Componentes reutilizáveis
- 📱 Breakpoints de responsividade
- 🎬 Animações e interações
- ✅ Estados e feedback visual

**Para quem:** UX/UI Designers, Frontend Developers

---

### 3. [Guia de Implementação](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md)

**Descrição:** Roteiro técnico passo a passo para implementar a feature.

**Conteúdo:**
- 🎯 Pré-requisitos técnicos
- 🏗️ Setup e estrutura base
- 📦 Componentes base (código completo)
- 🔧 Implementação por ELO
- 🤖 Configuração de Mastra Agents
- 🧪 Testes (unit, integration, e2e)
- 📦 Deployment checklist
- 🐛 Troubleshooting
- 📈 Roadmap de evoluções

**Para quem:** Desenvolvedores, DevOps

---

### 4. [Templates da Mandala](./templates-mandala/)

**Descrição:** Documentação original das metodologias e prompts para cada ELO.

**Conteúdo:**
- [README.md](./templates-mandala/README.md) - Índice geral
- [templates1.md](./templates-mandala/templates1.md) - Resumo de todos os templates
- [ELO 1 - Busca](./templates-mandala/mandala-da-inovacao/elo-1-busca/)
  - templates.md - Teoria do Encontro, Funil da Realização
  - prompts.md - Prompts para IA
- [ELO 2 - Conexões](./templates-mandala/mandala-da-inovacao/elo-2-conexoes/)
  - templates.md - Canvas 3 I's, Meetup Canvas
  - prompts.md - Prompts para IA
- [ELO 3 - Visão](./templates-mandala/mandala-da-inovacao/elo-3-visao/)
  - templates.md - MVV, 7 Fontes, Golden Circle
  - prompts.md - Prompts para IA
- [ELO 4 - Desenvolvimento](./templates-mandala/mandala-da-inovacao/elo-4-desenvolvimento/)
  - templates.md - Six Thinking Hats, SWOT, AVI
  - prompts.md - Prompts para IA
- [ELO 5 - Pitch](./templates-mandala/mandala-da-inovacao/elo-5-pitch/)
  - templates.md - Pitch Canvas, SIM
  - prompts.md - Prompts para IA
- [ELO 6 - Encontro](./templates-mandala/mandala-da-inovacao/elo-6-encontro/)
  - templates.md - Mapa Ecossistema, Engajamento
  - prompts.md - Prompts para IA

**Para quem:** Todos (referência metodológica)

---

## 🎯 Quick Start para Desenvolvedores

### 1. Leia primeiro
1. [MANDALA_INOVACAO_SPEC.md](./MANDALA_INOVACAO_SPEC.md) - Seções "Visão Geral" e "Arquitetura"
2. [MANDALA_INOVACAO_WIREFRAMES.md](./MANDALA_INOVACAO_WIREFRAMES.md) - Dashboard e fluxos principais
3. [MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md) - Fase 1

### 2. Prepare o ambiente
```bash
# Instalar dependências
npm install @copilotkit/react-core @copilotkit/react-ui
npm install @mastra/core @ai-sdk/openai
npm install zod

# Configurar .env
cp .env.example .env
# Adicionar OPENAI_API_KEY
```

### 3. Comece pela Fase 1
- Criar estrutura de diretórios
- Definir types base
- Criar schemas Zod
- Configurar API client
- Implementar hooks customizados

### 4. Siga o guia passo a passo
[MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md)

---

## 🎨 Quick Start para Designers

### 1. Leia primeiro
1. [MANDALA_INOVACAO_WIREFRAMES.md](./MANDALA_INOVACAO_WIREFRAMES.md) - Todos os wireframes
2. [MANDALA_INOVACAO_SPEC.md](./MANDALA_INOVACAO_SPEC.md) - Seção "Design System"

### 2. Crie os mockups de alta fidelidade
Baseie-se nos wireframes ASCII e aplique o design system:
- Cores por ELO (definidas na spec)
- Componentes UI existentes (Card, Badge, Button, etc.)
- Responsividade (desktop, tablet, mobile)
- Estados (loading, error, success)
- Animações (transições, feedback visual)

### 3. Ferramentas sugeridas
- Figma (preferencial)
- Adobe XD
- Sketch

### 4. Entregáveis
- Mockups de alta fidelidade de todas as telas
- Protótipo interativo (opcional, mas recomendado)
- Design tokens / style guide
- Assets exportados (ícones, imagens)

---

## 📊 Quick Start para Product Managers

### 1. Leia primeiro
1. [MANDALA_INOVACAO_SPEC.md](./MANDALA_INOVACAO_SPEC.md) - Completo
2. [MANDALA_INOVACAO_WIREFRAMES.md](./MANDALA_INOVACAO_WIREFRAMES.md) - Fluxos de usuário

### 2. Valide a especificação
- Objetivos de negócio alinhados?
- Funcionalidades cobrem necessidades dos usuários?
- Fases de implementação fazem sentido?
- KPIs definidos são adequados?

### 3. Planeje o roadmap
- Fase 1 (MVP - ELO 1): 2-3 semanas
- Fase 2 (ELOs 2-3): 2 semanas
- Fase 3 (ELOs 4-6): 3 semanas
- Fase 4 (Polimento): 1-2 semanas
- **Total:** 4-6 semanas

### 4. Defina métricas de sucesso
- Taxa de conclusão de ELOs
- Tempo médio por canvas
- NPS da feature
- Retenção (usuários que voltam)
- Interações com IA (mensagens enviadas)

---

## 🗺️ Mapa de Navegação

### Por Tipo de Informação

#### Arquitetura
- [Especificação → Arquitetura da Feature](./MANDALA_INOVACAO_SPEC.md#🏗️-arquitetura-da-feature)
- [Especificação → Estrutura de Diretórios](./MANDALA_INOVACAO_SPEC.md#estrutura-de-diretórios)

#### Modelos de Dados
- [Especificação → Modelos de Dados](./MANDALA_INOVACAO_SPEC.md#📊-modelos-de-dados)
- [Implementação → Types Base](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md#12-definir-types-base)
- [Implementação → Schemas de Validação](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md#13-criar-schemas-de-validação)

#### UI/UX
- [Wireframes → Dashboard](./MANDALA_INOVACAO_WIREFRAMES.md#1-dashboard---mandalaoverview)
- [Wireframes → Canvas Desktop](./MANDALA_INOVACAO_WIREFRAMES.md#4-canvas-page---desktop-layout-teoria-do-encontro)
- [Wireframes → Canvas Mobile](./MANDALA_INOVACAO_WIREFRAMES.md#5-canvas-page---mobile-layout-teoria-do-encontro)
- [Especificação → Design System](./MANDALA_INOVACAO_SPEC.md#🎨-design-system)

#### Backend/IA
- [Especificação → Integração com IA](./MANDALA_INOVACAO_SPEC.md#🤖-integração-com-ia-mastra-agents)
- [Implementação → Mastra Agents](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md#fase-4-backend---mastra-agents-3-4-dias)
- [Templates → Prompts por ELO](./templates-mandala/mandala-da-inovacao/)

#### Testes
- [Implementação → Testes](./MANDALA_INOVACAO_IMPLEMENTATION_GUIDE.md#🧪-testes)
- [Especificação → Estratégia de Testes](./MANDALA_INOVACAO_SPEC.md#🧪-testes)

---

## 📋 Checklist de Implementação

### Preparação
- [ ] Equipe alocada (frontend, backend, design)
- [ ] Ambiente de desenvolvimento configurado
- [ ] OpenAI API key obtida
- [ ] Repositório criado/branch criada
- [ ] Documentação lida e entendida

### Fase 1: MVP - ELO 1 (2-3 semanas)
- [ ] Estrutura de diretórios criada
- [ ] Types base definidos
- [ ] Schemas Zod criados
- [ ] API client configurado
- [ ] Hooks customizados implementados
- [ ] Componentes base (MandalaNavigation, CanvasContainer)
- [ ] ELO 1 completo:
  - [ ] Teoria do Encontro Canvas
  - [ ] Funil da Realização Canvas
  - [ ] Autoconhecimento Form
- [ ] Agente ELO 1 configurado no backend
- [ ] Endpoints API criados
- [ ] Testes unitários básicos
- [ ] Code review e merge

### Fase 2: ELOs 2 e 3 (2 semanas)
- [ ] ELO 2 - Conexões implementado
- [ ] ELO 3 - Visão implementado
- [ ] Agentes configurados
- [ ] Navegação entre ELOs funcional
- [ ] Tracking de progresso
- [ ] Testes de integração

### Fase 3: ELOs 4, 5 e 6 (3 semanas)
- [ ] ELO 4 - Desenvolvimento implementado
- [ ] ELO 5 - Pitch implementado
- [ ] ELO 6 - Encontro implementado
- [ ] Todos os agentes configurados
- [ ] Exportação em PDF
- [ ] Analytics básico
- [ ] Testes e2e

### Fase 4: Polimento (1-2 semanas)
- [ ] Refinamento UX/UI
- [ ] Otimização de performance
- [ ] Integração com leads
- [ ] Features avançadas (compartilhamento, templates)
- [ ] Testes finais
- [ ] Deploy em produção

---

## 🤝 Contribuindo

### Como adicionar novos canvas

1. Definir types em `types/elo-X.types.ts`
2. Criar schema Zod em `schemas/elo-X.schema.ts`
3. Implementar componente em `components/elo-X/`
4. Configurar agente em Mastra
5. Adicionar prompts na documentação
6. Criar testes
7. Atualizar esta documentação

### Como reportar issues

Use o template:

```markdown
**Tipo:** Bug / Feature Request / Dúvida
**Componente:** [Nome do componente ou ELO]
**Descrição:** [Descrição detalhada]
**Passos para reproduzir:** (se bug)
**Comportamento esperado:**
**Screenshots:** (se aplicável)
```

---

## 📞 Contatos

### Responsáveis

- **Product Lead:** [Nome] <email@leadsrapido.com>
- **Tech Lead:** [Nome] <email@leadsrapido.com>
- **Design Lead:** [Nome] <email@leadsrapido.com>

### Reuniões

- **Daily Standup:** Diariamente, 9h30
- **Sprint Planning:** Segundas, 10h
- **Sprint Review:** Sextas, 16h
- **Retrospectiva:** Sextas, 17h

---

## 📚 Referências Externas

### Metodologias
- [Mandala da Inovação - Livro](https://www.amazon.com.br/Mandala-Inova%C3%A7%C3%A3o-Fernando-Seabra/dp/...)
- [Teoria do Encontro - Fernando Seabra](https://fernandoseabra.com/)

### Tecnologias
- [CopilotKit Documentation](https://docs.copilotkit.ai/)
- [Mastra AI Documentation](https://mastra.ai/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)

### Inspirações
- [Lead Agent Feature](/src/features/lead-agent/README.md) - Feature similar já implementada

---

## 🎓 Glossário

| Termo | Definição |
|-------|-----------|
| **ELO** | Etapa da Mandala da Inovação (Busca, Conexões, Visão, Desenvolvimento, Pitch, Encontro) |
| **Canvas** | Ferramenta/template específico dentro de um ELO (ex: Teoria do Encontro, Pitch Canvas) |
| **Mandala** | Metodologia completa de inovação com 6 ELOs |
| **Essência (E)** | O que a pessoa é intrinsecamente (Teoria do Encontro) |
| **Vocação (V)** | Para que a pessoa é chamada (Teoria do Encontro) |
| **Day One (D)** | Momento definidor (Teoria do Encontro) |
| **SIM** | Sistema Integrado de Monetização (ELO 5) |
| **MVV** | Missão, Visão e Valores (ELO 3) |
| **SWOT** | Strengths, Weaknesses, Opportunities, Threats (ELO 4) |

---

## 📝 Changelog

### 2025-10-19
- ✨ Criação inicial da documentação completa
- 📝 Especificação da feature
- 🎨 Wireframes de todas as telas
- 🔧 Guia de implementação técnica
- 📚 Índice navegável

---

## ⭐ Próximos Passos

1. **Imediato:**
   - [ ] Review da documentação pela equipe
   - [ ] Aprovação final do Product Owner
   - [ ] Kickoff meeting com toda a equipe

2. **Esta Semana:**
   - [ ] Setup do ambiente de desenvolvimento
   - [ ] Criação de mockups de alta fidelidade
   - [ ] Início do desenvolvimento (Fase 1)

3. **Próximas 2-3 Semanas:**
   - [ ] Desenvolvimento do MVP (ELO 1)
   - [ ] Testes e ajustes
   - [ ] Deploy em staging para validação

---

**Última atualização:** 2025-10-19
**Versão da documentação:** 1.0.0
**Status:** ✅ Completa e aprovada
**Pronto para:** 🚀 Implementação

