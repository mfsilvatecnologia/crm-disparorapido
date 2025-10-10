import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Kanban,
  Phone,
  CreditCard,
  Settings,
  Shield,
  Building2,
  Home,
  Zap,
  Plus,
  Activity,
  Search,
  Map,
  User,
  Target,
  Mail,
  ShoppingCart,
  Coins,
  Receipt,
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { leadKeys } from '@/features/leads/hooks/useLeads';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/app',
    icon: Home,
    description: 'Visão geral e métricas'
  },
  {
    title: 'Leads',
    url: '/app/leads',
    icon: Users,
    description: 'Gerenciar base de leads'
  },
  {
    title: 'Empresas',
    url: '/app/empresas',
    icon: Building2,
    description: 'Gestão de empresas'
  },
  {
    title: 'Campanhas',
    url: '/app/campanhas',
    icon: Target,
    description: 'Marketing automation e campanhas'
  },
  {
    title: 'Pipeline',
    url: '/app/pipeline',
    icon: Kanban,
    description: 'Funil de vendas'
  },
  {
    title: 'Segmentos',
    url: '/app/segments',
    icon: BarChart3,
    description: 'Análise e segmentação'
  },
  {
    title: 'Scraping',
    url: '/app/scraping',
    icon: Map,
    description: 'Jobs de coleta Google Maps'
  },
  {
    title: 'Termos de Busca',
    url: '/app/search-terms',
    icon: Search,
    description: 'Gerenciar termos para scraping'
  },
  {
    title: 'Workers',
    url: '/app/workers',
    icon: Activity,
    description: 'Monitorar workers e jobs'
  },
  {
    title: 'Ferramentas',
    url: '/app/sales-tools',
    icon: Phone,
    description: 'Call center e e-mails'
  },
];

const salesItems = [
  {
    title: 'Marketplace',
    url: '/app/marketplace',
    icon: ShoppingCart,
    description: 'Comprar leads verificados'
  },
  {
    title: 'Créditos',
    url: '/app/credits',
    icon: Coins,
    description: 'Gerenciar créditos'
  },
  {
    title: 'Assinatura',
    url: '/app/subscription',
    icon: CreditCard,
    description: 'Gerenciar assinatura'
  },
];

const financialItems = [
  {
    title: 'Dashboard',
    url: '/app/financial',
    icon: TrendingUp,
    description: 'Visão geral financeira'
  },
  {
    title: 'Pagamentos',
    url: '/app/payments',
    icon: Receipt,
    description: 'Histórico de pagamentos'
  },
  {
    title: 'Transações',
    url: '/app/credits/transactions',
    icon: ArrowRightLeft,
    description: 'Transações de crédito'
  },
];

const settingsItems = [
  {
    title: 'Perfil',
    url: '/app/profile',
    icon: User,
    description: 'Configurações do perfil'
  },
  {
    title: 'Estágios de Campanha',
    url: '/app/settings/campaign-stages',
    icon: Kanban,
    description: 'Configurar estágios e funil'
  },
  {
    title: 'Cobrança',
    url: '/app/billing',
    icon: CreditCard,
    description: 'Uso e faturas'
  },
  {
    title: 'Configurações',
    url: '/app/settings',
    icon: Settings,
    description: 'Integrações e sistema'
  },
];

const adminItems = [
  {
    title: 'Usuários',
    url: '/app/users',
    icon: Users,
    description: 'Gerenciar usuários do sistema'
  },
  {
    title: 'Organizações',
    url: '/app/admin/organizations',
    icon: Building2,
    description: 'Gerenciar organizações'
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path) 
      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
      : "hover:bg-accent hover:text-accent-foreground";
  };

  const handleNavClick = () => {
    queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Sidebar className={!open ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            {open && (
              <div>
                <h2 className="text-lg font-bold text-sidebar-foreground">LeadCRM</h2>
                <p className="text-xs text-sidebar-foreground/60">Multi-tenant CRM</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={!open ? item.description : undefined}
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sales & Credits */}
        <SidebarGroup>
          <SidebarGroupLabel>Vendas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={!open ? item.description : undefined}
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Financial */}
        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {financialItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={!open ? item.description : undefined}
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={getNavClassName(item.url)}
                      title={!open ? item.description : undefined}
                      onClick={handleNavClick}
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              Admin
              <Badge variant="destructive" className="text-xs h-4 px-1">
                Admin
              </Badge>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={getNavClassName(item.url)}
                        title={!open ? item.description : undefined}
                        onClick={handleNavClick}
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
