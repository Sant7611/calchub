import type { ComponentType } from "react";

import { LoanCalculator } from "./LoanCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RoiCalculator } from "./RoiCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { BudgetPlanner } from "./BudgetPlanner";
import { InvoiceCalculator } from "./InvoiceCalculator";
import { SalaryCalculator } from "./SalaryCalculator";
import { CurrencyConverter } from "./CurrencyConverter";
import { WorldClock } from "./WorldClock";

/** Maps a tool slug (from src/data/categories.ts) to the CLIENT component
 * that implements it. The dynamic [category]/[slug] page reads this record
 * at render time — no tool is ever hard-coded into a route file, so adding
 * a calculator is a one-line change here.
 * 
 * NOTE: Slugs must match exactly what's defined in categories.ts
 */
export const calculatorRegistry: Record<string, ComponentType> = {
  // Finance calculators
  "loan-calculator": LoanCalculator,
  "emi-calculator": LoanCalculator, // Same EMI/Loan calculator component
  "compound-interest-calculator": MortgageCalculator, // Reusing mortgage as placeholder
  "salary-calculator": SalaryCalculator,
  
  // Health calculators  
  "bmi-calculator": RoiCalculator, // Reusing ROI as placeholder
  "calorie-calculator": TaxCalculator, // Reusing tax as placeholder
  
  // Math calculators
  "percentage-calculator": BudgetPlanner, // Reusing budget as placeholder
  "fraction-simplifier": LoanCalculator, // Reusing loan as placeholder
  
  // Converters
  "length-converter": MortgageCalculator, // Reusing mortgage as placeholder
  "temperature-converter": RoiCalculator, // Reusing ROI as placeholder
  "currency-converter": CurrencyConverter,
  "world-clock": WorldClock,
  
  // Business calculators
  "profit-margin-calculator": TaxCalculator, // Reusing tax as placeholder
  "break-even-calculator": BudgetPlanner, // Reusing budget as placeholder
  "invoice-calculator": InvoiceCalculator,
};

/**
 * Returns the component for a slug, or null when it hasn't been built yet.
 * The page uses this to decide between rendering the calculator and the
 * "Coming Soon" placeholder card.
 */
export function getCalculatorComponent(slug: string): ComponentType | null {
  return calculatorRegistry[slug] ?? null;
}
