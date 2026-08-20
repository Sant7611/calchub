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
 * @param filingStatus - Filing status (currently uses same brackets for all statuses)
 * @returns Tax calculation result with breakdown
 */
export function calculateRegionalTax(
  income: number,
  region: Region,
  filingStatus: string = "individual"
): TaxCalculationResult {
  const config = getRegionConfig(region);
  
  // Calculate tax using progressive brackets
  let tax = 0;
  let prevLimit = 0;
  let marginalRate = 0;
  
  for (const bracket of config.taxBrackets) {
    if (income > prevLimit) {
      const taxableInBracket = Math.min(income, bracket.limit) - prevLimit;
      tax += taxableInBracket * bracket.rate;
      
      // Determine if income falls within this bracket
      if (income <= bracket.limit || bracket.limit === Infinity) {
        // Income falls within this bracket - this is the marginal rate
        marginalRate = bracket.rate;
        break;
      }
      // Income exceeds this bracket, continue to next bracket
      prevLimit = bracket.limit;
    } else {
      // Income doesn't exceed previous limit, we're done
      break;
    }
  }
  
  // Calculate mandatory payroll deductions
  let payrollDeductionsTotal = 0;
  const deductionDetails: { label: string; amount: number }[] = [];
  
  for (const ded of config.payrollDeductions) {
    if (ded.defaultRate) {
      const amount = income * ded.defaultRate;
      payrollDeductionsTotal += amount;
      deductionDetails.push({ label: ded.label, amount });
    }
  }
  
  const effectiveRate = income > 0 ? tax / income : 0;
  const taxableIncome = Math.max(0, income - payrollDeductionsTotal);
  
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
  
  return `${config.defaultTaxLabel}: ${result.tax.toFixed(2)} (${(result.effectiveRate * 100).toFixed(1)}% effective)`;
}
