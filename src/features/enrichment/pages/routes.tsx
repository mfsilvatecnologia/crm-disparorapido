import type { RouteObject } from 'react-router-dom';
import { LeadEnrichmentPage } from './LeadEnrichmentPage';
import { InvestigationPage } from './InvestigationPage';
import { ProviderAdminPage } from './ProviderAdminPage';
import { EnrichmentStatsPage } from './EnrichmentStatsPage';

export const enrichmentRoutes: RouteObject[] = [
  {
    path: '/enrichment/lead/:leadId',
    element: <LeadEnrichmentPage leadId="" providers={[]} />,
  },
  {
    path: '/enrichment/investigation/:dossierId',
    element: <InvestigationPage dossierId="" />,
  },
  {
    path: '/enrichment/admin/providers',
    element: <ProviderAdminPage />,
  },
  {
    path: '/enrichment/stats',
    element: <EnrichmentStatsPage />,
  },
];
