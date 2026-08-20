import type { ComponentType } from "react";

import { LoanCalculator } from "./LoanCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RoiCalculator } from "./RoiCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { BudgetPlanner } from "./BudgetPlanner";

/**
 * Maps a tool slug (from src/data/categories.ts) to the CLIENT component
 * that implements it. The dynamic [category]/[slug] page reads this record
 * at render time — no tool is ever hard-coded into a route file, so adding
 * a calculator is a one-line change here.
 */
export const calculatorRegistry: Record<string, ComponentType> = {
  "loan-calculator": LoanCalculator,
  "mortgage-calculator": MortgageCalculator,
  "roi-calculator": RoiCalculator,
  "tax-calculator": TaxCalculator,
  "budget-planner": BudgetPlanner,
};

/**
 * Returns the component for a slug, or null when it hasn't been built yet.
 * The page uses this to decide between rendering the calculator and the
 * "Coming Soon" placeholder card.
 */
export function getCalculatorComponent(slug: string): ComponentType | null {
  return calculatorRegistry[slug] ?? null;
}
