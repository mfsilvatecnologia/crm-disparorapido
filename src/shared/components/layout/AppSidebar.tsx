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
  Activity,
  Search,
  Map,
  User,
  Target,
  ShoppingCart,
  Coins,
  Receipt,
  TrendingUp,
  ArrowRightLeft,
  DollarSign
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
import { FeatureGuard } from '@/shared/components/features/FeatureGuard';
import { useTenant } from '@/shared/contexts/TenantContext';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/app',
    icon: Home,
    description: 'Visão geral e métricas',
    // Dashboard sempre disponível (sem feature required)
  },
  {
    title: 'Leads',
    url: '/app/leads',
    icon: Users,
    description: 'Gerenciar base de leads',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Campanhas',
    url: '/app/campanhas',
    icon: Target,
    description: 'Marketing automation e campanhas',
    requiredFeature: 'enableCampaigns'
  },
  {
    title: 'Pipeline',
    url: '/app/pipeline',
    icon: Kanban,
    description: 'Funil de vendas',
    requiredFeature: 'enablePipeline'
  },
  // {
  //   title: 'Segmentos',
  //   url: '/app/segments',
  //   icon: BarChart3,
  //   description: 'Análise e segmentação',
  //   requiredFeature: 'enableAnalytics'
  // },
  {
    title: 'Scraping',
    url: '/app/scraping',
    icon: Map,
    description: 'Jobs de coleta Google Maps',
    requiredFeature: 'enableScraping'
  },
  {
    title: 'Workers',
    url: '/app/workers',
    icon: Activity,
    description: 'Monitorar workers e jobs',
    requiredFeature: 'enableWorkers'
  }
];

const salesItems = [
  {
    title: 'Marketplace',
    url: '/app/marketplace',
    icon: ShoppingCart,
    description: 'Comprar leads verificados',
    requiredFeature: 'enableMarketplace'
  },
  {
    title: 'Créditos',
    url: '/app/credits',
    icon: Coins,
    description: 'Gerenciar créditos',
    requiredFeature: 'enableBilling'
  },
  {
    title: 'Assinatura',
    url: '/app/subscription',
    icon: CreditCard,
    description: 'Gerenciar assinatura',
    requiredFeature: 'enableBilling'
  },
];

const financialItems = [
  {
    title: 'Dashboard',
    url: '/app/financial',
    icon: TrendingUp,
    description: 'Visão geral financeira',
    requiredFeature: 'enableBilling'
  },
  {
    title: 'Planos',
    url: '/app/pricing',
    icon: DollarSign,
    description: 'Planos e preços',
    requiredFeature: 'enablePlanos'
  },
  {
    title: 'Pagamentos',
    url: '/app/payments',
    icon: Receipt,
    description: 'Histórico de pagamentos',
    requiredFeature: 'enableBilling'
  },
  {
    title: 'Transações',
    url: '/app/credits/transactions',
    icon: ArrowRightLeft,
    description: 'Transações de crédito',
    requiredFeature: 'enableBilling'
  },
];

const settingsItems = [
  {
    title: 'Perfil',
    url: '/app/profile',
    icon: User,
    description: 'Configurações do perfil',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Sessões Ativas',
    url: '/app/sessions',
    icon: Shield,
    description: 'Gerenciar dispositivos e sessões',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Estágios de Campanha',
    url: '/app/settings/campaign-stages',
    icon: Kanban,
    description: 'Configurar estágios e funil',
    requiredFeature: 'enableCampaigns'
  },
    {
    title: 'Empresas',
    url: '/app/empresas',
    icon: Building2,
    description: 'Gestão de empresas',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Cobrança',
    url: '/app/billing',
    icon: CreditCard,
    description: 'Uso e faturas',
    requiredFeature: 'enableBilling'
  },
  // {
  //   title: 'Configurações',
  //   url: '/app/settings',
  //   icon: Settings,
  //   description: 'Integrações e sistema',
  //   requiredFeature: 'enableBasicFeatures'
  // },
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
  const { tenant } = useTenant();
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

  // Render menu item with feature control
  const renderMenuItem = (item: any) => {
    const menuItem = (
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
    );

    // If item has required feature, wrap with FeatureGuard
    if (item.requiredFeature) {
      return (
        <FeatureGuard key={item.title} feature={item.requiredFeature}>
          {menuItem}
        </FeatureGuard>
      );
    }

    return menuItem;
  };

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
                <h2 className="text-lg font-bold text-sidebar-foreground">{tenant.branding.companyName}</h2>
                <p className="text-xs text-sidebar-foreground/60">{tenant.branding.companyTagline}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sales & Credits */}
        <FeatureGuard anyFeatures={['enableMarketplace', 'enableBilling']}>
          <SidebarGroup>
            <SidebarGroupLabel>Vendas</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {salesItems.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </FeatureGuard>

        {/* Financial */}
        <FeatureGuard feature="enableBilling">
          <SidebarGroup>
            <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {financialItems.map(renderMenuItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </FeatureGuard>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map(renderMenuItem)}
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
