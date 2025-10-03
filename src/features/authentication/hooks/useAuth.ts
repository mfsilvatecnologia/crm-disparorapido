/**
 * useAuth Hook
 * Provides access to authentication context
 * Implements T031 from tasks.md
 */

import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../contexts/AuthContext';

/**
 * Hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContextType with user, auth state, and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
