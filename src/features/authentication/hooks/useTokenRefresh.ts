/**
 * useTokenRefresh Hook
 * Auto-refreshes access token when it's close to expiration
 * Implements T033 from tasks.md
 */

import { useEffect, useRef } from 'react';
import { isTokenExpiringSoon } from '@/shared/utils/token';
import { authStorage } from '@/shared/utils/storage';
import { getOrCreateDeviceId, generateDeviceFingerprint } from '@/shared/utils/device';
import type { RefreshTokenRequest, RefreshTokenResponse } from '../contracts/auth-contracts';
import { useAuth } from './useAuth';

/**
 * Hook to automatically refresh access tokens
 * Checks every minute and refreshes if token expires in less than 5 minutes
 *
 * @param thresholdMinutes - Minutes before expiration to trigger refresh (default: 5)
 *
 * @example
 * ```tsx
 * function App() {
 *   useTokenRefresh(); // Auto-refresh with default 5-minute threshold
 *
 *   return <div>App content</div>;
 * }
 * ```
 */
export function useTokenRefresh(thresholdMinutes: number = 5): void {
  const { logout, refreshUser } = useAuth();
  const isRefreshing = useRef(false);

  useEffect(() => {
    /**
     * Refresh the access token
     */
    const refreshAccessToken = async (): Promise<void> => {
      // Prevent concurrent refresh calls
      if (isRefreshing.current) {
        return;
      }

      isRefreshing.current = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        const deviceId = getOrCreateDeviceId();

        if (!refreshToken) {
          console.warn('No refresh token available');
          await logout();
          return;
        }

        const deviceFingerprint = await generateDeviceFingerprint('web');

        const refreshRequest: RefreshTokenRequest = {
          refresh_token: refreshToken,
          device_id: deviceId,
          device_fingerprint: deviceFingerprint,
          client_type: 'web',
        };

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(refreshRequest),
        });

        if (!response.ok) {
          console.error('Token refresh failed:', response.status);
          await logout();
          return;
        }

        const data: RefreshTokenResponse = await response.json();

        // Update tokens in storage
        authStorage.setAccessToken(data.data.access_token);
        authStorage.setRefreshToken(data.data.refresh_token);
        authStorage.setSessionId(data.data.session.id);
        authStorage.updateLastActivity();

        // Refresh user data from new token
        await refreshUser();

        console.debug('Token refreshed successfully');
      } catch (error) {
        console.error('Token refresh error:', error);
        await logout();
      } finally {
        isRefreshing.current = false;
      }
    };

    /**
     * Check if token needs refresh
     */
    const checkTokenExpiration = async (): Promise<void> => {
      const token = authStorage.getAccessToken();

      if (!token) {
        return;
      }

      if (isTokenExpiringSoon(token, thresholdMinutes)) {
        console.debug('Token expiring soon, refreshing...');
        await refreshAccessToken();
      }
    };

    // Check immediately on mount
    checkTokenExpiration();

    // Check every minute
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // 60 seconds

    return () => {
      clearInterval(interval);
    };
  }, [thresholdMinutes, logout, refreshUser]);
}
