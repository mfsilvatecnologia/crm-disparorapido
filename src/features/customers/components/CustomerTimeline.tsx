import React from 'react';
import React from 'react';
import { Timeline } from '@/shared/components/Timeline';
import { formatDateTime } from '@/shared/lib/crm/formatters';
import type { TimelineEvent } from '../types/timeline';
import type { Activity } from '@/features/activities/types/activity';
import type { Contract } from '@/features/contracts/types/contract';
import { FileText } from 'lucide-react';
import { ACTIVITY_TYPE_ICONS, ACTIVITY_TYPE_LABELS } from '@/features/activities/lib/constants';

interface CustomerTimelineProps {
  events: TimelineEvent[];
  activities?: Activity[];
  contracts?: Contract[];
}

export function CustomerTimeline({ events, activities = [], contracts = [] }: CustomerTimelineProps) {
  const activityItems = activities.map((activity) => ({
    id: `activity-${activity.id}`,
    title: ACTIVITY_TYPE_LABELS[activity.tipo],
    description: activity.descricao,
    timestamp: formatDateTime(activity.dataHora),
    icon: React.createElement(ACTIVITY_TYPE_ICONS[activity.tipo], {
      className: 'h-3 w-3',
    }),
    dateValue: new Date(activity.dataHora).getTime(),
  }));

  const eventItems = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    timestamp: formatDateTime(event.createdAt),
    dateValue: new Date(event.createdAt).getTime(),
  }));

  const contractItems = contracts.map((contract) => ({
    id: `contract-${contract.id}`,
    title: `Contrato ${contract.tipo}`,
    description: `Periodo ${formatDateTime(contract.dataInicio)} - ${formatDateTime(contract.dataFim)}`,
    timestamp: formatDateTime(contract.dataInicio),
    icon: <FileText className="h-3 w-3" />,
    dateValue: new Date(contract.dataInicio).getTime(),
  }));

  const merged = [...eventItems, ...activityItems, ...contractItems]
    .filter((item) => !Number.isNaN(item.dateValue))
    .sort((a, b) => b.dateValue - a.dateValue)
    .map(({ dateValue, ...item }) => item);

  return <Timeline items={merged} emptyState="Nenhum evento registrado." />;
}
