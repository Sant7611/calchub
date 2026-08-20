import type { LucideIcon } from "lucide-react";
import {
  Apple,
  ArrowLeftRight,
  Briefcase,
  Divide,
  Gauge,
  LineChart,
  Percent,
  PiggyBank,
  Ruler,
  Sigma,
  Store,
  Thermometer,
  TrendingUp,
  Wallet,
  HeartPulse,
} from "lucide-react";

/**
 * Central, data-driven registry for every calculator on the site.
 * Pages in Phase 2+ map over this array — no tool is ever hardcoded
 * into JSX. Slugs become routes: /tools/[slug], /categories/[slug].
 */

export interface Tool {
  /** Display name, e.g. "Loan Calculator" */
  name: string;
  /** URL segment, e.g. "loan-calculator" → /tools/loan-calculator */
  slug: string;
  /** One-line pitch used on cards and in meta descriptions */
  description: string;
  /** Lucide icon component rendered on cards, lists and breadcrumbs */
  icon: LucideIcon;
  /** Flag to mark this tool as popular for homepage showcase */
  popular?: boolean;
}

export interface Category {
  name: string;
  slug: string;
  icon: LucideIcon;
  tools: Tool[];
}

export const categories: Category[] = [
  {
    name: "Finance",
    slug: "finance",
    icon: Wallet,
    tools: [
      {
        name: "Loan Calculator",
        slug: "loan-calculator",
        description: "Monthly payment, total interest and full amortization for any loan.",
        icon: PiggyBank,
      },
      {
        name: "Compound Interest",
        slug: "compound-interest-calculator",
        description: "Project how an investment grows with recurring contributions.",
        icon: TrendingUp,
      },
    ],
  },
  {
    name: "Health",
    slug: "health",
    icon: HeartPulse,
    tools: [
      {
        name: "BMI Calculator",
        slug: "bmi-calculator",
        description: "Body mass index with WHO category and healthy weight range.",
        icon: Gauge,
      },
      {
        name: "Calorie Calculator",
        slug: "calorie-calculator",
        description: "Daily energy needs via Mifflin-St Jeor, tuned to your goal.",
        icon: Apple,
      },
    ],
  },
  {
    name: "Math",
    slug: "math",
    icon: Sigma,
    tools: [
      {
        name: "Percentage Calculator",
        slug: "percentage-calculator",
        description: "Percent of, percent change and increase/decrease in one tap.",
        icon: Percent,
      },
      {
        name: "Fraction Simplifier",
        slug: "fraction-simplifier",
        description: "Reduce fractions and convert between mixed and improper form.",
        icon: Divide,
      },
    ],
  },
  {
    name: "Converters",
    slug: "converters",
    icon: ArrowLeftRight,
    tools: [
      {
        name: "Length Converter",
        slug: "length-converter",
        description: "Millimetres to miles — 15 length units, instant conversion.",
        icon: Ruler,
      },
      {
        name: "Temperature Converter",
        slug: "temperature-converter",
        description: "Celsius, Fahrenheit and Kelvin with the formulas shown.",
        icon: Thermometer,
      },
    ],
  },
  {
    name: "Business",
    slug: "business",
    icon: Briefcase,
    tools: [
      {
        name: "Profit Margin Calculator",
        slug: "profit-margin-calculator",
        description: "Gross, operating and net margin from revenue and costs.",
        icon: LineChart,
      },
      {
        name: "Break-Even Calculator",
        slug: "break-even-calculator",
        description: "Units and revenue needed to cover fixed and variable costs.",
        icon: Store,
      },
    ],
  },
];

/** Flattened list — powers the /tools page and sitemap in Phase 2. */
export const allTools: Tool[] = categories.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool })),
);
