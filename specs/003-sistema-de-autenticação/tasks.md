# Tasks: Sistema de Autenticação e Gerenciamento de Sessões

**Feature**: Sistema de Autenticação e Gerenciamento de Sessões
**Version**: 1.0.0
**Branch**: `003-sistema-de-autenticação`
**Generated**: 2025-10-01

---

## Task Overview

**Total Tasks**: 48
**Estimated Effort**: ~3-5 days (1-2 developers)
**TDD Approach**: All tests written before implementation

### Task Categories

- **Setup & Foundation** (6 tasks): Project structure, dependencies, base types
- **Contract Tests** (6 tasks): API schema validation tests
- **Core Utilities** (8 tasks): Device ID, fingerprinting, token handling
- **Services** (8 tasks): Auth and session API services
- **React Integration** (10 tasks): Context, hooks, and state management
- **UI Components** (8 tasks): Forms, modals, protected routes
- **Integration Tests** (7 tasks): End-to-end user scenarios
- **Polish & Documentation** (4 tasks): Performance, docs, cleanup

### Parallel Execution Guide

Tasks marked with `[P]` can be executed in parallel. Example:

```bash
# Execute 3 contract tests in parallel
claude --task "Complete T007: Contract test for POST /auth/login" &
claude --task "Complete T008: Contract test for POST /auth/logout" &
claude --task "Complete T009: Contract test for POST /auth/refresh-token" &
wait
```

---

## Setup & Foundation

### T001: Setup Feature Directory Structure

**Type**: Setup
**Dependencies**: None
**Files to Create**:
- `src/features/authentication/components/`
- `src/features/authentication/contexts/`
- `src/features/authentication/hooks/`
- `src/features/authentication/services/`
- `src/features/authentication/types/`
- `src/features/authentication/pages/`
- `src/features/authentication/index.ts`
- `src/shared/utils/device.ts` (placeholder)
- `src/shared/utils/token.ts` (placeholder)
- `src/shared/utils/storage.ts` (placeholder)

**Acceptance Criteria**:
- [ ] All directories created
- [ ] Each directory has a `.gitkeep` or placeholder file
- [ ] Feature has public API file (`index.ts`)
- [ ] Follows existing project structure in `src/features/`

---

### T002: Install and Configure Dependencies [P]

**Type**: Setup
**Dependencies**: None
**Command**: `bun add zod @fingerprintjs/fingerprintjs-pro`

**Acceptance Criteria**:
- [ ] Zod installed for schema validation
- [ ] FingerprintJS installed for device fingerprinting
- [ ] Dependencies added to `package.json`
- [ ] No breaking changes to existing deps

---

### T003: Create Base TypeScript Types [P]

**Type**: Implementation
**Dependencies**: T001
**File**: `src/features/authentication/types/auth.ts`

**Implementation**:
```typescript
// Copy interfaces from specs/003-sistema-de-autenticação/data-model.md
// - User, UserRole, UserStatus
// - AuthToken, TokenType, JWTPayload
// - Device, BrowserInfo, HardwareInfo
```

**Acceptance Criteria**:
- [ ] All auth-related types defined
- [ ] Matches data model spec exactly
- [ ] Exports are clean and documented
- [ ] No any types used

---

### T004: Create Session TypeScript Types [P]

**Type**: Implementation
**Dependencies**: T001
**File**: `src/features/authentication/types/session.ts`

**Implementation**:
```typescript
// Copy interfaces from specs/003-sistema-de-autenticação/data-model.md
// - Session, ClientType, SessionStatus
// - Company, CompanyPlan, CompanyStatus
// - CompanyLicenseConfig, EnforcementMode
// - SessionAuditLog, SessionEventType, EventResult
```

**Acceptance Criteria**:
- [ ] All session-related types defined
- [ ] Matches data model spec exactly
- [ ] Exports are clean and documented
- [ ] Includes PLAN_LIMITS constant

---

### T005: Copy Contract Schemas to Source [P]

**Type**: Setup
**Dependencies**: T001, T002
**Files to Create**:
- `src/features/authentication/contracts/types.ts`
- `src/features/authentication/contracts/auth-contracts.ts`
- `src/features/authentication/contracts/errors.ts`

**Implementation**:
```bash
# Copy from specs/003-sistema-de-autenticação/contracts/
cp specs/003-sistema-de-autenticação/contracts/*.ts src/features/authentication/contracts/
```

**Acceptance Criteria**:
- [ ] All Zod schemas copied
- [ ] Imports resolve correctly
- [ ] No TypeScript errors
- [ ] Schemas export types and validators

---

### T006: Setup Test Infrastructure

**Type**: Setup
**Dependencies**: None
**Files to Create**:
- `src/test/contract/auth-api.contract.test.ts`
- `src/test/integration/auth-flow.integration.test.ts`
- `src/test/mocks/authHandlers.ts`
- `vitest.config.ts` (update if exists)

**Acceptance Criteria**:
- [ ] Test directories created
- [ ] MSW handlers setup for mocking
- [ ] Vitest configured for contract and integration tests
- [ ] Test commands work: `bun test:contract`, `bun test:integration`

---

## Contract Tests (All Parallel)

### T007: Contract Test - POST /auth/login [P]

**Type**: Contract Test
**Dependencies**: T005, T006
**File**: `src/test/contract/auth-login.contract.test.ts`

**Implementation**:
```typescript
import { describe, it, expect } from 'vitest';
import { LoginRequestSchema, LoginResponseSchema } from '@/features/authentication/contracts/auth-contracts';

describe('POST /auth/login Contract', () => {
  it('validates LoginRequest schema', () => {
    const request = {
      email: 'test@example.com',
      password: 'Password123!',
      device_id: crypto.randomUUID(),
      device_fingerprint: 'fp_web_abc123',
      client_type: 'web'
    };
    expect(() => LoginRequestSchema.parse(request)).not.toThrow();
  });

  it('validates LoginResponse schema', () => {
    // TODO: Mock API response and validate
  });
});
```

**Acceptance Criteria**:
- [ ] Request schema validation passes
- [ ] Response schema validation test exists (will fail until T015)
- [ ] Test follows TDD (RED phase)
- [ ] Clear error messages on validation failure

---

### T008: Contract Test - POST /auth/logout [P]

**Type**: Contract Test
**Dependencies**: T005, T006
**File**: `src/test/contract/auth-logout.contract.test.ts`

**Acceptance Criteria**:
- [ ] LogoutRequest schema validated
- [ ] LogoutResponse schema test exists (will fail until T016)
- [ ] Test follows TDD (RED phase)

---

### T009: Contract Test - POST /auth/refresh-token [P]

**Type**: Contract Test
**Dependencies**: T005, T006
**File**: `src/test/contract/auth-refresh.contract.test.ts`

**Acceptance Criteria**:
- [ ] RefreshTokenRequest schema validated
- [ ] RefreshTokenResponse schema test exists (will fail until T017)
- [ ] Test follows TDD (RED phase)

---

### T010: Contract Test - GET /sessions/active [P]

**Type**: Contract Test
**Dependencies**: T005, T006
**File**: `src/test/contract/sessions-list.contract.test.ts`

**Acceptance Criteria**:
- [ ] ActiveSessionsResponse schema validated
- [ ] Array of sessions properly typed
- [ ] Test follows TDD (RED phase)

---

### T011: Contract Test - DELETE /sessions/{id} [P]

**Type**: Contract Test
**Dependencies**: T005, T006
**File**: `src/test/contract/sessions-revoke.contract.test.ts`

**Acceptance Criteria**:
- [ ] RevokeSessionRequest schema validated
- [ ] RevokeSessionResponse schema test exists
- [ ] Test follows TDD (RED phase)

---

### T012: Contract Test - Error Responses [P]

**Type**: Contract Test
**Dependencies**: T005, T006
**File**: `src/test/contract/error-responses.contract.test.ts`

**Implementation**:
```typescript
// Test all error schemas from contracts/errors.ts
// - SessionLimitError
// - InvalidTokenError
// - DeviceMismatchError
// - UnauthorizedError
```

**Acceptance Criteria**:
- [ ] All error schemas validated
- [ ] Error codes match spec
- [ ] Error messages are user-friendly
- [ ] Test follows TDD (RED phase)

---

## Core Utilities

### T013: Implement Device ID Utility

**Type**: Implementation
**Dependencies**: T003
**File**: `src/shared/utils/device.ts`

**Implementation**:
```typescript
/**
 * Get or create device ID from localStorage
 */
export function getOrCreateDeviceId(): string {
  const key = 'leadsrapido_device_id';
  let deviceId = localStorage.getItem(key);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }

  return deviceId;
}

/**
 * Generate device fingerprint using multiple components
 */
export async function generateDeviceFingerprint(clientType: 'web' | 'extension'): Promise<string> {
  // TODO: Implement fingerprinting logic
  // - Canvas fingerprint
  // - WebGL fingerprint
  // - Hardware info
  // - Browser info
  // Return: `fp_${clientType}_${hash}`
}
```

**Acceptance Criteria**:
- [ ] Device ID persists in localStorage
- [ ] Fingerprint includes 5+ components
- [ ] Fingerprint format: `fp_web_` or `fp_extension_` + hash
- [ ] Tests pass (create unit test first)

---

### T014: Unit Test for Device Utility [P]

**Type**: Unit Test
**Dependencies**: T013
**File**: `src/shared/utils/device.test.ts`

**Acceptance Criteria**:
- [ ] Tests device ID creation
- [ ] Tests device ID retrieval
- [ ] Tests fingerprint generation
- [ ] Mocks localStorage correctly
- [ ] All tests pass (GREEN phase)

---

### T015: Implement Token Utility

**Type**: Implementation
**Dependencies**: T003
**File**: `src/shared/utils/token.ts`

**Implementation**:
```typescript
import { JWTPayload } from '@/features/authentication/types/auth';

/**
 * Decode JWT token (no verification, just decode)
 */
export function decodeJWT(token: string): JWTPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');

  const payload = JSON.parse(atob(parts[1]));
  return payload as JWTPayload;
}

/**
 * Check if token is expiring soon (< 5 minutes)
 */
export function isTokenExpiringSoon(token: string, thresholdMinutes = 5): boolean {
  const payload = decodeJWT(token);
  const expiresAt = payload.exp * 1000; // Convert to ms
  const now = Date.now();
  const threshold = thresholdMinutes * 60 * 1000;

  return (expiresAt - now) < threshold;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  return Date.now() >= payload.exp * 1000;
}
```

**Acceptance Criteria**:
- [ ] Decodes JWT correctly
- [ ] Validates expiration logic
- [ ] Handles invalid tokens gracefully
- [ ] Tests pass (create unit test first)

---

### T016: Unit Test for Token Utility [P]

**Type**: Unit Test
**Dependencies**: T015
**File**: `src/shared/utils/token.test.ts`

**Acceptance Criteria**:
- [ ] Tests JWT decoding
- [ ] Tests expiration detection
- [ ] Tests invalid token handling
- [ ] All tests pass (GREEN phase)

---

### T017: Implement Storage Utility

**Type**: Implementation
**Dependencies**: T003
**File**: `src/shared/utils/storage.ts`

**Implementation**:
```typescript
/**
 * Type-safe localStorage wrapper for auth tokens
 */
export const authStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  },

  setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  },

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getLastActivity(): Date | null {
    const ts = localStorage.getItem('last_activity');
    return ts ? new Date(parseInt(ts)) : null;
  },

  updateLastActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString());
  }
};
```

**Acceptance Criteria**:
- [ ] Type-safe API for token storage
- [ ] Tracks last activity timestamp
- [ ] Clear method removes all auth data
- [ ] Tests pass (create unit test first)

---

### T018: Unit Test for Storage Utility [P]

**Type**: Unit Test
**Dependencies**: T017
**File**: `src/shared/utils/storage.test.ts`

**Acceptance Criteria**:
- [ ] Tests all storage methods
- [ ] Mocks localStorage
- [ ] Validates type safety
- [ ] All tests pass (GREEN phase)

---

### T019: Implement API Client with Interceptors

**Type**: Implementation
**Dependencies**: T015, T017
**File**: `src/shared/services/apiClient.ts`

**Implementation**:
```typescript
/**
 * Fetch wrapper with auth interceptors
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = authStorage.getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  // Handle 401 - trigger token refresh
  if (response.status === 401) {
    // TODO: Trigger refresh flow
  }

  return response;
}
```

**Acceptance Criteria**:
- [ ] Adds Authorization header automatically
- [ ] Handles 401 responses
- [ ] Type-safe request/response
- [ ] Tests pass (create unit test first)

---

### T020: Unit Test for API Client [P]

**Type**: Unit Test
**Dependencies**: T019
**File**: `src/shared/services/apiClient.test.ts`

**Acceptance Criteria**:
- [ ] Tests header injection
- [ ] Tests 401 handling
- [ ] Mocks fetch correctly
- [ ] All tests pass (GREEN phase)

---

## Services

### T021: Implement Auth Service - Login

**Type**: Implementation
**Dependencies**: T005, T013, T019
**File**: `src/features/authentication/services/authService.ts`

**Implementation**:
```typescript
import { LoginRequest, LoginResponse } from '../contracts/auth-contracts';
import { authenticatedFetch } from '@/shared/services/apiClient';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  return data as LoginResponse;
}
```

**Acceptance Criteria**:
- [ ] Calls POST /auth/login
- [ ] Validates request with Zod
- [ ] Validates response with Zod
- [ ] Makes T007 contract test pass (GREEN)

---

### T022: Implement Auth Service - Logout

**Type**: Implementation
**Dependencies**: T005, T019
**File**: `src/features/authentication/services/authService.ts` (update)

**Implementation**:
```typescript
export async function logout(device_id: string): Promise<void> {
  await authenticatedFetch('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ device_id }),
  });

  authStorage.clearTokens();
}
```

**Acceptance Criteria**:
- [ ] Calls POST /auth/logout
- [ ] Clears localStorage tokens
- [ ] Makes T008 contract test pass (GREEN)

---

### T023: Implement Auth Service - Refresh Token

**Type**: Implementation
**Dependencies**: T005, T013, T015, T019
**File**: `src/features/authentication/services/authService.ts` (update)

**Implementation**:
```typescript
export async function refreshAccessToken(): Promise<RefreshTokenResponse> {
  const refreshToken = authStorage.getRefreshToken();
  const deviceId = getOrCreateDeviceId();
  const fingerprint = await generateDeviceFingerprint('web');

  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({
      refresh_token: refreshToken,
      device_id: deviceId,
      device_fingerprint: fingerprint,
      client_type: 'web',
    }),
  });

  const data = await response.json();

  // Update tokens in storage
  authStorage.setAccessToken(data.data.access_token);
  authStorage.setRefreshToken(data.data.refresh_token);

  return data;
}
```

**Acceptance Criteria**:
- [ ] Calls POST /auth/refresh-token
- [ ] Updates tokens in localStorage
- [ ] Makes T009 contract test pass (GREEN)

---

### T024: Implement Session Service - List Active

**Type**: Implementation
**Dependencies**: T005, T019
**File**: `src/features/authentication/services/sessionService.ts`

**Implementation**:
```typescript
export async function listActiveSessions(): Promise<Session[]> {
  const response = await authenticatedFetch('/api/sessions/active');
  const data = await response.json();
  return data.data.sessions;
}
```

**Acceptance Criteria**:
- [ ] Calls GET /sessions/active
- [ ] Returns array of Session objects
- [ ] Makes T010 contract test pass (GREEN)

---

### T025: Implement Session Service - Revoke

**Type**: Implementation
**Dependencies**: T005, T019
**File**: `src/features/authentication/services/sessionService.ts` (update)

**Implementation**:
```typescript
export async function revokeSession(sessionId: string): Promise<void> {
  await authenticatedFetch(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
  });
}
```

**Acceptance Criteria**:
- [ ] Calls DELETE /sessions/{id}
- [ ] Makes T011 contract test pass (GREEN)

---

### T026: Unit Test for Auth Service [P]

**Type**: Unit Test
**Dependencies**: T021, T022, T023
**File**: `src/features/authentication/services/authService.test.ts`

**Acceptance Criteria**:
- [ ] Tests login flow
- [ ] Tests logout flow
- [ ] Tests refresh flow
- [ ] Mocks API calls with MSW
- [ ] All tests pass

---

### T027: Unit Test for Session Service [P]

**Type**: Unit Test
**Dependencies**: T024, T025
**File**: `src/features/authentication/services/sessionService.test.ts`

**Acceptance Criteria**:
- [ ] Tests list sessions
- [ ] Tests revoke session
- [ ] Mocks API calls with MSW
- [ ] All tests pass

---

### T028: Implement Error Handling in Services

**Type**: Implementation
**Dependencies**: T021-T025
**Files**: All service files

**Implementation**:
```typescript
// Add proper error handling for:
// - Network errors
// - Validation errors
// - API errors (4xx, 5xx)
// - SessionLimitError (403)
// - InvalidTokenError
```

**Acceptance Criteria**:
- [ ] All errors are typed
- [ ] Error messages are user-friendly
- [ ] Makes T012 contract test pass (GREEN)
- [ ] Logs errors appropriately

---

## React Integration

### T029: Create Auth Context

**Type**: Implementation
**Dependencies**: T003, T021-T023
**File**: `src/features/authentication/contexts/AuthContext.tsx`

**Implementation**:
```typescript
import { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/auth';
import { authStorage } from '@/shared/utils/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const token = authStorage.getAccessToken();
    if (token && !isTokenExpired(token)) {
      const payload = decodeJWT(token);
      // TODO: Fetch user data
    }
    setIsLoading(false);
  }, []);

  // TODO: Implement login, logout methods

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Acceptance Criteria**:
- [ ] Context provides auth state
- [ ] Initializes from localStorage
- [ ] Provides login/logout methods
- [ ] Tests pass (create test first)

---

### T030: Unit Test for Auth Context [P]

**Type**: Unit Test
**Dependencies**: T029
**File**: `src/features/authentication/contexts/AuthContext.test.tsx`

**Acceptance Criteria**:
- [ ] Tests context initialization
- [ ] Tests login flow
- [ ] Tests logout flow
- [ ] Uses React Testing Library
- [ ] All tests pass

---

### T031: Create useAuth Hook

**Type**: Implementation
**Dependencies**: T029
**File**: `src/features/authentication/hooks/useAuth.ts`

**Implementation**:
```typescript
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
```

**Acceptance Criteria**:
- [ ] Returns auth context
- [ ] Throws error if used outside provider
- [ ] Type-safe return value
- [ ] Tests pass

---

### T032: Unit Test for useAuth Hook [P]

**Type**: Unit Test
**Dependencies**: T031
**File**: `src/features/authentication/hooks/useAuth.test.ts`

**Acceptance Criteria**:
- [ ] Tests hook usage
- [ ] Tests error when no provider
- [ ] All tests pass

---

### T033: Create useTokenRefresh Hook

**Type**: Implementation
**Dependencies**: T015, T023, T031
**File**: `src/features/authentication/hooks/useTokenRefresh.ts`

**Implementation**:
```typescript
import { useEffect } from 'react';
import { isTokenExpiringSoon } from '@/shared/utils/token';
import { refreshAccessToken } from '../services/authService';
import { authStorage } from '@/shared/utils/storage';

export function useTokenRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = authStorage.getAccessToken();

      if (token && isTokenExpiringSoon(token, 5)) {
        try {
          await refreshAccessToken();
        } catch (error) {
          console.error('Token refresh failed:', error);
          // TODO: Trigger re-login
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
}
```

**Acceptance Criteria**:
- [ ] Checks token expiration every minute
- [ ] Refreshes when < 5 min remaining
- [ ] Handles refresh failure gracefully
- [ ] Tests pass (create test first)

---

### T034: Unit Test for useTokenRefresh Hook [P]

**Type**: Unit Test
**Dependencies**: T033
**File**: `src/features/authentication/hooks/useTokenRefresh.test.ts`

**Acceptance Criteria**:
- [ ] Tests refresh trigger
- [ ] Tests interval cleanup
- [ ] Tests error handling
- [ ] Mocks timers with vi.useFakeTimers()
- [ ] All tests pass

---

### T035: Create useActivityMonitor Hook

**Type**: Implementation
**Dependencies**: T017
**File**: `src/features/authentication/hooks/useActivityMonitor.ts`

**Implementation**:
```typescript
import { useEffect } from 'react';
import { authStorage } from '@/shared/utils/storage';

export function useActivityMonitor() {
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const updateActivity = () => {
      authStorage.updateLastActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, []);
}
```

**Acceptance Criteria**:
- [ ] Tracks user activity events
- [ ] Updates last activity timestamp
- [ ] Cleans up event listeners
- [ ] Tests pass

---

### T036: Unit Test for useActivityMonitor Hook [P]

**Type**: Unit Test
**Dependencies**: T035
**File**: `src/features/authentication/hooks/useActivityMonitor.test.ts`

**Acceptance Criteria**:
- [ ] Tests activity tracking
- [ ] Tests event listener cleanup
- [ ] Mocks DOM events
- [ ] All tests pass

---

### T037: Create useAuthenticatedFetch Hook

**Type**: Implementation
**Dependencies**: T019, T031
**File**: `src/features/authentication/hooks/useAuthenticatedFetch.ts`

**Implementation**:
```typescript
import { useCallback } from 'react';
import { authenticatedFetch } from '@/shared/services/apiClient';

export function useAuthenticatedFetch() {
  const fetch = useCallback(async (url: string, options?: RequestInit) => {
    return authenticatedFetch(url, options);
  }, []);

  return fetch;
}
```

**Acceptance Criteria**:
- [ ] Wraps authenticatedFetch
- [ ] Returns memoized callback
- [ ] Type-safe
- [ ] Tests pass

---

### T038: Unit Test for useAuthenticatedFetch Hook [P]

**Type**: Unit Test
**Dependencies**: T037
**File**: `src/features/authentication/hooks/useAuthenticatedFetch.test.ts`

**Acceptance Criteria**:
- [ ] Tests fetch wrapper
- [ ] Tests memoization
- [ ] All tests pass

---

## UI Components

### T039: Create LoginForm Component

**Type**: Implementation
**Dependencies**: T031
**File**: `src/features/authentication/components/LoginForm.tsx`

**Implementation**:
```typescript
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* TODO: Implement form UI with Tailwind */}
    </form>
  );
}
```

**Acceptance Criteria**:
- [ ] Form validation
- [ ] Error display
- [ ] Loading state
- [ ] Tailwind styling
- [ ] Tests pass (create test first)

---

### T040: Unit Test for LoginForm Component [P]

**Type**: Unit Test
**Dependencies**: T039
**File**: `src/features/authentication/components/LoginForm.test.tsx`

**Acceptance Criteria**:
- [ ] Tests form submission
- [ ] Tests error handling
- [ ] Tests loading state
- [ ] Uses React Testing Library
- [ ] All tests pass

---

### T041: Create ProtectedRoute Component

**Type**: Implementation
**Dependencies**: T031
**File**: `src/features/authentication/components/ProtectedRoute.tsx`

**Implementation**:
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

**Acceptance Criteria**:
- [ ] Redirects to login if not authenticated
- [ ] Shows loading state
- [ ] Preserves intended destination
- [ ] Tests pass

---

### T042: Create SessionManager Component

**Type**: Implementation
**Dependencies**: T024, T025, T031
**File**: `src/features/authentication/components/SessionManager.tsx`

**Implementation**:
```typescript
import { useEffect, useState } from 'react';
import { Session } from '../types/session';
import { listActiveSessions, revokeSession } from '../services/sessionService';
import { SessionCard } from './SessionCard';

export function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const data = await listActiveSessions();
    setSessions(data);
  };

  const handleRevoke = async (sessionId: string) => {
    await revokeSession(sessionId);
    await loadSessions();
  };

  return (
    <div className="space-y-4">
      {sessions.map(session => (
        <SessionCard key={session.id} session={session} onRevoke={handleRevoke} />
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Lists all active sessions
- [ ] Allows revoking sessions
- [ ] Updates list after revoke
- [ ] Tests pass

---

### T043: Create SessionCard Component [P]

**Type**: Implementation
**Dependencies**: T004
**File**: `src/features/authentication/components/SessionCard.tsx`

**Implementation**:
```typescript
interface SessionCardProps {
  session: Session;
  onRevoke: (sessionId: string) => void;
}

export function SessionCard({ session, onRevoke }: SessionCardProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{session.device_id}</h3>
      <p>Client: {session.client_type}</p>
      <p>Last active: {new Date(session.last_activity_at).toLocaleString()}</p>
      <button onClick={() => onRevoke(session.id)}>Revoke</button>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Shows session details
- [ ] Revoke button works
- [ ] Tailwind styling
- [ ] Tests pass

---

### T044: Create SessionLimitModal Component [P]

**Type**: Implementation
**Dependencies**: T024
**File**: `src/features/authentication/components/SessionLimitModal.tsx`

**Implementation**:
```typescript
interface SessionLimitModalProps {
  isOpen: boolean;
  sessions: Session[];
  onClose: () => void;
  onRevoke: (sessionId: string) => void;
}

export function SessionLimitModal({ isOpen, sessions, onClose, onRevoke }: SessionLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>License Limit Reached</h2>
      <p>You have reached your device limit. Disconnect a session to continue.</p>
      {/* List sessions with revoke option */}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Modal shows on limit error
- [ ] Lists active sessions
- [ ] Allows revoking to free slot
- [ ] Tests pass

---

### T045: Create SessionExpirationWarning Component [P]

**Type**: Implementation
**Dependencies**: T015, T031
**File**: `src/features/authentication/components/SessionExpirationWarning.tsx`

**Implementation**:
```typescript
export function SessionExpirationWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check if session is expiring soon
    // Show warning if < 5 min to expiration
  }, []);

  if (!showWarning) return null;

  return (
    <div className="warning-banner">
      Your session will expire soon. Save your work!
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Shows warning before expiration
- [ ] Auto-hides after user activity
- [ ] Non-intrusive UI
- [ ] Tests pass

---

### T046: Create LoginPage [P]

**Type**: Implementation
**Dependencies**: T039
**File**: `src/features/authentication/pages/LoginPage.tsx`

**Implementation**:
```typescript
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login - LeadsRapido</h1>
        <LoginForm />
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Uses LoginForm component
- [ ] Tailwind styling
- [ ] Responsive design
- [ ] Tests pass

---

## Integration Tests

### T047: Integration Test - First-time Login Flow [P]

**Type**: Integration Test
**Dependencies**: T021, T029, T039
**File**: `src/test/integration/first-login.integration.test.ts`

**Test Scenario** (from spec.md):
```
1. Given a new user opens the web application
2. When they enter valid credentials and submit login
3. Then the system creates a unique device identifier, authenticates, and creates session
```

**Acceptance Criteria**:
- [ ] Tests complete login flow
- [ ] Verifies device_id creation
- [ ] Verifies token storage
- [ ] Uses real API or test database
- [ ] All assertions pass

---

### T048: Integration Test - Session Sharing [P]

**Type**: Integration Test
**Dependencies**: T021, T024
**File**: `src/test/integration/session-sharing.integration.test.ts`

**Test Scenario**:
```
1. Given user logged in on web
2. When extension opens on same device
3. Then session is shared (same device_id)
```

**Acceptance Criteria**:
- [ ] Tests session sharing logic
- [ ] Verifies device_id reuse
- [ ] Verifies client_type update
- [ ] All assertions pass

---

### T049: Integration Test - License Limit Enforcement [P]

**Type**: Integration Test
**Dependencies**: T021, T044
**File**: `src/test/integration/license-limit.integration.test.ts`

**Test Scenario**:
```
1. Given company with Básico plan (2 devices)
2. When 3rd user attempts login
3. Then login blocked with SessionLimitError
```

**Acceptance Criteria**:
- [ ] Tests limit enforcement
- [ ] Verifies error response
- [ ] Tests revoke to free slot
- [ ] All assertions pass

---

### T050: Integration Test - Auto Token Refresh [P]

**Type**: Integration Test
**Dependencies**: T023, T033
**File**: `src/test/integration/token-refresh.integration.test.ts`

**Test Scenario**:
```
1. Given user active for 40 minutes
2. When token < 5min to expire
3. Then auto-refresh occurs in background
```

**Acceptance Criteria**:
- [ ] Tests refresh trigger
- [ ] Verifies token update
- [ ] Verifies transparent UX
- [ ] All assertions pass

---

### T051: Integration Test - Session Expiration [P]

**Type**: Integration Test
**Dependencies**: T029, T035
**File**: `src/test/integration/session-expiration.integration.test.ts`

**Test Scenario**:
```
1. Given user logged in but inactive
2. When 45 minutes pass
3. Then session expires, user redirected to login
```

**Acceptance Criteria**:
- [ ] Tests inactivity tracking
- [ ] Verifies session expiration
- [ ] Verifies redirect to login
- [ ] All assertions pass

---

### T052: Integration Test - Manual Session Management [P]

**Type**: Integration Test
**Dependencies**: T024, T025, T042
**File**: `src/test/integration/session-management.integration.test.ts`

**Test Scenario**:
```
1. Given user logged in from multiple devices
2. When viewing sessions list
3. Then can see all sessions and revoke any
```

**Acceptance Criteria**:
- [ ] Tests session list display
- [ ] Tests revoke functionality
- [ ] Verifies UI updates
- [ ] All assertions pass

---

### T053: Integration Test - Suspicious Activity Detection [P]

**Type**: Integration Test
**Dependencies**: T013, T023
**File**: `src/test/integration/suspicious-activity.integration.test.ts`

**Test Scenario**:
```
1. Given active session
2. When fingerprint changes significantly
3. Then session marked suspicious, re-auth required
```

**Acceptance Criteria**:
- [ ] Tests fingerprint validation
- [ ] Verifies suspicious marking
- [ ] Tests re-auth flow
- [ ] All assertions pass

---

## Polish & Documentation

### T054: Performance Optimization [P]

**Type**: Optimization
**Dependencies**: All previous tasks

**Tasks**:
- [ ] Lazy load non-critical components
- [ ] Optimize fingerprint generation (< 100ms)
- [ ] Add request debouncing where needed
- [ ] Measure and log performance metrics
- [ ] Ensure login < 2s (p95)
- [ ] Ensure refresh < 500ms (p95)

---

### T055: Update Public API Exports [P]

**Type**: Documentation
**Dependencies**: All implementation tasks
**File**: `src/features/authentication/index.ts`

**Implementation**:
```typescript
// Components
export { LoginForm } from './components/LoginForm';
export { ProtectedRoute } from './components/ProtectedRoute';
export { SessionManager } from './components/SessionManager';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useAuthenticatedFetch } from './hooks/useAuthenticatedFetch';

// Context
export { AuthProvider } from './contexts/AuthContext';

// Pages
export { LoginPage } from './pages/LoginPage';

// Types
export type { User, Session } from './types/auth';
```

**Acceptance Criteria**:
- [ ] All public APIs exported
- [ ] Types exported
- [ ] Clean barrel exports
- [ ] No internal leaks

---

### T056: Add JSDoc Documentation [P]

**Type**: Documentation
**Dependencies**: All implementation tasks

**Tasks**:
- [ ] Document all public functions
- [ ] Document all hooks
- [ ] Document all components
- [ ] Add usage examples
- [ ] Document gotchas and edge cases

---

### T057: Final Code Review & Cleanup

**Type**: Quality
**Dependencies**: All tasks

**Tasks**:
- [ ] Remove console.logs
- [ ] Remove TODOs
- [ ] Check TypeScript strict mode
- [ ] Run linter and fix issues
- [ ] Verify 80%+ test coverage
- [ ] Run all tests: `bun test`
- [ ] Build succeeds: `bun run build`
- [ ] No TypeScript errors

---

## Task Execution Order

### Phase 1: Setup (T001-T006)
Run sequentially to establish foundation.

### Phase 2: Contracts (T007-T012)
Run all in parallel - independent validation.

### Phase 3: Core Utilities (T013-T020)
- T013, T014 (device) in parallel
- T015, T016 (token) in parallel
- T017, T018 (storage) in parallel
- T019, T020 (api client) after storage

### Phase 4: Services (T021-T028)
- T021, T022, T023 (auth) sequential
- T024, T025 (session) sequential
- T026, T027, T028 (tests) in parallel after implementations

### Phase 5: React Integration (T029-T038)
- T029, T030 (context) first
- T031, T032 (useAuth) after context
- T033-T038 (other hooks) in parallel after useAuth

### Phase 6: UI Components (T039-T046)
- T039, T040 (LoginForm) first
- T041 (ProtectedRoute) parallel with LoginForm
- T042-T046 all in parallel after core components

### Phase 7: Integration Tests (T047-T053)
Run all in parallel - independent scenarios.

### Phase 8: Polish (T054-T057)
Run in parallel to complete project.

---

## Success Metrics

**Technical**:
- [ ] 100% contract tests passing
- [ ] 100% integration tests passing
- [ ] 80%+ unit test coverage
- [ ] 0 TypeScript errors
- [ ] 0 linting errors
- [ ] Build succeeds

**Performance**:
- [ ] Login < 2s (p95)
- [ ] Token refresh < 500ms (p95)
- [ ] Device fingerprint < 100ms

**Quality**:
- [ ] All public APIs documented
- [ ] All edge cases handled
- [ ] Error messages user-friendly
- [ ] Code follows project conventions

---

**Ready to start?** Begin with T001 and follow the execution order above.

For parallel execution, use the Task agent to run multiple tasks concurrently.
