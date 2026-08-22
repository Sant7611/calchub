export interface GuideLink {
  title: string;
  description: string;
  href: string;
}

export interface SourceReference {
  name: string;
  description: string;
  href: string;
}

export interface CalculatorInternalLinkConfig {
  guides?: GuideLink[];
  relatedTools?: string[];
  sources?: SourceReference[];
}

/**
 * Editorial internal-link graph for calculator pages.
 *
 * Keep this deliberately curated instead of linking every calculator to every
 * other calculator. The goal is to connect pages that genuinely help the same
 * user intent and to connect calculators with their strongest supporting guide.
 */
const INTERNAL_LINKS: Record<string, CalculatorInternalLinkConfig> = {
  "loan-calculator": {
    guides: [
      {
        title: "How to Calculate EMI for a Car Loan in Nepal",
        description:
          "See the EMI formula, a worked NPR example and the inputs that affect vehicle-loan repayment.",
        href: "/blog/emi-car-loan-nepal",
      },
    ],
    relatedTools: ["emi-calculator", "mortgage-calculator", "budget-planner"],
  },
  "tax-calculator": {
    guides: [
      {
        title: "How Income Tax Works in Nepal: FY 2083/84",
        description:
          "Understand Nepal's progressive tax slabs, taxable income and a worked salary example.",
        href: "/blog/income-tax-nepal-2083-84",
      },
    ],
    relatedTools: ["salary-calculator", "budget-planner", "loan-calculator"],
  },
  "salary-calculator": {
    guides: [
      {
        title: "How Income Tax Works in Nepal: FY 2083/84",
        description:
          "Learn how progressive tax bands affect take-home salary and effective tax rate in Nepal.",
        href: "/blog/income-tax-nepal-2083-84",
      },
    ],
    relatedTools: ["tax-calculator", "budget-planner", "loan-calculator"],
  },
  "emi-calculator": {
    guides: [
      {
        title: "How to Calculate EMI for a Car Loan in Nepal",
        description:
          "Learn how principal, interest rate and tenure combine to determine a reducing-balance EMI.",
        href: "/blog/emi-car-loan-nepal",
      },
    ],
    relatedTools: ["loan-calculator", "mortgage-calculator", "budget-planner"],
  },
  "mortgage-calculator": {
    relatedTools: ["loan-calculator", "emi-calculator", "budget-planner"],
  },
  "budget-planner": {
    guides: [
      {
        title: "How to Plan a Monthly Budget",
        description:
          "Build a practical monthly budget and use the 50/30/20 guideline as a flexible starting point.",
        href: "/blog/how-to-plan-a-budget",
      },
    ],
    relatedTools: ["salary-calculator", "sip-calculator", "loan-calculator"],
  },
  "sip-calculator": {
    guides: [
      {
        title: "What Is SIP? How SIP Investing Works",
        description:
          "Understand recurring investing, compounding, Step-Up SIP and future-value calculations.",
        href: "/blog/what-is-sip",
      },
    ],
    relatedTools: ["compound-interest-calculator", "roi-calculator", "budget-planner"],
  },
  "share-calculator": {
    relatedTools: ["roi-calculator", "sip-calculator", "compound-interest-calculator"],
  },
  "grade-calculator": {
    relatedTools: ["percentage-calculator", "scientific-calculator"],
  },
  "world-clock": {
    relatedTools: ["nepali-date-converter", "age-calculator"],
  },
  "bmi-calculator": {
    guides: [
      {
        title: "What Is BMI and How Is It Calculated?",
        description:
          "Learn the BMI formula, common categories, a worked example and the important limits of BMI.",
        href: "/blog/what-is-bmi",
      },
    ],
    relatedTools: ["calorie-calculator"],
  },
  "calorie-calculator": {
    guides: [
      {
        title: "Calories in Food and Health: A Simple Guide",
        description:
          "Learn what calories measure, how energy needs are estimated and how intake relates to body weight.",
        href: "/blog/calories-in-food-and-health",
      },
    ],
    relatedTools: ["bmi-calculator"],
  },
  "percentage-calculator": {
    guides: [
      {
        title: "How to Calculate Percentage Increase",
        description:
          "Use the percentage-increase formula with practical salary, rent and price-change examples.",
        href: "/blog/percentage-increase",
      },
    ],
    relatedTools: ["grade-calculator", "roi-calculator", "scientific-calculator"],
  },
  "scientific-calculator": {
    relatedTools: ["percentage-calculator", "compound-interest-calculator", "grade-calculator"],
  },
  "compound-interest-calculator": {
    relatedTools: ["sip-calculator", "roi-calculator", "loan-calculator"],
  },
  "age-calculator": {
    relatedTools: ["nepali-date-converter", "world-clock"],
  },
  "length-converter": {
    relatedTools: ["nepal-land-area-converter", "temperature-converter"],
  },
  "temperature-converter": {
    relatedTools: ["length-converter"],
  },
  "currency-converter": {
    relatedTools: ["share-calculator", "roi-calculator"],
  },
  "nepali-date-converter": {
    relatedTools: ["age-calculator", "world-clock", "nepal-land-area-converter"],
  },
  "nepal-land-area-converter": {
    guides: [
      {
        title: "Nepal Land Area Conversion Guide",
        description:
          "Learn Ropani, Aana, Paisa, Daam, Bigha, Kattha and Dhur with formulas, tables and practical examples.",
        href: "/blog/nepal-land-area-conversion-guide",
      },
    ],
    relatedTools: ["length-converter", "nepali-date-converter"],
    sources: [
      {
        name: "Department of Land Management and Archive, Government of Nepal",
        description:
          "Official Nepal government land valuation publication containing customary land-area conversion relationships.",
        href: "https://www.dolma.gov.np/uploads/files/Department/MinimumLandEvaluation/7879/MLV%20mugu.pdf",
      },
      {
        name: "Department of Survey, Government of Nepal",
        description:
          "Official Land (Measurement) Rules, 2058 and cadastral surveying guidance.",
        href: "https://dos.gov.np/content/34/land--measure-check--rules--2058/",
      },
    ],
  },
  "roi-calculator": {
    relatedTools: ["sip-calculator", "share-calculator", "compound-interest-calculator"],
  },
};

export function getCalculatorInternalLinks(
  toolSlug: string,
): CalculatorInternalLinkConfig {
  return INTERNAL_LINKS[toolSlug] ?? {};
}
