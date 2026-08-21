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
        description: "Calculate monthly loan payments, total interest and a full amortization schedule.",
        icon: PiggyBank,
      },
      {
        name: "Tax Calculator",
        slug: "tax-calculator",
        description: "Estimate income tax, payroll deductions and take-home pay for Nepal, USA, India, UK, Canada and Australia.",
        icon: Wallet,
      },
      {
        name:"Salary Calculator",
        slug: "salary-calculator",
        description: "Calculate gross salary and take-home pay from hourly wages, pay frequency, taxes and deductions.",
        icon: TrendingUp,
      },
      {
        name: "EMI Calculator",
        slug: "emi-calculator",
        description: "Calculate EMI, total interest and repayment cost for home, car, personal and other loans.",
        icon: PiggyBank,
      },
      {
        name: "Mortgage Calculator",
        slug: "mortgage-calculator",
        description: "Estimate monthly mortgage payments, property tax, insurance, fees, total interest and home cost.",
        icon: PiggyBank,
      },
      {
        name: "Budget Planner",
        slug: "budget-planner",
        description: "Plan monthly income with the 50/30/20 rule for needs, wants and savings.",
        icon: Store,
      },
      {
        name: "SIP Calculator",
        slug: "sip-calculator",
        description: "Estimate SIP investment growth, future value and returns with flexible contribution frequency and annual step-up.",
        icon: TrendingUp,
      },
      {
        name:"Share Calculator",
        slug: "share-calculator",
        description: "Calculate NEPSE buy/sell costs, brokerage, SEBON fees, CGT and share investment profit or loss.",
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
        description: "Calculate average grades, weighted grades, final exam requirements and GPA.",
        icon: TrendingUp,
      },
      {
        name: "World Clock",
        slug: "world-clock",
        description: "Compare current time across Kathmandu, Delhi, London, New York, Toronto, Sydney and more.",
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
        description: "Calculate BMI, WHO weight category and healthy weight range using metric or imperial units.",
        icon: Gauge,
      },
      {
        name: "Calorie Calculator",
        slug: "calorie-calculator",
        description: "Estimate BMR, TDEE and daily calorie needs for weight loss, maintenance or weight gain.",
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
        description: "Perform trigonometry, logarithms, powers, complex numbers, statistics, matrices and advanced calculations.",
        icon: Calculator,
      },
      {
        name: "Compound Interest Calculator",
        slug: "compound-interest-calculator",
        description: "Calculate compound interest, future value and recurring contributions across multiple compounding frequencies.",
        icon: TrendingUp,
      },
      {
        name: "Age Calculator",
        slug: "age-calculator",
        description: "Calculate exact age in years, months and days plus the time until your next birthday.",
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
        description: "Convert millimeters, centimeters, meters, kilometers, inches, feet, yards and miles instantly.",
        icon: Ruler,
      },
      {
        name: "Temperature Converter",
        slug: "temperature-converter",
        description: "Convert Celsius, Fahrenheit and Kelvin using standard temperature conversion formulas.",
        icon: Thermometer,
      },
      {
        name: "Currency Converter",
        slug: "currency-converter",
        description: "Convert NPR, INR, USD and other currencies using exchange rates with source and timestamp.",
        icon: Coins,
      },
      
      {
        name: "Nepali Date Converter",
        slug: "nepali-date-converter",
        description: "Convert AD to BS, BS to AD and calculate differences between Nepali and Gregorian dates.",
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
        description: "Calculate ROI, net profit, investment multiple and annualized return from total investment and return.",
        icon: TrendingUp,
      }
      
    ],
  },
];

/** Flattened list — powers the /tools page and sitemap in Phase 2. */
export const allTools: Tool[] = categories.flatMap((category) =>
  category.tools.map((tool) => ({ ...tool })),
);
