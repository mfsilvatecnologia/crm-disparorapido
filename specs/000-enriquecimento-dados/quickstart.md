# Quickstart (Phase 1)

1) Instalar dependências
```sh
npm install
```

2) Rodar testes em ordem TDD (failing-first)
```sh
npm run test:contract
npm run test:integration
npm run test:run
npm run lint
npm run build
```

3) Desenvolvimento
```sh
npm run dev
```
- Usa Vite; variáveis sensíveis permanecem no backend. 
- Polling: 3s para enriquecimento, 5s para investigação; backoff 1s/2s/4s, máximo 3 tentativas.

4) Estrutura esperada
```
src/features/enrichment/
  components/
  pages/
  services/
  hooks/
  types/
  index.ts
```

5) Critérios de sucesso (SC)
- SC-001..SC-006: latências e feedback de UI conforme definidos em `spec.md`.
