/**
 * Authentication Service
 *
 * Handles user authentication operations:
 * - Login with device tracking
 * - Logout with session cleanup
 * - Token refresh with fingerprint validation
 *
 * Implements Tasks T021-T023 from tasks.md
 */

import {
  LoginRequest,
  LoginResponse,
  LoginRequestSchema,
  LoginResponseSchema,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
} from '../contracts/auth-contracts';
import {
  APIError,
  SessionLimitError,
  InvalidTokenError,
  DeviceMismatchError,
  ErrorResponse,
  SessionLimitErrorResponse,
} from '../contracts/errors';
import { authStorage } from '@/shared/utils/storage';
import { getOrCreateDeviceId, generateDeviceFingerprint } from '@/shared/utils/device';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Login user with credentials and device tracking
 *
 * @param request - Login request with email, password, device info
 * @returns Login response with tokens and user data
 * @throws {SessionLimitError} When device limit reached
 * @throws {APIError} For other API errors
 *
 * @example
 * ```typescript
 * const response = await login({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   device_id: getOrCreateDeviceId(),
 *   device_fingerprint: await generateDeviceFingerprint('web'),
 *   client_type: 'web'
 * });
 * ```
 */
export async function login(request: LoginRequest): Promise<LoginResponse> {
  // Validate request with Zod schema
  const validatedRequest = LoginRequestSchema.parse(request);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedRequest),
    });

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();

      // Handle session limit error (403)
      if (
        response.status === 403 &&
        errorData.error.code === 'SESSION_LIMIT_REACHED'
      ) {
        const sessionLimitData = errorData as SessionLimitErrorResponse;
        throw new SessionLimitError(sessionLimitData.error.details);
      }

      // Handle invalid credentials (401)
      if (response.status === 401) {
        throw new APIError(
          'INVALID_CREDENTIALS',
          errorData.error.message || 'Invalid email or password'
        );
      }

      // Handle account locked/suspended
      if (
        errorData.error.code === 'ACCOUNT_LOCKED' ||
        errorData.error.code === 'ACCOUNT_SUSPENDED'
      ) {
        throw new APIError(errorData.error.code, errorData.error.message);
      }

      // Generic error
      throw new APIError(
        errorData.error.code || 'INTERNAL_ERROR',
        errorData.error.message || `Login failed: ${response.status}`
      );
    }

    // Parse and validate response
    const data = await response.json();
    const validatedResponse = LoginResponseSchema.parse(data);

    // Store tokens in localStorage
    authStorage.setAccessToken(validatedResponse.data.token);
    authStorage.setRefreshToken(validatedResponse.data.refresh_token);
    authStorage.setSessionId(validatedResponse.data.session.id);
    authStorage.updateLastActivity();

    return validatedResponse;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        'INTERNAL_ERROR',
        'Network error: Unable to connect to server'
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      throw new APIError('VALIDATION_ERROR', 'Invalid request or response format');
    }

    // Unknown error
    throw new APIError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Logout user and revoke session
 *
 * @returns Promise that resolves when logout is complete
 * @throws {APIError} If logout fails
 *
 * @example
 * ```typescript
 * await logout();
 * ```
 */
export async function logout(): Promise<void> {
  try {
    // Get access token and session ID for authenticated request
    const token = authStorage.getAccessToken();
    const sessionId = authStorage.getSessionId();

    if (!sessionId) {
      console.warn('No session ID found for logout');
      authStorage.clearTokens();
      return;
    }

    // Use DELETE /api/v1/sessions/{sessionId} endpoint instead of POST /api/auth/logout
    const response = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();
      throw new APIError(
        errorData.error.code || 'INTERNAL_ERROR',
        errorData.error.message || `Logout failed: ${response.status}`
      );
    }

    // Parse response if it exists
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      await response.json();
    }

    // Clear tokens from localStorage after successful logout
    authStorage.clearTokens();
  } catch (error) {
    // Always clear local tokens even if API call fails
    authStorage.clearTokens();

    // Re-throw known errors
    if (error instanceof APIError) {
      throw error;
    }

    // For logout, we don't want to throw on network errors
    // as the local cleanup is more important
    console.error('Logout error:', error);
  }
}

/**
 * Refresh access token using refresh token
 *
 * @returns Refresh token response with new access and refresh tokens
 * @throws {InvalidTokenError} When refresh token is invalid or expired
 * @throws {DeviceMismatchError} When device fingerprint doesn't match
 * @throws {APIError} For other API errors
 *
 * @example
 * ```typescript
 * try {
 *   const response = await refreshAccessToken();
 *   // Tokens automatically updated in storage
 * } catch (error) {
 *   if (error instanceof InvalidTokenError) {
 *     // Redirect to login
 *   }
 * }
 * ```
 */
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const refreshToken = authStorage.getRefreshToken();
  const deviceId = getOrCreateDeviceId();

  if (!refreshToken) {
    throw new InvalidTokenError('No refresh token available');
  }

  try {
    // Generate current device fingerprint
    const fingerprint = await generateDeviceFingerprint('web');

    const request: RefreshTokenRequest = {
      refresh_token: refreshToken,
      device_id: deviceId,
      device_fingerprint: fingerprint,
      client_type: 'web',
    };

    // Validate request
    const validatedRequest = RefreshTokenRequestSchema.parse(request);

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedRequest),
    });

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();

      // Handle invalid/expired token (401)
      if (response.status === 401) {
        // Clear tokens on invalid refresh token
        authStorage.clearTokens();
        throw new InvalidTokenError(
          errorData.error.message || 'Refresh token expired or invalid'
        );
      }

      // Handle device mismatch
      if (errorData.error.code === 'DEVICE_MISMATCH') {
        authStorage.clearTokens();
        throw new DeviceMismatchError(errorData.error.message);
      }

      // Handle fingerprint mismatch (suspicious activity)
      if (errorData.error.code === 'FINGERPRINT_MISMATCH') {
        authStorage.clearTokens();
        throw new APIError(
          'SESSION_SUSPICIOUS',
          errorData.error.message || 'Device fingerprint mismatch detected'
        );
      }

      // Generic error
      throw new APIError(
        errorData.error.code || 'INTERNAL_ERROR',
        errorData.error.message || `Token refresh failed: ${response.status}`
      );
    }

    // Parse and validate response
    const data = await response.json();
    const validatedResponse = RefreshTokenResponseSchema.parse(data);

    // Update tokens in localStorage
    authStorage.setAccessToken(validatedResponse.data.access_token);
    authStorage.setRefreshToken(validatedResponse.data.refresh_token);
    authStorage.setSessionId(validatedResponse.data.session.id);
    authStorage.updateLastActivity();

    return validatedResponse;
  } catch (error) {
    // Re-throw known errors
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        'INTERNAL_ERROR',
        'Network error: Unable to connect to server'
      );
    }

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      throw new APIError('VALIDATION_ERROR', 'Invalid request or response format');
    }

    // Unknown error
    throw new APIError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
