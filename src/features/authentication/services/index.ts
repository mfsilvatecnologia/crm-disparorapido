/**
 * Authentication Services
 * Public API exports for authentication and session management
 */

// Auth Service
export { login, logout, refreshAccessToken } from './authService';

// Session Service
export { listActiveSessions, revokeSession, getSessionById } from './sessionService';

// Re-export types for convenience
export type {
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../contracts/auth-contracts';

export type {
  APIError,
  SessionLimitError,
  InvalidTokenError,
  DeviceMismatchError,
  RateLimitError,
} from '../contracts/errors';
