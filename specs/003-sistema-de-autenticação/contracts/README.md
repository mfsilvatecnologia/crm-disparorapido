# API Contracts - Sistema de Autenticação

Este diretório contém as definições de contratos de API usando Zod schemas para validação runtime e inferência de tipos TypeScript.

## Estrutura

```
contracts/
├── README.md                    # Este arquivo
├── auth-contracts.ts            # Contratos de autenticação (login, logout, refresh)
├── session-contracts.ts         # Contratos de sessões (list, validate, revoke)
├── types.ts                     # Types compartilhados e enums
└── errors.ts                    # Schemas de erros da API
```

## Uso

### Importar Schemas

```typescript
import { LoginRequestSchema, LoginResponseSchema } from '@/specs/003-sistema-de-autenticação/contracts/auth-contracts';
```

### Validar Request

```typescript
const validatedRequest = LoginRequestSchema.parse(requestData);
```

### Validar Response

```typescript
const validatedResponse = LoginResponseSchema.parse(apiResponse);
```

### Inferir Types

```typescript
import { z } from 'zod';
import { LoginRequestSchema } from './auth-contracts';

type LoginRequest = z.infer<typeof LoginRequestSchema>;
```

## Endpoints Cobertos

### Autenticação (`auth-contracts.ts`)
- `POST /auth/login` - Login de usuário
- `POST /auth/logout` - Logout de usuário  
- `POST /auth/refresh-token` - Refresh de access token

### Sessões (`session-contracts.ts`)
- `GET /sessions/active` - Listar sessões ativas do usuário
- `POST /sessions/{id}/validate` - Validar sessão específica
- `DELETE /sessions/{id}` - Revogar sessão específica
- `GET /admin/sessions` - Listar todas as sessões (admin)

## Próximos Passos

1. Implementar schemas completos em cada arquivo
2. Criar contract tests em `/src/test/contract/`
3. Usar schemas nos services para validação
4. Gerar types TypeScript a partir dos schemas
