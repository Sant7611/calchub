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
  rate: number; // marginal rate, e.g., 0.36 === 36%
}

export interface FilingStatus {
  value: string;
  label: string;
  // Optional: different brackets per status (future extension)
}

export interface PayrollDeduction {
  key: string;
  label: string;
  defaultRate?: number; // as decimal, e.g., 0.062 for 6.2%
  fixedAmount?: number; // optional fixed amount
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
  // Invoice/sales tax configuration
  defaultSalesTaxRate: number; // VAT/GST/sales tax rate as decimal
  salesTaxLabel: string; // e.g., "VAT", "GST", "Sales Tax"
  // Filing status options (region-specific)
  filingStatuses: FilingStatus[];
  // Payroll deductions (region-specific)
  payrollDeductions: PayrollDeduction[];
  // Metadata for estimates
  isEstimate: boolean; // true if brackets are estimates/placeholders
  estimateNote?: string; // optional note explaining estimate status
  // Mortgage/property terminology (region-specific)
  propertyTaxLabel: string; // e.g., "Property Tax", "Council Tax", "Land Tax"
  insuranceLabel: string; // e.g., "Home Insurance", "Buildings Insurance"
  hoaLabel: string; // e.g., "HOA", "Strata Fees", "Service Charge"
  hasServiceCharge: boolean; // whether service charges are common
  serviceChargeLabel: string; // e.g., "Service Charge", "Maintenance Fee"
}

/**
 * Multi-region configuration. Adding a new country is ONE entry here —
 * the store, selector, formatters and calculators all read from it.
 */
export const REGIONS: Record<Region, RegionConfig> = {
  global: {
    name: "Global (Illustrative)",
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
    taxYear: "Current Year (Illustrative)",
    taxBrackets: [{ limit: Infinity, rate: 0.2 }],
    toolName: "Calculator",
    paymentLabel: "Payment",
    defaultSalesTaxRate: 0,
    salesTaxLabel: "Sales Tax",
    filingStatuses: [{ value: "single", label: "Single" }],
    payrollDeductions: [],
    isEstimate: true,
    estimateNote: "Global mode uses illustrative rates only — not based on any specific country's tax laws.",
    propertyTaxLabel: "Property Tax",
    insuranceLabel: "Insurance",
    hoaLabel: "HOA Fees",
    hasServiceCharge: false,
    serviceChargeLabel: "Service Charge",
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
    taxYear: "Federal 2024 (Single)",
    taxBrackets: [
      { limit: 11_600, rate: 0.1 },
      { limit: 47_150, rate: 0.12 },
      { limit: 100_525, rate: 0.22 },
      { limit: 191_950, rate: 0.24 },
      { limit: 243_725, rate: 0.32 },
      { limit: 609_350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
    defaultSalesTaxRate: 0.07,
    salesTaxLabel: "Sales Tax",
    filingStatuses: [
      { value: "single", label: "Single" },
      { value: "married_joint", label: "Married Filing Jointly" },
      { value: "married_separate", label: "Married Filing Separately" },
      { value: "head_household", label: "Head of Household" },
    ],
    payrollDeductions: [
      { key: "social_security", label: "Social Security", defaultRate: 0.062 },
      { key: "medicare", label: "Medicare", defaultRate: 0.0145 },
    ],
    isEstimate: false,
    propertyTaxLabel: "Property Tax",
    insuranceLabel: "Homeowners Insurance",
    hoaLabel: "HOA Fees",
    hasServiceCharge: false,
    serviceChargeLabel: "Service Charge",
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
    taxYear: "FY 2083/84 (Individual)",
    taxBrackets: [
      { limit: 500_000, rate: 0.01 },
      { limit: 700_000, rate: 0.1 },
      { limit: 1_000_000, rate: 0.2 },
      { limit: 2_000_000, rate: 0.3 },
      { limit: Infinity, rate: 0.36 },
    ],
    toolName: "EMI Calculator",
    paymentLabel: "Monthly EMI",
    defaultSalesTaxRate: 0.13,
    salesTaxLabel: "VAT",
    filingStatuses: [
      { value: "individual", label: "Individual" },
      { value: "couple", label: "Couple (Joint)" },
    ],
    payrollDeductions: [
      { key: "ssf_employee", label: "SSF (Employee)", defaultRate: 0.11 },
    ],
    isEstimate: false,
    propertyTaxLabel: "Property Tax",
    insuranceLabel: "Home Insurance",
    hoaLabel: "Maintenance Fee",
    hasServiceCharge: true,
    serviceChargeLabel: "Service Charge",
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
    taxYear: "New Regime FY 2024-25 (Estimate)",
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
    defaultSalesTaxRate: 0.18,
    salesTaxLabel: "GST",
    filingStatuses: [
      { value: "individual", label: "Individual" },
      { value: "huf", label: "HUF" },
    ],
    payrollDeductions: [
      { key: "pf", label: "Provident Fund (EPF)", defaultRate: 0.12 },
    ],
    isEstimate: true,
    estimateNote: "India brackets are simplified estimates under the new tax regime. Actual liability may vary with deductions and surcharges.",
    propertyTaxLabel: "Property Tax",
    insuranceLabel: "Home Insurance",
    hoaLabel: "Maintenance Charges",
    hasServiceCharge: true,
    serviceChargeLabel: "Society Maintenance",
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
    taxYear: "Tax Year 2024/25 (Estimate)",
    taxBrackets: [
      { limit: 12_570, rate: 0 },
      { limit: 50_270, rate: 0.2 },
      { limit: 125_140, rate: 0.4 },
      { limit: Infinity, rate: 0.45 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
    defaultSalesTaxRate: 0.2,
    salesTaxLabel: "VAT",
    filingStatuses: [
      { value: "single", label: "Single" },
      { value: "married", label: "Married/Civil Partnership" },
    ],
    payrollDeductions: [
      { key: "ni", label: "National Insurance (Class 1)", defaultRate: 0.08 },
    ],
    isEstimate: true,
    estimateNote: "UK brackets are simplified estimates. National Insurance and personal allowance tapering not fully modeled.",
    propertyTaxLabel: "Council Tax",
    insuranceLabel: "Buildings Insurance",
    hoaLabel: "Service Charge",
    hasServiceCharge: true,
    serviceChargeLabel: "Service Charge",
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
    taxYear: "Federal 2024 (Estimate)",
    taxBrackets: [
      { limit: 55_867, rate: 0.15 },
      { limit: 111_733, rate: 0.205 },
      { limit: 173_669, rate: 0.26 },
      { limit: 246_752, rate: 0.29 },
      { limit: Infinity, rate: 0.33 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
    defaultSalesTaxRate: 0.05,
    salesTaxLabel: "GST/HST",
    filingStatuses: [
      { value: "single", label: "Single" },
      { value: "married", label: "Married/Common-law" },
    ],
    payrollDeductions: [
      { key: "cpp", label: "CPP", defaultRate: 0.0595 },
      { key: "ei", label: "EI", defaultRate: 0.0166 },
    ],
    isEstimate: true,
    estimateNote: "Canada federal brackets only. Provincial taxes, CPP, and EI are separate and vary by province.",
    propertyTaxLabel: "Property Tax",
    insuranceLabel: "Home Insurance",
    hoaLabel: "Condo Fees",
    hasServiceCharge: false,
    serviceChargeLabel: "Service Charge",
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
    taxYear: "FY 2024-25 (Estimate)",
    taxBrackets: [
      { limit: 18_200, rate: 0 },
      { limit: 45_000, rate: 0.19 },
      { limit: 135_000, rate: 0.325 },
      { limit: 190_000, rate: 0.37 },
      { limit: Infinity, rate: 0.45 },
    ],
    toolName: "Loan Calculator",
    paymentLabel: "Monthly Payment",
    defaultSalesTaxRate: 0.1,
    salesTaxLabel: "GST",
    filingStatuses: [
      { value: "resident", label: "Resident" },
      { value: "foreign", label: "Foreign Resident" },
    ],
    payrollDeductions: [
      { key: "super", label: "Superannuation (SG)", defaultRate: 0.115 },
    ],
    isEstimate: true,
    estimateNote: "Australia brackets are simplified estimates. Medicare levy and offsets not included.",
    propertyTaxLabel: "Council Rates",
    insuranceLabel: "Home Insurance",
    hoaLabel: "Strata Fees",
    hasServiceCharge: false,
    serviceChargeLabel: "Service Charge",
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
