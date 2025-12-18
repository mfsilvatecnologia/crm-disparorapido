export interface Responsavel {
  id: string;
  nome: string;
  email: string;
  avatar_url: string | null;
  cargo: string | null;
  departamento: string | null;
  ativo: boolean;
}
