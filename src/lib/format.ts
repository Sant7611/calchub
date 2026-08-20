import { getRegionConfig, type Region } from "@/config/regions";

export interface Formatters {
  /** "Rs. 1,00,000" · "₹8,50,000" · "$250,000" */
  money: (value: number, fractionDigits?: number) => string;
  /** Locale-aware number grouping without a currency symbol. */
  fmt: (value: number, fractionDigits?: number) => string;
}

/**
 * Region-aware formatters bound to the active region's locale + currency.
 * Calculators call `makeFormatters(region)` via `useRegion()`.
 */
export function makeFormatters(region: Region): Formatters {
  const config = getRegionConfig(region);

  const fmt = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);

  const money = (value: number, fractionDigits = 0) =>
    `${config.currencySymbol}${fmt(value, fractionDigits)}`;

  return { money, fmt };
}
