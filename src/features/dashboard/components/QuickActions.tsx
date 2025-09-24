import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Rocket,
  BarChart3,
  FileDown,
  Settings,
  Zap,
  Phone,
  Mail,
  Target,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Eye,
  TrendingUp
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
  onClick: () => void;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'outline';
  };
  disabled?: boolean;
  featured?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActions({ actions, className = '' }: QuickActionsProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-primary-600 hover:bg-primary-700',
      text: 'text-white',
      border: 'border-primary-600'
    },
    secondary: {
      bg: 'bg-gray-600 hover:bg-gray-700',
      text: 'text-white',
      border: 'border-gray-600'
    },
    success: {
      bg: 'bg-green-600 hover:bg-green-700',
      text: 'text-white',
      border: 'border-green-600'
    },
    warning: {
      bg: 'bg-yellow-600 hover:bg-yellow-700',
      text: 'text-white',
      border: 'border-yellow-600'
    },
    info: {
      bg: 'bg-blue-600 hover:bg-blue-700',
      text: 'text-white',
      border: 'border-blue-600'
    }
  };

  const featuredActions = actions.filter(action => action.featured);
  const regularActions = actions.filter(action => !action.featured);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Featured Actions */}
      {featuredActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredActions.map((action) => (
            <Card key={action.id} className="hover:shadow-lg transition-all duration-200 border-2 border-primary-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <div className="h-6 w-6 text-primary-600">
                      {action.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{action.title}</h3>
                      {action.badge && (
                        <Badge variant={action.badge.variant} className="text-xs">
                          {action.badge.text}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <Button
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={`w-full ${colorClasses[action.color].bg} ${colorClasses[action.color].text}`}
                    >
                      {action.icon}
                      <span className="ml-2">{action.title}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Actions Grid */}
      {regularActions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {regularActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-auto p-4 flex-col gap-2 hover:shadow-md transition-all duration-200"
            >
              <div className="h-6 w-6 text-gray-600">
                {action.icon}
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">{action.title}</div>
                {action.badge && (
                  <Badge variant={action.badge.variant} className="text-xs mt-1">
                    {action.badge.text}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook para fornecer ações padrão do dashboard
export function useQuickActions() {
  const actions: QuickAction[] = [
    // Featured Actions
    {
      id: 'new-campaign',
      title: 'Nova Campanha',
      description: 'Configure e inicie uma nova campanha de geração de leads',
      icon: <Rocket className="h-6 w-6" />,
      color: 'primary',
      onClick: () => console.log('Nova campanha'),
      badge: {
        text: 'Recomendado',
        variant: 'default'
      },
      featured: true
    },
    {
      id: 'view-report',
      title: 'Ver Relatório',
      description: 'Visualize relatórios detalhados de performance e ROI',
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'info',
      onClick: () => console.log('Ver relatório'),
      featured: true
    },
    {
      id: 'export-leads',
      title: 'Exportar Leads',
      description: 'Exporte sua base de leads em diversos formatos',
      icon: <FileDown className="h-6 w-6" />,
      color: 'success',
      onClick: () => console.log('Exportar leads'),
      badge: {
        text: '2.847 leads',
        variant: 'outline'
      },
      featured: true
    },

    // Regular Actions
    {
      id: 'search-leads',
      title: 'Buscar Leads',
      description: 'Busque leads específicos',
      icon: <Search className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Buscar leads')
    },
    {
      id: 'filter-leads',
      title: 'Filtrar',
      description: 'Aplique filtros avançados',
      icon: <Filter className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Filtrar')
    },
    {
      id: 'import-data',
      title: 'Importar',
      description: 'Importe dados externos',
      icon: <Upload className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Importar')
    },
    {
      id: 'call-leads',
      title: 'Ligar',
      description: 'Inicie chamadas em massa',
      icon: <Phone className="h-5 w-5" />,
      color: 'warning',
      onClick: () => console.log('Ligar'),
      badge: {
        text: 'Premium',
        variant: 'outline'
      }
    },
    {
      id: 'email-leads',
      title: 'Email',
      description: 'Envie emails em massa',
      icon: <Mail className="h-5 w-5" />,
      color: 'warning',
      onClick: () => console.log('Email'),
      badge: {
        text: 'Premium',
        variant: 'outline'
      }
    },
    {
      id: 'manage-segments',
      title: 'Segmentos',
      description: 'Gerencie segmentação',
      icon: <Target className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Segmentos')
    },
    {
      id: 'team-management',
      title: 'Equipe',
      description: 'Gerencie sua equipe',
      icon: <Users className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Equipe')
    },
    {
      id: 'automation',
      title: 'Automação',
      description: 'Configure automações',
      icon: <Zap className="h-5 w-5" />,
      color: 'warning',
      onClick: () => console.log('Automação'),
      badge: {
        text: 'Novo',
        variant: 'default'
      }
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Análises avançadas',
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'info',
      onClick: () => console.log('Analytics')
    },
    {
      id: 'settings',
      title: 'Configurações',
      description: 'Ajuste suas preferências',
      icon: <Settings className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Configurações')
    },
    {
      id: 'refresh',
      title: 'Atualizar',
      description: 'Sincronizar dados',
      icon: <RefreshCw className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Atualizar')
    },
    {
      id: 'view-all',
      title: 'Ver Tudo',
      description: 'Visualizar todos os leads',
      icon: <Eye className="h-5 w-5" />,
      color: 'secondary',
      onClick: () => console.log('Ver tudo')
    }
  ];

  return { actions };
}
