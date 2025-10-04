/**
 * API Contracts - Autenticação
 * 
 * Define schemas Zod para endpoints de autenticação:
 * - POST /auth/login
 * - POST /auth/logout
 * - POST /auth/refresh-token
 */

import { z } from 'zod';
import {
  ClientTypeSchema,
  DeviceIdSchema,
  DeviceFingerprintSchema,
  JWTTokenSchema,
  EmailSchema,
  PasswordSchema,
  UserSchema,
  CompanySchema,
  SessionInfoSchema,
  createSuccessResponseSchema,
} from './types';

// ============================================================================
// POST /auth/login
// ============================================================================

/**
 * Login Request
 */
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  device_id: DeviceIdSchema,
  device_fingerprint: DeviceFingerprintSchema,
  client_type: ClientTypeSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * Login Response - Success
 */
export const LoginResponseDataSchema = z.object({
  token: JWTTokenSchema,
  refresh_token: JWTTokenSchema,
  user: UserSchema,
  empresa: CompanySchema,
  session: z.object({
    id: z.string().uuid(),
    device_id: DeviceIdSchema,
    expires_at: z.string().datetime(),
  }),
});

export const LoginResponseSchema = createSuccessResponseSchema(LoginResponseDataSchema);

export type LoginResponseData = z.infer<typeof LoginResponseDataSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ============================================================================
// POST /auth/logout
// ============================================================================

/**
 * Logout Request
 */
export const LogoutRequestSchema = z.object({
  device_id: DeviceIdSchema,
  reason: z.string().optional(),
});

export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;

/**
 * Logout Response - Success
 */
export const LogoutResponseDataSchema = z.object({
  message: z.string(),
  session_id: z.string().uuid(),
});

export const LogoutResponseSchema = createSuccessResponseSchema(LogoutResponseDataSchema);

export type LogoutResponseData = z.infer<typeof LogoutResponseDataSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// ============================================================================
// POST /auth/refresh-token
// ============================================================================

/**
 * Refresh Token Request
 */
export const RefreshTokenRequestSchema = z.object({
  refresh_token: JWTTokenSchema,
  device_id: DeviceIdSchema,
  device_fingerprint: DeviceFingerprintSchema,
  client_type: ClientTypeSchema,
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

/**
 * Refresh Token Response - Success
 */
export const RefreshTokenResponseDataSchema = z.object({
  access_token: JWTTokenSchema,
  refresh_token: JWTTokenSchema,
  token_type: z.literal('Bearer'),
  expires_in: z.number(), // seconds
  expires_at: z.string().datetime(),
  session: z.object({
    id: z.string().uuid(),
    device_id: DeviceIdSchema,
    client_type: ClientTypeSchema,
    last_activity_at: z.string().datetime(),
    expires_at: z.string().datetime(),
    time_to_expiration_minutes: z.number(),
  }),
  user: UserSchema,
});

export const RefreshTokenResponseSchema = createSuccessResponseSchema(
  RefreshTokenResponseDataSchema
);

export type RefreshTokenResponseData = z.infer<typeof RefreshTokenResponseDataSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate Login Request
 */
export function validateLoginRequest(data: unknown): LoginRequest {
  return LoginRequestSchema.parse(data);
}

/**
 * Validate Login Response
 */
export function validateLoginResponse(data: unknown): LoginResponse {
  return LoginResponseSchema.parse(data);
}

/**
 * Validate Refresh Token Request
 */
export function validateRefreshTokenRequest(data: unknown): RefreshTokenRequest {
  return RefreshTokenRequestSchema.parse(data);
}

/**
 * Validate Refresh Token Response
 */
export function validateRefreshTokenResponse(data: unknown): RefreshTokenResponse {
  return RefreshTokenResponseSchema.parse(data);
}

/**
 * Validate Logout Request
 */
export function validateLogoutRequest(data: unknown): LogoutRequest {
  return LogoutRequestSchema.parse(data);
}

/**
 * Validate Logout Response
 */
export function validateLogoutResponse(data: unknown): LogoutResponse {
  return LogoutResponseSchema.parse(data);
}
