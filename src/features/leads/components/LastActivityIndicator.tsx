import React from 'react';
import { Clock, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LastActivityIndicatorProps {
  lastActivityDate?: string | Date;
  createdDate?: string | Date;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
}

export function LastActivityIndicator({
  lastActivityDate,
  createdDate,
  size = 'md',
  showLabel = true,
  showIcon = true
}: LastActivityIndicatorProps) {
  const activityDate = lastActivityDate || createdDate;
  
  if (!activityDate) {
    return (
      <Badge variant="outline" className="text-xs text-gray-400">
        <Clock className="h-3 w-3 mr-1" />
        Sem atividade
      </Badge>
    );
  }

  const date = new Date(activityDate);
  const now = new Date();
  const daysSince = differenceInDays(now, date);
  const hoursSince = differenceInHours(now, date);

  const getActivityStatus = () => {
    if (hoursSince < 24) {
      return {
        label: 'Recente',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: CheckCircle2,
        description: 'Atividade nas últimas 24 horas'
      };
    }
    if (daysSince < 7) {
      return {
        label: 'Esta semana',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Clock,
        description: 'Atividade nos últimos 7 dias'
      };
    }
    if (daysSince < 30) {
      return {
        label: 'Este mês',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: Clock,
        description: 'Atividade nos últimos 30 dias'
      };
    }
    return {
      label: 'Inativo',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertCircle,
      description: 'Sem atividade há mais de 30 dias'
    };
  };

  const status = getActivityStatus();
  const Icon = status.icon;
  
  const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  const fullDate = date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const badgeSizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  if (!showLabel && !showIcon) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`h-2 w-2 rounded-full ${status.bgColor.replace('bg-', 'bg-opacity-100 ')}`} />
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center space-y-1">
              <p className="font-semibold">{status.label}</p>
              <p className="text-xs">{timeAgo}</p>
              <p className="text-xs text-gray-400">{fullDate}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`${status.bgColor} ${status.color} ${status.borderColor} ${badgeSizeClasses[size]} flex items-center gap-1`}
          >
            {showIcon && <Icon className={sizeClasses[size]} />}
            {showLabel && <span>{timeAgo}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="font-semibold">{status.label}</span>
            </div>
            <div className="text-xs space-y-1">
              <p>{status.description}</p>
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar className="h-3 w-3" />
                <span>{fullDate}</span>
              </div>
              {daysSince > 0 && (
                <p className="font-mono">
                  {daysSince === 1 ? '1 dia' : `${daysSince} dias`} atrás
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ActivityAgeAlertProps {
  lastActivityDate?: string | Date;
  thresholdDays?: number;
}

export function ActivityAgeAlert({ lastActivityDate, thresholdDays = 30 }: ActivityAgeAlertProps) {
  if (!lastActivityDate) return null;

  const daysSince = differenceInDays(new Date(), new Date(lastActivityDate));

  if (daysSince < thresholdDays) return null;

  return (
    <Badge variant="destructive" className="text-xs">
      <AlertCircle className="h-3 w-3 mr-1" />
      {daysSince} dias sem atividade
    </Badge>
  );
}
