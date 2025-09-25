// Pipeline Feature - Sales pipeline and deal management

// Pages
export { default as PipelinePage } from "./pages/PipelinePage"

// Components
export * from './components'

// Hooks
export * from './hooks/usePipeline'

// Types
export type {
  Deal,
  PipelineStage,
  DealActivity,
  PipelineFilters,
  CreateDealData,
  UpdateDealData,
  DealsResponse,
  PipelineStats,
  CreateStageData,
  UpdateStageData,
  StagesResponse,
  DealMove,
  CreateActivityData,
  UpdateActivityData,
  ActivitiesResponse,
  PipelineDashboard,
  PipelineForecast,
  BoardColumn
} from './types/pipeline'

// Services
export * from './services/pipeline'
