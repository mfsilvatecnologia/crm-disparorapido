# LeadsRápido Frontend Constitution

## Princípios Fundamentais

### I. Componentização e Reutilização
Todo novo recurso deve ser implementado como componente React reutilizável, preferencialmente em `src/components/` ou `src/pages/`.
- Componentes devem ser funcionais, com tipagem TypeScript.
- Hooks customizados devem ser criados em `src/hooks/`.

### II. Estado e Contexto
Estados globais devem ser gerenciados via React Context API ou bibliotecas aprovadas (ex: Zustand, Redux), sempre tipados.
Evitar prop drilling excessivo.

### III. Testes Primeiro (TDD)
Todo componente, hook ou utilitário deve ter testes automatizados (Jest/React Testing Library) antes da implementação final.
- Cobertura mínima: 80% linhas/branches.
- Testes de integração para fluxos críticos (ex: login, dashboard).

### IV. Padronização Visual e Estilo
Utilizar Tailwind CSS para todos os estilos.
- Proibido CSS inline ou arquivos CSS avulsos (exceto resets globais).
- Seguir design tokens definidos no projeto.

### V. Observabilidade e Qualidade
Logs de erro devem ser centralizados (ex: Sentry, console.error padronizado).
Utilizar ESLint, Prettier e Husky para garantir qualidade e padronização de código.

### VI. Simplicidade e Clareza
Evitar abstrações desnecessárias.
Priorizar legibilidade e documentação em comentários JSDoc.

## Requisitos de Stack e Segurança
- React 18+, TypeScript 5+, Vite, Tailwind, Supabase.
- Proibido dependências não auditadas ou sem aprovação.
- Dados sensíveis nunca devem ser expostos no frontend.

## Fluxo de Desenvolvimento
1. Criar branch a partir de `main` (`feature/nome` ou `fix/nome`).
2. Especificar feature usando `/specs` e templates.
3. Planejar implementação com `/plan`.
4. Implementar com TDD, commitando frequentemente.
5. Abrir PR com descrição clara, checklist de testes e screenshots.
6. Revisão obrigatória por pelo menos 1 dev.
7. Merge apenas se CI/CD aprovar (build, lint, test).
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->