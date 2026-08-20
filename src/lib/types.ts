import type { Region } from "@/config/regions";

/* ──────────────────────────────────────────────────────────
   Generic marginal tax band

   `upTo` is an absolute upper threshold.

   Example:
   {
     upTo: 50_000,
     rate: 0.20
   }
────────────────────────────────────────────────────────── */

export interface TaxBand {
  upTo: number | null;
  rate: number;
}

/* ──────────────────────────────────────────────────────────
   Region-specific calculator options
────────────────────────────────────────────────────────── */

export type UsaFilingStatus =
  | "single"
  | "married_joint"
  | "married_separate"
  | "head_household";

export type UkJurisdiction =
  | "england_wales_ni"
  | "scotland";

export interface TaxContext {
  usaFilingStatus?: UsaFilingStatus;

  ukJurisdiction?: UkJurisdiction;

  /**
   * Nepal's first-band 1% social security tax
   * may not apply to qualifying SSF/pension-fund contributors.
   *
   * This does NOT automatically deduct SSF contributions.
   */
  nepalSSFContributor?: boolean;

  /**
   * Australian Medicare levy.
   *
   * Defaults to true for resident salary estimates.
   */
  australiaIncludeMedicare?: boolean;
}

/* ──────────────────────────────────────────────────────────
   Breakdown
────────────────────────────────────────────────────────── */

export interface TaxDeductionDetail {
  label: string;
  amount: number;

  type:
    | "income-tax"
    | "payroll"
    | "levy"
    | "credit";
}

/* ──────────────────────────────────────────────────────────
   Tax-profile metadata
────────────────────────────────────────────────────────── */

export interface TaxProfileMeta {
  region: Region;

  taxYear: string;

  description: string;

  verifiedOn: string;

  sourceNames: string[];

  limitations: string[];
}

/* ──────────────────────────────────────────────────────────
   Final calculation result
────────────────────────────────────────────────────────── */

export interface RegionalTaxResult {
  grossIncome: number;

  taxableIncome: number;

  /**
   * Income tax only.
   *
   * Does not include payroll/social contributions.
   */
  tax: number;

  incomeTax: number;

  /**
   * Employee-side payroll deductions such as:
   *
   * USA Social Security + Medicare
   * UK National Insurance
   * Canada CPP + EI
   */
  payrollDeductionsTotal: number;

  deductionDetails: TaxDeductionDetail[];

  totalGovernmentDeductions: number;

  estimatedTakeHome: number;

  effectiveTaxRate: number;

  meta: TaxProfileMeta;

  notes: string[];
}