# Data Model: Sistema de Autenticação e Gerenciamento de Sessões

**Feature**: Sistema de Autenticação e Gerenciamento de Sessões  
**Version**: 1.0.0  
**Date**: 2025-10-01

## Visão Geral

Este documento define o modelo de dados TypeScript para o sistema de autenticação, incluindo todas as entidades, suas propriedades, relacionamentos e regras de validação extraídas da especificação da feature.

---

## Entidades Principais

### 1. User (Usuário)

Representa um usuário autenticado no sistema.

**Interface TypeScript**:
```typescript
interface User {
  id: string;                    // UUID do usuário
  email: string;                 // Email único (usado para login)
  nome: string;                  // Nome completo do usuário
  empresa_id: string;            // UUID da empresa (relacionamento)
  role: UserRole;                // Papel do usuário no sistema
  created_at: Date;              // Data de criação da conta
  updated_at: Date;              // Data da última atualização
  last_login_at: Date | null;   // Data do último login
  status: UserStatus;            // Status da conta
}

type UserRole = 'admin' | 'user' | 'viewer';
type UserStatus = 'active' | 'inactive' | 'suspended';
```

**Regras de Validação**:
- `email`: Deve ser email válido, único no sistema
- `nome`: Mínimo 2 caracteres
- `empresa_id`: Deve referenciar empresa existente
- `role`: Valores permitidos: 'admin', 'user', 'viewer'
- `status`: Valores permitidos: 'active', 'inactive', 'suspended'

**Relacionamentos**:
- `1:N` com Session (um usuário pode ter múltiplas sessões)
- `N:1` com Company (muitos usuários pertencem a uma empresa)

---

### 2. Session (Sessão)

Representa uma sessão ativa de autenticação para um dispositivo específico.

**Interface TypeScript**:
```typescript
interface Session {
  id: string;                              // UUID da sessão
  user_id: string;                         // UUID do usuário (relacionamento)
  empresa_id: string;                      // UUID da empresa (relacionamento)
  device_id: string;                       // UUID do dispositivo (compartilhado web/extension)
  device_fingerprint: string;              // Fingerprint para validação de segurança
  refresh_token_hash: string;              // Hash SHA-256 do refresh token
  ip_address: string | null;               // IP do último acesso
  user_agent: string | null;               // User agent do último acesso
  client_type: ClientType;                 // Tipo do último cliente ativo
  status: SessionStatus;                   // Status da sessão
  created_at: Date;                        // Data de criação da sessão
  last_activity_at: Date;                  // Data da última atividade (atualizado por qualquer cliente)
  expires_at: Date;                        // Data de expiração (created_at + 45 minutos de inatividade)
  metadata: Record<string, any>;           // Metadados adicionais para auditoria
}

type ClientType = 'web' | 'extension';
type SessionStatus = 'active' | 'expired' | 'revoked' | 'suspicious';
```

**Regras de Validação**:
- `device_id`: Deve ser UUID válido, persistente no localStorage
- `device_fingerprint`: Deve começar com 'fp_web_' ou 'fp_extension_'
- `refresh_token_hash`: Hash SHA-256 (64 caracteres hex)
- `client_type`: Valores permitidos: 'web', 'extension'
- `status`: Valores permitidos: 'active', 'expired', 'revoked', 'suspicious'
- `expires_at`: Deve ser 45 minutos após last_activity_at
- `last_activity_at`: Deve ser <= now()

**Transições de Estado**:
```
active → expired       (45 minutos de inatividade)
active → revoked       (logout manual ou admin)
active → suspicious    (detecção de anomalia)
expired → revoked      (cleanup automático)
suspicious → revoked   (após investigação)
```

**Relacionamentos**:
- `N:1` com User (muitas sessões pertencem a um usuário)
- `N:1` com Company (muitas sessões pertencem a uma empresa)
- `1:1` com Device (uma sessão por device_id)
- `1:N` com SessionAuditLog (uma sessão tem múltiplos eventos de auditoria)

---

### 3. Device (Dispositivo)

Representa a identificação única de um dispositivo/navegador.

**Interface TypeScript**:
```typescript
interface Device {
  device_id: string;                       // UUID único do dispositivo
  device_fingerprint: string;              // Fingerprint atual do dispositivo
  fingerprint_history: FingerprintEntry[]; // Histórico de fingerprints
  user_id: string;                         // UUID do último usuário (relacionamento)
  browser_info: BrowserInfo;               // Informações do navegador
  hardware_info: HardwareInfo;             // Informações de hardware
  first_seen_at: Date;                     // Data da primeira vez visto
  last_seen_at: Date;                      // Data da última vez visto
}

interface FingerprintEntry {
  fingerprint: string;
  recorded_at: Date;
  changed_reason: string | null;
}

interface BrowserInfo {
  user_agent: string;
  language: string;
  languages: string[];
  platform: string;
  vendor: string;
}

interface HardwareInfo {
  hardware_concurrency: number;
  device_memory?: number;
  screen_resolution: string;
  screen_color_depth: number;
  timezone: string;
  timezone_offset: number;
}
```

**Regras de Validação**:
- `device_id`: Deve ser UUID válido
- `device_fingerprint`: Deve corresponder ao hash dos componentes
- `fingerprint_history`: Máximo 10 entradas (manter últimas 10)
- `last_seen_at`: Deve ser >= first_seen_at

**Relacionamentos**:
- `N:1` com User (múltiplos devices podem pertencer a um usuário)
- `1:N` com Session (um device pode ter múltiplas sessões ao longo do tempo, mas apenas 1 ativa)

---

### 4. AuthToken (Token de Autenticação)

Representa um token JWT (access ou refresh) para autenticação de requisições.

**Interface TypeScript**:
```typescript
interface AuthToken {
  token_type: TokenType;                   // Tipo do token
  token_value: string;                     // Token JWT criptografado
  session_id: string;                      // UUID da sessão (relacionamento)
  device_id: string;                       // UUID do dispositivo para validação
  issued_at: Date;                         // Data de emissão
  expires_at: Date;                        // Data de expiração
  is_revoked: boolean;                     // Se foi revogado
  revoked_at: Date | null;                 // Data da revogação
  revoked_reason: string | null;           // Motivo da revogação
}

type TokenType = 'access' | 'refresh';

// Payload do JWT (decodificado)
interface JWTPayload {
  sub: string;                             // user_id
  email: string;
  empresa_id: string;
  device_id: string;
  session_id: string;
  role: UserRole;
  type: TokenType;
  iat: number;                             // Issued at (Unix timestamp)
  exp: number;                             // Expiration (Unix timestamp)
}
```

**Regras de Validação**:
- `token_type`: Valores permitidos: 'access', 'refresh'
- `token_value`: Deve ser JWT válido
- `expires_at` (access): Deve ser issued_at + 15 minutos
- `expires_at` (refresh): Deve ser issued_at + 7 dias
- `device_id`: Deve corresponder ao device_id da sessão
- `is_revoked`: true se revoked_at não for null

**Transições de Estado**:
```
valid → expired        (tempo decorrido >= expires_at)
valid → revoked        (logout, sessão revogada, refresh rotation)
```

**Relacionamentos**:
- `N:1` com Session (múltiplos tokens pertencem a uma sessão)
- Validado contra Device (device_id deve corresponder)

---

### 5. Company (Empresa)

Representa uma empresa que usa o sistema.

**Interface TypeScript**:
```typescript
interface Company {
  id: string;                              // UUID da empresa
  nome: string;                            // Nome da empresa
  cnpj: string;                            // CNPJ único
  plan: CompanyPlan;                       // Plano contratado
  created_at: Date;                        // Data de criação
  updated_at: Date;                        // Data da última atualização
  status: CompanyStatus;                   // Status da empresa
}

type CompanyPlan = 'freemium' | 'basico' | 'premium' | 'enterprise';
type CompanyStatus = 'active' | 'suspended' | 'cancelled';
```

**Regras de Validação**:
- `cnpj`: Deve ser CNPJ válido, único no sistema
- `plan`: Valores permitidos: 'freemium', 'basico', 'premium', 'enterprise'
- `status`: Valores permitidos: 'active', 'suspended', 'cancelled'

**Relacionamentos**:
- `1:N` com User (uma empresa tem múltiplos usuários)
- `1:N` com Session (uma empresa tem múltiplas sessões)
- `1:1` com CompanyLicenseConfig (uma empresa tem uma configuração de licença)

---

### 6. CompanyLicenseConfig (Configuração de Licença)

Representa os limites e regras de licenciamento para uma empresa.

**Interface TypeScript**:
```typescript
interface CompanyLicenseConfig {
  empresa_id: string;                      // UUID da empresa (relacionamento)
  max_concurrent_sessions: number;         // Limite baseado no plano
  current_active_sessions: number;         // Contador atual de device_ids únicos ativos
  enforcement_mode: EnforcementMode;       // Modo de enforcement
  created_at: Date;                        // Data de criação
  updated_at: Date;                        // Data da última atualização
  updated_by: string | null;               // UUID do admin que atualizou
}

type EnforcementMode = 'block' | 'warn' | 'allow_with_audit';

// Limites por plano (constante)
const PLAN_LIMITS: Record<CompanyPlan, number> = {
  freemium: 1,
  basico: 2,
  premium: 5,
  enterprise: 10
};
```

**Regras de Validação**:
- `max_concurrent_sessions`: Deve corresponder ao limite do plano
- `current_active_sessions`: Deve ser >= 0 e <= max_concurrent_sessions (se enforcement = 'block')
- `enforcement_mode`: Valores permitidos: 'block', 'warn', 'allow_with_audit'
- `enforcement_mode` padrão: 'block' (produção)

**Lógica de Negócio**:
- `current_active_sessions` é calculado contando `device_ids` únicos com sessões ativas
- Quando `current_active_sessions >= max_concurrent_sessions` e `enforcement_mode = 'block'`: bloquear novos logins
- Quando plano muda: `max_concurrent_sessions` é atualizado, sessões existentes permanecem

**Relacionamentos**:
- `1:1` com Company (uma config por empresa)
- `N:1` com User (updated_by referencia admin)

---

### 7. SessionAuditLog (Log de Auditoria)

Representa um evento de auditoria relacionado a sessões.

**Interface TypeScript**:
```typescript
interface SessionAuditLog {
  id: string;                              // UUID do log
  event_type: SessionEventType;            // Tipo do evento
  timestamp: Date;                         // Data/hora do evento
  session_id: string | null;               // UUID da sessão (null se evento não relacionado a sessão específica)
  user_id: string;                         // UUID do usuário
  empresa_id: string;                      // UUID da empresa
  device_id: string;                       // UUID do dispositivo
  ip_address: string | null;               // IP de origem
  user_agent: string | null;               // User agent
  location: string | null;                 // Localização (cidade, país) - opcional
  event_details: Record<string, any>;      // Detalhes específicos do evento
  result: EventResult;                     // Resultado do evento
  error_message: string | null;            // Mensagem de erro se result = 'failure'
}

type SessionEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'token_refresh'
  | 'session_expired'
  | 'session_revoked'
  | 'session_suspicious'
  | 'fingerprint_mismatch'
  | 'license_limit_reached';

type EventResult = 'success' | 'failure' | 'warning';
```

**Regras de Validação**:
- `event_type`: Deve ser um dos valores permitidos
- `result`: Valores permitidos: 'success', 'failure', 'warning'
- `timestamp`: Deve ser <= now()
- `error_message`: Obrigatório se result = 'failure'

**Relacionamentos**:
- `N:1` com Session (múltiplos logs para uma sessão)
- `N:1` com User (múltiplos logs para um usuário)
- `N:1` com Company (múltiplos logs para uma empresa)
- `N:1` com Device (múltiplos logs para um dispositivo)

---

## Diagrama de Relacionamentos

```
Company (1) ─────── (N) User
   │                   │
   │                   │
   │ (1)            (N) │
   │                   │
   └─────── (N) Session (N) ─────── (1) Device
               │
               │ (1)
               │
               └─────── (N) SessionAuditLog
               │
               │ (1)
               │
               └─────── (N) AuthToken

Company (1) ─────── (1) CompanyLicenseConfig
```

---

## Regras de Negócio Transversais

### Controle de Licenças

1. **Contagem de Sessões Ativas**:
   ```typescript
   // Contar device_ids únicos com status = 'active'
   const activeSessionCount = 
     await countDistinct('device_id')
     .where('empresa_id', empresa_id)
     .where('status', 'active');
   ```

2. **Validação de Limite**:
   ```typescript
   if (activeSessionCount >= maxConcurrentSessions && enforcementMode === 'block') {
     throw new SessionLimitError({
       current: activeSessionCount,
       max: maxConcurrentSessions,
       plan: company.plan
     });
   }
   ```

3. **Sessão Compartilhada**:
   - Web e extension no mesmo device_id = 1 sessão apenas
   - Última atividade em qualquer client atualiza `last_activity_at`
   - Campo `client_type` indica último client ativo

### Expiração de Sessão

1. **Cálculo de Expiração**:
   ```typescript
   expires_at = last_activity_at + 45 minutes
   ```

2. **Verificação de Expiração**:
   ```typescript
   const isExpired = now() > session.expires_at;
   if (isExpired && session.status === 'active') {
     session.status = 'expired';
     await auditLog('session_expired', session);
   }
   ```

### Refresh Token

1. **Rotação de Token**:
   - Cada refresh invalida o refresh_token antigo
   - Novo refresh_token é gerado e hash armazenado
   - Access token é sempre renovado

2. **Validação de Refresh**:
   ```typescript
   // Verificar hash do refresh token
   const hash = sha256(refreshToken);
   if (hash !== session.refresh_token_hash) {
     throw new InvalidTokenError();
   }
   
   // Verificar device_id e fingerprint
   if (deviceId !== session.device_id) {
     throw new DeviceMismatchError();
   }
   ```

### Device Fingerprinting

1. **Geração de Fingerprint**:
   ```typescript
   const components = {
     userAgent, language, platform,
     hardwareConcurrency, deviceMemory,
     screenResolution, colorDepth,
     timezone, canvasFingerprint, webglVendor
   };
   
   const fingerprint = 'fp_web_' + sha256(JSON.stringify(components)).substring(0, 16);
   ```

2. **Detecção de Mudanças**:
   - Comparar novo fingerprint com último registrado
   - Se diferença > threshold: marcar sessão como 'suspicious'
   - Registrar mudança em `fingerprint_history`

---

## Validações de Frontend (Zod Schemas)

Os schemas Zod serão criados em `/contracts/` e corresponderão a estas interfaces, fornecendo validação runtime e inferência de tipos.

Exemplo:
```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nome: z.string().min(2),
  empresa_id: z.string().uuid(),
  role: z.enum(['admin', 'user', 'viewer']),
  created_at: z.date(),
  updated_at: z.date(),
  last_login_at: z.date().nullable(),
  status: z.enum(['active', 'inactive', 'suspended'])
});

export type User = z.infer<typeof UserSchema>;
```

---

## Próximos Passos

1. Criar schemas Zod em `/contracts/` baseados nestas interfaces
2. Gerar contract tests para validar schemas
3. Implementar types em `src/features/authentication/types/`
4. Implementar services que manipulam estas entidades

---

**Document Status**: Complete ✅  
**Next Phase**: Create contracts and tests (Phase 1 continuation)
