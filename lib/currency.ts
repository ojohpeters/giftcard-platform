/**
 * Currency formatting utilities for Iranian Rial (IRR) / تومان
 */

// Persian digit mapping for RTL display
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Convert a number to Persian digits
 */
export const toPersianDigits = (num: number | string): string => {
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

/**
 * Format IRR (Iranian Rial) with proper formatting
 * Iranian Rial doesn't use decimal places
 */
export const formatIRR = (value: number | string, options?: {
  showSymbol?: boolean;
  usePersianDigits?: boolean;
}): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const showSymbol = options?.showSymbol !== false;
  const usePersian = options?.usePersianDigits ?? false;
  
  // Format with commas, no decimals (IRR doesn't use decimals)
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  
  if (usePersian) {
    const persianFormatted = toPersianDigits(formatted);
    return showSymbol ? `${persianFormatted} تومان` : persianFormatted;
  }
  
  return showSymbol ? `${formatted} تومان` : formatted;
};

/**
 * Format IRR short form (just numbers with commas)
 */
export const formatIRRShort = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

/**
 * Format IRR with Persian digits and تومان symbol
 */
export const formatIRRWithSymbol = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return `${formatted} تومان`;
};

/**
 * Format IRR with Persian/Arabic display
 */
export const formatIRRPersian = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  const persianFormatted = toPersianDigits(formatted);
  return `${persianFormatted} تومان`;
};

/**
 * Convert USD to IRR using exchange rate
 */
export const convertUsdToIrr = (usdAmount: number, exchangeRate: number): number => {
  return Math.round(usdAmount * exchangeRate);
};

/**
 * Format USD amount with dollar sign
 */
export const formatUSD = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Symbols for the currencies our gift-card countries actually use.
 * Codes not listed fall back to "CODE " (e.g. "AED 50").
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$', NZD: 'NZ$',
  JPY: '¥', CNY: '¥', INR: '₹', CHF: 'CHF ', SEK: 'kr ', NOK: 'kr ',
  DKK: 'kr ', PLN: 'zł ', TRY: '₺', BRL: 'R$', MXN: 'MX$', ZAR: 'R',
  SGD: 'S$', HKD: 'HK$', KRW: '₩', THB: '฿', MYR: 'RM', PHP: '₱',
  IDR: 'Rp ', VND: '₫', NGN: '₦', RUB: '₽', ILS: '₪', AED: 'AED ',
  SAR: 'SAR ', CZK: 'Kč ', HUF: 'Ft ', RON: 'lei ',
};

/**
 * Symbol for an ISO-4217 currency code (defaults to "$" when unknown/empty).
 */
export const currencySymbol = (code?: string | null): string => {
  if (!code) return '$';
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? `${code.toUpperCase()} `;
};

/**
 * Format a face value in its native currency, e.g. formatMoney(50, 'GBP') -> "£50".
 * Whole numbers show no decimals; fractional values show 2.
 */
export const formatMoney = (value: number | string, code?: string | null): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  const safe = Number.isFinite(num) ? num : 0;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: safe % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(safe);
  return `${currencySymbol(code)}${formatted}`;
};

// Legacy aliases for backward compatibility (IQD -> IRR)
export const formatIQD = formatIRR;
export const formatIQDShort = formatIRRShort;
export const formatIQDWithSymbol = formatIRRWithSymbol;
export const formatIQDArabic = formatIRRPersian;
