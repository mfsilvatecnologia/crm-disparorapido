import React from 'react';
import { Check, ChevronDown, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useOrganization } from '@/contexts/OrganizationContext';

export function OrganizationSwitcher() {
  const { currentOrganization, organizations, switchOrganization } = useOrganization();

  if (!currentOrganization) {
    return null;
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default';
      case 'professional':
        return 'secondary';
      case 'white_label':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case 'basic':
        return 'Básico';
      case 'professional':
        return 'Profissional';
      case 'enterprise':
        return 'Enterprise';
      case 'white_label':
        return 'White Label';
      default:
        return plan;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold">
              {currentOrganization.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-medium truncate max-w-32">
                {currentOrganization.name}
              </span>
              <Badge 
                variant={getPlanBadgeVariant(currentOrganization.plan)} 
                className="text-xs h-4 px-1"
              >
                {getPlanLabel(currentOrganization.plan)}
              </Badge>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="px-3 py-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Organizações</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrganization(org.id)}
            className="flex items-center gap-3 p-3"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {org.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">
                  {org.name}
                </span>
                {org.id === currentOrganization.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant={getPlanBadgeVariant(org.plan)} 
                  className="text-xs h-4 px-1"
                >
                  {getPlanLabel(org.plan)}
                </Badge>
                {org.quota && (
                  <span className="text-xs text-muted-foreground">
                    {org.quota.used.toLocaleString()} / {org.quota.total.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 p-3 text-primary">
          <CreditCard className="h-4 w-4" />
          <span>Comprar créditos</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}