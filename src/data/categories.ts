import type { LucideIcon } from "lucide-react";
import {
  Apple,
  ArrowLeftRight,
  Briefcase,
  Clock,
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
  Coins,
  Calculator,
  Calendar,
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
        name: "Tax Calculator",
        slug: "tax-calculator",
        description: "Estimate 2026 US federal income tax, Social Security, Medicare, effective tax rate and after-tax income.",
        icon: Wallet,
      },
      {
        name:"Salary Calculator",
        slug: "salary-calculator",
        description: "Calculate take-home pay after taxes, deductions and benefits.",
        icon: TrendingUp,
      },
      {
        name: "EMI Calculator",
        slug: "emi-calculator",
        description: "Calculate Equated Monthly Installment (EMI) for home, car and personal loans.",
        icon: PiggyBank,
      },
      {
        name: "Mortgage Calculator",
        slug: "mortgage-calculator",
        description: "Calculate monthly mortgage payments and total interest over the life of the loan.",
        icon: PiggyBank,
      },
      {
        name: "Budget Planner",
        slug: "budget-planner",
        description: "Units and revenue needed to cover fixed and variable costs.",
        icon: Store,
      },
      {
        name: "SIP Calculator",
        slug: "sip-calculator",
        description: "Calculate the future value of a Systematic Investment Plan (SIP) with compound interest.",
        icon: TrendingUp,
      },
      {
        name:"Share Calculator",
        slug: "share-calculator",
        description: "Calculate the profit/loss of your share investment based on buy/sell price and quantity.",
        icon: Coins,
      },
    ],
  },
  {
    name: "Others",
    slug: "others",
    icon: Divide,
    tools: [
      {
        name: "Grade Calculator",
        slug: "grade-calculator",
        description: "Calculate your grade point average (GPA) based on your course grades.",
        icon: TrendingUp,
      },
      {
        name: "World Clock",
        slug: "world-clock",
        description: "Compare times across Kathmandu, Delhi, London, New York, Toronto, Sydney and more.",
        icon: Clock,
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
        name: "Scientific Calculator",
        slug: "scientific-calculator",
        description: "Advanced calculations with trigonometric, logarithmic and exponential functions.",
        icon: Calculator,
      },
      {
        name: "Compound Interest Calculator",
        slug: "compound-interest-calculator",
        description: "Calculate compound interest, future value and total interest earned.",
        icon: TrendingUp,
      },
      {
        name: "Age Calculator",
        slug: "age-calculator",
        description: "Calculate your age in years, months and days from your date of birth.",
        icon: LineChart,
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
      {
        name: "Currency Converter",
        slug: "currency-converter",
        description: "Real-time exchange rates with NPR, INR and major currencies. Shows rate timestamp and source.",
        icon: Coins,
      },
      
      {
        name: "Nepali Date Converter",
        slug: "nepali-date-converter",
        description: "Convert between AD and BS dates with a simple and intuitive interface.",
        icon: Calendar,
      },
    ],
  },
  {
    name: "Business",
    slug: "business",
    icon: Briefcase,
    tools: [
      
      {
        name: "ROI Calculator",
        slug: "roi-calculator",
        description: "Return on investment (ROI) and payback period from costs and revenue.",
        icon: TrendingUp,
      }
      
    ],
  },
];

/** Flattened list — powers the /tools page and sitemap in Phase 2. */
export const allTools: Tool[] = categories.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool })),
);
