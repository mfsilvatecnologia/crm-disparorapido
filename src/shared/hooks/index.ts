// Feature Control System Exports
// Centralized exports for easy importing

// Main hook
export { useFeatures } from './useFeatures';

// Components
export { 
  FeatureGuard, 
  FeatureList, 
  RequireFeature 
} from '../components/features/FeatureGuard';

// Types (re-export from tenant config)
export type { TenantFeatures } from '@/config/tenants/types';

// Convenience exports for common patterns
export { useTenant } from '@/shared/contexts/TenantContext';
export type { TenantConfig, TenantId } from '@/config/tenants/types';