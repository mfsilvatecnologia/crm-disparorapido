# Authentication Services

This directory contains all authentication and session management services implementing Tasks T021-T028 from the authentication specification.

## Files Overview

### Core Services

1. **authService.ts** - Authentication operations (T021-T023)
   - `login()` - User login with device tracking
   - `logout()` - User logout with session cleanup
   - `refreshAccessToken()` - Token refresh with fingerprint validation

2. **sessionService.ts** - Session management operations (T024-T025)
   - `listActiveSessions()` - List all active sessions
   - `revokeSession()` - Revoke a specific session
   - `getSessionById()` - Get session details (admin)

3. **index.ts** - Public API exports

### Supporting Files

- **apiClient.ts** (in `src/shared/services/`) - Authenticated fetch wrapper (T019)

## Usage Examples

### Login

```typescript
import { login } from '@/features/authentication/services';
import { getOrCreateDeviceId, generateDeviceFingerprint } from '@/shared/utils/device';
import { SessionLimitError, APIError } from '@/features/authentication/contracts/errors';

try {
  const response = await login({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    device_id: getOrCreateDeviceId(),
    device_fingerprint: await generateDeviceFingerprint('web'),
    client_type: 'web'
  });

  console.log('Login successful!', response.data.user);
  console.log('Session expires at:', response.data.session.expires_at);

  // Tokens are automatically stored in localStorage
} catch (error) {
  if (error instanceof SessionLimitError) {
    // Handle device limit reached - show modal to revoke sessions
    console.error('Device limit reached:', error.limitDetails);
    console.log(`Current: ${error.limitDetails.current_sessions}/${error.limitDetails.max_sessions}`);
  } else if (error instanceof APIError) {
    // Handle other API errors
    console.error('Login failed:', error.message);
  }
}
```

### Logout

```typescript
import { logout } from '@/features/authentication/services';
import { getOrCreateDeviceId } from '@/shared/utils/device';

try {
  await logout(getOrCreateDeviceId());
  console.log('Logout successful');

  // Tokens are automatically cleared from localStorage
  // Redirect to login page
} catch (error) {
  console.error('Logout error:', error);
  // Tokens are cleared even if API call fails
}
```

### Refresh Token

```typescript
import { refreshAccessToken } from '@/features/authentication/services';
import { InvalidTokenError, DeviceMismatchError } from '@/features/authentication/contracts/errors';

try {
  const response = await refreshAccessToken();
  console.log('Token refreshed successfully');
  console.log('New expiration:', response.data.expires_at);

  // New tokens are automatically stored in localStorage
} catch (error) {
  if (error instanceof InvalidTokenError) {
    // Refresh token expired - redirect to login
    console.error('Session expired, please login again');
    window.location.href = '/login';
  } else if (error instanceof DeviceMismatchError) {
    // Device fingerprint changed - suspicious activity
    console.error('Device mismatch detected');
    window.location.href = '/login';
  }
}
```

### List Active Sessions

```typescript
import { listActiveSessions } from '@/features/authentication/services';

try {
  const sessions = await listActiveSessions();

  console.log(`You have ${sessions.length} active sessions`);

  sessions.forEach(session => {
    console.log(`Device: ${session.device_id}`);
    console.log(`Type: ${session.client_type}`);
    console.log(`Last active: ${session.last_activity_at}`);
    console.log(`Expires: ${session.expires_at}`);
  });
} catch (error) {
  console.error('Failed to load sessions:', error);
}
```

### Revoke Session

```typescript
import { revokeSession } from '@/features/authentication/services';
import { APIError } from '@/features/authentication/contracts/errors';

try {
  await revokeSession('session-id-here');
  console.log('Session revoked successfully');

  // Refresh the session list
  const updatedSessions = await listActiveSessions();
} catch (error) {
  if (error instanceof APIError) {
    if (error.code === 'SESSION_NOT_FOUND') {
      console.error('Session not found');
    } else if (error.code === 'FORBIDDEN') {
      console.error('Cannot revoke this session');
    }
  }
}
```

## Error Handling

All services use typed error classes from `contracts/errors.ts`:

### Error Types

- **APIError** - Base error class for all API errors
- **SessionLimitError** - Device/session limit reached (403)
- **InvalidTokenError** - Token expired or invalid (401)
- **DeviceMismatchError** - Device ID doesn't match session
- **RateLimitError** - Too many requests

### Error Codes

All errors include a `code` property for programmatic handling:

- `SESSION_LIMIT_REACHED` - Max concurrent sessions exceeded
- `INVALID_CREDENTIALS` - Wrong email/password
- `INVALID_TOKEN` - Token expired or malformed
- `DEVICE_MISMATCH` - Device ID mismatch
- `FINGERPRINT_MISMATCH` - Device fingerprint changed
- `SESSION_NOT_FOUND` - Session doesn't exist
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied
- `VALIDATION_ERROR` - Request validation failed
- `INTERNAL_ERROR` - Server error

### Error Handling Pattern

```typescript
import { APIError, SessionLimitError } from '@/features/authentication/contracts/errors';

try {
  await someAuthOperation();
} catch (error) {
  if (error instanceof SessionLimitError) {
    // Handle session limit
    showSessionLimitModal(error.limitDetails);
  } else if (error instanceof APIError) {
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        showError('Invalid email or password');
        break;
      case 'ACCOUNT_LOCKED':
        showError('Your account is locked');
        break;
      case 'UNAUTHORIZED':
        redirectToLogin();
        break;
      default:
        showError(error.message);
    }
  } else {
    // Unknown error
    showError('An unexpected error occurred');
  }
}
```

## Validation

All requests and responses are validated using Zod schemas from `contracts/`:

- Request validation happens before API call
- Response validation happens after receiving data
- Validation errors throw `APIError` with code `VALIDATION_ERROR`

## Storage

Services automatically manage token storage using `authStorage` from `@/shared/utils/storage`:

- **Access Token** - Stored as `access_token` in localStorage
- **Refresh Token** - Stored as `refresh_token` in localStorage
- **Session ID** - Stored as `session_id` in localStorage
- **Last Activity** - Updated on login/refresh

## Device Tracking

Services use device utilities from `@/shared/utils/device`:

- **Device ID** - Persistent UUID stored in localStorage
- **Device Fingerprint** - Hash of browser/hardware info
- Format: `fp_web_[hash]` or `fp_extension_[hash]`

## API Endpoints

All services use these endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/sessions/active` - List active sessions
- `DELETE /api/sessions/{id}` - Revoke session

Base URL configured via `VITE_API_BASE_URL` environment variable.

## Integration with React

These services are used by React hooks and contexts:

- `useAuth` hook - Wraps login/logout
- `useTokenRefresh` hook - Auto-refreshes tokens
- `AuthContext` - Provides authentication state
- `SessionManager` component - Lists/revokes sessions

## Testing

Contract tests in `src/test/contract/`:
- `auth-login.contract.test.ts` (T007)
- `auth-logout.contract.test.ts` (T008)
- `auth-refresh.contract.test.ts` (T009)
- `sessions-list.contract.test.ts` (T010)
- `sessions-revoke.contract.test.ts` (T011)

Unit tests:
- `authService.test.ts` (T026)
- `sessionService.test.ts` (T027)

## Performance Considerations

- Login: Target < 2s (p95)
- Token refresh: Target < 500ms (p95)
- Session list: Cached for 1 minute
- Device fingerprint: Cached during session

## Security

- Tokens stored in localStorage (XSS risk - use CSP)
- Device fingerprinting prevents session hijacking
- Automatic token refresh before expiration
- 401 responses trigger logout/re-login

## Dependencies

- `zod` - Schema validation
- `crypto` (Web API) - UUID generation, fingerprint hashing
- No external HTTP library - uses native `fetch`

## Related Files

- `src/shared/utils/device.ts` - Device ID and fingerprinting
- `src/shared/utils/token.ts` - JWT decoding and validation
- `src/shared/utils/storage.ts` - Token storage wrapper
- `src/features/authentication/contracts/` - Type definitions and schemas
