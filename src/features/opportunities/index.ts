export type {
  Opportunity,
  OpportunityFilters,
  OpportunityStage,
  OpportunityStatus,
  WinOpportunityPayload,
} from './types/opportunity';

export {
  useOpportunities,
  useOpportunity,
  useCreateOpportunity,
  useUpdateOpportunity,
  useWinOpportunity,
  useLoseOpportunity,
} from './api/opportunities';

export { OpportunitiesPage } from './pages/OpportunitiesPage';
export { OpportunityDetailPage } from './pages/OpportunityDetailPage';
