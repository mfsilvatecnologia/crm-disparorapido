import React from 'react';
import type { Activity } from '../types/activity';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { formatDateTime } from '@/shared/lib/crm/formatters';
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_LABELS } from '../lib/constants';

interface ActivityCardProps {
  activity: Activity;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activity: Activity) => void;
}

export function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const Icon = ACTIVITY_TYPE_ICONS[activity.tipo];

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {ACTIVITY_TYPE_LABELS[activity.tipo]}
          </div>
          <p className="text-sm text-muted-foreground">{formatDateTime(activity.dataHora)}</p>
          <p className="text-sm">{activity.descricao}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onEdit ? (
            <Button variant="outline" size="sm" onClick={() => onEdit(activity)}>
              Editar
            </Button>
          ) : null}
          {onDelete ? (
            <Button variant="outline" size="sm" onClick={() => onDelete(activity)}>
              Remover
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
