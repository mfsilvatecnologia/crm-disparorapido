# Contratos de API - CRM Management

Este diretório contém testes de contrato que validam a conformidade da API backend com as expectativas do frontend.

## Arquivos de Contrato

| Arquivo | Entidade | Endpoints Testados |
|---------|----------|-------------------|
| `opportunities.contract.ts` | Oportunidades | POST, GET, GET/:id, PATCH/:id, POST/:id/win, POST/:id/lose |
| `customers.contract.ts` | Clientes | GET, GET/:id, PATCH/:id, PATCH/:id/status, GET/:id/timeline, GET/:id/health-score |
| `contacts.contract.ts` | Contatos | POST, GET, PATCH/:id, DELETE/:id, POST/:id/set-primary |
| `activities.contract.ts` | Atividades | POST, GET, PATCH/:id, DELETE/:id |
| `contracts.contract.ts` | Contratos | POST, GET, GET/near-renewal, PATCH/:id, POST/:id/renew |

## Executar Testes de Contrato

```bash
# Executar todos os contratos
npm run test:contract

# Executar contrato específico
npm run test:contract -- opportunities.contract

# Executar com watch mode
npm run test:contract -- --watch

# Executar com coverage
npm run test:contract -- --coverage
```

## Estrutura de um Teste de Contrato

```typescript
describe('Endpoint API', () => {
  it('deve validar schema da resposta', async () => {
    const response = await fetch('/api/endpoint');
    const data = await response.json();

    // Validar com Zod schema
    const parsed = responseSchema.parse(data);
    expect(parsed).toBeDefined();
  });

  it('deve retornar erro para dados inválidos', async () => {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });

    expect(response.status).toBe(400);
  });
});
```

## Convenções

1. **Schemas Zod**: Todos os contratos usam Zod para validação de schema
2. **Status Codes**: Validar HTTP status codes apropriados (200, 201, 400, 404, etc.)
3. **Autenticação**: Incluir token JWT em headers quando necessário
4. **Cleanup**: Limpar dados de teste quando possível
5. **Independência**: Testes devem ser independentes e executáveis em qualquer ordem

## Próximos Passos

1. **Implementar contratos faltantes**: `customers.contract.ts`, `contacts.contract.ts`, `activities.contract.ts`, `contracts.contract.ts`
2. **Configurar CI**: Executar testes de contrato no pipeline
3. **Mock Server**: Considerar uso de Mock Service Worker (MSW) para desenvolvimento offline

## Referências

- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [Zod](https://zod.dev/)
- [Vitest](https://vitest.dev/)
- Backend Swagger: `/leadsrapido_backend/swagger.json`
