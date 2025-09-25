import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  Clock,
  Star,
  Save,
  ExternalLink,
  BarChart3
} from 'lucide-react';

interface Lead {
  id: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone?: string;
  sector: string;
  location: string;
  employees: number;
  qualityScore: number;
  createdAt: Date;
  campaign: string;
  linkedinUrl?: string;
}

interface RecentLeadsWidgetProps {
  leads: Lead[];
  className?: string;
}

export function RecentLeadsWidget({ leads, className = '' }: RecentLeadsWidgetProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const getQualityBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-success-500 text-white';
    if (score >= 80) return 'bg-primary-500 text-white';
    if (score >= 70) return 'bg-warning-500 text-white';
    return 'bg-gray-400 text-white';
  };

  return (
    <Card className={`bg-white border border-gray-200 shadow-lg ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-primary-600" />
          <CardTitle className="text-lg font-semibold text-gray-900">
            Leads Recentes
          </CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
          Ver Todos
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all"
          >
            {/* Header com empresa e score */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900">{lead.companyName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs ${getQualityBadgeColor(lead.qualityScore)}`}>
                      ⭐ {lead.qualityScore}%
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Novo
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações do contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3 text-gray-400" />
                  <span className="font-medium text-gray-700">{lead.contactName}</span>
                  <span className="text-gray-500">- {lead.contactRole}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{lead.email}</span>
                </div>
                {lead.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-600">{lead.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{lead.sector}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{lead.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{lead.employees} funcionários</span>
                </div>
              </div>
            </div>

            {/* Meta informações */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(lead.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🎯 {lead.campaign}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Save className="h-3 w-3 mr-1" />
                Salvar
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              {lead.linkedinUrl && (
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  LinkedIn
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-xs">
                <BarChart3 className="h-3 w-3 mr-1" />
                Detalhes
              </Button>
            </div>
          </div>
        ))}

        {leads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Nenhum lead recente</p>
            <p className="text-xs mt-1">Novos leads aparecerão aqui automaticamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
