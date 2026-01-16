/**
 * Currency formatting utilities for Iraqi Dinar (IQD)
 */

export const formatIQD = (value: number | string, options?: {
  showSymbol?: boolean;
  decimals?: number;
}): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const showSymbol = options?.showSymbol !== false;
  const decimals = options?.decimals ?? 2;
  
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
  
  return showSymbol ? `${formatted} IQD` : formatted;
};

export const formatIQDShort = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatIQDWithSymbol = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `${formatted} IQD`;
};

// For display purposes, you can also use ع.د (Arabic symbol)
export const formatIQDArabic = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
  return `ع.د ${formatted}`;
};

