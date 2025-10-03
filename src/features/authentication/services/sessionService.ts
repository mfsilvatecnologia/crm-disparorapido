/**
 * Session Management Service
 *
 * Handles session management operations:
 * - List active sessions for current user
 * - Revoke specific sessions
 *
 * Implements Tasks T024-T025 from tasks.md
 */

import { z } from 'zod';
import { SessionInfoSchema } from '../contracts/types';
import { APIError, ErrorResponse } from '../contracts/errors';
import { authenticatedFetch } from '@/shared/services/apiClient';
import type { Session } from '@/shared/types';

/**
 * Active Sessions Response Schema
 */
const ActiveSessionsResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    sessions: z.array(SessionInfoSchema),
  }),
});

type ActiveSessionsResponse = z.infer<typeof ActiveSessionsResponseSchema>;

/**
 * Revoke Session Response Schema
 */
const RevokeSessionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
    session_id: z.string().uuid(),
  }),
});

type RevokeSessionResponse = z.infer<typeof RevokeSessionResponseSchema>;

/**
 * List all active sessions for the current user
 *
 * @returns Array of active session information
 * @throws {APIError} If request fails or user is unauthorized
 *
 * @example
 * ```typescript
 * const sessions = await listActiveSessions();
 * console.log(`You have ${sessions.length} active sessions`);
 * ```
 */
export async function listActiveSessions(): Promise<Session[]> {
  try {
    const response = await authenticatedFetch('/api/sessions/active', {
      method: 'GET',
    });

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();

      // Handle unauthorized (401)
      if (response.status === 401) {
        throw new APIError(
          'UNAUTHORIZED',
          errorData.error.message || 'Authentication required'
        );
      }

      // Generic error
      throw new APIError(
        errorData.error.code || 'INTERNAL_ERROR',
        errorData.error.message || `Failed to list sessions: ${response.status}`
      );
    }

    // Parse and validate response
    const data = await response.json();
    const validatedResponse = ActiveSessionsResponseSchema.parse(data);

    // Convert SessionInfo to Session type
    const sessions: Session[] = validatedResponse.data.sessions.map((sessionInfo) => ({
      id: sessionInfo.id,
      user_id: '', // Not provided by API, will be filled by context
      empresa_id: '', // Not provided by API, will be filled by context
      device_id: sessionInfo.device_id,
      refresh_token_hash: '', // Not exposed to frontend
      device_fingerprint: '', // Not exposed to frontend
      ip_address: sessionInfo.ip_address || '',
      user_agent: sessionInfo.device_info,
      client_type: sessionInfo.client_type === 'web' ? 'web' : 'extension',
      status: sessionInfo.status,
      created_at: new Date(sessionInfo.last_activity_at), // Using last_activity as created
      last_activity_at: new Date(sessionInfo.last_activity_at),
      expires_at: new Date(sessionInfo.expires_at),
      metadata: {
        time_to_expiration_minutes: sessionInfo.time_to_expiration_minutes,
        is_active: sessionInfo.is_active,
      },
    }));

    return sessions;
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
      throw new APIError('VALIDATION_ERROR', 'Invalid response format from server');
    }

    // Unknown error
    throw new APIError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Revoke a specific session by ID
 *
 * @param sessionId - UUID of the session to revoke
 * @throws {APIError} If revoke fails or session not found
 *
 * @example
 * ```typescript
 * await revokeSession('123e4567-e89b-12d3-a456-426614174000');
 * console.log('Session revoked successfully');
 * ```
 */
export async function revokeSession(sessionId: string): Promise<void> {
  // Validate session ID format
  if (!sessionId || typeof sessionId !== 'string') {
    throw new APIError('VALIDATION_ERROR', 'Invalid session ID');
  }

  try {
    const response = await authenticatedFetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();

      // Handle session not found (404)
      if (response.status === 404) {
        throw new APIError(
          'SESSION_NOT_FOUND',
          errorData.error.message || 'Session not found'
        );
      }

      // Handle unauthorized (401)
      if (response.status === 401) {
        throw new APIError(
          'UNAUTHORIZED',
          errorData.error.message || 'Authentication required'
        );
      }

      // Handle forbidden (403) - trying to revoke someone else's session
      if (response.status === 403) {
        throw new APIError(
          'FORBIDDEN',
          errorData.error.message || 'You cannot revoke this session'
        );
      }

      // Generic error
      throw new APIError(
        errorData.error.code || 'INTERNAL_ERROR',
        errorData.error.message || `Failed to revoke session: ${response.status}`
      );
    }

    // Parse and validate response
    const data = await response.json();
    RevokeSessionResponseSchema.parse(data);

    // Success - no return value needed
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
      throw new APIError('VALIDATION_ERROR', 'Invalid response format from server');
    }

    // Unknown error
    throw new APIError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

/**
 * Get session by ID (admin only)
 *
 * @param sessionId - UUID of the session to get
 * @returns Session information
 * @throws {APIError} If request fails or user is unauthorized
 */
export async function getSessionById(sessionId: string): Promise<Session> {
  // Validate session ID format
  if (!sessionId || typeof sessionId !== 'string') {
    throw new APIError('VALIDATION_ERROR', 'Invalid session ID');
  }

  try {
    const response = await authenticatedFetch(`/api/sessions/${sessionId}`, {
      method: 'GET',
    });

    // Handle error responses
    if (!response.ok) {
      const errorData: ErrorResponse = await response.json();

      // Handle session not found (404)
      if (response.status === 404) {
        throw new APIError(
          'SESSION_NOT_FOUND',
          errorData.error.message || 'Session not found'
        );
      }

      // Handle unauthorized (401)
      if (response.status === 401) {
        throw new APIError(
          'UNAUTHORIZED',
          errorData.error.message || 'Authentication required'
        );
      }

      // Generic error
      throw new APIError(
        errorData.error.code || 'INTERNAL_ERROR',
        errorData.error.message || `Failed to get session: ${response.status}`
      );
    }

    // Parse and validate response
    const data = await response.json();
    const sessionInfo = SessionInfoSchema.parse(data.data);

    // Convert SessionInfo to Session type
    const session: Session = {
      id: sessionInfo.id,
      user_id: '', // Not provided by API
      empresa_id: '', // Not provided by API
      device_id: sessionInfo.device_id,
      refresh_token_hash: '', // Not exposed to frontend
      device_fingerprint: '', // Not exposed to frontend
      ip_address: sessionInfo.ip_address || '',
      user_agent: sessionInfo.device_info,
      client_type: sessionInfo.client_type === 'web' ? 'web' : 'extension',
      status: sessionInfo.status,
      created_at: new Date(sessionInfo.last_activity_at),
      last_activity_at: new Date(sessionInfo.last_activity_at),
      expires_at: new Date(sessionInfo.expires_at),
      metadata: {
        time_to_expiration_minutes: sessionInfo.time_to_expiration_minutes,
        is_active: sessionInfo.is_active,
      },
    };

    return session;
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
      throw new APIError('VALIDATION_ERROR', 'Invalid response format from server');
    }

    // Unknown error
    throw new APIError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}
