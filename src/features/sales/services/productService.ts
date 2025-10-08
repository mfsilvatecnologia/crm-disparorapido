/**
 * Product Service
 * 
 * Business logic for product/plan operations
 */

import type { 
  Product, 
  ProductWithComputed
} from '../types';
import { 
  BillingCycle,
  formatPrice, 
  getBillingCycleLabel, 
  getTrialLabel 
} from '../types';

// Re-export utility functions for convenience
export { formatPrice, getBillingCycleLabel, getTrialLabel };

/**
 * Add computed fields to product
 */
export function enrichProduct(product: Product): ProductWithComputed {
  return {
    ...product,
    formattedPrice: formatPrice(product.priceMonthly),
    billingCycleLabel: getBillingCycleLabel(product.billingCycle),
    hasTrial: product.trialDays > 0,
    trialLabel: getTrialLabel(product.trialDays)
  };
}

/**
 * Calculate yearly price based on billing cycle
 */
export function calculateYearlyPrice(
  monthlyPrice: number,
  cycle: BillingCycle
): number {
  switch (cycle) {
    case BillingCycle.MONTHLY:
      return monthlyPrice * 12;
    case BillingCycle.QUARTERLY:
      // Usually 5% discount on quarterly
      return Math.floor(monthlyPrice * 12 * 0.95);
    case BillingCycle.YEARLY:
      // Usually 15-20% discount on yearly
      return Math.floor(monthlyPrice * 12 * 0.80);
    default:
      return monthlyPrice * 12;
  }
}

/**
 * Calculate price per lead
 */
export function calculatePricePerLead(
  monthlyPrice: number,
  maxLeads: number | null
): number | null {
  if (!maxLeads || maxLeads === 0) return null;
  return Math.floor(monthlyPrice / maxLeads);
}

/**
 * Sort products by display order
 */
export function sortProductsByOrder(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.position - b.position);
}

/**
 * Filter active products
 */
export function filterActiveProducts(products: Product[]): Product[] {
  return products.filter(p => p.isActive);
}

/**
 * Find most popular product
 */
export function findMostPopularProduct(products: Product[]): Product | null {
  return products.find(p => p.isMostPopular) || null;
}

/**
 * Find product by ID
 */
export function findProductById(
  products: Product[],
  id: string
): Product | null {
  return products.find(p => p.id === id) || null;
}

/**
 * Group products by billing cycle
 */
export function groupProductsByBillingCycle(
  products: Product[]
): Record<BillingCycle, Product[]> {
  return products.reduce((acc, product) => {
    const cycle = product.billingCycle;
    if (!acc[cycle]) {
      acc[cycle] = [];
    }
    acc[cycle].push(product);
    return acc;
  }, {} as Record<BillingCycle, Product[]>);
}

/**
 * Get recommended product based on company needs
 */
export function getRecommendedProduct(
  products: Product[],
  estimatedLeads: number | null,
  estimatedSessions: number | null
): Product | null {
  const activeProducts = filterActiveProducts(products);
  
  if (activeProducts.length === 0) return null;
  
  // Filter products that can handle the estimated usage
  const suitableProducts = activeProducts.filter(product => {
    const canHandleLeads = !product.maxLeads || 
      !estimatedLeads || 
      product.maxLeads >= estimatedLeads;
      
    const canHandleSessions = !product.maxSessions || 
      !estimatedSessions || 
      product.maxSessions >= estimatedSessions;
      
    return canHandleLeads && canHandleSessions;
  });
  
  if (suitableProducts.length === 0) {
    // Return most expensive product if needs exceed all plans
    return activeProducts.sort((a, b) => 
      b.priceMonthly - a.priceMonthly
    )[0];
  }
  
  // Return cheapest suitable product
  return suitableProducts.sort((a, b) => 
    a.priceMonthly - b.priceMonthly
  )[0];
}

/**
 * Compare two products
 */
export interface ProductComparison {
  product1: ProductWithComputed;
  product2: ProductWithComputed;
  priceDifference: number;
  priceDifferenceFormatted: string;
  priceDifferencePercentual: number;
  featuresDifference: {
    onlyInProduct1: string[];
    onlyInProduct2: string[];
    common: string[];
  };
  recommendation: 'product1' | 'product2' | 'similar';
}

export function compareProducts(
  product1: Product,
  product2: Product
): ProductComparison {
  const enriched1 = enrichProduct(product1);
  const enriched2 = enrichProduct(product2);
  
  const priceDifference = enriched2.priceMonthly - enriched1.priceMonthly;
  const priceDifferencePercentual = 
    (Math.abs(priceDifference) / enriched1.priceMonthly) * 100;
  
  const features1 = new Set(product1.features);
  const features2 = new Set(product2.features);
  
  const onlyInProduct1 = product1.features.filter(f => !features2.has(f));
  const onlyInProduct2 = product2.features.filter(f => !features1.has(f));
  const common = product1.features.filter(f => features2.has(f));
  
  let recommendation: 'product1' | 'product2' | 'similar' = 'similar';
  
  if (priceDifferencePercentual > 10) {
    // If price difference > 10%, recommend based on value
    const value1 = (product1.maxLeads || 0) / (product1.priceMonthly || 1);
    const value2 = (product2.maxLeads || 0) / (product2.priceMonthly || 1);
    recommendation = value1 > value2 ? 'product1' : 'product2';
  }
  
  return {
    product1: enriched1,
    product2: enriched2,
    priceDifference,
    priceDifferenceFormatted: formatPrice(Math.abs(priceDifference)),
    priceDifferencePercentual,
    featuresDifference: {
      onlyInProduct1,
      onlyInProduct2,
      common
    },
    recommendation
  };
}

/**
 * Calculate savings for annual billing
 */
export function calculateAnnualSavings(product: Product): {
  monthlyCost: number;
  annualCost: number;
  savings: number;
  savingsPercentage: number;
} {
  const monthlyCost = product.priceMonthly * 12;
  const annualCost = calculateYearlyPrice(
    product.priceMonthly,
    BillingCycle.YEARLY
  );
  const savings = monthlyCost - annualCost;
  const savingsPercentage = (savings / monthlyCost) * 100;
  
  return {
    monthlyCost,
    annualCost,
    savings,
    savingsPercentage
  };
}

/**
 * Check if product has unlimited feature
 */
export function hasUnlimitedFeature(
  product: Product,
  feature: 'leads' | 'sessions'
): boolean {
  if (feature === 'leads') {
    return product.maxLeads === null;
  }
  if (feature === 'sessions') {
    return product.maxSessions === null;
  }
  return false;
}

/**
 * Format product limits for display
 */
export function formatProductLimits(product: Product): {
  leadsLabel: string;
  sessionsLabel: string;
} {
  return {
    leadsLabel: product.maxLeads 
      ? `${product.maxLeads.toLocaleString('pt-BR')} leads` 
      : 'Leads ilimitados',
    sessionsLabel: product.maxSessions 
      ? `${product.maxSessions.toLocaleString('pt-BR')} sessões` 
      : 'Sessões ilimitadas'
  };
}
