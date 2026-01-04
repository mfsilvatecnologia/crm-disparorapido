import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./shared/contexts/AuthContext";
import { OrganizationProvider } from "./shared/contexts/OrganizationContext";
import { TenantProvider } from "./shared/contexts/TenantContext";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { TourProvider, Tour } from "./shared/components/tour";
import { leadsTour } from "./features/leads/tours/leadsTour";
// Feature imports
import { Index } from "./features/landing";
import { LoginPage, RegisterPage, ResetPasswordPage, NewPasswordPage, UserProfilePage } from "./features/authentication";
import AuthCallbackPage from "./features/authentication/pages/AuthCallbackPage";
import SessionManagementPage from "./features/authentication/pages/SessionManagementPage";
import { Dashboard } from "./features/dashboard";
import { LeadsPage } from "./features/leads";
import LeadCreatePage from "./features/leads/pages/LeadCreatePage";
import LeadEditPage from "./features/leads/pages/LeadEditPage";
import { LeadAgentPage } from "./features/lead-agent";
import { AdminPage } from "./features/admin";
import { SearchTermsPage, ScrapingPage } from "./features/scraping";
import { ProjetoNovoPage } from "./features/resolucao-problemas/pages/ProjetoNovoPage";
import { ProjetosIndexPage } from "./features/resolucao-problemas/pages/ProjetosIndexPage";
import { ProjetoDetalhesPage } from "./features/resolucao-problemas/pages/ProjetoDetalhesPage";
// import { WorkerMonitorPage } from "./features/scraping"; // Removido - workers agora são automáticos
import { MessagesPage, VinculacoesPendentesPage } from "./features/disparorapido/pages";
import { UsersPage } from "./features/user-management";
import { EmpresasPage, CadastroEmpresaPage } from "./features/companies";
import { SegmentosPage } from "./features/segments";
import { CampanhasPage } from "./features/campaigns";
import { StageConfigPage } from "./features/campaign-stages/pages/StageConfigPage";
import { CampaignFunnelPage } from "./features/campaign-stages/pages/CampaignFunnelPage";
import { CampaignDashboard } from "./features/campaign-stages/components/metrics/CampaignDashboard";
import {
  PricingPage,
  CheckoutPage,
  SubscriptionManagementPage,
  CreditPackagesPage,
  MarketplacePage,
  PaymentHistoryPage,
  PaymentDetailsPage,
  CreditTransactionsPage,
  FinancialDashboardPage
} from "./features/sales/pages";
import { AffiliateCommissionsPage, AffiliateDashboardPage } from "./features/affiliates/pages";
import { NotFound } from "./shared/pages";
import { BillingConfigPage } from "./features/campaign-stages/pages/BillingConfigPage";
import { FeatureDemoPage } from "./shared/components/features/FeatureDemoPage";
import { LeadEnrichmentPage } from "./features/enrichment/pages/LeadEnrichmentPage";
import { InvestigationPage } from "./features/enrichment/pages/InvestigationPage";
import { ProviderAdminPage } from "./features/enrichment/pages/ProviderAdminPage";
import { EnrichmentStatsPage } from "./features/enrichment/pages/EnrichmentStatsPage";
import { OpportunitiesPage, OpportunityDetailPage } from "./features/opportunities";
import { CustomersPage, CustomerDetailPage } from "./features/customers";
import { RenewalsPage, ContractsPage } from "./features/contracts";
import { ErrorBoundary } from "./shared/components/common/ErrorBoundary";
import { CRMPage } from "./features/crm";

const shouldRetry = (failureCount: number, error: unknown) => {
  const status = (error as { status?: number; response?: { status?: number } })?.status
    ?? (error as { response?: { status?: number } })?.response?.status;

  if (status && status >= 400 && status < 500) {
    return false;
  }

  return failureCount < 2;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (era cacheTime)
    },
    mutations: {
      retry: shouldRetry,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

const LeadEnrichmentRoute = () => {
  const { leadId = "" } = useParams();
  return <LeadEnrichmentPage leadId={leadId} providers={[]} />;
};

const InvestigationRoute = () => {
  const { dossierId = "" } = useParams();
  return <InvestigationPage dossierId={dossierId} />;
};

const ProviderAdminRoute = () => <ProviderAdminPage />;

const EnrichmentStatsRoute = () => <EnrichmentStatsPage />;

function AppRoutes() {
  const withErrorBoundary = (element: React.ReactNode) => (
    <ErrorBoundary>{element}</ErrorBoundary>
  );

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/nova-senha" element={<NewPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Public Sales Routes */}
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* Protected App Routes */}
        <Route path="/app" element={
          <PrivateRoute>
            <OrganizationProvider>
              <AppLayout />
            </OrganizationProvider>
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="crm" element={withErrorBoundary(<CRMPage />)} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/novo" element={<LeadCreatePage />} />
          <Route path="leads/:id/edit" element={<LeadEditPage />} />
          <Route path="lead-agent" element={<LeadAgentPage />} />
          {/* <Route path="workers" element={<WorkerMonitorPage />} /> */}
          {/* Rota comentada - workers agora são automáticos, gerenciados pela tela de Scraping */}
          <Route path="search-terms" element={<SearchTermsPage />} />
          <Route path="scraping" element={<ScrapingPage />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="campanhas" element={<CampanhasPage />} />
          <Route path="segments" element={<SegmentosPage />} />
          <Route path="pipeline" element={<Navigate to="/crm/opportunities" replace />} />
          <Route path="projetos" element={<ProjetosIndexPage />} />
          <Route path="projetos/novo" element={<ProjetoNovoPage />} />
          <Route path="projetos/:id" element={<ProjetoDetalhesPage />} />
          <Route path="campaigns/:id/funnel" element={<CampaignFunnelPage />} />
          <Route path="campaigns/:id/metrics" element={<CampaignDashboard />} />
          <Route path="campaigns/:id/stages" element={<StageConfigPage />} />
          <Route path="billing" element={<BillingConfigPage />} />

          {/* Affiliates */}
          <Route path="afiliados" element={<AffiliateDashboardPage />} />
          <Route path="afiliados/comissoes" element={<AffiliateCommissionsPage />} />

          {/* Sales & Subscriptions Routes */}
          <Route path="subscription" element={<SubscriptionManagementPage />} />
          <Route path="credits" element={<CreditPackagesPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          
          {/* Payments & Financial Routes */}
          <Route path="payments" element={<PaymentHistoryPage />} />
          <Route path="payments/:id" element={<PaymentDetailsPage />} />
          <Route path="credits/transactions" element={<CreditTransactionsPage />} />
          <Route path="financial" element={<FinancialDashboardPage />} />

          {/* Enrichment */}
          <Route path="enrichment/lead/:leadId" element={<LeadEnrichmentRoute />} />
          <Route path="enrichment/investigation/:dossierId" element={<InvestigationRoute />} />
          <Route path="enrichment/admin/providers" element={<ProviderAdminRoute />} />
          <Route path="enrichment/stats" element={<EnrichmentStatsRoute />} />

          {/* CRM */}
          <Route path="crm/opportunities" element={withErrorBoundary(<OpportunitiesPage />)} />
          <Route path="crm/opportunities/:id" element={withErrorBoundary(<OpportunityDetailPage />)} />
          <Route path="crm/customers" element={withErrorBoundary(<CustomersPage />)} />
          <Route path="crm/customers/:id" element={withErrorBoundary(<CustomerDetailPage />)} />
          <Route path="crm/contracts" element={withErrorBoundary(<ContractsPage />)} />
          <Route path="crm/renewals" element={withErrorBoundary(<RenewalsPage />)} />
          
          {/* DisparoRapido Routes */}
          <Route path="disparorapido/messages" element={<MessagesPage />} />
          <Route path="disparorapido/vinculacoes" element={<VinculacoesPendentesPage />} />
          <Route path="pricing" element={<PricingPage />} />
          
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="sessions" element={<SessionManagementPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings/campaign-stages" element={<StageConfigPage />} />
          <Route path="features-demo" element={<FeatureDemoPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="empresas/cadastro" element={<CadastroEmpresaPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <TenantProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <TourProvider tours={[leadsTour]}>
            <Toaster />
            <Sonner />
            <AppRoutes />
            <Tour />
          </TourProvider>
        </TooltipProvider>
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </AuthProvider>
    </QueryClientProvider>
  </TenantProvider>
);

export default App;
