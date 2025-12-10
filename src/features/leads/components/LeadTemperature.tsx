import React from 'react';
import { Flame, Thermometer, Snowflake } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

interface LeadTemperatureProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function LeadTemperature({ score, size = 'md', showLabel = true }: LeadTemperatureProps) {
  const getTemperature = (score: number) => {
    if (score >= 90) {
      return {
        icon: Flame,
        label: 'Quente',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        description: 'Lead de alta qualidade, prioridade máxima'
      };
    }
    if (score >= 70) {
      return {
        icon: Thermometer,
        label: 'Morno',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        description: 'Lead qualificado, boa oportunidade'
      };
    }
    return {
      icon: Snowflake,
      label: 'Frio',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Lead necessita qualificação ou aquecimento'
    };
  };

  const temp = getTemperature(score);
  const Icon = temp.icon;

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

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center justify-center ${temp.bgColor} ${temp.borderColor} border rounded-full p-1`}>
              <Icon className={`${sizeClasses[size]} ${temp.color}`} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold">{temp.label}</p>
              <p className="text-xs text-gray-500">{temp.description}</p>
              <p className="text-xs font-mono mt-1">Score: {score}%</p>
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
            className={`${temp.bgColor} ${temp.color} ${temp.borderColor} ${badgeSizeClasses[size]} flex items-center gap-1`}
          >
            <Icon className={sizeClasses[size]} />
            <span>{temp.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{temp.description}</p>
            <p className="text-xs font-mono mt-1">Score: {score}%</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface LeadPriorityProps {
  priority: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg';
}

export function LeadPriority({ priority, size = 'md' }: LeadPriorityProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          label: 'Alta',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '🔴'
        };
      case 'medium':
        return {
          label: 'Média',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '🟡'
        };
      case 'low':
        return {
          label: 'Baixa',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '🟢'
        };
      default:
        return {
          label: 'Normal',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '⚪'
        };
    }
  };

  const config = getPriorityConfig(priority);

  const badgeSizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <Badge
      variant="outline"
      className={`${config.bgColor} ${config.color} ${config.borderColor} ${badgeSizeClasses[size]} flex items-center gap-1`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </Badge>
  );
}
