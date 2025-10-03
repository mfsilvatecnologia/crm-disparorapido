/**
 * API Contracts - Erros
 * 
 * Define schemas para respostas de erro da API.
 */

import { z } from 'zod';

// ============================================================================
// Error Codes
// ============================================================================

export const ErrorCodeSchema = z.enum([
  // Session Errors
  'SESSION_LIMIT_REACHED',
  'SESSION_NOT_FOUND',
  'SESSION_EXPIRED',
  'SESSION_REVOKED',
  'SESSION_SUSPICIOUS',
  'DEVICE_MISMATCH',
  
  // Token Errors
  'INVALID_TOKEN',
  'EXPIRED_TOKEN',
  'FINGERPRINT_MISMATCH',
  'RATE_LIMIT_EXCEEDED',
  
  // Auth Errors
  'INVALID_CREDENTIALS',
  'ACCOUNT_LOCKED',
  'ACCOUNT_SUSPENDED',
  'ACCOUNT_NOT_FOUND',
  
  // General Errors
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'INTERNAL_ERROR',
]);

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;

// ============================================================================
// Error Details
// ============================================================================

/**
 * Session Limit Error Details
 */
export const SessionLimitErrorDetailsSchema = z.object({
  current_sessions: z.number(),
  max_sessions: z.number(),
  plan: z.string(),
  enforcement_mode: z.string(),
});

export type SessionLimitErrorDetails = z.infer<typeof SessionLimitErrorDetailsSchema>;

/**
 * Rate Limit Error Details
 */
export const RateLimitErrorDetailsSchema = z.object({
  retry_after: z.number(), // seconds
  limit: z.number(),
  window: z.number(), // seconds
});

export type RateLimitErrorDetails = z.infer<typeof RateLimitErrorDetailsSchema>;

/**
 * Validation Error Details
 */
export const ValidationErrorDetailsSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.any().optional(),
});

export type ValidationErrorDetails = z.infer<typeof ValidationErrorDetailsSchema>;

// ============================================================================
// Error Response
// ============================================================================

/**
 * Base Error Response
 */
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.record(z.any()).optional(),
  }),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

/**
 * Session Limit Error Response
 */
export const SessionLimitErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal('SESSION_LIMIT_REACHED'),
    message: z.string(),
    details: SessionLimitErrorDetailsSchema,
  }),
});

export type SessionLimitErrorResponse = z.infer<typeof SessionLimitErrorResponseSchema>;

/**
 * Rate Limit Error Response
 */
export const RateLimitErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal('RATE_LIMIT_EXCEEDED'),
    message: z.string(),
    details: RateLimitErrorDetailsSchema,
  }),
});

export type RateLimitErrorResponse = z.infer<typeof RateLimitErrorResponseSchema>;

/**
 * Validation Error Response
 */
export const ValidationErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.literal('VALIDATION_ERROR'),
    message: z.string(),
    details: z.object({
      errors: z.array(ValidationErrorDetailsSchema),
    }),
  }),
});

export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponseSchema>;

// ============================================================================
// Error Classes (para uso no código)
// ============================================================================

/**
 * Base API Error
 */
export class APIError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Session Limit Error
 */
export class SessionLimitError extends APIError {
  constructor(public limitDetails: SessionLimitErrorDetails) {
    super(
      'SESSION_LIMIT_REACHED',
      `Session limit reached: ${limitDetails.current_sessions}/${limitDetails.max_sessions}`,
      limitDetails
    );
    this.name = 'SessionLimitError';
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends APIError {
  constructor(public rateLimitDetails: RateLimitErrorDetails) {
    super(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded. Retry after ${rateLimitDetails.retry_after} seconds`,
      rateLimitDetails
    );
    this.name = 'RateLimitError';
  }
}

/**
 * Invalid Token Error
 */
export class InvalidTokenError extends APIError {
  constructor(message: string = 'Invalid or expired token') {
    super('INVALID_TOKEN', message);
    this.name = 'InvalidTokenError';
  }
}

/**
 * Device Mismatch Error
 */
export class DeviceMismatchError extends APIError {
  constructor(message: string = 'Device ID does not match session') {
    super('DEVICE_MISMATCH', message);
    this.name = 'DeviceMismatchError';
  }
}
