import { getRegionConfig, type Region } from "@/config/regions";

export interface Formatters {
  /** Format a number with locale-aware grouping (no currency symbol). */
  fmt: (value: number, fractionDigits?: number) => string;
  /** Format money with the region's currency symbol and locale-aware grouping. */
  money: (value: number, fractionDigits?: number) => string;
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

/**
 * Standalone currency formatter using a specific currency code.
 * Uses Intl.NumberFormat with style: 'currency' for proper formatting.
 */
export function formatCurrency(
  value: number,
  currencyCode: string,
  locale: string,
  fractionDigits = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/**
 * Standalone number formatter with locale-aware grouping.
 */
export function formatNumber(
  value: number,
  locale: string,
  fractionDigits = 0
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
