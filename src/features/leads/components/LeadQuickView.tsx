import React from 'react';
import { X, Mail, Phone, MapPin, Building2, Calendar, Clock, TrendingUp, Tag as TagIcon, Star } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Separator } from '@/shared/components/ui/separator';
import { Progress } from '@/shared/components/ui/progress';
import { LeadQuickActions } from './LeadQuickActions';
import type { Lead } from '@/shared/services/schemas';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadQuickViewProps {
  lead: Lead;
  onClose?: () => void;
  position?: { x: number; y: number };
}

export function LeadQuickView({ lead, onClose, position }: LeadQuickViewProps) {
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Alta';
    if (score >= 70) return 'Média';
    return 'Baixa';
  };

  const getTemperature = (score: number) => {
    if (score >= 90) return { icon: '🔥', label: 'Quente', color: 'text-red-600 bg-red-50' };
    if (score >= 70) return { icon: '🌡️', label: 'Morno', color: 'text-orange-600 bg-orange-50' };
    return { icon: '❄️', label: 'Frio', color: 'text-blue-600 bg-blue-50' };
  };

  const temperature = getTemperature(lead.scoreQualificacao || 0);
  
  const lastActivity = lead.updatedAt || lead.createdAt;
  const lastActivityText = lastActivity 
    ? formatDistanceToNow(new Date(lastActivity), { addSuffix: true, locale: ptBR })
    : 'Nunca';

  const style = position ? {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 9999,
  } : {};

  return (
    <Card 
      className="w-96 shadow-2xl border-2 border-primary-200 animate-in fade-in-0 zoom-in-95"
      style={style}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-white">
              <AvatarImage src={`https://avatar.vercel.sh/${lead.nomeContato || lead.nomeEmpresa}?size=48`} />
              <AvatarFallback className="bg-primary-600 text-white text-sm">
                {lead.nomeContato?.split(' ').map((n: string) => n[0]).join('').toUpperCase() ||
                 lead.nomeEmpresa?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'NN'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{lead.nomeEmpresa}</h3>
              <p className="text-sm text-gray-600 truncate">{lead.nomeContato || 'Nome não informado'}</p>
              <p className="text-xs text-gray-500 truncate">{lead.cargoContato || 'Cargo não informado'}</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-white/50"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-4 space-y-4">
          {/* Temperature & Quality */}
          <div className="flex items-center gap-3">
            <div className={`px-3 py-2 rounded-lg ${temperature.color} flex items-center gap-2`}>
              <span className="text-2xl">{temperature.icon}</span>
              <div>
                <p className="text-xs font-medium">{temperature.label}</p>
                <p className="text-xs opacity-75">Temperatura</p>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Qualidade</span>
                <span className={`text-sm font-bold ${getQualityColor(lead.scoreQualificacao || 0)}`}>
                  {lead.scoreQualificacao}%
                </span>
              </div>
              <Progress value={lead.scoreQualificacao || 0} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">{getQualityLabel(lead.scoreQualificacao || 0)}</p>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate">{lead.email || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{lead.telefone || 'Não informado'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate">
                {lead.endereco?.cidade ? `${lead.endereco.cidade}, ${lead.endereco.estado}` : 'Não informado'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{lead.segmento || 'Não informado'}</span>
            </div>
          </div>

          <Separator />

          {/* Activity Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Última atividade: <strong>{lastActivityText}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>Criado em: {new Date(lead.createdAt || '').toLocaleDateString('pt-BR')}</span>
            </div>
          </div>

          {/* Tags */}
          {lead.tags && lead.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <TagIcon className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lead.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Quick Actions */}
          <LeadQuickActions lead={lead} compact />
        </div>
      </CardContent>
    </Card>
  );
}
