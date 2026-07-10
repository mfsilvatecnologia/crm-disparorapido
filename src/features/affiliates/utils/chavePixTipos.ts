/** Tipos de chave PIX aceitos para repasse manual (CPF não permitido). */
export const CHAVE_PIX_TIPOS_REPASSE = [
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'TELEFONE', label: 'Telefone' },
  { value: 'ALEATORIA', label: 'Chave aleatória (EVP)' },
] as const;

export type ChavePixTipoRepasse = (typeof CHAVE_PIX_TIPOS_REPASSE)[number]['value'];
