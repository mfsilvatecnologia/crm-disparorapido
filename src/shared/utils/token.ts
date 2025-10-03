/**
 * JWT Token Utilities
 * Handles JWT decoding and expiration checking
 */

import type { JWTPayload } from '../types';

/**
 * Decode JWT token (no verification, just decode)
 * @param token - JWT token string
 * @returns Decoded JWT payload
 * @throws Error if token format is invalid
 */
export function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload as JWTPayload;
  } catch (e) {
    throw new Error('Failed to decode JWT payload');
  }
}

/**
 * Check if token is expiring soon (< threshold minutes)
 * @param token - JWT token string
 * @param thresholdMinutes - Minutes threshold (default: 5)
 * @returns true if token expires within threshold
 */
export function isTokenExpiringSoon(
  token: string,
  thresholdMinutes: number = 5
): boolean {
  try {
    const payload = decodeJWT(token);
    const expiresAt = payload.exp * 1000; // Convert to ms
    const now = Date.now();
    const threshold = thresholdMinutes * 60 * 1000;

    return (expiresAt - now) < threshold;
  } catch (e) {
    // If we can't decode the token, consider it expiring
    return true;
  }
}

/**
 * Check if token is expired
 * @param token - JWT token string
 * @returns true if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    // If we can't decode the token, consider it expired
    return true;
  }
}

/**
 * Get time until token expiration in milliseconds
 * @param token - JWT token string
 * @returns milliseconds until expiration, or 0 if expired/invalid
 */
export function getTimeUntilExpiration(token: string): number {
  try {
    const payload = decodeJWT(token);
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    const timeRemaining = expiresAt - now;

    return Math.max(0, timeRemaining);
  } catch (e) {
    return 0;
  }
}

/**
 * Validate token format without decoding
 * @param token - JWT token string
 * @returns true if token has valid JWT format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3;
}
