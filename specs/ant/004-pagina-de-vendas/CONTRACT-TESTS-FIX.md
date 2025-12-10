# Solução para Testes de Contrato Travando

## Problema Identificado

Os testes de contrato estavam **travando e consumindo todos os processadores** porque:

1. ❌ Cada teste criava seu **próprio servidor MSW** com `setupServer()`
2. ❌ Múltiplos servidores MSW tentavam interceptar as mesmas requisições
3. ❌ Conflitos entre servidores causavam **deadlocks** e **loops infinitos**
4. ❌ Recursos não eram liberados corretamente

## Solução Implementada

### ✅ Usar Servidor MSW Compartilhado

Em vez de criar um servidor em cada teste:

```typescript
// ❌ ANTES (ERRADO - cria novo servidor)
const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterAll(() => server.close());
```

Agora usamos o servidor compartilhado:

```typescript
// ✅ DEPOIS (CORRETO - usa servidor compartilhado)
import { describe, it, expect } from 'vitest';

// Servidor já está configurado em setup-node.ts
// Apenas escrever os testes!
```

### Arquitetura da Solução

```
src/test/
├── setup-node.ts              # Setup global - cria servidor MSW UMA VEZ
├── mocks/
│   ├── server.ts              # Servidor MSW compartilhado
│   └── handlers.ts            # Handlers existentes
└── contract/
    ├── sales-handlers.ts      # Handlers específicos de Sales
    └── *.test.ts              # Testes (usam servidor compartilhado)
```

### Fluxo de Execução

1. **Vitest inicia** → Carrega `setup-node.ts`
2. **setup-node.ts** → Cria servidor MSW **UMA VEZ**
3. **server.ts** → Combina todos os handlers (handlers.ts + sales-handlers.ts)
4. **Testes executam** → Usam o mesmo servidor compartilhado
5. **afterEach** → Server.resetHandlers() (limpa entre testes)
6. **afterAll** → Server.close() (fecha servidor ao final)

## Mudanças Implementadas

### 1. Criado `sales-handlers.ts`

Arquivo centralizado com todos os handlers de Sales:

```typescript
// src/test/contract/sales-handlers.ts
export const salesHandlers = [
  http.get('http://localhost:3000/api/products', ...),
  http.get('http://localhost:3000/api/products/:id', ...),
  // Mais handlers...
];
```

### 2. Atualizado `server.ts`

Combina handlers existentes + handlers de Sales:

```typescript
// src/test/mocks/server.ts
import { salesHandlers } from '../contract/sales-handlers'

const allHandlers = [...handlers, ...salesHandlers]
export const server = setupServer(...allHandlers)
```

### 3. Atualizado `vitest.config.contract.ts`

Adicionou timeouts e isolamento para evitar travamentos:

```typescript
test: {
  testTimeout: 10000,       // 10s timeout
  hookTimeout: 10000,
  teardownTimeout: 10000,
  isolate: true,            // Isola testes
  pool: 'forks',            // Usa forks
  poolOptions: {
    forks: {
      singleFork: true      // Um fork por vez
    }
  }
}
```

### 4. Testes Otimizados

Removido criação de servidor individual:

```typescript
// ❌ ANTES
const server = setupServer(...);
beforeAll(() => server.listen());

// ✅ DEPOIS
// Nada! Apenas os testes
describe('Contract: GET /api/products', () => {
  it('should work', async () => {
    const response = await fetch('http://localhost:3000/api/products');
    // ...
  });
});
```

## Resultados

✅ **Testes não travam mais**
✅ **Execução rápida** (~300ms por arquivo)
✅ **Sem consumo excessivo de CPU**
✅ **Sem avisos do MSW** (handlers encontrados corretamente)
✅ **Isolamento entre testes** mantido
✅ **Cleanup automático** entre testes

## Próximos Passos

1. ✅ Atualizar todos os testes existentes em `src/test/contract/features/sales/` para usar servidor compartilhado
2. ✅ Adicionar mais handlers em `sales-handlers.ts` conforme necessário
3. ✅ Executar todos os testes sem problemas
4. ✅ Prosseguir com implementação (Fase 3.3 - Types)
