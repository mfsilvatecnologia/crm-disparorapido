export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  showSymbol?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface DateFormatOptions {
  locale?: string;
  includeTime?: boolean;
}

export function formatCurrency(
  value: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'pt-BR',
    currency = 'BRL',
    showSymbol = true,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
}

export function formatDate(isoDate: string, options: DateFormatOptions = {}): string {
  const { locale = 'pt-BR', includeTime = false } = options;

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  if (includeTime) {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(isoDate: string, locale = 'pt-BR'): string {
  return formatDate(isoDate, { includeTime: true, locale });
}
