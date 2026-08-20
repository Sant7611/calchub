/**
 * SEO content registry for every calculator.
 *
 * Pure data — no React. The dynamic `[category]/[slug]` page reads it
 * server-side to render intro copy, how-to steps, the formula block and
 * the FAQ (which is also emitted as FAQPage JSON-LD).
 *
 * Authored content wins; anything not yet written falls back to a
 * sensible generic block generated from the tool's display name.
 */

export interface Faq {
  question: string;
  answer: string;
}

export interface FormulaInfo {
  title: string;
  explanation: string;
}

export interface CalculatorContent {
  slug: string;
  /** 1–2 paragraphs shown under the H1 */
  intro: string[];
  /** Numbered "How to use" steps */
  howToUse: string[];
  /** Formula title + plain-English explanation */
  formula: FormulaInfo;
  /** Rendered as <details> and FAQPage JSON-LD */
  faqs: Faq[];
}

const loanCalculator: CalculatorContent = {
  slug: "loan-calculator",
  intro: [
    "A loan calculator tells you exactly what a loan costs before you sign anything. Enter the amount you want to borrow, the annual interest rate and the repayment term, and it works out your fixed monthly payment, the total interest you'll pay, and the true all-in cost of the loan.",
    "Because it uses the standard amortization formula, the result matches what a bank or lender would quote for a fully-amortized, fixed-rate loan — auto loans, personal loans, student loans and small business loans included.",
  ],
  howToUse: [
    "Enter the principal — the amount you plan to borrow.",
    "Enter the annual interest rate (APR) as a percentage, e.g. 6.5 for 6.5%.",
    "Enter the repayment term in years (or months, depending on the field).",
    "Read your monthly payment, then compare total interest across different terms — a longer term lowers the payment but usually raises the total cost.",
  ],
  formula: {
    title: "The amortization (equal-installment) formula",
    explanation:
      "Monthly payment M = P × [ r(1+r)ⁿ ] / [ (1+r)ⁿ − 1 ], where P is the principal, r is the monthly interest rate (annual rate ÷ 12) and n is the total number of monthly payments (years × 12). Each payment covers that month's interest first; the remainder reduces the principal, which is why early payments are interest-heavy and later payments chip away at the balance faster.",
  },
  faqs: [
    {
      question: "Is the monthly payment the only thing I'll pay?",
      answer:
        "No. The monthly payment covers principal and interest only. Real loans often add origination fees, insurance or taxes (for mortgages). Use the total-interest figure here to compare the financing cost, then add any fees a lender discloses.",
    },
    {
      question: "Why does a longer term cost more overall?",
      answer:
        "Interest accrues on the outstanding balance every month. Spreading repayment over more months means the balance stays higher for longer, so more interest accumulates even though each individual payment is smaller.",
    },
    {
      question: "What happens if I make extra payments?",
      answer:
        "Extra payments reduce the principal early, which lowers the interest charged in every remaining month. You'll either pay the loan off sooner or shrink future payments, depending on your lender's recalculation policy.",
    },
    {
      question: "Does this work for variable-rate loans?",
      answer:
        "It gives an accurate snapshot at today's rate. If your rate can change, treat the result as a starting point and re-run the calculator whenever the rate resets.",
    },
  ],
};

const emiCalculator: CalculatorContent = {
  slug: "emi-calculator",
  intro: [
    "An EMI (Equated Monthly Installment) calculator helps you determine your fixed monthly payment for home loans, car loans, and personal loans. EMI combines both principal and interest into one predictable payment, making budgeting easier.",
    "This calculator uses the reducing-balance method — the same approach banks in Nepal, India and internationally use — so you can trust the results when comparing loan offers or planning your finances.",
  ],
  howToUse: [
    "Select your region (Nepal, India, or USA) to see local currency and typical rates.",
    "Enter the loan amount you need (principal).",
    "Input the annual interest rate offered by your lender.",
    "Set the loan tenure in years, then instantly see your monthly EMI, total interest payable, and the complete repayment schedule.",
  ],
  formula: {
    title: "EMI Formula (Reducing Balance Method)",
    explanation:
      "EMI = P × r × (1+r)ⁿ / [(1+r)ⁿ − 1], where P = loan principal, r = monthly interest rate (annual rate ÷ 12 ÷ 100), and n = loan tenure in months. This formula ensures each payment is identical throughout the loan term, with the interest portion decreasing and principal portion increasing over time.",
  },
  faqs: [
    {
      question: "What is EMI and how is it calculated?",
      answer:
        "EMI stands for Equated Monthly Installment. It's a fixed amount paid monthly towards repaying a loan. Banks calculate EMI using the reducing balance method, where interest is computed on the outstanding principal each month.",
    },
    {
      question: "Does EMI change over the loan tenure?",
      answer:
        "For fixed-rate loans, the EMI remains constant throughout. However, if you have a floating/variable rate loan, the EMI may change when the interest rate resets. Some lenders adjust the tenure instead of the EMI when rates change.",
    },
    {
      question: "How can I reduce my EMI burden?",
      answer:
        "You can lower your EMI by: (1) opting for a longer tenure, (2) making a larger down payment to reduce the principal, (3) improving your credit score to qualify for lower interest rates, or (4) making partial prepayments when possible.",
    },
    {
      question: "Is this EMI calculator accurate for Nepal and India?",
      answer:
        "Yes. This calculator uses the same reducing-balance formula used by banks in Nepal and India. It supports NPR (Rs.), INR (₹), and USD ($) with region-specific default amounts and interest rates for realistic estimates.",
    },
  ],
};

const currencyConverter: CalculatorContent = {
  slug: "currency-converter",
  intro: [
    "A currency converter gives you instant exchange rates between major world currencies including NPR (Nepalese Rupee), INR (Indian Rupee), USD, EUR, GBP, CAD, AUD and more. See when rates were last updated and whether you're viewing live or cached data.",
    "This tool uses indicative market rates and includes an offline fallback so you always get a result. Exchange rates are shown with timestamps and source information for transparency.",
  ],
  howToUse: [
    "Enter the amount you want to convert.",
    "Select the source currency (e.g., USD, NPR, INR).",
    "Choose the target currency you want to convert to.",
    "View the converted amount, exchange rate, and rate timestamp.",
    "Check the reversibility verification to confirm accuracy.",
  ],
  formula: {
    title: "Currency Conversion Formula",
    explanation:
      "Conversion uses cross-rates relative to USD base: Amount_target = (Amount_source / Rate_source) × Rate_target. This method ensures mathematical reversibility within rounding tolerance. Rates are updated from market data sources when available.",
  },
  faqs: [
    {
      question: "Are these exchange rates live?",
      answer:
        "When available, rates are fetched from market data APIs. If the API is unavailable, the tool falls back to cached indicative rates. The timestamp shows when rates were last updated, and an indicator tells you if you're viewing offline data.",
    },
    {
      question: "Why is NPR (Nepalese Rupee) included?",
      answer:
        "NPR is supported as a key regional currency for users in Nepal. The Nepalese Rupee is pegged to the Indian Rupee at approximately 1 INR = 1.6 NPR, and both are included alongside major international currencies.",
    },
    {
      question: "Can I use these rates for actual transactions?",
      answer:
        "No. These are indicative rates for informational purposes only. Actual exchange rates offered by banks, money changers, or payment processors will differ due to spreads, fees, and real-time market movements. Always verify with your financial institution before transacting.",
    },
    {
      question: "How accurate is the conversion?",
      answer:
        "The math is precise and reversible within standard floating-point rounding tolerance. You can verify this using the reversibility check shown after conversion. However, the underlying rates are indicative and may not reflect current market conditions.",
    },
  ],
};

const worldClock: CalculatorContent = {
  slug: "world-clock",
  intro: [
    "A world clock and time zone converter lets you compare local times across multiple cities simultaneously. View current times in Kathmandu, Delhi, London, New York, Toronto, Sydney, and other major cities around the world.",
    "Times are calculated using the IANA timezone database with automatic Daylight Saving Time (DST) adjustments. Your selected region sets the default timezone for personalized date and time formatting.",
  ],
  howToUse: [
    "Your local time is displayed at the top based on your selected region.",
    "Click city buttons to add or remove them from the comparison view.",
    "View current time, date, and UTC offset for each selected city.",
    "Use the reference table to see all regional times at a glance.",
  ],
  formula: {
    title: "Time Zone Calculation",
    explanation:
      "Times are computed using IANA timezone identifiers (e.g., Asia/Kathmandu, America/New_York). The browser's Intl.DateTimeFormat API handles timezone conversions and DST rules automatically, ensuring accurate times year-round.",
  },
  faqs: [
    {
      question: "Which cities are supported?",
      answer:
        "Regional cities include Kathmandu (Nepal), Delhi (India), London (UK), New York (USA), Toronto (Canada), and Sydney (Australia). Additional cities like Tokyo, Singapore, Dubai, Paris, Berlin, Los Angeles, Chicago, and Vancouver are also available.",
    },
    {
      question: "Does this account for Daylight Saving Time?",
      answer:
        "Yes. The tool uses the IANA timezone database which automatically applies DST rules where applicable. Times in London, New York, Toronto, Sydney and other DST-observing regions will adjust seasonally.",
    },
    {
      question: "Why does my region affect the display?",
      answer:
        "Your selected region determines the default timezone and date/time format. For example, selecting Nepal shows times in Asia/Kathmandu timezone with DD/MM/YYYY formatting, while USA shows MM/DD/YYYY with America/New_York timezone.",
    },
    {
      question: "How often do times update?",
      answer:
        "The clock updates every second to show accurate real-time information. Date changes roll over automatically at midnight in each respective timezone.",
    },
  ],
};

/** Authored content, keyed by tool slug. */
const contentBySlug: Record<string, CalculatorContent> = {
  "loan-calculator": loanCalculator,
  "emi-calculator": emiCalculator,
  "currency-converter": currencyConverter,
  "world-clock": worldClock,
};

/**
 * Returns authored content for a slug, or a high-quality generic block
 * generated from the tool's display name when nothing is authored yet.
 */
export function getCalculatorContent(
  slug: string,
  toolName: string,
): CalculatorContent {
  const authored = contentBySlug[slug];
  if (authored) return authored;

  return {
    slug,
    intro: [
      `The ${toolName} gives you an instant, private answer in your browser — no sign-up, no data leaves your device. Enter your figures below and the result updates as you type.`,
      "Use it to sanity-check a decision, compare scenarios, or get a quick estimate before you talk to a professional.",
    ],
    howToUse: [
      `Open the ${toolName} and review the input fields.`,
      "Enter your values; every field accepts decimals and updates live.",
      "Check the highlighted result and the supporting breakdown beneath it.",
      "Adjust a single input to compare scenarios side by side.",
    ],
    formula: {
      title: `How the ${toolName} works`,
      explanation: `The ${toolName} applies the standard formula used by professionals in its field, rounding only for display. The full precision is kept internally so intermediate steps never distort the final answer.`,
    },
    faqs: [
      {
        question: `Is the ${toolName} free to use?`,
        answer:
          "Yes — completely free, with no account, subscription or usage limit. It runs entirely in your browser.",
      },
      {
        question: "Is my data stored anywhere?",
        answer:
          "No. Calculations happen client-side; nothing you type is sent to a server or saved.",
      },
      {
        question: "How accurate are the results?",
        answer:
          "Results use full-precision arithmetic and standard rounding for display. For legally or financially binding decisions, confirm with a qualified professional.",
      },
    ],
  };
}
