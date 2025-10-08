import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./shared/contexts/AuthContext";
import { OrganizationProvider } from "./shared/contexts/OrganizationContext";
import { AppLayout } from "./shared/components/layout/AppLayout";
// Feature imports
import { Index } from "./features/landing";
import { LoginPage, RegisterPage, ResetPasswordPage, NewPasswordPage, UserProfilePage } from "./features/authentication";
import { Dashboard } from "./features/dashboard";
import { LeadsPage } from "./features/leads";
import { AdminPage } from "./features/admin";
import { SearchTermsPage, ScrapingPage, WorkerMonitorPage } from "./features/scraping";
import { UsersPage } from "./features/user-management";
import { EmpresasPage, CadastroEmpresaPage } from "./features/companies";
import { SegmentosPage } from "./features/segments";
import { PipelinePage } from "./features/pipeline";
import { CampanhasPage } from "./features/campaigns";
import { 
  PricingPage, 
  CheckoutPage, 
  SubscriptionManagementPage, 
  CreditPackagesPage, 
  MarketplacePage 
} from "./features/sales/pages";
import { NotFound } from "./shared/pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (era cacheTime)
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

function AppRoutes() {
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
          <Route path="leads" element={<LeadsPage />} />
          <Route path="workers" element={<WorkerMonitorPage />} />
          <Route path="search-terms" element={<SearchTermsPage />} />
          <Route path="scraping" element={<ScrapingPage />} />
          <Route path="empresas" element={<EmpresasPage />} />
          <Route path="campanhas" element={<CampanhasPage />} />
          <Route path="segments" element={<SegmentosPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="sales-tools" element={<div className="p-6">Ferramentas de Vendas - Em desenvolvimento</div>} />
          <Route path="billing" element={<div className="p-6">Cobrança - Em desenvolvimento</div>} />
          
          {/* Sales & Subscriptions Routes */}
          <Route path="subscription" element={<SubscriptionManagementPage />} />
          <Route path="credits" element={<CreditPackagesPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<div className="p-6">Configurações - Em desenvolvimento</div>} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="admin/organizations" element={<div className="p-6">Admin - Organizações - Em desenvolvimento</div>} />
          <Route path="empresas/cadastro" element={<CadastroEmpresaPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;