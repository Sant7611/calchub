import type {
  TaxBand,
  TaxProfileMeta,
  UsaFilingStatus,
  UkJurisdiction,
} from "../types";

import type { Region } from "@/config/regions";

/* ══════════════════════════════════════════════════════════
   VERSION
══════════════════════════════════════════════════════════ */

export const TAX_RULE_VERSION = "2026.08.20";

export const TAX_RULE_LAST_VERIFIED =
  "2026-08-20";

/**
 * Direct references used to verify the constants below.
 * Keep these beside the rule data so future rate updates are made in the
 * calculation source of truth rather than in the display-only region config.
 */
export const TAX_RULE_SOURCES = {
  usa: [
    "https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill",
    "https://www.ssa.gov/oact/cola/cbb.html",
  ],
  nepal: [
    "https://ird.gov.np/",
    "https://www.mof.gov.np/",
  ],
  india: [
    "https://www.indiabudget.gov.in/doc/memo.pdf",
    "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
  ],
  uk: [
    "https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past",
    "https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027",
  ],
  canada: [
    "https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html",
    "https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html",
  ],
  australia: [
    "https://www.ato.gov.au/law/view/pdf/acts/20250028.pdf",
    "https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee",
  ],
} as const;

/* ══════════════════════════════════════════════════════════
   USA — TAX YEAR 2026
══════════════════════════════════════════════════════════ */

export const USA_2026 = {
  taxYear: "Tax Year 2026",

  standardDeduction: {
    single: 16_100,
    married_joint: 32_200,
    married_separate: 16_100,
    head_household: 24_150,
  } satisfies Record<
    UsaFilingStatus,
    number
  >,

  brackets: {
    single: [
      { upTo: 12_400, rate: 0.10 },
      { upTo: 50_400, rate: 0.12 },
      { upTo: 105_700, rate: 0.22 },
      { upTo: 201_775, rate: 0.24 },
      { upTo: 256_225, rate: 0.32 },
      { upTo: 640_600, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],

    married_joint: [
      { upTo: 24_800, rate: 0.10 },
      { upTo: 100_800, rate: 0.12 },
      { upTo: 211_400, rate: 0.22 },
      { upTo: 403_550, rate: 0.24 },
      { upTo: 512_450, rate: 0.32 },
      { upTo: 768_700, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],

    married_separate: [
      { upTo: 12_400, rate: 0.10 },
      { upTo: 50_400, rate: 0.12 },
      { upTo: 105_700, rate: 0.22 },
      { upTo: 201_775, rate: 0.24 },
      { upTo: 256_225, rate: 0.32 },
      { upTo: 384_350, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],

    head_household: [
      { upTo: 17_700, rate: 0.10 },
      { upTo: 67_450, rate: 0.12 },
      { upTo: 105_700, rate: 0.22 },
      { upTo: 201_750, rate: 0.24 },
      { upTo: 256_200, rate: 0.32 },
      { upTo: 640_600, rate: 0.35 },
      { upTo: null, rate: 0.37 },
    ],
  } satisfies Record<
    UsaFilingStatus,
    TaxBand[]
  >,

  socialSecurity: {
    employeeRate: 0.062,
    wageBase: 184_500,
  },

  medicare: {
    employeeRate: 0.0145,

    additionalRate: 0.009,

    additionalThreshold: {
      single: 200_000,
      married_joint: 250_000,
      married_separate: 125_000,
      head_household: 200_000,
    } satisfies Record<
      UsaFilingStatus,
      number
    >,
  },
};

/* ══════════════════════════════════════════════════════════
   NEPAL — FY 2083/84 / 2026-27
══════════════════════════════════════════════════════════ */

export const NEPAL_2083_84 = {
  taxYear: "FY 2083/84 (2026/27)",

  /*
   * Finance Act 2083 unified the previous
   * single/couple schedules.
   *
   * First Rs. 1,000,000 → 1%
   * Next 500,000         → 10%
   * Next 1,000,000       → 20%
   * Next 1,500,000       → 27%
   * Balance              → 29%
   */

  brackets: [
    {
      upTo: 1_000_000,
      rate: 0.01,
    },

    {
      upTo: 1_500_000,
      rate: 0.10,
    },

    {
      upTo: 2_500_000,
      rate: 0.20,
    },

    {
      upTo: 4_000_000,
      rate: 0.27,
    },

    {
      upTo: null,
      rate: 0.29,
    },
  ] satisfies TaxBand[],
};

/* ══════════════════════════════════════════════════════════
   INDIA — FY 2026-27

   New regime.

   Budget 2026-27 did not change these slabs.
══════════════════════════════════════════════════════════ */

export const INDIA_2026_27 = {
  taxYear:
    "FY 2026-27 — New Tax Regime",

  standardDeduction: 75_000,

  brackets: [
    {
      upTo: 400_000,
      rate: 0,
    },

    {
      upTo: 800_000,
      rate: 0.05,
    },

    {
      upTo: 1_200_000,
      rate: 0.10,
    },

    {
      upTo: 1_600_000,
      rate: 0.15,
    },

    {
      upTo: 2_000_000,
      rate: 0.20,
    },

    {
      upTo: 2_400_000,
      rate: 0.25,
    },

    {
      upTo: null,
      rate: 0.30,
    },
  ] satisfies TaxBand[],

  rebate87A: {
    taxableIncomeLimit: 1_200_000,
    maxRebate: 60_000,
  },

  healthEducationCessRate: 0.04,

  /*
   * Surcharges above ₹50 lakh are not modeled
   * here because marginal relief and special-rate
   * income require more context than a salary
   * calculator currently collects.
   */
};

/* ══════════════════════════════════════════════════════════
   UNITED KINGDOM — 2026/27
══════════════════════════════════════════════════════════ */

export const UK_2026_27 = {
  taxYear: "Tax Year 2026/27",

  personalAllowance: {
    standard: 12_570,

    taperStartsAt: 100_000,

    zeroAt: 125_140,
  },

  brackets: {
    england_wales_ni: [
      {
        upTo: 37_700,
        rate: 0.20,
      },

      {
        upTo: 125_140,
        rate: 0.40,
      },

      {
        upTo: null,
        rate: 0.45,
      },
    ],

    scotland: [
      {
        upTo: 3_967,
        rate: 0.19,
      },

      {
        upTo: 16_956,
        rate: 0.20,
      },

      {
        upTo: 31_092,
        rate: 0.21,
      },

      {
        upTo: 62_430,
        rate: 0.42,
      },

      {
        upTo: 125_140,
        rate: 0.45,
      },

      {
        upTo: null,
        rate: 0.48,
      },
    ],
  } satisfies Record<
    UkJurisdiction,
    TaxBand[]
  >,

  employeeNationalInsurance: {
    primaryThreshold: 12_570,

    upperEarningsLimit: 50_270,

    mainRate: 0.08,

    upperRate: 0.02,
  },
};

/* ══════════════════════════════════════════════════════════
   CANADA — CALENDAR YEAR 2026
══════════════════════════════════════════════════════════ */

export const CANADA_2026 = {
  taxYear: "Tax Year 2026",

  /*
   * This implementation provides federal tax only.
   *
   * Provincial / territorial income tax must be
   * added separately for a complete Canadian result.
   */

  federalBrackets: [
    {
      upTo: 58_523,
      rate: 0.14,
    },

    {
      upTo: 117_045,
      rate: 0.205,
    },

    {
      upTo: 181_440,
      rate: 0.26,
    },

    {
      upTo: 258_482,
      rate: 0.29,
    },

    {
      upTo: null,
      rate: 0.33,
    },
  ] satisfies TaxBand[],

  basicPersonalAmount: {
    maximum: 16_452,
    minimum: 14_829,

    phaseOutStart: 181_440,
    phaseOutEnd: 258_482,
  },

  canadaEmploymentAmount: 1_501,

  /*
   * Federal non-refundable credit rate.
   *
   * Some 2026 Top-Up Tax Credit interactions are
   * intentionally not replicated by this lightweight
   * estimator.
   */
  federalCreditRate: 0.14,

  cpp: {
    basicExemption: 3_500,

    ympe: 74_600,

    employeeRate: 0.0595,

    maximumEmployeeContribution:
      4_230.45,

    /*
     * CPP2
     */
    yampe: 85_000,

    secondAdditionalRate: 0.04,

    maximumSecondAdditional:
      416,
  },

  ei: {
    maximumInsurableEarnings:
      68_900,

    employeeRate: 0.0163,

    maximumEmployeePremium:
      1_123.07,
  },
};

/* ══════════════════════════════════════════════════════════
   AUSTRALIA — FY 2026-27
══════════════════════════════════════════════════════════ */

export const AUSTRALIA_2026_27 = {
  taxYear: "FY 2026-27",

  residentBrackets: [
    {
      upTo: 18_200,
      rate: 0,
    },

    {
      upTo: 45_000,
      rate: 0.15,
    },

    {
      upTo: 135_000,
      rate: 0.30,
    },

    {
      upTo: 190_000,
      rate: 0.37,
    },

    {
      upTo: null,
      rate: 0.45,
    },
  ] satisfies TaxBand[],

  medicareLevy: {
    normalRate: 0.02,
  },

  /*
   * Employer contribution.
   *
   * DO NOT subtract from employee take-home pay.
   */
  superGuaranteeRate: 0.12,
};

/* ══════════════════════════════════════════════════════════
   GLOBAL
══════════════════════════════════════════════════════════ */

export const GLOBAL_2026 = {
  taxYear: "Illustrative",

  brackets: [
    {
      upTo: null,
      rate: 0.20,
    },
  ] satisfies TaxBand[],
};

/* ══════════════════════════════════════════════════════════
   METADATA

   Change/update this whenever rules are updated.
══════════════════════════════════════════════════════════ */

export const TAX_PROFILE_META: Record<
  Region,
  TaxProfileMeta
> = {
  global: {
    region: "global",

    taxYear: "Illustrative",

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "Illustrative global salary estimate.",

    sourceNames: [
      "Illustrative calculator assumptions",
    ],

    limitations: [
      "Not based on any country's tax system.",
    ],
  },

  usa: {
    region: "usa",

    taxYear: USA_2026.taxYear,

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "US federal income tax and employee FICA estimate for 2026.",

    sourceNames: [
      "IRS Revenue Procedure 2025-32 — tax year 2026 inflation adjustments",
      "Social Security Administration — 2026 contribution and benefit base",
    ],

    limitations: [
      "State and local income taxes are not included.",
      "Tax credits, itemized deductions and employer benefits are not modeled.",
      "Assumes wage income.",
    ],
  },

  nepal: {
    region: "nepal",

    taxYear:
      NEPAL_2083_84.taxYear,

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "Nepal resident natural-person salary tax estimate for FY 2083/84.",

    sourceNames: [
      "Nepal Inland Revenue Department",
      "Nepal Finance Act 2083 — Schedule 1 natural-person rates",
    ],

    limitations: [
      "Models resident employment income under the unified FY 2083/84 natural-person schedule.",
      "Special deductions and retirement-fund limits are not modeled.",
      "SSF contribution itself is not automatically deducted.",
    ],
  },

  india: {
    region: "india",

    taxYear:
      INDIA_2026_27.taxYear,

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "India salaried-person estimate under the default new tax regime.",

    sourceNames: [
      "Income Tax Department of India",
      "Union Budget 2026-27 explanatory memorandum — new-regime rates",
    ],

    limitations: [
      "Models ordinary salary income under the default new tax regime for FY 2026-27.",
      "Old tax regime is not modeled.",
      "Surcharge and surcharge marginal relief above high-income thresholds are not modeled.",
      "Special-rate income such as capital gains is excluded.",
    ],
  },

  uk: {
    region: "uk",

    taxYear:
      UK_2026_27.taxYear,

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "UK employee income tax and Class 1 National Insurance estimate.",

    sourceNames: [
      "HMRC — 2026/27 Income Tax rates and allowances",
      "HMRC — 2026/27 Class 1 National Insurance thresholds",
    ],

    limitations: [
      "Uses standard employee National Insurance category A.",
      "Tax codes, benefits and student loan deductions are not modeled.",
    ],
  },

  canada: {
    region: "canada",

    taxYear:
      CANADA_2026.taxYear,

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "Canada federal income tax plus CPP and EI estimate.",

    sourceNames: [
      "Canada Revenue Agency — 2026 federal tax brackets",
      "Canada Revenue Agency — 2026 payroll deduction formulas",
    ],

    limitations: [
      "Provincial and territorial income taxes are not included yet.",
      "Quebec uses separate QPP/QPIP rules and is not modeled.",
      "Some federal credit interactions are simplified.",
    ],
  },

  australia: {
    region: "australia",

    taxYear:
      AUSTRALIA_2026_27.taxYear,

    verifiedOn:
      TAX_RULE_LAST_VERIFIED,

    description:
      "Australian resident individual income-tax estimate for FY 2026-27.",

    sourceNames: [
      "Australian Taxation Office",
      "Treasury Laws Amendment (More Cost of Living Relief) Act 2025",
    ],

    limitations: [
      "Medicare low-income reductions and exemptions are not fully modeled.",
      "Medicare Levy Surcharge is not included.",
      "Offsets and deductions are not included.",
      "Super Guarantee is employer-paid and is not subtracted from employee take-home pay.",
    ],
  },
};
