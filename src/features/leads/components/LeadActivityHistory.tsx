import React from 'react';
import { Clock, User, MessageSquare, Phone, Mail, FileText, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface LeadActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'created' | 'whatsapp';
  title: string;
  description?: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

interface LeadActivityHistoryProps {
  activities: LeadActivity[];
  maxHeight?: string;
}

export function LeadActivityHistory({ activities, maxHeight = '400px' }: LeadActivityHistoryProps) {
  const getActivityIcon = (type: LeadActivity['type']) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      case 'status_change':
        return <ExternalLink className="h-4 w-4" />;
      case 'created':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: LeadActivity['type']) => {
    switch (type) {
      case 'call':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'email':
        return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'meeting':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'note':
        return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'whatsapp':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'status_change':
        return 'bg-orange-50 text-orange-600 border-orange-200';
      case 'created':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma atividade registrada ainda</p>
          <p className="text-sm text-gray-400 mt-1">
            As interações com este lead aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Histórico de Atividades
          <Badge variant="secondary" className="ml-auto">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <Separator />
      <ScrollArea style={{ maxHeight }}>
        <CardContent className="p-0">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[29px] top-0 bottom-0 w-px bg-gray-200" />
            
            <div className="space-y-4 p-4">
              {sortedActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-3">
                  {/* Icon */}
                  <div className={`
                    relative z-10 flex items-center justify-center h-8 w-8 rounded-full border-2
                    ${getActivityColor(activity.type)}
                  `}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <User className="h-3 w-3" />
                      <span>{activity.user.name}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>

                    {/* Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <Badge key={key} variant="secondary" className="text-xs">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
