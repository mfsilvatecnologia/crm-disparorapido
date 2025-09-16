// SessionContext - Manages session state and validation
// Integration with refresh token system (spec 003)

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getOrCreateDeviceId, getDeviceFingerprint } from '../lib/device'
import { getCurrentSession } from '../lib/api/sessions'
import type { SessionContext as SessionContextType, UserSession } from '../types/auth'

const SessionContext = createContext<SessionContextType | null>(null)

export interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [deviceId] = useState(getOrCreateDeviceId())
  const [fingerprint] = useState(getDeviceFingerprint())
  const queryClient = useQueryClient()

  // Query current session information
  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', deviceId],
    queryFn: async () => {
      const token = localStorage.getItem(
        import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token'
      )
      if (!token) return Promise.resolve(null)

      try {
        return await getCurrentSession(token, deviceId)
      } catch (error: any) {
        // Log session validation errors but don't throw
        console.warn('Session validation failed:', error.message || error)

        // Only return null for network errors or temporary failures
        // Let 401 errors be handled by the API client's refresh logic
        if (error.status === 401) {
          throw error; // Let API client handle token refresh
        }

        return null; // Treat other errors as no session
      }
    },
    enabled: !!deviceId,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Retry network errors but not auth errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  })

  // More defensive session validation
  const isValidSession = (() => {
    if (!session) return false;

    const isActive = session.status === 'active';
    const deviceMatches = session.device_id === deviceId;
    const notExpired = new Date(session.expires_at) > new Date();

    return isActive && deviceMatches && notExpired;
  })();

  // Auto-refresh session data and invalidate related caches when session becomes invalid
  useEffect(() => {
    if (session && !isValidSession) {
      // Only invalidate if we have a session but it's invalid
      // This prevents unnecessary cache invalidation on initial load
      const reasons = [];
      if (session.status !== 'active') reasons.push('inactive status');
      if (session.device_id !== deviceId) reasons.push('device mismatch');
      if (new Date(session.expires_at) <= new Date()) reasons.push('expired');

      console.warn('Session became invalid:', {
        reasons,
        status: session.status,
        device_match: session.device_id === deviceId,
        expired: new Date(session.expires_at) <= new Date(),
        session_id: session.session_id
      });

      // Only invalidate permissions if session is truly invalid
      // Don't invalidate on temporary network errors
      if (!error) {
        queryClient.invalidateQueries({ queryKey: ['permissions'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    }
  }, [isValidSession, session, queryClient, deviceId, error])

  // Monitor session status changes
  useEffect(() => {
    if (session) {
      // Set up monitoring for session state changes
      const checkInterval = setInterval(() => {
        const now = new Date()
        const expiresAt = new Date(session.expires_at)

        if (expiresAt <= now) {
          console.warn('Session expired, invalidating caches')
          queryClient.invalidateQueries({ queryKey: ['session'] })
          queryClient.invalidateQueries({ queryKey: ['permissions'] })
        }
      }, 60 * 1000) // Check every minute

      return () => clearInterval(checkInterval)
    }
  }, [session, queryClient])

  const value: SessionContextType = {
    session: session || null,
    deviceId,
    fingerprint,
    isValidSession
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}

// Helper hook to get session-aware API headers
export function useSessionHeaders() {
  const { deviceId, isValidSession } = useSession()

  return React.useMemo(() => {
    const token = localStorage.getItem(
      import.meta.env.VITE_AUTH_TOKEN_KEY || 'leadsrapido_auth_token'
    )

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token && isValidSession) {
      headers['Authorization'] = `Bearer ${token}`
      headers['X-Device-Id'] = deviceId
    }

    return headers
  }, [deviceId, isValidSession])
}