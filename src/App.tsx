import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OrganizationProvider } from "./contexts/OrganizationContext";
import { AppLayout } from "./components/layout/AppLayout";
import { Index } from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/LeadsPage";
import Leads2Page from "./pages/Leads2Page";
import WorkerMonitorPage from "./pages/WorkerMonitorPage";
import NotFound from "./pages/NotFound";
import CadastroEmpresaPage from "./pages/CadastroEmpresaPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
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
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<Index />} />
      
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      
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
        <Route path="leads2" element={<Leads2Page />} />
        <Route path="workers" element={<WorkerMonitorPage />} />
        <Route path="segments" element={<div className="p-6">Segmentos - Em desenvolvimento</div>} />
        <Route path="pipeline" element={<div className="p-6">Pipeline - Em desenvolvimento</div>} />
        <Route path="sales-tools" element={<div className="p-6">Ferramentas de Vendas - Em desenvolvimento</div>} />
        <Route path="billing" element={<div className="p-6">Cobrança - Em desenvolvimento</div>} />
        <Route path="settings" element={<div className="p-6">Configurações - Em desenvolvimento</div>} />
        <Route path="admin/organizations" element={<div className="p-6">Admin - Organizações - Em desenvolvimento</div>} />
        <Route path="empresas/cadastro" element={<CadastroEmpresaPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;