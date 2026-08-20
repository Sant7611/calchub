// import { Region, getRegionConfig } from "@/config/regions";

// export interface TaxCalculationResult {
//   tax: number;
//   taxableIncome: number;
//   effectiveRate: number;
//   marginalRate: number;
//   payrollDeductionsTotal: number;
//   deductionDetails: { label: string; amount: number }[];
// }

// /**
//  * Calculate regional income tax based on progressive tax brackets.
//  * @param income - Annual gross income
//  * @param region - Selected region code
//  * @returns Tax calculation result with breakdown
//  */
// export function calculateRegionalTax(
//   income: number,
//   region: Region,
// ): TaxCalculationResult {
//   const config = getRegionConfig(region);
  
//   // Calculate tax using progressive brackets (cumulative slab method)
//   let tax = 0;
//   let remainingIncome = income;
//   let marginalRate = 0;
  
//   for (const bracket of config.tax.brackets) {
//     if (remainingIncome <= 0) break;
    
//     const bracketLimit = bracket.limit ?? Infinity;
//     const taxableInBracket = Math.min(remainingIncome, bracketLimit);
//     tax += taxableInBracket * bracket.rate;
//     remainingIncome -= taxableInBracket;
//     marginalRate = bracket.rate;
//   }
  
//   // Calculate mandatory payroll deductions
//   let payrollDeductionsTotal = 0;
//   const deductionDetails: { label: string; amount: number }[] = [];
  
//   if (config.tax.payrollDeductions) {
//     for (const ded of config.tax.payrollDeductions) {
//       const amount = income * ded.rate;
//       payrollDeductionsTotal += amount;
//       deductionDetails.push({ label: ded.name, amount });
//     }
//   }
  
//   const effectiveRate = income > 0 ? tax / income : 0;
//   const taxableIncome = Math.max(0, income);
  
//   return {
//     tax,
//     taxableIncome,
//     effectiveRate,
//     marginalRate,
//     payrollDeductionsTotal,
//     deductionDetails,
//   };
// }

// /**
//  * Get formatted tax summary for display
//  */
// export function getTaxSummary(income: number, region: Region): string {
//   const result = calculateRegionalTax(income, region);
//   const config = getRegionConfig(region);
  
//   return `${config.tax.system === "illustrative" ? "Illustrative Tax" : config.tax.taxYear}: ${result.tax.toFixed(2)} (${(result.effectiveRate * 100).toFixed(1)}% effective)`;
// }
import type { Region } from "@/config/regions";

import type {
  RegionalTaxResult,
  TaxBand,
  TaxContext,
  TaxDeductionDetail,
  UsaFilingStatus,
  UkJurisdiction,
} from "./types";

import {
  AUSTRALIA_2026_27,
  CANADA_2026,
  GLOBAL_2026,
  INDIA_2026_27,
  NEPAL_2083_84,
  TAX_PROFILE_META,
  UK_2026_27,
  USA_2026,
} from "./rules";

/* ══════════════════════════════════════════════════════════
   Generic marginal tax calculator
══════════════════════════════════════════════════════════ */

export function calculateMarginalTax(
  income: number,
  bands: TaxBand[]
): number {
  if (
    !Number.isFinite(income) ||
    income <= 0
  ) {
    return 0;
  }

  let tax = 0;
  let previousLimit = 0;

  for (const band of bands) {
    const upperLimit =
      band.upTo ??
      Number.POSITIVE_INFINITY;

    if (income <= previousLimit) {
      break;
    }

    const taxableInBand =
      Math.min(
        income,
        upperLimit
      ) - previousLimit;

    if (taxableInBand > 0) {
      tax +=
        taxableInBand *
        band.rate;
    }

    previousLimit =
      upperLimit;
  }

  return Math.max(0, tax);
}

/* ══════════════════════════════════════════════════════════
   USA
══════════════════════════════════════════════════════════ */

function calculateUsaTax(
  grossIncome: number,
  context: TaxContext
): RegionalTaxResult {
  const filingStatus: UsaFilingStatus =
    context.usaFilingStatus ??
    "single";

  const standardDeduction =
    USA_2026.standardDeduction[
      filingStatus
    ];

  const taxableIncome =
    Math.max(
      0,
      grossIncome -
        standardDeduction
    );

  const incomeTax =
    calculateMarginalTax(
      taxableIncome,
      USA_2026.brackets[
        filingStatus
      ]
    );

  /* ── Social Security ──────────────────────────────── */

  const socialSecurity =
    Math.min(
      grossIncome,
      USA_2026
        .socialSecurity.wageBase
    ) *
    USA_2026
      .socialSecurity
      .employeeRate;

  /* ── Medicare ─────────────────────────────────────── */

  const medicare =
    grossIncome *
    USA_2026
      .medicare
      .employeeRate;

  const additionalThreshold =
    USA_2026
      .medicare
      .additionalThreshold[
        filingStatus
      ];

  const additionalMedicare =
    Math.max(
      0,
      grossIncome -
        additionalThreshold
    ) *
    USA_2026
      .medicare
      .additionalRate;

  const payrollDeductionsTotal =
    socialSecurity +
    medicare +
    additionalMedicare;

  const deductionDetails: TaxDeductionDetail[] =
    [
      {
        label:
          "Federal income tax",
        amount: incomeTax,
        type: "income-tax",
      },

      {
        label:
          "Social Security",
        amount:
          socialSecurity,
        type: "payroll",
      },

      {
        label: "Medicare",
        amount: medicare,
        type: "payroll",
      },
    ];

  if (
    additionalMedicare > 0
  ) {
    deductionDetails.push({
      label:
        "Additional Medicare Tax",
      amount:
        additionalMedicare,
      type: "payroll",
    });
  }

  return buildResult({
    region: "usa",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal,

    deductionDetails,

    notes: [
      `Filing status: ${formatUsFilingStatus(
        filingStatus
      )}.`,
      "State and local income taxes are not included.",
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   NEPAL
══════════════════════════════════════════════════════════ */

function calculateNepalTax(
  grossIncome: number,
  context: TaxContext
): RegionalTaxResult {
  /*
   * Copy brackets because SSF contributors may
   * qualify for exemption from the first-band 1%.
   */

  const brackets: TaxBand[] =
    NEPAL_2083_84.brackets.map(
      (band) => ({
        ...band,
      })
    );

  if (
    context.nepalSSFContributor
  ) {
    brackets[0] = {
      ...brackets[0],
      rate: 0,
    };
  }

  const taxableIncome =
    Math.max(
      0,
      grossIncome
    );

  const incomeTax =
    calculateMarginalTax(
      taxableIncome,
      brackets
    );

  const deductionDetails: TaxDeductionDetail[] =
    [
      {
        label:
          context.nepalSSFContributor
            ? "Income tax (SSF first-band relief applied)"
            : "Income tax / social security tax",
        amount: incomeTax,
        type: "income-tax",
      },
    ];

  return buildResult({
    region: "nepal",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal: 0,

    deductionDetails,

    notes: [
      "Finance Act 2083 uses a unified natural-person tax schedule.",
      context.nepalSSFContributor
        ? "The first-band 1% social security tax has been removed in this estimate."
        : "The first Rs. 1,000,000 is calculated at 1%.",
      "Actual SSF employee contribution is not deducted because it depends on contribution-eligible/basic salary.",
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   INDIA
══════════════════════════════════════════════════════════ */

function calculateIndiaTax(
  grossIncome: number
): RegionalTaxResult {
  const taxableIncome =
    Math.max(
      0,
      grossIncome -
        INDIA_2026_27
          .standardDeduction
    );

  const slabTax =
    calculateMarginalTax(
      taxableIncome,
      INDIA_2026_27.brackets
    );

  let afterRebate = slabTax;

  const rebate =
    INDIA_2026_27.rebate87A;

  if (
    taxableIncome <=
    rebate.taxableIncomeLimit
  ) {
    afterRebate = Math.max(
      0,
      slabTax -
        Math.min(
          slabTax,
          rebate.maxRebate
        )
    );
  } else {
    /*
     * Basic Section 87A marginal-relief
     * treatment immediately above ₹12 lakh.
     *
     * Tax should not exceed the amount by
     * which taxable income exceeds the
     * rebate threshold where marginal relief
     * applies.
     */

    const excess =
      taxableIncome -
      rebate.taxableIncomeLimit;

    if (
      slabTax > excess &&
      excess > 0
    ) {
      afterRebate = Math.min(
        slabTax,
        excess
      );
    }
  }

  const cess =
    afterRebate *
    INDIA_2026_27
      .healthEducationCessRate;

  const incomeTax =
    afterRebate + cess;

  const deductionDetails: TaxDeductionDetail[] =
    [
      {
        label:
          "Income tax after rebate",
        amount: afterRebate,
        type: "income-tax",
      },

      {
        label:
          "Health & Education Cess",
        amount: cess,
        type: "levy",
      },
    ];

  return buildResult({
    region: "india",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal: 0,

    deductionDetails,

    notes: [
      `₹${INDIA_2026_27.standardDeduction.toLocaleString(
        "en-IN"
      )} salaried standard deduction applied.`,
      "Default new tax regime used.",
      "High-income surcharge rules are not modeled.",
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   UK
══════════════════════════════════════════════════════════ */

function calculateUkTax(
  grossIncome: number,
  context: TaxContext
): RegionalTaxResult {
  const jurisdiction: UkJurisdiction =
    context.ukJurisdiction ??
    "england_wales_ni";

  /* ── Personal allowance taper ─────────────────────── */

  let personalAllowance =
    UK_2026_27
      .personalAllowance
      .standard;

  if (
    grossIncome >
    UK_2026_27
      .personalAllowance
      .taperStartsAt
  ) {
    const excess =
      grossIncome -
      UK_2026_27
        .personalAllowance
        .taperStartsAt;

    personalAllowance =
      Math.max(
        0,
        personalAllowance -
          excess / 2
      );
  }

  const taxableIncome =
    Math.max(
      0,
      grossIncome -
        personalAllowance
    );

  const incomeTax =
    calculateMarginalTax(
      taxableIncome,
      UK_2026_27.brackets[
        jurisdiction
      ]
    );

  /* ── Employee Class 1 NI ─────────────────────────── */

  const ni =
    UK_2026_27
      .employeeNationalInsurance;

  const mainBand =
    Math.max(
      0,
      Math.min(
        grossIncome,
        ni.upperEarningsLimit
      ) -
        ni.primaryThreshold
    );

  const upperBand =
    Math.max(
      0,
      grossIncome -
        ni.upperEarningsLimit
    );

  const nationalInsurance =
    mainBand *
      ni.mainRate +
    upperBand *
      ni.upperRate;

  const deductionDetails: TaxDeductionDetail[] =
    [
      {
        label:
          "Income Tax",
        amount: incomeTax,
        type: "income-tax",
      },

      {
        label:
          "Employee National Insurance",
        amount:
          nationalInsurance,
        type: "payroll",
      },
    ];

  return buildResult({
    region: "uk",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal:
      nationalInsurance,

    deductionDetails,

    notes: [
      jurisdiction ===
      "scotland"
        ? "Scottish income-tax bands applied."
        : "England, Wales and Northern Ireland income-tax bands applied.",
      `Personal Allowance used: £${personalAllowance.toFixed(
        0
      )}.`,
      "Class 1 employee NI category A assumed.",
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   CANADA
══════════════════════════════════════════════════════════ */

function calculateCanadaTax(
  grossIncome: number
): RegionalTaxResult {
  const taxableIncome =
    Math.max(
      0,
      grossIncome
    );

  /* ── Federal gross tax ────────────────────────────── */

  const grossFederalTax =
    calculateMarginalTax(
      taxableIncome,
      CANADA_2026
        .federalBrackets
    );

  /* ── Basic Personal Amount ────────────────────────── */

  const bpaConfig =
    CANADA_2026
      .basicPersonalAmount;

  let basicPersonalAmount =
    bpaConfig.maximum;

  if (
    grossIncome >
      bpaConfig.phaseOutStart &&
    grossIncome <
      bpaConfig.phaseOutEnd
  ) {
    const range =
      bpaConfig.phaseOutEnd -
      bpaConfig.phaseOutStart;

    const reduction =
      ((grossIncome -
        bpaConfig.phaseOutStart) /
        range) *
      (bpaConfig.maximum -
        bpaConfig.minimum);

    basicPersonalAmount =
      bpaConfig.maximum -
      reduction;
  } else if (
    grossIncome >=
    bpaConfig.phaseOutEnd
  ) {
    basicPersonalAmount =
      bpaConfig.minimum;
  }

  /* ── Canada Employment Amount ─────────────────────── */

  const employmentAmount =
    Math.min(
      grossIncome,
      CANADA_2026
        .canadaEmploymentAmount
    );

  const federalCredits =
    (
      basicPersonalAmount +
      employmentAmount
    ) *
    CANADA_2026
      .federalCreditRate;

  const incomeTax =
    Math.max(
      0,
      grossFederalTax -
        federalCredits
    );

  /* ── CPP ──────────────────────────────────────────── */

  const cppConfig =
    CANADA_2026.cpp;

  const cppBase =
    Math.min(
      Math.max(
        0,
        grossIncome -
          cppConfig.basicExemption
      ),
      cppConfig.ympe -
        cppConfig.basicExemption
    );

  const cpp =
    Math.min(
      cppBase *
        cppConfig.employeeRate,
      cppConfig
        .maximumEmployeeContribution
    );

  /* CPP2 */

  const cpp2Base =
    Math.max(
      0,
      Math.min(
        grossIncome,
        cppConfig.yampe
      ) -
        cppConfig.ympe
    );

  const cpp2 =
    Math.min(
      cpp2Base *
        cppConfig.secondAdditionalRate,
      cppConfig
        .maximumSecondAdditional
    );

  /* ── EI ───────────────────────────────────────────── */

  const eiConfig =
    CANADA_2026.ei;

  const ei =
    Math.min(
      Math.min(
        grossIncome,
        eiConfig
          .maximumInsurableEarnings
      ) *
        eiConfig.employeeRate,

      eiConfig
        .maximumEmployeePremium
    );

  const payrollDeductionsTotal =
    cpp + cpp2 + ei;

  const deductionDetails: TaxDeductionDetail[] =
    [
      {
        label:
          "Federal income tax",
        amount: incomeTax,
        type: "income-tax",
      },

      {
        label: "CPP",
        amount: cpp,
        type: "payroll",
      },
    ];

  if (cpp2 > 0) {
    deductionDetails.push({
      label: "CPP2",
      amount: cpp2,
      type: "payroll",
    });
  }

  deductionDetails.push({
    label:
      "Employment Insurance",
    amount: ei,
    type: "payroll",
  });

  return buildResult({
    region: "canada",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal,

    deductionDetails,

    notes: [
      "Federal income tax only.",
      "CPP and EI 2026 employee contributions are included.",
      "Provincial or territorial income tax is NOT included, so Canadian take-home pay will be higher than a complete payroll calculation.",
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   AUSTRALIA
══════════════════════════════════════════════════════════ */

function calculateAustraliaTax(
  grossIncome: number,
  context: TaxContext
): RegionalTaxResult {
  const taxableIncome =
    Math.max(
      0,
      grossIncome
    );

  const incomeTaxBeforeMedicare =
    calculateMarginalTax(
      taxableIncome,
      AUSTRALIA_2026_27
        .residentBrackets
    );

  const includeMedicare =
    context.australiaIncludeMedicare ??
    true;

  /*
   * Normal Medicare levy is 2%.
   *
   * Low-income reductions/exemptions need
   * family/dependant information, so this
   * calculator deliberately does not pretend
   * to calculate those.
   */

  const medicareLevy =
    includeMedicare
      ? taxableIncome *
        AUSTRALIA_2026_27
          .medicareLevy
          .normalRate
      : 0;

  const incomeTax =
    incomeTaxBeforeMedicare +
    medicareLevy;

  const deductionDetails: TaxDeductionDetail[] =
    [
      {
        label:
          "Income tax",
        amount:
          incomeTaxBeforeMedicare,
        type: "income-tax",
      },
    ];

  if (includeMedicare) {
    deductionDetails.push({
      label:
        "Medicare levy (standard 2%)",
      amount:
        medicareLevy,
      type: "levy",
    });
  }

  return buildResult({
    region: "australia",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal: 0,

    deductionDetails,

    notes: [
      "Australian resident tax rates used.",
      includeMedicare
        ? "Standard 2% Medicare levy included. Low-income reductions/exemptions are not modeled."
        : "Medicare levy excluded by user selection.",
      `Employer Super Guarantee is currently ${
        AUSTRALIA_2026_27
          .superGuaranteeRate *
        100
      }% and is not deducted from take-home pay.`,
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   GLOBAL
══════════════════════════════════════════════════════════ */

function calculateGlobalTax(
  grossIncome: number
): RegionalTaxResult {
  const taxableIncome =
    Math.max(
      0,
      grossIncome
    );

  const incomeTax =
    calculateMarginalTax(
      taxableIncome,
      GLOBAL_2026.brackets
    );

  return buildResult({
    region: "global",

    grossIncome,

    taxableIncome,

    incomeTax,

    payrollDeductionsTotal: 0,

    deductionDetails: [
      {
        label:
          "Illustrative tax",
        amount: incomeTax,
        type: "income-tax",
      },
    ],

    notes: [
      "Global mode is illustrative only.",
    ],
  });
}

/* ══════════════════════════════════════════════════════════
   PUBLIC API
══════════════════════════════════════════════════════════ */

export function calculateRegionalTax(
  grossIncome: number,
  region: Region,
  context: TaxContext = {}
): RegionalTaxResult {
  const safeGross =
    Number.isFinite(grossIncome)
      ? Math.max(
          0,
          grossIncome
        )
      : 0;

  switch (region) {
    case "usa":
      return calculateUsaTax(
        safeGross,
        context
      );

    case "nepal":
      return calculateNepalTax(
        safeGross,
        context
      );

    case "india":
      return calculateIndiaTax(
        safeGross
      );

    case "uk":
      return calculateUkTax(
        safeGross,
        context
      );

    case "canada":
      return calculateCanadaTax(
        safeGross
      );

    case "australia":
      return calculateAustraliaTax(
        safeGross,
        context
      );

    case "global":
    default:
      return calculateGlobalTax(
        safeGross
      );
  }
}

/* ══════════════════════════════════════════════════════════
   RESULT BUILDER
══════════════════════════════════════════════════════════ */

function buildResult({
  region,
  grossIncome,
  taxableIncome,
  incomeTax,
  payrollDeductionsTotal,
  deductionDetails,
  notes,
}: {
  region: Region;

  grossIncome: number;

  taxableIncome: number;

  incomeTax: number;

  payrollDeductionsTotal: number;

  deductionDetails: TaxDeductionDetail[];

  notes: string[];
}): RegionalTaxResult {
  const totalGovernmentDeductions =
    incomeTax +
    payrollDeductionsTotal;

  const estimatedTakeHome =
    Math.max(
      0,
      grossIncome -
        totalGovernmentDeductions
    );

  return {
    grossIncome,

    taxableIncome,

    tax: incomeTax,

    incomeTax,

    payrollDeductionsTotal,

    deductionDetails,

    totalGovernmentDeductions,

    estimatedTakeHome,

    effectiveTaxRate:
      grossIncome > 0
        ? (totalGovernmentDeductions /
            grossIncome) *
          100
        : 0,

    meta:
      TAX_PROFILE_META[
        region
      ],

    notes,
  };
}

/* ══════════════════════════════════════════════════════════
   LABEL HELPERS
══════════════════════════════════════════════════════════ */

function formatUsFilingStatus(
  status: UsaFilingStatus
) {
  switch (status) {
    case "married_joint":
      return "Married Filing Jointly";

    case "married_separate":
      return "Married Filing Separately";

    case "head_household":
      return "Head of Household";

    default:
      return "Single";
  }
}