export interface Cliente {
  id: string;
  nome: string;
  razao_social: string | null;
  cnpj: string | null;
  email: string;
  telefone: string | null;
  ativo: boolean;
}
