export type Region = "nepal" | "india" | "usa";

export interface TaxBracket {
  limit: number; // upper bound of the slab (Infinity for the top slab)
  rate: number; // marginal rate, e.g. 0.36 === 36%
}

export interface RegionConfig {
  label: string;
  flag: string;
  currency: string; // ISO 4217 code
  symbol: string;
  locale: string; // Intl grouping — lakh style for NP/IN, comma style for US
  defaultInterestRate: number;
  defaultLoanAmount: number; // Default principal for loan/EMI calculators
  taxYear: string;
  taxBrackets: TaxBracket[];
  toolName: string; // "EMI Calculator" for NP/IN, "Loan Calculator" for US
  paymentLabel: string; // "Monthly EMI" for NP/IN, "Monthly Payment" for US
}

/**
 * Multi-region configuration. Adding a new country is ONE entry here —
 * the store, selector, formatters and calculators all read from it.
 * Sample values — verify and update yearly.
 */
export const REGIONS: Record<Region, RegionConfig> = {
  nepal: {
    label: "Nepal",
    flag: "🇳🇵",
    currency: "NPR",
    symbol: "Rs. ",
    locale: "en-IN",
    defaultInterestRate: 11,
    defaultLoanAmount: 1_000_000, // 10 lakh NPR
    taxYear: "FY 2081/82",
    taxBrackets: [
      { limit: 500_000, rate: 0.01 },
      { limit: 700_000, rate: 0.1 },
      { limit: 1_000_000, rate: 0.2 },
      { limit: 2_000_000, rate: 0.3 },
      { limit: Infinity, rate: 0.36 },
    ],
    toolName: "EMI Calculator",
    paymentLabel: "Monthly EMI",
  },
  india: {
    label: "India",
    flag: "🇮🇳",
    currency: "INR",
    symbol: "₹",
    locale: "en-IN",
    defaultInterestRate: 8.5,
    defaultLoanAmount: 1_000_000, // 10 lakh INR
    taxYear: "New Regime FY 2024-25",
    taxBrackets: [
      { limit: 300_000, rate: 0 },
      { limit: 700_000, rate: 0.05 },
      { limit: 1_000_000, rate: 0.1 },
      { limit: 1_200_000, rate: 0.15 },
      { limit: 1_500_000, rate: 0.2 },
      { limit: Infinity, rate: 0.3 },
    ],
    toolName: "EMI Calculator",
    paymentLabel: "Monthly EMI",
  },
  usa: {
    label: "United States",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    locale: "en-US",
    defaultInterestRate: 6.5,
    defaultLoanAmount: 25_000, // $25k USD
    taxYear: "Federal 2024",
    taxBrackets: [
      { limit: 11_600, rate: 0.1 },
      { limit: 47_150, rate: 0.12 },
      { limit: 100_525, rate: 0.22 },
      { limit: 191_950, rate: 0.24 },
      { limit: Infinity, rate: 0.32 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
  },
};

export const DEFAULT_REGION: Region = "nepal";

/** Validate + fall back to Nepal — used by both the store and ?region= params. */
export function getRegion(region: string | null | undefined): Region {
  if (region && region in REGIONS) return region as Region;
  return DEFAULT_REGION;
}

export function getRegionConfig(region: Region): RegionConfig {
  return REGIONS[region] ?? REGIONS[DEFAULT_REGION];
}
