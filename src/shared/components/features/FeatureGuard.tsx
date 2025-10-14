import React from 'react';
import { useFeatures } from '@/shared/hooks/useFeatures';
import { useTenant } from '@/shared/contexts/TenantContext';
import { TenantFeatures } from '@/config/tenants/types';

interface FeatureGuardProps {
  /** Single feature that must be enabled */
  feature?: keyof TenantFeatures;
  /** Multiple features that must ALL be enabled */
  features?: (keyof TenantFeatures)[];
  /** Multiple features where ANY can be enabled (OR logic) */
  anyFeatures?: (keyof TenantFeatures)[];
  /** Invert the logic - show when feature is DISABLED */
  not?: boolean;
  /** Content to render when feature conditions are met */
  children?: React.ReactNode;
  /** Alternative content to render when feature conditions are NOT met */
  fallback?: React.ReactNode;
  /** Custom render function for more complex logic */
  render?: (features: ReturnType<typeof useFeatures>) => React.ReactNode;
}

/**
 * FeatureGuard Component
 * 
 * Conditionally renders content based on tenant feature flags.
 * Supports various logical combinations and fallback content.
 * 
 * @example
 * ```tsx
 * // Simple feature check
 * <FeatureGuard feature="enableCampaigns">
 *   <CampaignsMenu />
 * </FeatureGuard>
 * 
 * // Multiple features required (AND logic)
 * <FeatureGuard features={['enableCampaigns', 'enableAnalytics']}>
 *   <AdvancedCampaigns />
 * </FeatureGuard>
 * 
 * // Any of the features (OR logic)
 * <FeatureGuard anyFeatures={['enablePipeline', 'enableCampaigns']}>
 *   <SalesSection />
 * </FeatureGuard>
 * 
 * // With fallback content
 * <FeatureGuard feature="enableMarketplace" fallback={<ComingSoon />}>
 *   <MarketplaceApp />
 * </FeatureGuard>
 * 
 * // Inverted logic - show when disabled
 * <FeatureGuard feature="enableBilling" not>
 *   <FreePlanMessage />
 * </FeatureGuard>
 * 
 * // Custom render function
 * <FeatureGuard 
 *   render={(features) => features.canUseCampaigns ? <Advanced /> : <Basic />}
 * />
 * ```
 */
export function FeatureGuard({
  feature,
  features,
  anyFeatures,
  not = false,
  children,
  fallback = null,
  render
}: FeatureGuardProps) {
  const featureUtils = useFeatures();

  // If custom render function is provided, use it
  if (render) {
    return <>{render(featureUtils)}</>;
  }

  let shouldShow = false;

  // Single feature check
  if (feature) {
    shouldShow = featureUtils.hasFeature(feature);
  }
  
  // Multiple features check (ALL must be enabled)
  else if (features && features.length > 0) {
    shouldShow = featureUtils.requiresFeatures(features);
  }
  
  // Any features check (OR logic)
  else if (anyFeatures && anyFeatures.length > 0) {
    shouldShow = featureUtils.hasAnyFeature(anyFeatures);
  }
  
  // Default to true if no conditions specified
  else {
    shouldShow = true;
  }

  // Apply inversion if 'not' prop is true
  if (not) {
    shouldShow = !shouldShow;
  }

  return <>{shouldShow ? children : fallback}</>;
}

/**
 * FeatureList Component
 * 
 * Renders a list of features with their status.
 * Useful for debugging and admin interfaces.
 */
interface FeatureListProps {
  /** Show only enabled features */
  enabledOnly?: boolean;
  /** Show only disabled features */
  disabledOnly?: boolean;
  /** Custom styling */
  className?: string;
}

export function FeatureList({ enabledOnly, disabledOnly, className }: FeatureListProps) {
  const { features, getEnabledFeatures, getDisabledFeatures } = useFeatures();

  let featuresToShow: [string, boolean][];

  if (enabledOnly) {
    featuresToShow = getEnabledFeatures().map(name => [name, true]);
  } else if (disabledOnly) {
    featuresToShow = getDisabledFeatures().map(name => [name, false]);
  } else {
    featuresToShow = Object.entries(features);
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-3">Feature Status</h3>
      <div className="space-y-2">
        {featuresToShow.map(([featureName, enabled]) => (
          <div
            key={featureName}
            className="flex items-center justify-between p-2 rounded border"
          >
            <span className="font-medium capitalize">
              {featureName.replace('enable', '').toLowerCase()}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded font-medium ${
                enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RequireFeature Component
 * 
 * Similar to FeatureGuard but throws a more explicit error message
 * when features are not available. Useful for pages that absolutely
 * require certain features.
 */
interface RequireFeatureProps {
  feature: keyof TenantFeatures;
  children: React.ReactNode;
  errorMessage?: string;
}

export function RequireFeature({ 
  feature, 
  children, 
  errorMessage 
}: RequireFeatureProps) {
  const { hasFeature } = useFeatures();
  const { tenant } = useTenant();

  if (!hasFeature(feature)) {
    const defaultMessage = `Feature "${feature}" is not available for ${tenant.name}`;
    
    return (
      <div className="p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Feature Not Available
          </h3>
          <p className="text-gray-600">
            {errorMessage || defaultMessage}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default FeatureGuard;