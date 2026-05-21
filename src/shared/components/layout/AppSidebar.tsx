import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Target,
  Map,
  User,
  Shield,
  CreditCard,
  BookOpen,
  LogOut,
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  UserCog,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useIsAffiliateUser } from '@/features/affiliates/hooks/useIsAffiliateUser';
import { useQueryClient } from '@tanstack/react-query';
import { leadKeys } from '@/features/leads/hooks/useLeads';
import { FeatureGuard } from '@/shared/components/features/FeatureGuard';
import { TenantLogo } from '@/shared/components/branding/TenantLogo';

const homeNavItem = {
  title: 'HOME',
  url: '/app',
  icon: Home,
  description: 'Painel inicial',
};

const featureNavigationItems = [
  {
    title: 'Campanhas',
    url: '/app/campanhas',
    icon: Target,
    description: 'Marketing automation e campanhas',
    requiredFeature: 'enableCampaigns'
  },
  {
    title: 'Scraping',
    url: '/app/scraping',
    icon: Map,
    description: 'Jobs de coleta Google Maps',
    requiredFeature: 'enableScraping'
  }
];

const adminNavItem = {
  title: 'Administração',
  url: '/app/admin',
  icon: UserCog,
  description: 'Afiliados, repasses e configurações',
};

const settingsItems = [
  {
    title: 'Perfil',
    url: '/app/profile',
    icon: User,
    description: 'Configurações do perfil',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Tutorial',
    url: '/app/tutorial',
    icon: BookOpen,
    description: 'Manual de uso em PDF',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Assinatura',
    url: '/app/subscription',
    icon: CreditCard,
    description: 'Gerenciar assinatura',
    requiredFeature: 'enableBilling'
  },
  {
    title: 'Sessões Ativas',
    url: '/app/sessions',
    icon: Shield,
    description: 'Gerenciar dispositivos e sessões',
    requiredFeature: 'enableBasicFeatures'
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { logout, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { isAffiliate } = useIsAffiliateUser();

  type AffiliateNavItem = {
    title: string;
    url: string;
    icon: typeof LayoutDashboard;
    description: string;
    end?: boolean;
  };

  const affiliateNavItems: AffiliateNavItem[] = [
    {
      title: 'Link do Afiliado',
      url: '/app/afiliados',
      icon: LayoutDashboard,
      description: 'Seu link de indicação',
      end: true,
    },
    {
      title: 'Minhas indicações',
      url: '/app/afiliados/clientes',
      icon: Users,
      description: 'Minhas indicações',
    },
    // Comissões (/app/afiliados/comissoes): oculta temporariamente no menu
    {
      title: 'Financeiro',
      url: '/app/afiliados/financeiro',
      icon: Wallet,
      description: 'Resumo financeiro',
    },
    {
      title: 'Notas fiscais',
      url: '/app/afiliados/notas-fiscais',
      icon: FileText,
      description: 'NFS-e e faturas',
    },
  ];

  const isAffiliateNavActive = (url: string, end?: boolean) => {
    const p = location.pathname;
    if (end) {
      return p === url || p === `${url}/`;
    }
    return p === url || p.startsWith(`${url}/`);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    // HOME (/app) só fica ativo na rota exata, não em /app/profile, /app/subscription, etc.
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    // Item ativo: sem efeito de hover (sobrescreve hover do SidebarMenuButton)
    if (isActive(path)) {
      return "text-primary-foreground hover:!bg-[#0055A4] hover:!text-primary-foreground";
    }
    return "hover:bg-accent hover:text-accent-foreground";
  };

  const handleNavClick = () => {
    queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  // Render menu item with feature control
  const renderMenuItem = (item: any) => {
    const menuItem = (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            className={getNavClassName(item.url)}
            style={isActive(item.url) ? { backgroundColor: '#0055A4' } : undefined}
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

  const renderAffiliateMenuItem = (item: AffiliateNavItem) => {
    const end = Boolean(item.end);
    const active = isAffiliateNavActive(item.url, end);
    const className = active
      ? 'text-primary-foreground hover:!bg-[#0055A4] hover:!text-primary-foreground'
      : 'hover:bg-accent hover:text-accent-foreground';
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={end}
            className={className}
            style={active ? { backgroundColor: '#0055A4' } : undefined}
            title={!open ? item.description : undefined}
            onClick={handleNavClick}
          >
            <item.icon className="h-4 w-4" />
            {open && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar className={!open ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          {open ? (
            <TenantLogo size="lg" className="h-10 w-auto" />
          ) : (
            <TenantLogo size="md" className="h-8 w-auto mx-auto" />
          )}
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderMenuItem(homeNavItem)}
              {settingsItems.map(renderMenuItem)}
              {hasPermission('admin.access') ? renderMenuItem(adminNavItem) : null}
              {featureNavigationItems.map(renderMenuItem)}
            </SidebarMenu>
            {isAffiliate ? (
              <>
                {open && (
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Programa de afiliados
                  </div>
                )}
                <SidebarMenu>{affiliateNavItems.map(renderAffiliateMenuItem)}</SidebarMenu>
              </>
            ) : null}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sair */}
        <SidebarFooter className="border-t border-sidebar-border pt-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full hover:bg-accent hover:text-accent-foreground text-left"
                  title={!open ? 'Sair' : undefined}
                >
                  <LogOut className="h-4 w-4" />
                  {open && <span>Sair</span>}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
