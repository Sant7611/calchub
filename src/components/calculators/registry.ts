import type { ComponentType } from "react";

import { LoanCalculator } from "./LoanCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { ROICalculator } from "./RoiCalculator";
import { EmiCalculator } from "./EmiCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { BudgetPlanner } from "./BudgetPlanner";
import { SalaryCalculator } from "./SalaryCalculator";
import { CurrencyConverter } from "./CurrencyConverter";
import { WorldClock } from "./WorldClock";
import { LengthConverter } from "./LengthConverter";
import { BmiCalculator } from "./BmiCalculator";
import { TemperatureConverter } from "./TemperatureConverter";
import { ScientificCalculatorResponsive } from "./ScientificCalculatorResponsive";
import {CompoundInterestCalculator} from "./CompoundInterestCalculator";
import {CalorieCalculator} from "./CalorieCalculator";
import {AgeCalculator} from "./AgeCalculator";
import {DateConverterCalculator} from "./DateConverter";
import {SipCalculator} from "./SipCalculator";
import {GradeCalculator} from "./GradeCalculator";
import {NepseShareCalculator} from "./NepseShareCalculator";
import { NepalLandAreaConverter } from "./NepalLandAreaConverter";

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
  "sip-calculator": SipCalculator,
  "share-calculator": NepseShareCalculator,

  // Health calculators
  "bmi-calculator": BmiCalculator,
  "calorie-calculator": CalorieCalculator, // Reusing tax as placeholder

  // Math calculators
  "percentage-calculator": BudgetPlanner, // Reusing budget as placeholder
  "scientific-calculator": ScientificCalculatorResponsive,
  "compound-interest-calculator": CompoundInterestCalculator, //  compound interest 
  "age-calculator": AgeCalculator,

  // Converters
  "length-converter": LengthConverter,
  "nepal-land-area-converter": NepalLandAreaConverter,
  "temperature-converter": TemperatureConverter,
  "currency-converter": CurrencyConverter,
  "nepali-date-converter": DateConverterCalculator, // Reusing date converter as placeholder
  
  // Business calculators
  "tax-calculator": TaxCalculator, // Reusing tax as placeholder
  "budget-planner": BudgetPlanner, // Reusing budget as placeholder
  "roi-calculator": ROICalculator, // Reusing ROI as placeholder
  
  //other calculators
  "grade-calculator": GradeCalculator, // Reusing grade as placeholder
  "world-clock": WorldClock,
};

/**
 * Returns the component for a slug, or null when it hasn't been built yet.
 * The page uses this to decide between rendering the calculator and the
 * "Coming Soon" placeholder card.
 */
export function getCalculatorComponent(slug: string): ComponentType | null {
  return calculatorRegistry[slug] ?? null;
}
