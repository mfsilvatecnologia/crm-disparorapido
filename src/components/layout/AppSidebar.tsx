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
  Zap
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
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
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
    title: 'Segmentos',
    url: '/segments',
    icon: BarChart3,
    description: 'Análise por segmento' 
  },
  {
    title: 'Pipeline',
    url: '/pipeline',
    icon: Kanban,
    description: 'Funil de vendas'
  },
  {
    title: 'Ferramentas',
    url: '/sales-tools',
    icon: Phone,
    description: 'Call center e e-mails'
  },
];

const settingsItems = [
  {
    title: 'Cobrança',
    url: '/billing',
    icon: CreditCard,
    description: 'Uso e faturas'
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
    description: 'Perfil e integrações'
  },
];

const adminItems = [
  {
    title: 'Organizações',
    url: '/admin/organizations',
    icon: Building2,
    description: 'Gerenciar organizações'
  },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

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