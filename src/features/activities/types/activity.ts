export type ActivityType = 'call' | 'meeting' | 'email' | 'note';

export interface Activity {
  id: string;
  customerId: string;
  tipo: ActivityType;
  descricao: string;
  dataHora: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ActivityApi {
  id: string;
  customer_id: string;
  tipo: ActivityType;
  descricao: string;
  data_hora: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateActivityPayload {
  customerId: string;
  tipo: ActivityType;
  descricao: string;
  dataHora: string;
}

export interface UpdateActivityPayload {
  id: string;
  tipo?: ActivityType;
  descricao?: string;
  dataHora?: string;
}
