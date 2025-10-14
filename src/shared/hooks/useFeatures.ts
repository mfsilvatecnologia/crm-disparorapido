import { useTenant } from '@/shared/contexts/TenantContext';
import { TenantFeatures } from '@/config/tenants/types';

/**
 * Hook for feature flag management
 * 
 * Provides easy access to tenant-specific feature flags and utilities
 * for conditional rendering and feature availability checks.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasFeature, requiresFeatures, features } = useFeatures();
 *   
 *   if (!hasFeature('enableCampaigns')) {
 *     return <div>Feature not available</div>;
 *   }
 *   
 *   return <CampaignsComponent />;
 * }
 * ```
 */
export function useFeatures() {
  const { tenant } = useTenant();
  const features = tenant.features;

  /**
   * Check if a specific feature is enabled
   * @param featureName - Name of the feature to check
   * @returns boolean indicating if feature is enabled
   */
  const hasFeature = (featureName: keyof TenantFeatures): boolean => {
    return features[featureName] === true;
  };

  /**
   * Check if multiple features are enabled (ALL required)
   * @param featureNames - Array of feature names that must all be enabled
   * @returns boolean indicating if all features are enabled
   */
  const requiresFeatures = (featureNames: (keyof TenantFeatures)[]): boolean => {
    return featureNames.every(featureName => hasFeature(featureName));
  };

  /**
   * Check if any of the provided features is enabled (OR logic)
   * @param featureNames - Array of feature names, at least one must be enabled
   * @returns boolean indicating if any feature is enabled
   */
  const hasAnyFeature = (featureNames: (keyof TenantFeatures)[]): boolean => {
    return featureNames.some(featureName => hasFeature(featureName));
  };

  /**
   * Get all enabled features
   * @returns Array of enabled feature names
   */
  const getEnabledFeatures = (): (keyof TenantFeatures)[] => {
    return Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([featureName]) => featureName as keyof TenantFeatures);
  };

  /**
   * Get all disabled features
   * @returns Array of disabled feature names
   */
  const getDisabledFeatures = (): (keyof TenantFeatures)[] => {
    return Object.entries(features)
      .filter(([, enabled]) => !enabled)
      .map(([featureName]) => featureName as keyof TenantFeatures);
  };

  /**
   * Check feature status with detailed information
   * @param featureName - Feature to check
   * @returns Object with feature status and metadata
   */
  const getFeatureStatus = (featureName: keyof TenantFeatures) => {
    const isEnabled = hasFeature(featureName);
    
    return {
      name: featureName,
      enabled: isEnabled,
      disabled: !isEnabled,
      tenant: tenant.id,
      tenantName: tenant.name,
    };
  };

  return {
    features,
    hasFeature,
    requiresFeatures,
    hasAnyFeature,
    getEnabledFeatures,
    getDisabledFeatures,
    getFeatureStatus,
    
    // Convenience getters for common features
    canUseCampaigns: hasFeature('enableCampaigns'),
    canUsePipeline: hasFeature('enablePipeline'),
    canUseScraping: hasFeature('enableScraping'),
    canUseAnalytics: hasFeature('enableAnalytics'),
    canUseMarketplace: hasFeature('enableMarketplace'),
    canUseBilling: hasFeature('enableBilling'),
  };
}

export default useFeatures;