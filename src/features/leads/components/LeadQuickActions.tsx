import React from 'react';
import { Phone, Mail, MessageSquare, Star, UserPlus, Tag, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import type { Lead } from '@/shared/services/schemas';

interface LeadQuickActionsProps {
  lead: Lead;
  onWhatsApp?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onCall?: (lead: Lead) => void;
  onAddToPipeline?: (lead: Lead) => void;
  onAssign?: (lead: Lead) => void;
  onTag?: (lead: Lead) => void;
  compact?: boolean;
}

export function LeadQuickActions({
  lead,
  onWhatsApp,
  onEmail,
  onCall,
  onAddToPipeline,
  onAssign,
  onTag,
  compact = false
}: LeadQuickActionsProps) {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = lead.telefone?.replace(/\D/g, '');
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
    onWhatsApp?.(lead);
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.email) {
      window.location.href = `mailto:${lead.email}`;
    }
    onEmail?.(lead);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.telefone) {
      window.location.href = `tel:${lead.telefone}`;
    }
    onCall?.(lead);
  };

  const handleAddToPipeline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToPipeline?.(lead);
  };

  const handleAssign = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAssign?.(lead);
  };

  const handleTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTag?.(lead);
  };

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleWhatsApp}
                disabled={!lead.telefone}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>WhatsApp</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleEmail}
                disabled={!lead.email}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enviar Email</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCall}
                disabled={!lead.telefone}
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ligar</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleAddToPipeline}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar ao Pipeline</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsApp}
        disabled={!lead.telefone}
        className="flex-1 min-w-[120px]"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleEmail}
        disabled={!lead.email}
        className="flex-1 min-w-[120px]"
      >
        <Mail className="mr-2 h-4 w-4" />
        Email
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCall}
        disabled={!lead.telefone}
        className="flex-1 min-w-[120px]"
      >
        <Phone className="mr-2 h-4 w-4" />
        Ligar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAddToPipeline}
        className="flex-1 min-w-[120px]"
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Pipeline
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAssign}
        className="flex-1 min-w-[120px]"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Atribuir
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleTag}
        className="flex-1 min-w-[120px]"
      >
        <Tag className="mr-2 h-4 w-4" />
        Tags
      </Button>
    </div>
  );
}
