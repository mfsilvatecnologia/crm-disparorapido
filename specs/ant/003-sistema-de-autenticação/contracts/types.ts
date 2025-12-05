/**
 * API Contracts - Tipos Compartilhados
 * 
 * Define types, enums e schemas compartilhados usados em múltiplos contratos.
 */

import { z } from 'zod';

// ============================================================================
// Enums e Tipos Básicos
// ============================================================================

export const ClientTypeSchema = z.enum(['web', 'extension']);
export type ClientType = z.infer<typeof ClientTypeSchema>;

export const SessionStatusSchema = z.enum(['active', 'expired', 'revoked', 'suspicious']);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const UserRoleSchema = z.enum(['admin', 'user', 'viewer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const CompanyPlanSchema = z.enum(['freemium', 'basico', 'premium', 'enterprise']);
export type CompanyPlan = z.infer<typeof CompanyPlanSchema>;

export const EnforcementModeSchema = z.enum(['block', 'warn', 'allow_with_audit']);
export type EnforcementMode = z.infer<typeof EnforcementModeSchema>;

// ============================================================================
// Entidades Compartilhadas
// ============================================================================

/**
 * User - Dados do usuário autenticado
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  nome: z.string().min(2),
  empresa_id: z.string().uuid(),
  role: UserRoleSchema,
});

export type User = z.infer<typeof UserSchema>;

/**
 * Company - Dados da empresa
 */
export const CompanySchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  cnpj: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;

/**
 * SessionInfo - Informações de uma sessão ativa
 */
export const SessionInfoSchema = z.object({
  id: z.string().uuid(),
  device_id: z.string().uuid(),
  device_info: z.string(),
  client_type: ClientTypeSchema,
  status: SessionStatusSchema,
  ip_address: z.string().nullable(),
  last_activity_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  time_to_expiration_minutes: z.number(),
  is_active: z.boolean(),
});

export type SessionInfo = z.infer<typeof SessionInfoSchema>;

// ============================================================================
// Response Wrappers
// ============================================================================

/**
 * Success Response - Envelope padrão para respostas de sucesso
 */
export const createSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

/**
 * Pagination Metadata
 */
export const PaginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  total_pages: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Paginated Response
 */
export const createPaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      pagination: PaginationMetaSchema,
    }),
  });

// ============================================================================
// Helpers
// ============================================================================

/**
 * UUID Validation
 */
export const UUIDSchema = z.string().uuid();

/**
 * Device ID - UUID persistente do dispositivo
 */
export const DeviceIdSchema = z.string().uuid();

/**
 * Device Fingerprint - Hash único do dispositivo
 */
export const DeviceFingerprintSchema = z
  .string()
  .regex(/^fp_(web|extension)_[a-f0-9]{16}$/, 'Invalid fingerprint format');

/**
 * JWT Token - Token de acesso ou refresh
 */
export const JWTTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/, 'Invalid JWT format');

/**
 * Timestamp ISO 8601
 */
export const TimestampSchema = z.string().datetime();

/**
 * Email
 */
export const EmailSchema = z.string().email();

/**
 * Password - Mínimo 8 caracteres (validação básica frontend)
 */
export const PasswordSchema = z.string().min(8);
