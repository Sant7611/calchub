export type Region =
  | "global"
  | "usa"
  | "nepal"
  | "india"
  | "uk"
  | "canada"
  | "australia";

export interface TaxBracket {
  limit: number | null; // upper bound of the slab (null for the top slab)
  rate: number; // marginal rate, e.g., 0.36 === 36%
}

export interface PayrollDeduction {
  name: string;
  rate: number; // as decimal, e.g., 0.062 for 6.2%
  annualCap?: number; // optional annual cap
}

export interface RegionConfig {
  id: string;
  name: string;
  currency: {
    code: string;
    symbol: string;
    locale: string;
    decimals: number;
  };
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  work: {
    hoursPerWeek: number;
    hoursPerDay: number;
    weeksPerYear: number;
    payFrequencies: string[];
    defaultPayFrequency: string;
  };
  tax: {
    system: string;
    taxYear: string;
    brackets: TaxBracket[];
    standardDeduction?: number;
    payrollDeductions?: PayrollDeduction[];
  };
  consumptionTax: {
    label: string;
    defaultRate: number;
  };
  loan: {
    terminology: {
      propertyTax: string;
      insurance: string;
      hoaOrServiceCharge: string;
    };
  };
  isEstimate: boolean;
  estimateNote?: string;
  sourceUrl?: string;
  lastUpdated?: string;
}

/**
 * Multi-region configuration. Adding a new country is ONE entry here —
 * the store, selector, formatters and calculators all read from it.
 */
export const REGIONS: Record<Region, RegionConfig> = {
  global: {
    id: "global",
    name: "Global (Illustrative)",
    currency: {
      code: "USD",
      symbol: "$",
      locale: "en-US",
      decimals: 2,
    },
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "en-US",
    work: {
      hoursPerWeek: 40,
      hoursPerDay: 8,
      weeksPerYear: 52,
      payFrequencies: ["weekly", "biweekly", "semimonthly", "monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "illustrative",
      taxYear: "Current Year (Illustrative)",
      brackets: [{ limit: null, rate: 0.2 }],
    },
    consumptionTax: {
      label: "Sales Tax",
      defaultRate: 0,
    },
    loan: {
      terminology: {
        propertyTax: "Property Tax",
        insurance: "Insurance",
        hoaOrServiceCharge: "HOA Fees",
      },
    },
    isEstimate: true,
    estimateNote: "Global mode uses illustrative rates only — not based on any specific country's tax laws.",
  },
  usa: {
    id: "usa",
    name: "United States",
    currency: {
      code: "USD",
      symbol: "$",
      locale: "en-US",
      decimals: 2,
    },
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "en-US",
    work: {
      hoursPerWeek: 40,
      hoursPerDay: 8,
      weeksPerYear: 52,
      payFrequencies: ["weekly", "biweekly", "semimonthly", "monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "federal",
      taxYear: "Federal 2024 (Single)",
      brackets: [
        { limit: 11600, rate: 0.1 },
        { limit: 47150, rate: 0.12 },
        { limit: 100525, rate: 0.22 },
        { limit: 191950, rate: 0.24 },
        { limit: 243725, rate: 0.32 },
        { limit: 609350, rate: 0.35 },
        { limit: null, rate: 0.37 },
      ],
      standardDeduction: 14600,
      payrollDeductions: [
        { name: "Social Security", rate: 0.062, annualCap: 168600 },
        { name: "Medicare", rate: 0.0145 },
      ],
    },
    consumptionTax: {
      label: "Sales Tax",
      defaultRate: 0.07,
    },
    loan: {
      terminology: {
        propertyTax: "Property Tax",
        insurance: "Homeowners Insurance",
        hoaOrServiceCharge: "HOA Fees",
      },
    },
    isEstimate: false,
    sourceUrl: "https://www.irs.gov/taxtopics/tc503",
    lastUpdated: "2024-01-15",
  },
  nepal: {
    id: "nepal",
    name: "Nepal",
    currency: {
      code: "NPR",
      symbol: "Rs.",
      locale: "en-NP",
      decimals: 2,
    },
    timezone: "Asia/Kathmandu",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-IN",
    work: {
      hoursPerWeek: 48,
      hoursPerDay: 8,
      weeksPerYear: 52,
      payFrequencies: ["monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "progressive",
      taxYear: "FY 2083/84 (2026/27)",
      brackets: [
        { limit: 1000000, rate: 0.01 },
        { limit: 500000, rate: 0.1 },
        { limit: 1000000, rate: 0.2 },
        { limit: 1500000, rate: 0.27 },
        { limit: null, rate: 0.29 },
      ],
      payrollDeductions: [
        { name: "SSF (Employee)", rate: 0.11 },
      ],
    },
    consumptionTax: {
      label: "VAT",
      defaultRate: 0.13,
    },
    loan: {
      terminology: {
        propertyTax: "Property Tax",
        insurance: "Home Insurance",
        hoaOrServiceCharge: "Maintenance Fee",
      },
    },
    isEstimate: false,
    sourceUrl: "https://ird.gov.np/",
    lastUpdated: "2024-07-15",
    estimateNote: "Based on Finance Act 2083/84. SSF/approved-retirement-fund exceptions may apply.",
  },
  india: {
    id: "india",
    name: "India",
    currency: {
      code: "INR",
      symbol: "₹",
      locale: "en-IN",
      decimals: 2,
    },
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-IN",
    work: {
      hoursPerWeek: 48,
      hoursPerDay: 8,
      weeksPerYear: 52,
      payFrequencies: ["monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "new-regime",
      taxYear: "New Regime FY 2024-25",
      brackets: [
        { limit: 300000, rate: 0 },
        { limit: 400000, rate: 0.05 },
        { limit: 300000, rate: 0.1 },
        { limit: 200000, rate: 0.15 },
        { limit: 300000, rate: 0.2 },
        { limit: null, rate: 0.3 },
      ],
      standardDeduction: 75000,
      payrollDeductions: [
        { name: "Provident Fund (EPF)", rate: 0.12 },
      ],
    },
    consumptionTax: {
      label: "GST",
      defaultRate: 0.18,
    },
    loan: {
      terminology: {
        propertyTax: "Property Tax",
        insurance: "Home Insurance",
        hoaOrServiceCharge: "Society Maintenance",
      },
    },
    isEstimate: true,
    estimateNote: "India brackets are simplified estimates under the new tax regime. Actual liability may vary with deductions and surcharges.",
    sourceUrl: "https://www.incometax.gov.in/",
    lastUpdated: "2024-07-01",
  },
  uk: {
    id: "uk",
    name: "United Kingdom",
    currency: {
      code: "GBP",
      symbol: "£",
      locale: "en-GB",
      decimals: 2,
    },
    timezone: "Europe/London",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-GB",
    work: {
      hoursPerWeek: 40,
      hoursPerDay: 8,
      weeksPerYear: 52,
      payFrequencies: ["weekly", "biweekly", "monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "progressive",
      taxYear: "Tax Year 2024/25",
      brackets: [
        { limit: 12570, rate: 0 },
        { limit: 37700, rate: 0.2 },
        { limit: 74870, rate: 0.4 },
        { limit: null, rate: 0.45 },
      ],
      standardDeduction: 12570, // Personal Allowance
      payrollDeductions: [
        { name: "National Insurance (Class 1)", rate: 0.08 },
      ],
    },
    consumptionTax: {
      label: "VAT",
      defaultRate: 0.2,
    },
    loan: {
      terminology: {
        propertyTax: "Council Tax",
        insurance: "Buildings Insurance",
        hoaOrServiceCharge: "Service Charge",
      },
    },
    isEstimate: true,
    estimateNote: "UK brackets are simplified estimates. National Insurance and personal allowance tapering not fully modeled.",
    sourceUrl: "https://www.gov.uk/income-tax-rates",
    lastUpdated: "2024-04-06",
  },
  canada: {
    id: "canada",
    name: "Canada",
    currency: {
      code: "CAD",
      symbol: "$",
      locale: "en-CA",
      decimals: 2,
    },
    timezone: "America/Toronto",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-CA",
    work: {
      hoursPerWeek: 40,
      hoursPerDay: 8,
      weeksPerYear: 52,
      payFrequencies: ["weekly", "biweekly", "semimonthly", "monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "federal",
      taxYear: "Federal 2024",
      brackets: [
        { limit: 55867, rate: 0.15 },
        { limit: 55866, rate: 0.205 },
        { limit: 61936, rate: 0.26 },
        { limit: 73083, rate: 0.29 },
        { limit: null, rate: 0.33 },
      ],
      payrollDeductions: [
        { name: "CPP", rate: 0.0595 },
        { name: "EI", rate: 0.0166 },
      ],
    },
    consumptionTax: {
      label: "GST/HST",
      defaultRate: 0.05,
    },
    loan: {
      terminology: {
        propertyTax: "Property Tax",
        insurance: "Home Insurance",
        hoaOrServiceCharge: "Condo Fees",
      },
    },
    isEstimate: true,
    estimateNote: "Canada federal brackets only. Provincial taxes, CPP, and EI are separate and vary by province.",
    sourceUrl: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals-income-tax/tax-packages-general-information/federal-personal-income-tax-brackets.html",
    lastUpdated: "2024-01-01",
  },
  australia: {
    id: "australia",
    name: "Australia",
    currency: {
      code: "AUD",
      symbol: "$",
      locale: "en-AU",
      decimals: 2,
    },
    timezone: "Australia/Sydney",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-AU",
    work: {
      hoursPerWeek: 38,
      hoursPerDay: 7.6,
      weeksPerYear: 52,
      payFrequencies: ["weekly", "biweekly", "semimonthly", "monthly", "quarterly", "annually"],
      defaultPayFrequency: "monthly",
    },
    tax: {
      system: "progressive",
      taxYear: "FY 2024-25",
      brackets: [
        { limit: 18200, rate: 0 },
        { limit: 26800, rate: 0.19 },
        { limit: 90000, rate: 0.325 },
        { limit: 55000, rate: 0.37 },
        { limit: null, rate: 0.45 },
      ],
      payrollDeductions: [
        { name: "Superannuation (SG)", rate: 0.115 },
      ],
    },
    consumptionTax: {
      label: "GST",
      defaultRate: 0.1,
    },
    loan: {
      terminology: {
        propertyTax: "Council Rates",
        insurance: "Home Insurance",
        hoaOrServiceCharge: "Strata Fees",
      },
    },
    isEstimate: true,
    estimateNote: "Australia brackets are simplified estimates. Medicare levy and offsets not included.",
    sourceUrl: "https://www.ato.gov.au/rates/individual-income-tax-rates/",
    lastUpdated: "2024-07-01",
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
export function getAllRegions(): { value: Region; name: string }[] {
  return Object.entries(REGIONS).map(([key, config]) => ({
    value: key as Region,
    name: config.name,
  }));
}
