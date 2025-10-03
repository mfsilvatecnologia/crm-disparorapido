// Pages
export { default as LoginPage } from './pages/LoginPage';
export { RegisterPage } from './pages/RegisterPage';
export { default as ResetPasswordPage } from './pages/ResetPasswordPage';
export { default as NewPasswordPage } from './pages/NewPasswordPage';
export { default as UserProfilePage } from './pages/UserProfilePage';

// Context & Providers
export { AuthProvider, AuthContext } from './contexts/AuthContext';
export type { AuthContextType } from './contexts/AuthContext';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useTokenRefresh } from './hooks/useTokenRefresh';
export { useActivityMonitor } from './hooks/useActivityMonitor';
export { useAuthenticatedFetch } from './hooks/useAuthenticatedFetch';
export type { AuthenticatedFetch } from './hooks/useAuthenticatedFetch';
export * from './hooks/useRegister';
export * from './hooks/usePermissions';
export * from './hooks/useRoles';
export * from './hooks/useSessions';

// Services
export * from './services/authService';
export * from './services/sessionService';

// Components
export * from './components';

// Types
export type * from './types/auth';

// Contracts
export type * from './contracts/auth-contracts';
export type * from './contracts/errors';
