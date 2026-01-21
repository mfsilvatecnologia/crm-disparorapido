import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Target,
  Map,
  User,
  Shield,
  Building2,
  CreditCard,
  DollarSign,
  Handshake,
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
import { useAuth } from '@/shared/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { leadKeys } from '@/features/leads/hooks/useLeads';
import { FeatureGuard } from '@/shared/components/features/FeatureGuard';
import { useTenant } from '@/shared/contexts/TenantContext';
import { TenantLogo } from '@/shared/components/branding/TenantLogo';

const navigationItems = [
  {
    title: 'HOME',
    url: '/app',
    icon: Home,
    description: 'Painel inicial',
    // Dashboard sempre disponível (sem feature required)
  },
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

const settingsItems = [
  {
    title: 'Perfil',
    url: '/app/profile',
    icon: User,
    description: 'Configurações do perfil',
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
    title: 'Planos',
    url: '/app/pricing',
    icon: DollarSign,
    description: 'Planos e preços',
    requiredFeature: 'enablePlanos'
  },
  {
    title: 'Afiliados',
    url: '/app/afiliados',
    icon: Handshake,
    description: 'Programa de indicações e comissões',
    requiredFeature: 'enableBilling'
  },
  {
    title: 'Sessões Ativas',
    url: '/app/sessions',
    icon: Shield,
    description: 'Gerenciar dispositivos e sessões',
    requiredFeature: 'enableBasicFeatures'
  },
  {
    title: 'Empresas',
    url: '/app/empresas',
    icon: Building2,
    description: 'Gestão de empresas',
    requiredFeature: 'enableBasicFeatures'
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
      ? "text-primary-foreground hover:opacity-90" 
      : "hover:bg-accent hover:text-accent-foreground";
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

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
