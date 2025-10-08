/**
 * Lead Service
 * 
 * Business logic for lead marketplace operations
 */

import {
  Lead,
  LeadAccess,
  MarketplaceStatus,
  InterestLevel,
  canAccessLead,
  isAccessExpired,
  isViewLimitReached,
  maskPhone,
  maskEmail
} from '../types';

/**
 * Filter leads by status
 */
export function filterByStatus(
  leads: Lead[],
  statuses: MarketplaceStatus[]
): Lead[] {
  return leads.filter(l => statuses.includes(l.statusMarketplace));
}

/**
 * Get available leads
 */
export function getAvailableLeads(leads: Lead[]): Lead[] {
  return filterByStatus(leads, [MarketplaceStatus.DISPONIVEL]);
}

/**
 * Filter by interest level
 */
export function filterByInterest(
  leads: Lead[],
  levels: InterestLevel[]
): Lead[] {
  return leads.filter(l => levels.includes(l.nivelInteresse));
}

/**
 * Get hot leads
 */
export function getHotLeads(leads: Lead[]): Lead[] {
  return filterByInterest(leads, [InterestLevel.QUENTE]);
}

/**
 * Sort by cost (cheapest first)
 */
export function sortByCost(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => a.custoCreditosCentavos - b.custoCreditosCentavos);
}

/**
 * Sort by interest level
 */
export function sortByInterest(leads: Lead[]): Lead[] {
  const priority = {
    [InterestLevel.QUENTE]: 1,
    [InterestLevel.MORNO]: 2,
    [InterestLevel.FRIO]: 3
  };
  
  return [...leads].sort((a, b) => 
    priority[a.nivelInteresse] - priority[b.nivelInteresse]
  );
}

/**
 * Filter by max cost
 */
export function filterByMaxCost(leads: Lead[], maxCost: number): Lead[] {
  return leads.filter(l => l.custoCreditosCentavos <= maxCost);
}

/**
 * Get leads within budget
 */
export function getLeadsWithinBudget(
  leads: Lead[],
  availableCredits: number
): Lead[] {
  return filterByMaxCost(leads, availableCredits);
}

/**
 * Check if lead access is valid
 */
export function hasValidAccess(access: LeadAccess | null): boolean {
  if (!access) return false;
  return canAccessLead(access);
}

/**
 * Get expiring accesses (within days)
 */
export function getExpiringAccesses(
  accesses: LeadAccess[],
  days: number = 7
): LeadAccess[] {
  return accesses.filter(access => {
    if (!access.expiraEm || !access.ativo) return false;
    
    const now = new Date();
    const expiresAt = new Date(access.expiraEm);
    const diff = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return daysRemaining >= 0 && daysRemaining <= days;
  });
}
