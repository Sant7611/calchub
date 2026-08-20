import type { ComponentType } from "react";

import { LoanCalculator } from "./LoanCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RoiCalculator } from "./RoiCalculator";
import { EmiCalculator } from "./EmiCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { BudgetPlanner } from "./BudgetPlanner";
import { InvoiceCalculator } from "./InvoiceCalculator";
import { SalaryCalculator } from "./SalaryCalculator";
import { CurrencyConverter } from "./CurrencyConverter";
import { WorldClock } from "./WorldClock";
import { LengthConverter } from "./LengthConverter";
import { BmiCalculator } from "./BmiCalculator";
import { TemperatureConverter } from "./TemperatureConverter";
import { ScientificCalculator } from "./ScientificCalculator";

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
  "emi-calculator": EmiCalculator, // Same EMI/Loan calculator component
  "mortgage-calculator": MortgageCalculator, // Reusing mortgage as placeholder
  "salary-calculator": SalaryCalculator,

  // Health calculators
  "bmi-calculator": BmiCalculator,
  "calorie-calculator": TaxCalculator, // Reusing tax as placeholder

  // Math calculators
  "percentage-calculator": BudgetPlanner, // Reusing budget as placeholder
  "fraction-simplifier": LoanCalculator, // Reusing loan as placeholder
  "scientific-calculator": ScientificCalculator, // Reusing scientific as placeholder

  // Converters
  "length-converter": LengthConverter,
  "temperature-converter": TemperatureConverter,
  "currency-converter": CurrencyConverter,
  "world-clock": WorldClock,

  // Business calculators
  // "profit-margin-calculator": TaxCalculator, // Reusing tax as placeholder
  "tax-calculator": TaxCalculator, // Reusing tax as placeholder
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
