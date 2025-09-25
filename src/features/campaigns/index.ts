// Campaigns Feature - Marketing automation and campaign management

// Pages
export { default as CampanhasPage } from "./pages/CampanhasPage"

// Components
export * from './components'

// Hooks
export * from './hooks/useCampaigns'

// Types
export type {
  Campaign,
  CampaignStep,
  CampaignFilters,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignsResponse,
  CampaignStats,
  CampaignExecution,
  CampaignContact,
  CampaignAnalytics,
  CampaignImportResult,
  CampaignIntegration,
  AddContactsToCampaignRequest,
  AddContactsToCampaignResponse,
  ListCampaignContactsResponse,
  CampaignContactsParams
} from './types/campaigns'

// Services
export * from './services/campaigns'
