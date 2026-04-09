import { useCallback } from 'react';
import { useSchema } from '../context/SchemaContext';

/**
 * Currency formatting hook — returns formatters that automatically
 * switch between ₹ (Lakhs) and $ (K/M) based on the selected schema.
 *
 * Usage:
 *   const { F, FL, symbol, locale } = useCurrency();
 *   F(1250000)   → "₹12.5L"  or  "$1.3M"
 *   FL(1250000)  → "₹12,50,000"  or  "$1,250,000"
 */
export default function useCurrency() {
  const { currentOption } = useSchema();
  const isUS = currentOption?.key === 'us';

  const symbol = isUS ? '$' : '₹';
  const locale = isUS ? 'en-US' : 'en-IN';

  // Short format:  ₹12.5L  or  $1.3M / $125.0K
  const F = useCallback((v) => {
    const n = Number(v) || 0;
    if (isUS) {
      if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
      return `$${n.toFixed(0)}`;
    }
    return `₹${(n / 100_000).toFixed(1)}L`;
  }, [isUS]);

  // Full format:  ₹12,50,000  or  $1,250,000
  const FL = useCallback((v) => {
    const n = Number(v) || 0;
    return `${symbol}${n.toLocaleString(locale)}`;
  }, [symbol, locale]);

  return { F, FL, symbol, locale, isUS };
}
