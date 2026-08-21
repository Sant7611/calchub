import type { Metadata } from "next";

/**
 * SEO + educational content registry for calculator pages.
 *
 * This data is rendered server-side by the dynamic calculator page.
 *
 * Each authored calculator should have:
 * - unique SEO title
 * - unique meta description
 * - useful intro copy
 * - clear how-to steps
 * - transparent formula/methodology
 * - genuinely useful FAQs
 *
 * Avoid generic claims such as "100% accurate" or
 * "the same result professionals use" unless they are verifiably true.
 */

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

export interface Faq {
  question: string;
  answer: string;
}

export interface FormulaInfo {
  title: string;
  explanation: string;
}

export interface CalculatorSeo {
  /**
   * Keep focused on the primary search intent.
   *
   * If your root layout uses:
   *
   * title: {
   *   template: "%s | OnCalculator"
   * }
   *
   * do NOT add "| OnCalculator" here.
   */
  title: string;

  /**
   * Natural SERP description.
   * Usually aim for roughly 140–160 characters,
   * but usefulness matters more than an exact length.
   */
  description: string;
}

export interface CalculatorContent {
  slug: string;

  seo: CalculatorSeo;

  /**
   * Main visible content immediately below the H1/calculator header.
   *
   * First paragraph should explain exactly what the calculator does.
   */
  intro: string[];

  /**
   * Numbered user instructions.
   */
  howToUse: string[];

  /**
   * Transparent formula / calculation methodology.
   */
  formula: FormulaInfo;

  /**
   * Visible FAQ content.
   *
   * Keep these because they answer long-tail searches and help users.
   * Do not rely on FAQ rich results for Google SEO.
   */
  faqs: Faq[];
}

/* ──────────────────────────────────────────────────────────
   Loan Calculator
────────────────────────────────────────────────────────── */

const loanCalculator: CalculatorContent = {
  slug: "loan-calculator",

  seo: {
    title:
      "Loan Calculator – Monthly Payment & Total Interest",

    description:
      "Calculate monthly loan payments, total interest and total repayment cost using loan amount, interest rate and repayment term.",
  },

  intro: [
    "Use this loan calculator to estimate your monthly loan payment, total interest and total repayment amount before borrowing. Enter the loan amount, annual interest rate and repayment term to see how much the loan may cost over time.",

    "It is useful for comparing personal loans, auto loans, student loans and other fixed-payment loans. Try different interest rates or repayment terms to see how even a small change can affect both the monthly payment and the total interest paid.",
  ],

  howToUse: [
    "Enter the loan amount, also called the principal.",
    "Enter the annual interest rate as a percentage, such as 6.5 for 6.5%.",
    "Choose or enter the repayment term.",
    "Review the estimated monthly payment, total interest and total repayment.",
    "Change the interest rate or loan term to compare different borrowing scenarios.",
  ],

  formula: {
    title:
      "Loan Payment Formula",

    explanation:
      "For a fixed-rate amortizing loan, the monthly payment is calculated as M = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1]. P is the loan principal, r is the monthly interest rate, and n is the total number of monthly payments. Each payment contains both interest and principal, while the interest portion generally decreases as the outstanding balance falls.",
  },

  faqs: [
    {
      question:
        "How is the monthly loan payment calculated?",

      answer:
        "The monthly payment is based on the amount borrowed, the interest rate and the number of payments. For a fixed-rate amortizing loan, the calculator distributes principal and interest across the repayment period using the standard amortization formula.",
    },

    {
      question:
        "Why does a longer loan term reduce the monthly payment?",

      answer:
        "A longer term spreads repayment over more months, so each payment is usually smaller. However, the outstanding balance remains unpaid for longer, which can increase the total interest paid.",
    },

    {
      question:
        "Does the loan calculator include lender fees?",

      answer:
        "Not unless the calculator provides a separate field for them. Origination fees, insurance, taxes, late charges and other lender-specific costs may increase the real cost of borrowing.",
    },

    {
      question:
        "What happens if the interest rate is lower?",

      answer:
        "A lower interest rate generally reduces both the monthly payment and the total interest cost when the loan amount and repayment term remain the same.",
    },

    {
      question:
        "Can I use this calculator to compare loan offers?",

      answer:
        "Yes. Enter the amount, rate and term from each offer and compare the monthly payment and total interest. Also review fees and conditions provided by each lender before making a decision.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   EMI Calculator
────────────────────────────────────────────────────────── */

const emiCalculator: CalculatorContent = {
  slug: "emi-calculator",

  seo: {
    title:
      "EMI Calculator – Calculate Monthly Loan EMI & Interest",

    description:
      "Calculate monthly EMI, total interest and total loan repayment for home, car and personal loans using amount, interest rate and tenure.",
  },

  intro: [
    "Use the EMI Calculator to estimate the Equated Monthly Installment for a home loan, car loan, personal loan or other reducing-balance loan. Enter the principal, annual interest rate and loan tenure to calculate the estimated monthly EMI.",

    "The calculator also shows how much interest may be paid over the full loan term and the total amount repaid. Comparing several combinations of loan amount, interest rate and tenure can help you understand whether a loan fits your monthly budget.",
  ],

  howToUse: [
    "Select your region to use the appropriate currency and regional formatting.",
    "Enter the total loan amount or principal.",
    "Enter the annual loan interest rate.",
    "Set the repayment tenure in years or months.",
    "Review the monthly EMI, total interest and total repayment amount.",
    "Adjust the interest rate or tenure to compare alternative loan scenarios.",
  ],

  formula: {
    title:
      "EMI Formula – Reducing Balance Method",

    explanation:
      "EMI = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1]. P represents the loan principal, r is the monthly interest rate calculated from the annual rate, and n is the total number of monthly installments. With a reducing-balance loan, interest is calculated on the remaining principal, so the interest component generally falls as the loan is repaid.",
  },

  faqs: [
    {
      question:
        "What does EMI mean?",

      answer:
        "EMI stands for Equated Monthly Installment. It is the scheduled amount paid each month toward a loan and normally contains both principal repayment and interest.",
    },

    {
      question:
        "How is EMI calculated?",

      answer:
        "EMI is calculated from the loan principal, monthly interest rate and total number of installments. The reducing-balance formula calculates interest on the outstanding loan balance rather than the original principal every month.",
    },

    {
      question:
        "Does a longer loan tenure reduce EMI?",

      answer:
        "Usually yes. Extending the repayment period spreads the loan across more installments and lowers the monthly EMI. However, it can increase the total interest paid over the full loan period.",
    },

    {
      question:
        "How can I reduce my monthly EMI?",

      answer:
        "You may reduce EMI by borrowing less, making a larger down payment, securing a lower interest rate or extending the loan tenure. Extending the tenure can reduce the monthly payment but may increase overall interest.",
    },

    {
      question:
        "Is the EMI calculator useful for Nepal and India?",

      answer:
        "Yes. The mathematical EMI formula is not currency-specific. Regional settings can be used to display results in currencies such as Nepalese Rupees or Indian Rupees while the underlying calculation remains the same.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Currency Converter
────────────────────────────────────────────────────────── */

const currencyConverter: CalculatorContent = {
  slug: "currency-converter",

  seo: {
    title:
      "Currency Converter – Convert NPR, INR, USD & More",

    description:
      "Convert NPR, INR, USD, EUR, GBP, CAD, AUD and other currencies. Check exchange rates, converted amounts and rate update information.",
  },

  intro: [
    "Use the Currency Converter to convert money between Nepalese Rupee (NPR), Indian Rupee (INR), US Dollar (USD), Euro (EUR), British Pound (GBP), Canadian Dollar (CAD), Australian Dollar (AUD) and other supported currencies.",

    "Enter an amount, choose the currency you are converting from and select the destination currency. The calculator displays the converted value together with the exchange rate and available rate-update information.",
  ],

  howToUse: [
    "Enter the amount you want to convert.",
    "Select the currency you currently have.",
    "Choose the currency you want to convert the amount into.",
    "Review the converted amount and exchange rate.",
    "Check the displayed rate source or update time before using the result for an important financial decision.",
  ],

  formula: {
    title:
      "Currency Conversion Formula",

    explanation:
      "A currency conversion multiplies the source amount by the exchange rate between the source and destination currencies. When rates are stored relative to a common base currency, the converter first derives the cross-rate and then applies it to the amount being converted.",
  },

  faqs: [
    {
      question:
        "How does a currency converter work?",

      answer:
        "A currency converter applies an exchange rate between two currencies to the amount entered. If direct rates are unavailable, a cross-rate can be calculated using a common base currency.",
    },

    {
      question:
        "Are currency converter rates the same as bank rates?",

      answer:
        "Not necessarily. Banks, card providers, remittance companies and money changers can add spreads, commissions or transaction fees, so the amount you actually receive may differ from an indicative market conversion.",
    },

    {
      question:
        "Can I convert Nepalese Rupees to US Dollars?",

      answer:
        "Yes. Select NPR as the source currency and USD as the destination currency, then enter the Nepalese Rupee amount you want to convert.",
    },

    {
      question:
        "Why can exchange rates change during the day?",

      answer:
        "Many currencies trade continuously in global foreign-exchange markets. Supply, demand, interest rates, economic data, central-bank policy and market events can cause exchange rates to change.",
    },

    {
      question:
        "Should I use the converted amount for an actual transaction?",

      answer:
        "Use it as an estimate unless the displayed rate is specifically guaranteed by your financial provider. Always check the final exchange rate and fees offered by the bank, card provider, exchange service or remittance company handling the transaction.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   World Clock
────────────────────────────────────────────────────────── */

const worldClock: CalculatorContent = {
  slug: "world-clock",

  seo: {
    title:
      "World Clock – Current Time & Time Zone Comparison",

    description:
      "Check current time around the world and compare time zones, local dates and UTC offsets for Kathmandu, Delhi, London, New York and more.",
  },

  intro: [
    "Use the World Clock to check the current local time in cities around the world and compare multiple time zones at once. View current times, dates and UTC offsets for locations such as Kathmandu, Delhi, London, New York, Toronto and Sydney.",

    "Time-zone calculations use standard IANA time-zone identifiers, allowing locations that observe Daylight Saving Time to adjust according to their applicable regional rules.",
  ],

  howToUse: [
    "View the default local time based on your selected region.",
    "Select the cities or time zones you want to compare.",
    "Compare the current local time and date for each location.",
    "Check the UTC offset to understand the time difference between locations.",
    "Reset the selection when you want to return to your regional default.",
  ],

  formula: {
    title:
      "How World Time Zone Conversion Works",

    explanation:
      "The world clock converts the same moment into different local times using IANA time-zone identifiers such as Asia/Kathmandu, Asia/Kolkata and America/New_York. The browser's internationalization APIs apply the relevant UTC offset and available daylight-saving rules for each time zone.",
  },

  faqs: [
    {
      question:
        "What is a world clock?",

      answer:
        "A world clock shows the current local time in multiple places around the world. It is useful for international calls, remote work, travel planning and comparing time differences between countries.",
    },

    {
      question:
        "What is a UTC offset?",

      answer:
        "A UTC offset shows how far a local time zone is ahead of or behind Coordinated Universal Time. Nepal Standard Time, for example, uses UTC+05:45.",
    },

    {
      question:
        "What time zone does Nepal use?",

      answer:
        "Nepal uses Nepal Standard Time, represented by the IANA time zone Asia/Kathmandu. Its standard UTC offset is UTC+05:45.",
    },

    {
      question:
        "Does the world clock account for Daylight Saving Time?",

      answer:
        "Where supported by the selected IANA time zone and browser data, daylight-saving changes are applied automatically for locations that observe them.",
    },

    {
      question:
        "Why can the time difference between two cities change during the year?",

      answer:
        "Some countries change their clocks for Daylight Saving Time while others do not. This can cause the difference between two cities to change by an hour during part of the year.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Registry
────────────────────────────────────────────────────────── */

/**
 * Authored calculator content keyed by slug.
 *
 * IMPORTANT:
 * For strong calculator SEO, add an authored entry for every important
 * calculator rather than relying permanently on the fallback.
 */
const contentBySlug: Record<
  string,
  CalculatorContent
> = {
  "loan-calculator":
    loanCalculator,

  "emi-calculator":
    emiCalculator,

  "currency-converter":
    currencyConverter,

  "world-clock":
    worldClock,
};

/* ──────────────────────────────────────────────────────────
   Content getter
────────────────────────────────────────────────────────── */

/**
 * Returns authored content when available.
 *
 * The fallback intentionally avoids making unsupported claims about:
 * - formulas
 * - accuracy
 * - privacy
 * - professional usage
 * - data storage
 *
 * Important calculators should eventually receive custom authored content.
 */
export function getCalculatorContent(
  slug: string,
  toolName: string
): CalculatorContent {
  const authored =
    contentBySlug[slug];

  if (authored) {
    return authored;
  }

  return {
    slug,

    seo: {
      title: `${toolName} – Free Online Calculator`,

      description:
        `Use the ${toolName} online to calculate results quickly from the values you enter. Review the result and compare different input scenarios.`,
    },

    intro: [
      `Use the ${toolName} to calculate a result from the values you enter. The calculator is designed to make the calculation quick and easy to understand.`,

      `Change the input values to compare different scenarios and review the result together with any supporting information shown by the calculator.`,
    ],

    howToUse: [
      `Open the ${toolName} and review the available input fields.`,

      "Enter the values required for the calculation.",

      "Review the calculated result and any supporting breakdown.",

      "Change one or more values to compare another scenario.",
    ],

    formula: {
      title:
        `How the ${toolName} Calculates the Result`,

      explanation:
        `The ${toolName} uses the values entered in the calculator to produce the displayed result. Refer to the calculator fields and result breakdown for the variables included in the calculation.`,
    },

    faqs: [
      {
        question:
          `What is the ${toolName}?`,

        answer:
          `The ${toolName} is an online tool that calculates a result from the information you enter and presents it in an easy-to-read format.`,
      },

      {
        question:
          `How do I use the ${toolName}?`,

        answer:
          `Enter the requested values in the calculator fields and review the result. You can change the inputs to compare different scenarios.`,
      },

      {
        question:
          `Can I use the ${toolName} for important decisions?`,

        answer:
          `The calculator can be useful for estimates and comparisons. For medical, legal, tax, investment or other high-stakes decisions, verify the result using appropriate official or professional guidance.`,
      },
    ],
  };
}

/* ──────────────────────────────────────────────────────────
   Next.js Metadata Helper
────────────────────────────────────────────────────────── */

/**
 * Use from your dynamic server page.
 *
 * Example:
 *
 * const content = getCalculatorContent(
 *   tool.slug,
 *   tool.name
 * );
 *
 * return getCalculatorMetadata(
 *   content,
 *   `/tools/${category}/${slug}`
 * );
 *
 * Set metadataBase in your root layout:
 *
 * metadataBase: new URL("https://oncalculator.app")
 */
export function getCalculatorMetadata(
  content: CalculatorContent,
  canonicalPath?: string
): Metadata {
  const {
    title,
    description,
  } = content.seo;

  return {
    title,

    description,

    ...(canonicalPath
      ? {
          alternates: {
            canonical:
              canonicalPath,
          },
        }
      : {}),

    openGraph: {
      title,
      description,
      type: "website",
      siteName:
        "OnCalculator",
        ...(canonicalPath
    ? {
        url: canonicalPath,
      }
    : {}),
    },

    twitter: {
      card:
        "summary_large_image",

      title,

      description,
    },
  };
}