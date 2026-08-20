export type Region =
  | "global"
  | "usa"
  | "nepal"
  | "india"
  | "uk"
  | "canada"
  | "australia";

export interface TaxBracket {
  limit: number; // upper bound of the slab (Infinity for the top slab)
  rate: number; // marginal rate, e.g. 0.36 === 36%
}

export interface PayFrequency {
  value: string;
  label: string;
  periodsPerYear: number;
}

export interface RegionConfig {
  name: string;
  currencyCode: string; // ISO 4217 code
  currencySymbol: string;
  locale: string; // Intl locale for formatting
  timezone: string; // IANA timezone
  dateFormat: string; // e.g., "MM/DD/YYYY" or "DD/MM/YYYY"
  defaultTaxLabel: string; // e.g., "Federal Tax", "Income Tax"
  defaultTaxRate: number; // default tax rate as decimal (e.g., 0.20 for 20%)
  standardWeeklyHours: number; // standard full-time weekly hours
  supportedPayFrequencies: PayFrequency[];
  flag: string;
  defaultInterestRate: number;
  defaultLoanAmount: number;
  taxYear: string;
  taxBrackets: TaxBracket[];
  toolName: string;
  paymentLabel: string;
}

/**
 * Multi-region configuration. Adding a new country is ONE entry here —
 * the store, selector, formatters and calculators all read from it.
 */
export const REGIONS: Record<Region, RegionConfig> = {
  global: {
    name: "Global",
    currencyCode: "USD",
    currencySymbol: "$",
    locale: "en-US",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    defaultTaxLabel: "Tax",
    defaultTaxRate: 0.2,
    standardWeeklyHours: 40,
    supportedPayFrequencies: [
      { value: "weekly", label: "Weekly", periodsPerYear: 52 },
      { value: "biweekly", label: "Bi-weekly", periodsPerYear: 26 },
      { value: "semimonthly", label: "Semi-monthly", periodsPerYear: 24 },
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🌍",
    defaultInterestRate: 5,
    defaultLoanAmount: 10_000,
    taxYear: "Current Year",
    taxBrackets: [{ limit: Infinity, rate: 0.2 }],
    toolName: "Calculator",
    paymentLabel: "Payment",
  },
  usa: {
    name: "United States",
    currencyCode: "USD",
    currencySymbol: "$",
    locale: "en-US",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    defaultTaxLabel: "Federal Tax",
    defaultTaxRate: 0.22,
    standardWeeklyHours: 40,
    supportedPayFrequencies: [
      { value: "weekly", label: "Weekly", periodsPerYear: 52 },
      { value: "biweekly", label: "Bi-weekly", periodsPerYear: 26 },
      { value: "semimonthly", label: "Semi-monthly", periodsPerYear: 24 },
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🇺🇸",
    defaultInterestRate: 6.5,
    defaultLoanAmount: 25_000,
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
  nepal: {
    name: "Nepal",
    currencyCode: "NPR",
    currencySymbol: "Rs. ",
    locale: "en-IN",
    timezone: "Asia/Kathmandu",
    dateFormat: "DD/MM/YYYY",
    defaultTaxLabel: "Income Tax",
    defaultTaxRate: 0.2,
    standardWeeklyHours: 48,
    supportedPayFrequencies: [
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🇳🇵",
    defaultInterestRate: 11,
    defaultLoanAmount: 1_000_000,
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
    name: "India",
    currencyCode: "INR",
    currencySymbol: "₹",
    locale: "en-IN",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    defaultTaxLabel: "Income Tax",
    defaultTaxRate: 0.1,
    standardWeeklyHours: 48,
    supportedPayFrequencies: [
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🇮🇳",
    defaultInterestRate: 8.5,
    defaultLoanAmount: 1_000_000,
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
  uk: {
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    locale: "en-GB",
    timezone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    defaultTaxLabel: "Income Tax",
    defaultTaxRate: 0.2,
    standardWeeklyHours: 37.5,
    supportedPayFrequencies: [
      { value: "weekly", label: "Weekly", periodsPerYear: 52 },
      { value: "biweekly", label: "Bi-weekly", periodsPerYear: 26 },
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🇬🇧",
    defaultInterestRate: 5.25,
    defaultLoanAmount: 20_000,
    taxYear: "Tax Year 2024/25",
    taxBrackets: [
      { limit: 12_570, rate: 0 },
      { limit: 50_270, rate: 0.2 },
      { limit: 125_140, rate: 0.4 },
      { limit: Infinity, rate: 0.45 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
  },
  canada: {
    name: "Canada",
    currencyCode: "CAD",
    currencySymbol: "$",
    locale: "en-CA",
    timezone: "America/Toronto",
    dateFormat: "DD/MM/YYYY",
    defaultTaxLabel: "Federal Tax",
    defaultTaxRate: 0.205,
    standardWeeklyHours: 40,
    supportedPayFrequencies: [
      { value: "weekly", label: "Weekly", periodsPerYear: 52 },
      { value: "biweekly", label: "Bi-weekly", periodsPerYear: 26 },
      { value: "semimonthly", label: "Semi-monthly", periodsPerYear: 24 },
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🇨🇦",
    defaultInterestRate: 5.5,
    defaultLoanAmount: 30_000,
    taxYear: "Federal 2024",
    taxBrackets: [
      { limit: 55_867, rate: 0.15 },
      { limit: 111_733, rate: 0.205 },
      { limit: 173_669, rate: 0.26 },
      { limit: 246_752, rate: 0.29 },
      { limit: Infinity, rate: 0.33 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
  },
  australia: {
    name: "Australia",
    currencyCode: "AUD",
    currencySymbol: "$",
    locale: "en-AU",
    timezone: "Australia/Sydney",
    dateFormat: "DD/MM/YYYY",
    defaultTaxLabel: "Income Tax",
    defaultTaxRate: 0.19,
    standardWeeklyHours: 38,
    supportedPayFrequencies: [
      { value: "weekly", label: "Weekly", periodsPerYear: 52 },
      { value: "biweekly", label: "Bi-weekly", periodsPerYear: 26 },
      { value: "semimonthly", label: "Semi-monthly", periodsPerYear: 24 },
      { value: "monthly", label: "Monthly", periodsPerYear: 12 },
      { value: "quarterly", label: "Quarterly", periodsPerYear: 4 },
      { value: "annually", label: "Annually", periodsPerYear: 1 },
    ],
    flag: "🇦🇺",
    defaultInterestRate: 6,
    defaultLoanAmount: 40_000,
    taxYear: "FY 2024-25",
    taxBrackets: [
      { limit: 18_200, rate: 0 },
      { limit: 45_000, rate: 0.19 },
      { limit: 135_000, rate: 0.325 },
      { limit: 190_000, rate: 0.37 },
      { limit: Infinity, rate: 0.45 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
  },
};

export const DEFAULT_REGION: Region = "global";

/** Validate + fall back to Global — used by both the store and ?region= params. */
export function getRegion(region: string | null | undefined): Region {
  if (region && region in REGIONS) return region as Region;
  return DEFAULT_REGION;
}

export function getRegionConfig(region: Region): RegionConfig {
  return REGIONS[region] ?? REGIONS[DEFAULT_REGION];
}

/** Get all regions as an array for iteration/selection UIs. */
export function getAllRegions(): { value: Region; name: string; flag: string }[] {
  return Object.entries(REGIONS).map(([key, config]) => ({
    value: key as Region,
    name: config.name,
    flag: config.flag,
  }));
}
