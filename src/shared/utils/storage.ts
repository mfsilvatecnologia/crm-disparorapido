/**
 * Storage Utilities for Authentication
 * Type-safe localStorage wrapper for auth tokens and session data
 */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const LAST_ACTIVITY_KEY = 'last_activity';
const SESSION_ID_KEY = 'session_id';

/**
 * Type-safe localStorage wrapper for auth tokens
 */
export const authStorage = {
  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  /**
   * Set refresh token in localStorage
   */
  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /**
   * Get session ID from localStorage
   */
  getSessionId(): string | null {
    return localStorage.getItem(SESSION_ID_KEY);
  },

  /**
   * Set session ID in localStorage
   */
  setSessionId(sessionId: string): void {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  },

  /**
   * Clear all tokens from localStorage
   */
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  },

  /**
   * Get last activity timestamp
   */
  getLastActivity(): Date | null {
    const ts = localStorage.getItem(LAST_ACTIVITY_KEY);
    return ts ? new Date(parseInt(ts)) : null;
  },

  /**
   * Update last activity timestamp to current time
   */
  updateLastActivity(): void {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  },

  /**
   * Check if user has valid tokens (not checking expiration)
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  },

  /**
   * Get all auth data as an object
   */
  getAllAuthData(): {
    accessToken: string | null;
    refreshToken: string | null;
    sessionId: string | null;
    lastActivity: Date | null;
  } {
    return {
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
      sessionId: this.getSessionId(),
      lastActivity: this.getLastActivity()
    };
  }
};
