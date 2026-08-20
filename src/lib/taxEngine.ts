import { Region, getRegionConfig } from "@/config/regions";

export interface TaxCalculationResult {
  tax: number;
  taxableIncome: number;
  effectiveRate: number;
  marginalRate: number;
  payrollDeductionsTotal: number;
  deductionDetails: { label: string; amount: number }[];
}

/**
 * Calculate regional income tax based on progressive tax brackets.
 * @param income - Annual gross income
 * @param region - Selected region code
 * @returns Tax calculation result with breakdown
 */
export function calculateRegionalTax(
  income: number,
  region: Region,
): TaxCalculationResult {
  const config = getRegionConfig(region);
  
  // Calculate tax using progressive brackets (cumulative slab method)
  let tax = 0;
  let remainingIncome = income;
  let marginalRate = 0;
  
  for (const bracket of config.tax.brackets) {
    if (remainingIncome <= 0) break;
    
    const bracketLimit = bracket.limit ?? Infinity;
    const taxableInBracket = Math.min(remainingIncome, bracketLimit);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
    marginalRate = bracket.rate;
  }
  
  // Calculate mandatory payroll deductions
  let payrollDeductionsTotal = 0;
  const deductionDetails: { label: string; amount: number }[] = [];
  
  if (config.tax.payrollDeductions) {
    for (const ded of config.tax.payrollDeductions) {
      const amount = income * ded.rate;
      payrollDeductionsTotal += amount;
      deductionDetails.push({ label: ded.name, amount });
    }
  }
  
  const effectiveRate = income > 0 ? tax / income : 0;
  const taxableIncome = Math.max(0, income);
  
  return {
    tax,
    taxableIncome,
    effectiveRate,
    marginalRate,
    payrollDeductionsTotal,
    deductionDetails,
  };
}

/**
 * Get formatted tax summary for display
 */
export function getTaxSummary(income: number, region: Region): string {
  const result = calculateRegionalTax(income, region);
  const config = getRegionConfig(region);
  
  return `${config.tax.system === "illustrative" ? "Illustrative Tax" : config.tax.taxYear}: ${result.tax.toFixed(2)} (${(result.effectiveRate * 100).toFixed(1)}% effective)`;
}
