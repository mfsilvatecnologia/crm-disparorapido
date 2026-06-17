export function formatBrazilianPhoneInput(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) {
    return numbers.length ? `(${numbers}` : '';
  }
  if (numbers.length <= 6) {
    return numbers.replace(/(\d{2})(\d{0,4})/, '($1) $2').trim();
  }
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

export function formatCpfCnpjInput(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  }
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
