/**
 * Shared Types
 * Re-exports all authentication and session types for use across the application
 */

// Re-export all authentication types
export * from '../features/authentication/types/auth';

// Explicit exports for commonly used types (for better IDE autocomplete)
export type {
  User,
  UserSession,
  Session,
  Device,
  AuthToken,
  JWTPayload,
  ClientType,
  SessionStatus,
  EnforcementMode,
  ComputedPermissions,
  LoginCredentials,
  AuthContextValue,
  SessionContext,
  BrowserInfo,
  HardwareInfo,
  Company,
  CompanyPlan,
  TokenType
} from '../features/authentication/types/auth';
