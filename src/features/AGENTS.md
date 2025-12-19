# Guia Padrão para Agentes de IA e Desenvolvedores - Features

Este documento serve como um guia padrão para a compreensão, desenvolvimento e manutenção de módulos de feature **em todo o diretório `/src/features`**. Ele foi projetado para garantir consistência arquitetônica, facilitar a colaboração e otimizar a interação de agentes de IA com o código-base, fornecendo um modelo unificado de como as features devem ser estruturadas e desenvolvidas.

## 1. Princípios Arquitetônicos

Todas as features seguem uma arquitetura baseada em módulos (feature-based architecture), promovendo:
-   **Separação de Preocupações:** Cada módulo é autocontido e focado em uma funcionalidade específica.
-   **Modularidade:** Facilita a compreensão, manutenção e reusabilidade do código.
-   **Testabilidade:** Componentes e lógicas isoladas são mais fáceis de testar.
-   **Consistência:** Um padrão unificado para toda a aplicação.

## 2. Estrutura de Diretórios Padrão para Cada Feature

A estrutura interna de **cada módulo de feature** (`src/features/[nome-da-feature]/`) deve seguir este padrão:

```
src/features/[nome-da-feature]/
├── components/      # Componentes React específicos e reutilizáveis DENTRO da feature.
│   ├── [nome-do-componente].tsx
│   └── index.ts     # Exporta todos os componentes desta pasta.
├── contexts/        # Contextos React para gerenciamento de estado local da feature.
│   ├── [nome-do-contexto]-context.tsx
│   └── index.ts     # Exporta todos os contextos desta pasta.
├── hooks/           # Hooks React customizados para encapsular lógica reusável da feature.
│   ├── use[NomeDoHook].ts
│   └── index.ts     # Exporta todos os hooks desta pasta.
├── pages/           # Componentes de página que representam rotas/views da feature.
│   ├── [NomeDaPagina].tsx
│   └── index.ts     # Exporta todas as páginas desta pasta.
├── services/        # Módulos para lógica de negócio, chamadas de API, e manipulação de dados.
│   ├── [nome-do-servico].ts
│   └── index.ts     # Exporta todos os serviços desta pasta.
├── types/           # Definições de tipos e interfaces TypeScript específicos da feature.
│   ├── [nome-do-tipo].d.ts
│   └── index.ts     # Exporta todos os tipos desta pasta.
├── contracts/       # (Opcional) Schemas de validação (e.g., Zod) ou contratos de API.
│   ├── [nome-do-contrato].ts
│   └── index.ts     # Exporta todos os contratos desta pasta.
├── tests/           # (Recomendado) Testes unitários e de integração específicos da feature.
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── ...
├── index.ts         # Ponto de entrada público da feature (re-exporta o que é visível externamente).
└── README.md        # (Opcional) Documentação específica da feature, incluindo seu propósito.
```

## 3. Diretrizes de Contribuição

Ao adicionar ou modificar código em uma feature:

### 3.1. Criando um Novo Componente
-   Coloque o arquivo `.tsx` em `components/`.
-   Exporte o componente através de `components/index.ts`.
-   Se o componente for complexo e possuir lógica própria, considere criar um hook em `hooks/` ou um serviço em `services/`.

### 3.2. Criando um Novo Hook
-   Coloque o arquivo `.ts` em `hooks/`. Prefira o prefixo `use` (e.g., `useAuth.ts`).
-   Exporte o hook através de `hooks/index.ts`.

### 3.3. Criando um Novo Serviço
-   Coloque o arquivo `.ts` em `services/`.
-   Exporte o serviço através de `services/index.ts`.

### 3.4. Definindo Novos Tipos
-   Coloque o arquivo `.d.ts` ou `.ts` contendo as interfaces/tipos em `types/`.
-   Exporte os tipos através de `types/index.ts`.

### 3.5. `index.ts` da Feature
-   O `index.ts` principal da feature deve re-exportar apenas o que precisa ser consumido por outras features ou pela aplicação principal (e.g., as páginas, hooks globais, serviços públicos).

## 4. Diretrizes de Teste

-   **Testes Colocalizados:** Crie testes unitários e de integração na pasta `tests/` dentro da própria feature.
-   **Estrutura de Testes:** Espelhe a estrutura de diretórios da feature dentro de `tests/` (e.g., `tests/components/`, `tests/hooks/`).
-   **Cobertura:** Busque uma alta cobertura de testes para garantir a robustez da feature.

## 5. Como os Agentes de IA Devem Usar Este Guia

Agentes de IA devem:
-   **Consultar este `AGENTS.md`** ao iniciar qualquer tarefa em qualquer feature dentro de `/src/features`.
-   **Compreender o propósito da feature específica** em que estão trabalhando, buscando essa informação em um `README.md` localizado dentro da própria feature ou através de outras fontes de documentação do projeto.
-   **Adicionar novos arquivos e diretórios** de acordo com a estrutura padrão definida aqui.
-   **Garantir que todas as exportações** sejam feitas através dos respectivos `index.ts` de cada subdiretório e do `index.ts` principal da feature.
-   **Priorizar a criação de testes** na pasta `tests/` da feature para qualquer nova funcionalidade ou correção.
-   **Manter a consistência** com os princípios arquitetônicos e a estrutura de diretórios apresentados.

Ao seguir estas diretrizes, garantimos um desenvolvimento mais eficiente, claro e manutenível para todos os envolvidos.