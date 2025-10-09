/**
 * Formatter Utilities
 * Functions for formatting currency and dates
 */

/**
 * Currency Formatter Options
 */
export interface CurrencyFormatOptions {
  locale?: string;                   // Default: 'pt-BR'
  currency?: string;                 // Default: 'BRL'
  showSymbol?: boolean;              // Default: true
}

/**
 * Date Formatter Options
 */
export interface DateFormatOptions {
  locale?: string;                   // Default: 'pt-BR'
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;             // Default: false
}

/**
 * Format currency from cents to R$ format
 * @param cents - Amount in cents (e.g., 9900 = R$ 99,00)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(cents: number, options: CurrencyFormatOptions = {}): string {
  const {
    locale = 'pt-BR',
    currency = 'BRL',
    showSymbol = true,
  } = options;

  const reais = cents / 100;

  return new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(reais);
}

/**
 * Format ISO 8601 date to Brazilian format
 * @param isoDate - ISO 8601 datetime string
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(isoDate: string, options: DateFormatOptions = {}): string {
  const {
    locale = 'pt-BR',
    includeTime = false,
  } = options;

  const date = new Date(isoDate);

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

/**
 * Format date to ISO 8601 string for API requests
 * @param date - Date object
 * @returns ISO 8601 string
 */
export function toISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO 8601 string to Date object
 * @param isoDate - ISO 8601 string
 * @returns Date object
 */
export function parseISODate(isoDate: string): Date {
  return new Date(isoDate);
}
