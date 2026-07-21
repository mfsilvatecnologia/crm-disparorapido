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
  Plug,
  UserCheck,
  KeyRound,
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
import { isAdminTab } from '@/features/admin/components/AdminPage';

type NavItem = {
  title: string;
  url: string;
  icon: typeof Home;
  description: string;
  requiredFeature?: string;
  adminTab?: string;
  end?: boolean;
};

const homeNavItem: NavItem = {
  title: 'HOME',
  url: '/app',
  icon: Home,
  description: 'Painel inicial',
};

const leadsNavItem: NavItem = {
  title: 'Lead Rápido',
  url: '/app/leads',
  icon: Users,
  description: 'Leads de coleta Google Meu Negócio',
  requiredFeature: 'enableBilling',
  end: true,
};

const platformAdminNavItems: NavItem[] = [
  {
    title: 'HOME',
    url: '/app/admin?tab=home',
    icon: Home,
    description: 'Painel administrativo',
    adminTab: 'home',
  },
  {
    title: 'Afiliados',
    url: '/app/admin?tab=afiliados',
    icon: UserCheck,
    description: 'Gestão de afiliados',
    adminTab: 'afiliados',
  },
  {
    title: 'Clientes',
    url: '/app/admin?tab=clientes',
    icon: Users,
    description: 'Gestão de clientes',
    adminTab: 'clientes',
  },
  {
    title: 'Financeiro',
    url: '/app/admin?tab=financeiro',
    icon: Wallet,
    description: 'Indicadores e pagamentos',
    adminTab: 'financeiro',
  },
  {
    title: 'Relatórios',
    url: '/app/admin?tab=relatorios',
    icon: FileText,
    description: 'Extrato de novas assinaturas',
    adminTab: 'relatorios',
  },
  {
    title: 'Integrações',
    url: '/app/admin?tab=integracoes',
    icon: Plug,
    description: 'Webhooks e integrações',
    adminTab: 'integracoes',
  },
];

const featureNavigationItems: NavItem[] = [
  {
    title: 'Campanhas',
    url: '/app/campanhas',
    icon: Target,
    description: 'Marketing automation e campanhas',
    requiredFeature: 'enableCampaigns',
  },
  {
    title: 'Scraping',
    url: '/app/scraping',
    icon: Map,
    description: 'Jobs de coleta Google Maps',
    requiredFeature: 'enableScraping',
  },
];

const settingsItems: NavItem[] = [
  {
    title: 'Perfil',
    url: '/app/profile',
    icon: User,
    description: 'Configurações do perfil',
    requiredFeature: 'enableBasicFeatures',
  },
  {
    title: 'Tutorial',
    url: '/app/tutorial',
    icon: BookOpen,
    description: 'Manual de uso em PDF',
    requiredFeature: 'enableBasicFeatures',
  },
  {
    title: 'Assinatura',
    url: '/app/subscription',
    icon: CreditCard,
    description: 'Gerenciar assinatura',
    requiredFeature: 'enableBilling',
  },
  {
    title: 'Sessões Ativas',
    url: '/app/sessions',
    icon: Shield,
    description: 'Gerenciar dispositivos e sessões',
    requiredFeature: 'enableBasicFeatures',
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { logout, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const { isAffiliate, code: affiliateCode } = useIsAffiliateUser();
  const isManualRepasse = affiliateCode?.modoRepasse === 'MANUAL_NF';
  const isPlatformAdmin = hasRole('admin');

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
    {
      title: 'Financeiro',
      url: '/app/afiliados/financeiro',
      icon: Wallet,
      description: 'Resumo financeiro',
    },
    ...(isManualRepasse
      ? [
          {
            title: 'Chave PIX',
            url: '/app/afiliados/chave-pix',
            icon: KeyRound,
            description: 'Dados para pagamento',
          },
        ]
      : []),
    {
      title: 'Assinar Disparo Rápido',
      url: '/app/afiliados/assinatura-ferramenta',
      icon: CreditCard,
      description: 'Assinatura da extensão para afiliados',
    },
    {
      title: 'Notas fiscais',
      url: '/app/afiliados/notas-fiscais',
      icon: FileText,
      description: 'NFS-e e faturas',
    },
  ];

  const getActiveAdminTab = (): string => {
    if (location.pathname !== '/app/admin') return '';
    const tab = new URLSearchParams(location.search).get('tab');
    if (!tab || tab === 'home') return 'home';
    return isAdminTab(tab) ? tab : 'home';
  };

  const isAffiliateNavActive = (url: string, end?: boolean) => {
    const p = location.pathname;
    if (end) {
      return p === url || p === `${url}/`;
    }
    return p === url || p.startsWith(`${url}/`);
  };

  const isActive = (path: string, adminTab?: string, end?: boolean) => {
    if (adminTab) {
      return location.pathname === '/app/admin' && getActiveAdminTab() === adminTab;
    }

    if (path === '/') {
      return location.pathname === '/';
    }

    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }

    const pathOnly = path.split('?')[0];
    if (end) {
      return location.pathname === pathOnly || location.pathname === `${pathOnly}/`;
    }
    return location.pathname.startsWith(pathOnly);
  };

  const getNavClassName = (path: string, adminTab?: string, end?: boolean) => {
    if (isActive(path, adminTab, end)) {
      return 'bg-primary text-primary-foreground hover:!bg-primary/90 hover:!text-primary-foreground';
    }
    return 'hover:bg-muted hover:text-foreground';
  };

  const handleNavClick = () => {
    queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
  };

  const renderMenuItem = (item: NavItem) => {
    const menuItem = (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.end}
            className={getNavClassName(item.url, item.adminTab, item.end)}
            title={!open ? item.description : undefined}
            onClick={handleNavClick}
          >
            <item.icon className="h-4 w-4" />
            {open && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

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
      ? 'bg-primary text-primary-foreground hover:!bg-primary/90 hover:!text-primary-foreground'
      : 'hover:bg-muted hover:text-foreground';
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={end}
            className={className}
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
    <Sidebar className={!open ? 'w-16' : 'w-64'} collapsible="icon">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          {open ? (
            <TenantLogo size="lg" className="h-10 w-auto" />
          ) : (
            <TenantLogo size="md" className="h-8 w-auto mx-auto" />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {isPlatformAdmin
                ? platformAdminNavItems.map(renderMenuItem)
                : (
                  <>
                    {renderMenuItem(homeNavItem)}
                    {renderMenuItem(leadsNavItem)}
                    {settingsItems.map(renderMenuItem)}
                    {featureNavigationItems.map(renderMenuItem)}
                  </>
                )}
            </SidebarMenu>
            {!isPlatformAdmin && isAffiliate ? (
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
