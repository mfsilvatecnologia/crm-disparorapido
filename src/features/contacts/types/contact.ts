export interface Contact {
  id: string;
  customerId: string;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  departamento: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactApi {
  id: string;
  customer_id: string;
  nome: string;
  email: string;
  telefone: string | null;
  cargo: string | null;
  departamento: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactsResponseApi {
  data: ContactApi[];
}

export interface ContactsResponse {
  data: Contact[];
}

export interface CreateContactPayload {
  customerId: string;
  nome: string;
  email: string;
  telefone?: string | null;
  cargo?: string | null;
  departamento?: string | null;
}

export interface UpdateContactPayload {
  customerId: string;
  id: string;
  nome?: string;
  email?: string;
  telefone?: string | null;
  cargo?: string | null;
  departamento?: string | null;
}
