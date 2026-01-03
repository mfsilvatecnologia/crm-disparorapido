import { Calendar, Mail, Phone, StickyNote } from 'lucide-react';
import type { ActivityType } from '../types/activity';

export const ACTIVITY_TYPES: ActivityType[] = ['call', 'meeting', 'email', 'note'];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  call: 'Ligacao',
  meeting: 'Reuniao',
  email: 'Email',
  note: 'Nota',
};

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, typeof Phone> = {
  call: Phone,
  meeting: Calendar,
  email: Mail,
  note: StickyNote,
};
