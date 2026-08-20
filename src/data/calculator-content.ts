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

/** Authored content, keyed by tool slug. */
const contentBySlug: Record<string, CalculatorContent> = {
  "loan-calculator": loanCalculator,
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
