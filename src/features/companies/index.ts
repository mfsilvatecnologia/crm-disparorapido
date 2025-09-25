// Companies Feature - Centralized exports

// Hooks
export * from './hooks/useCompanies'

// Pages
export { default as CadastroEmpresaPage } from './pages/CadastroEmpresaPage'
export { default as EmpresasPage } from './pages/EmpresasPage'

// Components
export * from './components'

// Types
export type {
  Company,
  CompanyFilters,
  CreateCompanyData,
  UpdateCompanyData,
  CompaniesResponse,
  CompanyStats,
  CompanyContact,
  CompanyActivity
} from './types/companies'

// Services
export * from './services/companies'