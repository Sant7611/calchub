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
  intro: string[];
  howToUse: string[];
  formula: FormulaInfo;
  faqs: Faq[];
}

/* ──────────────────────────────────────────────────────────
   Loan Calculator
────────────────────────────────────────────────────────── */

const loanCalculator: CalculatorContent = {
  slug: "loan-calculator",

  seo: {
    title: "Loan Calculator – Monthly Payment & Total Interest",
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
    title: "Loan Payment Formula",
    explanation:
      "For a fixed-rate amortizing loan, the monthly payment is calculated as M = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1]. P is the loan principal, r is the monthly interest rate, and n is the total number of monthly payments. Each payment contains both interest and principal, while the interest portion generally decreases as the outstanding balance falls.",
  },

  faqs: [
    {
      question: "How is the monthly loan payment calculated?",
      answer:
        "The monthly payment is based on the amount borrowed, the interest rate and the number of payments. For a fixed-rate amortizing loan, the calculator distributes principal and interest across the repayment period using the standard amortization formula.",
    },
    {
      question: "Why does a longer loan term reduce the monthly payment?",
      answer:
        "A longer term spreads repayment over more months, so each payment is usually smaller. However, the outstanding balance remains unpaid for longer, which can increase the total interest paid.",
    },
    {
      question: "Does the loan calculator include lender fees?",
      answer:
        "Not unless the calculator provides a separate field for them. Origination fees, insurance, taxes, late charges and other lender-specific costs may increase the real cost of borrowing.",
    },
    {
      question: "What happens if the interest rate is lower?",
      answer:
        "A lower interest rate generally reduces both the monthly payment and the total interest cost when the loan amount and repayment term remain the same.",
    },
    {
      question: "Can I use this calculator to compare loan offers?",
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
    title: "EMI Calculator – Calculate Monthly Loan EMI & Interest",
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
    title: "EMI Formula – Reducing Balance Method",
    explanation:
      "EMI = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1]. P represents the loan principal, r is the monthly interest rate calculated from the annual rate, and n is the total number of monthly installments. With a reducing-balance loan, interest is calculated on the remaining principal, so the interest component generally falls as the loan is repaid.",
  },

  faqs: [
    {
      question: "What does EMI mean?",
      answer:
        "EMI stands for Equated Monthly Installment. It is the scheduled amount paid each month toward a loan and normally contains both principal repayment and interest.",
    },
    {
      question: "How is EMI calculated?",
      answer:
        "EMI is calculated from the loan principal, monthly interest rate and total number of installments. The reducing-balance formula calculates interest on the outstanding loan balance rather than the original principal every month.",
    },
    {
      question: "Does a longer loan tenure reduce EMI?",
      answer:
        "Usually yes. Extending the repayment period spreads the loan across more installments and lowers the monthly EMI. However, it can increase the total interest paid over the full loan period.",
    },
    {
      question: "How can I reduce my monthly EMI?",
      answer:
        "You may reduce EMI by borrowing less, making a larger down payment, securing a lower interest rate or extending the loan tenure. Extending the tenure can reduce the monthly payment but may increase overall interest.",
    },
    {
      question: "Is the EMI calculator useful for Nepal and India?",
      answer:
        "Yes. The mathematical EMI formula is not currency-specific. Regional settings can be used to display results in currencies such as Nepalese Rupees or Indian Rupees while the underlying calculation remains the same.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Tax Calculator
────────────────────────────────────────────────────────── */

const taxCalculator: CalculatorContent = {
  slug: "tax-calculator",

  seo: {
    title: "Tax Calculator – Income Tax, Deductions & Take-Home Pay",
    description:
      "Estimate income tax, statutory payroll deductions, effective tax rate and after-tax income using regional tax settings and annual income.",
  },

  intro: [
    "Use the Tax Calculator to estimate income tax, statutory payroll deductions, effective tax rate and after-tax income from your annual income. The calculator applies the tax rules configured for the selected region rather than using one global tax percentage.",
    "Regional options are available for Nepal, the United States, India, the United Kingdom, Canada and Australia, with additional settings where the tax system requires them. Results are estimates and should be checked against current official guidance before filing or making an important tax decision.",
  ],

  howToUse: [
    "Select the country or region whose tax rules you want to use.",
    "Enter your annual income in the selected region's currency.",
    "Choose any region-specific options shown, such as filing status, jurisdiction, SSF contribution or Medicare levy inclusion.",
    "Review estimated income tax, payroll deductions, effective tax rate and take-home income.",
    "Change the income or tax settings to compare another scenario.",
  ],

  formula: {
    title: "How the Tax Estimate Is Calculated",
    explanation:
      "The calculator sends annual income and the selected regional tax settings to the site's regional tax engine. That engine applies the configured income-tax bands and applicable statutory payroll deductions for the region. Effective tax rate is calculated as total government deductions divided by annual income × 100, while estimated take-home income is annual income minus the calculated government deductions.",
  },

  faqs: [
    {
      question: "What does the tax calculator include?",
      answer:
        "It estimates income tax and the statutory payroll deductions supported by the selected regional tax configuration, then shows total government deductions, effective tax rate and estimated take-home income.",
    },
    {
      question: "Does the calculator use the same tax rules for every country?",
      answer:
        "No. The calculator uses region-specific tax logic and exposes additional settings when a country's calculation requires them.",
    },
    {
      question: "Can I use the result as my final tax liability?",
      answer:
        "Use the result as an estimate. Tax liability can depend on deductions, credits, exemptions, residency, income types and other circumstances that may not be represented by the calculator.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Salary Calculator
────────────────────────────────────────────────────────── */

const salaryCalculator: CalculatorContent = {
  slug: "salary-calculator",

  seo: {
    title: "Salary Calculator – Gross Pay, Tax & Take-Home Salary",
    description:
      "Convert hourly pay to annual salary and estimate gross pay, regional taxes, deductions and take-home pay by weekly, monthly or other pay periods.",
  },

  intro: [
    "Use the Salary Calculator to convert an hourly rate into estimated annual salary and take-home pay. Enter your hourly rate, weekly hours and weeks worked per year, then choose a pay frequency to see annual and per-pay-period amounts.",
    "The calculator also uses the site's regional tax engine to estimate income tax and statutory payroll deductions. You can add an optional personal deduction percentage and compare weekly, biweekly, semimonthly, monthly, quarterly or annual pay results.",
  ],

  howToUse: [
    "Select your region so the calculator uses the appropriate currency and configured tax rules.",
    "Enter your hourly rate, hours worked per week and weeks worked per year.",
    "Choose your pay frequency and any region-specific tax settings.",
    "Optionally enter a personal deduction percentage for additional deductions.",
    "Review gross annual salary, taxes, deductions and estimated net pay for the selected pay period.",
  ],

  formula: {
    title: "Salary and Take-Home Pay Formula",
    explanation:
      "Gross annual salary = hourly rate × hours per week × weeks per year. Regional income tax and statutory payroll deductions are then calculated from that annual gross amount. Any optional deduction is calculated as a percentage of gross annual salary. The resulting annual amounts are divided by the selected number of pay periods to estimate gross and net pay per period.",
  },

  faqs: [
    {
      question: "How do I convert hourly pay to annual salary?",
      answer:
        "Multiply the hourly rate by the number of hours worked each week and then by the number of weeks worked per year.",
    },
    {
      question: "Which pay frequencies are supported?",
      answer:
        "The calculator supports weekly, biweekly, semimonthly, monthly, quarterly and annual pay periods.",
    },
    {
      question: "Is take-home salary the same as gross salary?",
      answer:
        "No. Gross salary is earnings before deductions. Estimated take-home pay is the amount remaining after supported taxes, statutory payroll deductions and any optional deduction entered in the calculator.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Mortgage Calculator
────────────────────────────────────────────────────────── */

const mortgageCalculator: CalculatorContent = {
  slug: "mortgage-calculator",

  seo: {
    title: "Mortgage Calculator – Monthly Payment & Total Home Cost",
    description:
      "Estimate mortgage principal and interest, property tax, insurance, extra monthly fees, lifetime interest and total home financing cost.",
  },

  intro: [
    "Use the Mortgage Calculator to estimate the monthly cost of financing a home. Enter the home price, down-payment percentage, interest rate and loan term to calculate the principal-and-interest payment.",
    "You can also include annual property tax, annual insurance and an additional monthly fee such as an HOA or service charge. The result separates these costs and estimates lifetime interest and the total cost including the down payment.",
  ],

  howToUse: [
    "Enter the home price and down-payment percentage.",
    "Enter the annual mortgage interest rate and loan term in years.",
    "Add the annual property-tax rate, annual insurance cost and any additional monthly housing fee.",
    "Review the principal-and-interest payment and the estimated total monthly housing payment.",
    "Compare lifetime interest and total cost by changing the down payment, rate or loan term.",
  ],

  formula: {
    title: "Fixed-Rate Mortgage Payment Formula",
    explanation:
      "The financed loan amount is the home price minus the down payment. For a fixed-rate mortgage, monthly principal and interest use M = P × [r(1+r)ⁿ] ÷ [(1+r)ⁿ − 1], where P is the loan amount, r is the monthly interest rate and n is the number of monthly payments. Property tax, insurance and any additional monthly fee are then added to estimate the total monthly payment.",
  },

  faqs: [
    {
      question: "Does the mortgage calculator include property tax and insurance?",
      answer:
        "Yes. It has inputs for an annual property-tax rate and annual insurance amount and converts both to monthly estimates.",
    },
    {
      question: "How does a larger down payment affect the mortgage?",
      answer:
        "A larger down payment reduces the amount financed, which generally lowers the principal-and-interest payment and total interest when the other loan terms stay the same.",
    },
    {
      question: "What is included in the total monthly payment?",
      answer:
        "The calculator adds monthly principal and interest, estimated property tax, insurance and the additional monthly housing fee entered by the user.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Budget Planner
────────────────────────────────────────────────────────── */

const budgetPlanner: CalculatorContent = {
  slug: "budget-planner",

  seo: {
    title: "Budget Planner – 50/30/20 Monthly Budget Calculator",
    description:
      "Split monthly take-home income into 50% needs, 30% wants and 20% savings with a simple 50/30/20 budget planner.",
  },

  intro: [
    "Use the Budget Planner to divide your monthly take-home income using the 50/30/20 budgeting guideline. It calculates suggested amounts for needs, wants and savings or financial goals.",
    "The guideline is a planning framework rather than a strict rule. Your actual housing costs, debt, family needs and financial goals may require a different allocation, so use the calculated amounts as starting targets for your budget.",
  ],

  howToUse: [
    "Enter the monthly net income you receive after tax and other deductions.",
    "Review the suggested amount for needs such as housing, groceries, transport and essential bills.",
    "Review the suggested amount for wants such as entertainment, dining and optional purchases.",
    "Use the savings-and-goals amount as a target for saving, investing, retirement or faster debt repayment.",
  ],

  formula: {
    title: "50/30/20 Budget Formula",
    explanation:
      "The planner applies the 50/30/20 guideline directly to monthly net income: needs = income × 0.50, wants = income × 0.30, and savings or financial goals = income × 0.20. The three suggested allocations add up to the full monthly take-home income.",
  },

  faqs: [
    {
      question: "What is the 50/30/20 budget rule?",
      answer:
        "It is a budgeting guideline that allocates about 50% of take-home income to needs, 30% to wants and 20% to savings or financial goals.",
    },
    {
      question: "Should I enter gross income or take-home income?",
      answer:
        "Enter monthly net or take-home income, because the calculator divides the amount you actually have available after taxes and other payroll deductions.",
    },
    {
      question: "Do I have to follow the percentages exactly?",
      answer:
        "No. The percentages are targets. High housing costs, debt repayment, irregular income or personal savings goals may justify a different budget split.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   SIP Calculator
────────────────────────────────────────────────────────── */

const sipCalculator: CalculatorContent = {
  slug: "sip-calculator",

  seo: {
    title: "SIP Calculator – Investment Growth & Step-Up Returns",
    description:
      "Estimate SIP investment growth, total contributions and returns for daily, weekly, monthly and other contribution frequencies with optional step-up.",
  },

  intro: [
    "Use the SIP Calculator to estimate how recurring investments may grow over time. Set a contribution amount, expected annual return, investment duration and contribution frequency to see total invested, estimated returns and projected future value.",
    "The calculator supports daily, weekly, biweekly, monthly, quarterly and yearly contributions. An optional annual step-up can increase the recurring contribution after each completed investment year to model a gradually increasing investment plan.",
  ],

  howToUse: [
    "Choose how often you plan to invest: daily, weekly, biweekly, monthly, quarterly or yearly.",
    "Enter the recurring contribution amount and expected annual return.",
    "Enter the investment period in years.",
    "Optionally add an annual step-up percentage to increase future contributions.",
    "Review total contributions, estimated returns, future value and the year-by-year projection.",
  ],

  formula: {
    title: "How SIP Growth Is Calculated",
    explanation:
      "The calculator divides the expected annual return by the number of contribution periods per year to obtain a periodic rate. Existing balance grows for each period and the recurring contribution is added at the end of that period. When step-up is enabled, the recurring contribution is increased by the selected percentage after each completed investment year. Results are projections, not guaranteed returns.",
  },

  faqs: [
    {
      question: "Which SIP frequencies are supported?",
      answer:
        "Daily, weekly, biweekly, monthly, quarterly and yearly recurring investment schedules are supported.",
    },
    {
      question: "What is a step-up SIP?",
      answer:
        "A step-up SIP increases the recurring contribution by a chosen percentage each year, allowing the contribution amount to grow over time.",
    },
    {
      question: "Are the projected SIP returns guaranteed?",
      answer:
        "No. The projection depends on the expected return you enter. Real investment returns can be higher or lower and may be negative.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   NEPSE Share Calculator
────────────────────────────────────────────────────────── */

const shareCalculator: CalculatorContent = {
  slug: "share-calculator",

  seo: {
    title: "NEPSE Share Calculator – Brokerage, CGT & Profit/Loss",
    description:
      "Calculate NEPSE share buying cost, selling proceeds, brokerage, SEBON fee, DP charge, capital gains tax, net profit or loss and ROI.",
  },

  intro: [
    "Use the NEPSE Share Calculator to estimate the real cost and return of buying or selling equity shares in Nepal. It can calculate buy-only, sell-only or complete buy-and-sell transactions.",
    "The calculator includes the configured equity brokerage slabs, SEBON transaction fee, sell-side DP charge and capital gains tax. It then shows total buying cost, net receivable, profit or loss, profit per share and return on investment.",
  ],

  howToUse: [
    "Choose Buy & Sell, Buy Only or Sell Only depending on the transaction you want to calculate.",
    "Enter the share quantity and applicable buy or sell price.",
    "For a taxable sale, choose the investor type and holding-period information requested by the calculator.",
    "Use the WACC option when your entered acquisition price already represents your cost basis.",
    "Review brokerage, SEBON fee, DP charge, CGT, net proceeds and final profit or loss.",
  ],

  formula: {
    title: "NEPSE Share Cost and Profit Calculation",
    explanation:
      "Gross transaction value is quantity × share price. Brokerage is calculated from the configured transaction-value slab and the SEBON fee is applied to the gross amount. The NPR 25 DP charge is added on selling. For taxable positive gains, the configured CGT rate is applied according to investor type and holding period. Net profit or loss compares the final net receivable with the actual acquisition cost after applicable charges.",
  },

  faqs: [
    {
      question: "What brokerage rates does the NEPSE calculator use?",
      answer:
        "It uses tiered equity brokerage rates of 0.36%, 0.33%, 0.31%, 0.27% and 0.24% based on transaction value. Transactions up to NPR 50,000 are subject to a minimum brokerage of NPR 10.",
    },
    {
      question: "Which SEBON and DP fees are included?",
      answer:
        "The calculator uses a SEBON fee of 0.015% on both buying and selling and a flat NPR 25 DP charge on selling only.",
    },
    {
      question: "How is capital gains tax handled?",
      answer:
        "For individuals, the calculator applies 10% to holdings of 365 days or less and 7.5% to holdings over 365 days. Institutional investors use 10%. CGT is applied only when taxable capital gain is positive.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Grade Calculator
────────────────────────────────────────────────────────── */

const gradeCalculator: CalculatorContent = {
  slug: "grade-calculator",

  seo: {
    title: "Grade Calculator – Average, Weighted Grade, Final & GPA",
    description:
      "Calculate grade averages, weighted grades, required final-exam scores and credit-weighted GPA on a built-in 4.0 scale.",
  },

  intro: [
    "Use the Grade Calculator for four common student calculations: simple grade average, weighted course grade, the final-exam score needed to reach a target grade, and GPA.",
    "The GPA tool uses a built-in 4.0 letter-grade scale and weights each course by its credit hours. Because grading policies differ between schools and universities, compare the result with your institution's own scale and weighting rules.",
  ],

  howToUse: [
    "Choose Grade Average, Weighted Grade, Final Grade or GPA.",
    "Enter the assignment scores, category weights, current and target grades, or course credits required by the selected tool.",
    "Review the calculated average, weighted result, required final score or GPA.",
    "Add or change rows to model your actual subjects, assignments or courses.",
  ],

  formula: {
    title: "Grade and GPA Formulas",
    explanation:
      "A simple grade average is the sum of entered scores divided by the number of scores. A weighted grade multiplies each score by its percentage weight before summing the results. The final-grade tool solves for the exam score needed to reach a selected overall target. GPA multiplies each course's grade point by its credit hours, adds the quality points and divides by total credits.",
  },

  faqs: [
    {
      question: "Can I calculate a weighted course grade?",
      answer:
        "Yes. Enter each category score and its percentage weight so categories with larger weights contribute more to the final result.",
    },
    {
      question: "Can it tell me what I need on my final exam?",
      answer:
        "Yes. Enter your current grade, the final exam weight and the target course grade to calculate the required final-exam score.",
    },
    {
      question: "What GPA scale does the calculator use?",
      answer:
        "The built-in GPA tool uses a common 4.0 scale from A = 4.0 to F = 0.0. Your institution may use different grade boundaries or grade points.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   World Clock
────────────────────────────────────────────────────────── */

const worldClock: CalculatorContent = {
  slug: "world-clock",

  seo: {
    title: "World Clock – Current Time & Time Zone Comparison",
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
    title: "How World Time Zone Conversion Works",
    explanation:
      "The world clock converts the same moment into different local times using IANA time-zone identifiers such as Asia/Kathmandu, Asia/Kolkata and America/New_York. The browser's internationalization APIs apply the relevant UTC offset and available daylight-saving rules for each time zone.",
  },

  faqs: [
    {
      question: "What is a world clock?",
      answer:
        "A world clock shows the current local time in multiple places around the world. It is useful for international calls, remote work, travel planning and comparing time differences between countries.",
    },
    {
      question: "What is a UTC offset?",
      answer:
        "A UTC offset shows how far a local time zone is ahead of or behind Coordinated Universal Time. Nepal Standard Time, for example, uses UTC+05:45.",
    },
    {
      question: "What time zone does Nepal use?",
      answer:
        "Nepal uses Nepal Standard Time, represented by the IANA time zone Asia/Kathmandu. Its standard UTC offset is UTC+05:45.",
    },
    {
      question: "Does the world clock account for Daylight Saving Time?",
      answer:
        "Where supported by the selected IANA time zone and browser data, daylight-saving changes are applied automatically for locations that observe them.",
    },
    {
      question: "Why can the time difference between two cities change during the year?",
      answer:
        "Some countries change their clocks for Daylight Saving Time while others do not. This can cause the difference between two cities to change by an hour during part of the year.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   BMI Calculator
────────────────────────────────────────────────────────── */

const bmiCalculator: CalculatorContent = {
  slug: "bmi-calculator",

  seo: {
    title: "BMI Calculator – Body Mass Index & Healthy Weight Range",
    description:
      "Calculate BMI from height and weight in metric or imperial units, view the BMI category and estimate the weight range for BMI 18.5–24.9.",
  },

  intro: [
    "Use the BMI Calculator to calculate body mass index from your height and weight. You can work in kilograms and centimetres or pounds and inches, and the calculator automatically converts the inputs to the standard BMI formula.",
    "The result shows your BMI category and an estimated weight range corresponding to BMI 18.5–24.9 at the entered height. BMI is a screening measure and does not directly measure body fat, fitness or individual health.",
  ],

  howToUse: [
    "Choose Metric or Imperial units.",
    "Enter your weight and height.",
    "Review the calculated BMI and category: underweight, normal, overweight or obese.",
    "Check the estimated weight range corresponding to BMI 18.5–24.9 for your height.",
  ],

  formula: {
    title: "BMI Formula",
    explanation:
      "BMI = weight in kilograms ÷ height in metres². Imperial inputs are converted internally to kilograms and metres before the same formula is applied. The calculator classifies BMI below 18.5 as underweight, 18.5 to below 25 as normal, 25 to below 30 as overweight, and 30 or above as obese.",
  },

  faqs: [
    {
      question: "What is BMI?",
      answer:
        "Body mass index is a height-to-weight screening measure calculated from body weight and squared height.",
    },
    {
      question: "Can I use pounds and inches?",
      answer:
        "Yes. Choose Imperial mode and enter weight in pounds and height in inches; the calculator converts them internally before calculating BMI.",
    },
    {
      question: "Does a normal BMI guarantee good health?",
      answer:
        "No. BMI does not directly measure body composition or diagnose health conditions. Consider it one screening measure and seek appropriate medical advice for personal health decisions.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Calorie Calculator
────────────────────────────────────────────────────────── */

const calorieCalculator: CalculatorContent = {
  slug: "calorie-calculator",

  seo: {
    title: "Calorie Calculator – BMR, TDEE & Daily Calorie Target",
    description:
      "Estimate BMR, maintenance calories and a daily calorie target using Mifflin–St Jeor, activity level, age, height, weight and weight goal.",
  },

  intro: [
    "Use the Calorie Calculator to estimate basal metabolic rate (BMR), total daily energy expenditure (TDEE) and a daily calorie target. It supports metric and imperial measurements and uses age, height, weight and the sex constant selected for the BMR formula.",
    "After estimating BMR with the Mifflin–St Jeor equation, the calculator applies an activity multiplier to estimate maintenance calories. You can then select a maintenance, weight-loss or weight-gain goal to adjust the daily target.",
  ],

  howToUse: [
    "Choose Metric or US/Imperial units.",
    "Enter your age, weight and height and select the sex constant used by the Mifflin–St Jeor formula.",
    "Choose the activity level that best represents your usual activity.",
    "Choose a maintenance, weight-loss or weight-gain goal.",
    "Review estimated BMR, TDEE and target daily calories.",
  ],

  formula: {
    title: "Mifflin–St Jeor and TDEE Formulas",
    explanation:
      "The calculator uses Mifflin–St Jeor: male BMR = 10W + 6.25H − 5A + 5 and female BMR = 10W + 6.25H − 5A − 161, where W is kilograms, H is centimetres and A is age in years. TDEE = BMR × activity multiplier. The selected goal then adjusts TDEE by the configured percentage to produce the daily calorie target.",
  },

  faqs: [
    {
      question: "What is the difference between BMR and TDEE?",
      answer:
        "BMR estimates energy used at rest, while TDEE multiplies BMR by an activity factor to estimate total daily energy needs.",
    },
    {
      question: "Which activity levels are available?",
      answer:
        "The calculator provides sedentary, lightly active, moderately active, very active and extremely active options with progressively higher activity multipliers.",
    },
    {
      question: "Are calorie targets exact?",
      answer:
        "No. They are estimates based on population equations and selected activity assumptions. Individual energy needs can differ, especially with medical conditions, pregnancy, intensive training or changing body composition.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Scientific Calculator
────────────────────────────────────────────────────────── */

const scientificCalculator: CalculatorContent = {
  slug: "scientific-calculator",

  seo: {
    title: "Scientific Calculator – Trigonometry, Logs & Advanced Math",
    description:
      "Evaluate scientific expressions with trigonometric functions, logs, powers, roots, factorials, combinations, permutations, complex numbers and more.",
  },

  intro: [
    "Use the Scientific Calculator for arithmetic and advanced mathematical expressions. It includes powers, roots, logarithms, natural logs, trigonometric and inverse-trigonometric functions, factorials, combinations, permutations, constants and scientific notation.",
    "The calculator also provides degree and radian angle modes, calculation history and additional modes or tools for advanced work such as complex numbers, statistics, base-N calculations, matrices, vectors, derivatives, integrals, sums and equation solving where supported by the interface.",
  ],

  howToUse: [
    "Enter an expression with the on-screen keys or keyboard.",
    "Choose DEG or RAD before evaluating trigonometric expressions.",
    "Use SHIFT or alternate functions for inverse trigonometry, factorials, roots and other secondary operations.",
    "Select an advanced calculator mode or tool when you need complex, statistical, base-N, matrix, vector or calculus-related operations.",
    "Evaluate the expression and use the calculation history or stored values when needed.",
  ],

  formula: {
    title: "How Scientific Expressions Are Evaluated",
    explanation:
      "Unlike a single-purpose calculator, the scientific calculator evaluates the mathematical expression you enter according to operator precedence and the selected angle or display mode. Functions such as square roots, logarithms, powers, trigonometry, factorials, combinations and permutations are evaluated by the calculator's math engine using the arguments supplied in the expression.",
  },

  faqs: [
    {
      question: "Can I calculate sine, cosine and tangent in degrees?",
      answer:
        "Yes. Select DEG for degree-based trigonometry or RAD when your angles are in radians.",
    },
    {
      question: "Does the calculator support logarithms and powers?",
      answer:
        "Yes. It includes common logarithm, natural logarithm, exponential functions, powers, square roots, cube roots and nth-root operations.",
    },
    {
      question: "Can it work with complex numbers?",
      answer:
        "The calculator includes a complex-number mode and an imaginary-unit key for supported complex expressions.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Compound Interest Calculator
────────────────────────────────────────────────────────── */

const compoundInterestCalculator: CalculatorContent = {
  slug: "compound-interest-calculator",

  seo: {
    title: "Compound Interest Calculator – Future Value & Contributions",
    description:
      "Calculate future value, total contributions and compound interest with monthly deposits, multiple compounding frequencies and contribution timing.",
  },

  intro: [
    "Use the Compound Interest Calculator to estimate how an initial investment and recurring monthly contributions can grow over time. Enter the starting principal, monthly contribution, annual return and investment period.",
    "You can choose annual, semiannual, quarterly, monthly, daily or continuous compounding and decide whether monthly contributions are made at the beginning or end of each month. The calculator also provides a year-by-year balance and interest breakdown.",
  ],

  howToUse: [
    "Enter the initial investment and planned monthly contribution.",
    "Enter the annual interest or expected return and the investment period in years.",
    "Choose the compounding frequency.",
    "Choose whether each monthly contribution is added at the beginning or end of the month.",
    "Review future value, total contributions, interest earned and the year-by-year projection.",
  ],

  formula: {
    title: "Compound Growth Method",
    explanation:
      "For periodic compounding, the calculator converts the selected annual rate and compounding frequency into an equivalent monthly growth rate using (1 + r/n)^(n/12) − 1. Continuous compounding uses e^(r/12) − 1. The balance is then grown month by month while recurring contributions are added either before or after each month's growth according to the selected timing.",
  },

  faqs: [
    {
      question: "Which compounding frequencies can I choose?",
      answer:
        "Annually, semi-annually, quarterly, monthly, daily and continuously.",
    },
    {
      question: "Does contribution timing matter?",
      answer:
        "Yes. A contribution added at the beginning of a month receives that month's growth, while an end-of-month contribution is added after the month's growth is applied.",
    },
    {
      question: "What does interest earned mean?",
      answer:
        "It is the estimated final balance minus the total amount you personally contributed, including the initial principal and recurring contributions.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Age Calculator
────────────────────────────────────────────────────────── */

const ageCalculator: CalculatorContent = {
  slug: "age-calculator",

  seo: {
    title: "Age Calculator – Exact Age & Days Until Next Birthday",
    description:
      "Calculate exact age in years, months and days, total months, weeks and days, plus the date and countdown to the next birthday.",
  },

  intro: [
    "Use the Age Calculator to calculate exact calendar age from a date of birth to a selected comparison date. The result is shown in years, months and days rather than only an approximate number of years.",
    "The calculator also reports total months, weeks and days and works out the next birthday date, age at that birthday and the number of calendar days remaining. Calendar-aware date handling is used for different month lengths and leap-year dates.",
  ],

  howToUse: [
    "Enter the date of birth.",
    "Choose the date on which you want to calculate the age, or use the current date when available in the calculator.",
    "Review the exact years, months and days.",
    "Check total months, weeks and days and the countdown to the next birthday.",
  ],

  formula: {
    title: "How Exact Age Is Calculated",
    explanation:
      "The calculator first counts complete calendar years from the birth date, then complete calendar months after those years, and finally the remaining calendar days. It clamps dates safely when a target month has fewer days and handles February 29 when adding years. Total-day differences are calculated from calendar dates so daylight-saving clock changes do not distort the result.",
  },

  faqs: [
    {
      question: "Why is exact age shown in years, months and days?",
      answer:
        "Calendar months and years have different lengths, so an exact calendar age is more meaningful than simply dividing total days by 365.",
    },
    {
      question: "Does the calculator handle leap-year birthdays?",
      answer:
        "Yes. Its date helpers safely handle February 29 and clamp the date when the corresponding target year does not contain February 29.",
    },
    {
      question: "Can it show how long until my next birthday?",
      answer:
        "Yes. It calculates the next birthday date and the number of calendar days remaining from the selected comparison date.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Length Converter
────────────────────────────────────────────────────────── */

const lengthConverter: CalculatorContent = {
  slug: "length-converter",

  seo: {
    title: "Length Converter – mm, cm, m, km, in, ft, yd & mi",
    description:
      "Convert length and distance between millimetres, centimetres, metres, kilometres, inches, feet, yards and miles with all results shown at once.",
  },

  intro: [
    "Use the Length Converter to convert a measurement between eight common metric and imperial length units: millimetres, centimetres, metres, kilometres, inches, feet, yards and miles.",
    "Select the unit of the value you already have and enter the measurement. The converter uses metres as the internal base unit and displays the equivalent value in every supported unit at the same time.",
  ],

  howToUse: [
    "Enter the length or distance you want to convert.",
    "Select the unit of the entered value.",
    "Review the equivalent measurement in all supported units.",
    "Change the input unit or value to perform another conversion.",
  ],

  formula: {
    title: "Length Conversion Method",
    explanation:
      "The converter first multiplies the input by the selected unit's standard factor to convert it to metres. It then divides that metre value by each destination unit's metre factor. For example, 1 inch = 0.0254 metres and 1 mile = 1609.344 metres. Full precision is retained internally and values are rounded only for display.",
  },

  faqs: [
    {
      question: "Which length units are supported?",
      answer:
        "Millimetres, centimetres, metres, kilometres, inches, feet, yards and miles.",
    },
    {
      question: "How does the converter calculate every unit at once?",
      answer:
        "It converts the input to metres first and then converts that metre value into each supported unit using standard conversion factors.",
    },
    {
      question: "Are displayed values rounded?",
      answer:
        "Yes. The interface rounds values for readability, while the conversion calculation keeps full numeric precision internally.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Temperature Converter
────────────────────────────────────────────────────────── */

const temperatureConverter: CalculatorContent = {
  slug: "temperature-converter",

  seo: {
    title: "Temperature Converter – Celsius, Fahrenheit & Kelvin",
    description:
      "Convert temperatures between Celsius, Fahrenheit and Kelvin, view all three scales and check values against absolute zero.",
  },

  intro: [
    "Use the Temperature Converter to convert between Celsius, Fahrenheit and Kelvin. Enter a temperature, choose the source scale and select the scale you want to convert to.",
    "The calculator also displays the equivalent value on all three temperature scales and checks the entered value against absolute zero for the selected unit.",
  ],

  howToUse: [
    "Enter the temperature value.",
    "Choose Celsius, Fahrenheit or Kelvin as the source unit.",
    "Select the destination temperature unit.",
    "Review the converted result and the equivalent values on the other scales.",
    "Use the swap control when you want to reverse the conversion direction.",
  ],

  formula: {
    title: "Temperature Conversion Formulas",
    explanation:
      "Fahrenheit to Celsius uses °C = (°F − 32) × 5/9. Kelvin to Celsius uses °C = K − 273.15. Celsius to Fahrenheit uses °F = °C × 9/5 + 32, and Celsius to Kelvin uses K = °C + 273.15. The calculator uses Celsius as the internal intermediate scale when converting between units.",
  },

  faqs: [
    {
      question: "What is 0°C in Fahrenheit?",
      answer: "0°C is 32°F.",
    },
    {
      question: "What is 0 Kelvin in Celsius?",
      answer: "0 K is −273.15°C, which is absolute zero.",
    },
    {
      question: "Can the calculator detect values below absolute zero?",
      answer:
        "Yes. It checks the entered value against −273.15°C, −459.67°F or 0 K depending on the selected source unit.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Currency Converter
────────────────────────────────────────────────────────── */

const currencyConverter: CalculatorContent = {
  slug: "currency-converter",

  seo: {
    title: "Currency Converter – Convert NPR, INR, USD & More",
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
    title: "Currency Conversion Formula",
    explanation:
      "A currency conversion multiplies the source amount by the exchange rate between the source and destination currencies. When rates are stored relative to a common base currency, the converter first derives the cross-rate and then applies it to the amount being converted.",
  },

  faqs: [
    {
      question: "How does a currency converter work?",
      answer:
        "A currency converter applies an exchange rate between two currencies to the amount entered. If direct rates are unavailable, a cross-rate can be calculated using a common base currency.",
    },
    {
      question: "Are currency converter rates the same as bank rates?",
      answer:
        "Not necessarily. Banks, card providers, remittance companies and money changers can add spreads, commissions or transaction fees, so the amount you actually receive may differ from an indicative market conversion.",
    },
    {
      question: "Can I convert Nepalese Rupees to US Dollars?",
      answer:
        "Yes. Select NPR as the source currency and USD as the destination currency, then enter the Nepalese Rupee amount you want to convert.",
    },
    {
      question: "Why can exchange rates change during the day?",
      answer:
        "Many currencies trade continuously in global foreign-exchange markets. Supply, demand, interest rates, economic data, central-bank policy and market events can cause exchange rates to change.",
    },
    {
      question: "Should I use the converted amount for an actual transaction?",
      answer:
        "Use it as an estimate unless the displayed rate is specifically guaranteed by your financial provider. Always check the final exchange rate and fees offered by the bank, card provider, exchange service or remittance company handling the transaction.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Nepali Date Converter
────────────────────────────────────────────────────────── */

const nepaliDateConverter: CalculatorContent = {
  slug: "nepali-date-converter",

  seo: {
    title: "Nepali Date Converter – AD to BS, BS to AD & Date Difference",
    description:
      "Convert Gregorian AD dates to Nepali Bikram Sambat BS and BS to AD, or calculate date differences in days, weeks, months and years.",
  },

  intro: [
    "Use the Nepali Date Converter to convert dates between the Gregorian calendar (AD) and Nepal's Bikram Sambat calendar (BS). You can convert in either direction and view the corresponding date and weekday information.",
    "A separate Date Difference tool can compare two AD dates or two BS dates and show total days, total weeks and a readable years, months and days duration.",
  ],

  howToUse: [
    "Choose Date Converter or Date Difference.",
    "For conversion, select AD to BS or BS to AD and enter the source date.",
    "Run the conversion to view the corresponding Gregorian or Bikram Sambat date.",
    "For a date difference, select AD or BS and enter the start and end dates.",
    "Review total days, weeks and the calendar duration between the selected dates.",
  ],

  formula: {
    title: "How AD and BS Date Conversion Works",
    explanation:
      "AD and Bikram Sambat do not have a fixed year or month offset because their month structures differ. The calculator uses Bikram Sambat calendar conversion data to map an entered AD date to BS or an entered BS date to AD. Date differences are calculated after converting the selected dates to comparable Gregorian calendar dates and then measuring the calendar-day interval.",
  },

  faqs: [
    {
      question: "Can I convert both AD to BS and BS to AD?",
      answer:
        "Yes. The converter supports both directions between Gregorian dates and Bikram Sambat dates.",
    },
    {
      question: "Can I compare two Nepali BS dates?",
      answer:
        "Yes. Choose the Date Difference tool, select BS and enter the two Bikram Sambat dates to calculate the interval.",
    },
    {
      question: "Why is there no simple fixed number of days between AD and BS?",
      answer:
        "The calendars use different year numbering and month structures, so accurate conversion requires calendar-specific date data rather than adding a fixed offset.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   ROI Calculator
────────────────────────────────────────────────────────── */

const roiCalculator: CalculatorContent = {
  slug: "roi-calculator",

  seo: {
    title: "ROI Calculator – Return on Investment & Annualized ROI",
    description:
      "Calculate ROI, net profit or loss, investment multiple and annualized return from investment cost, final value, additional income and time period.",
  },

  intro: [
    "Use the ROI Calculator to measure the return produced by an investment after including both the original investment and additional costs. Enter the final value and any additional income such as dividends, rent, interest or distributions.",
    "The calculator shows net profit or loss, return on investment percentage, investment multiple and an annualized return estimate when an investment period is provided.",
  ],

  howToUse: [
    "Enter the initial investment and any additional investment-related costs.",
    "Enter the final or current value of the investment.",
    "Add any extra income received from the investment.",
    "Enter the investment period in years if you want an annualized return estimate.",
    "Review ROI, net profit or loss, investment multiple and annualized ROI.",
  ],

  formula: {
    title: "ROI and Annualized Return Formulas",
    explanation:
      "Total invested = initial investment + additional costs. Total return = final value + additional income. Net profit = total return − total invested, and ROI = net profit ÷ total invested × 100. When the investment period is greater than zero, annualized ROI = [(total return ÷ total invested)^(1/years) − 1] × 100.",
  },

  faqs: [
    {
      question: "What costs should I include in ROI?",
      answer:
        "Include the money invested plus relevant costs such as fees, commissions, maintenance, advertising or other expenses that were necessary for the investment.",
    },
    {
      question: "What counts as additional income?",
      answer:
        "Examples include dividends, rent, interest, distributions or other income received in addition to the investment's final value.",
    },
    {
      question: "What is annualized ROI?",
      answer:
        "It converts the total growth over the entered investment period into an equivalent compounded yearly return, making investments with different time periods easier to compare.",
    },
  ],
};

/* ──────────────────────────────────────────────────────────
   Registry
────────────────────────────────────────────────────────── */

const contentBySlug: Record<string, CalculatorContent> = {
  "loan-calculator": loanCalculator,
  "tax-calculator": taxCalculator,
  "salary-calculator": salaryCalculator,
  "emi-calculator": emiCalculator,
  "mortgage-calculator": mortgageCalculator,
  "budget-planner": budgetPlanner,
  "sip-calculator": sipCalculator,
  "share-calculator": shareCalculator,
  "grade-calculator": gradeCalculator,
  "world-clock": worldClock,
  "bmi-calculator": bmiCalculator,
  "calorie-calculator": calorieCalculator,
  "scientific-calculator": scientificCalculator,
  "compound-interest-calculator": compoundInterestCalculator,
  "age-calculator": ageCalculator,
  "length-converter": lengthConverter,
  "temperature-converter": temperatureConverter,
  "currency-converter": currencyConverter,
  "nepali-date-converter": nepaliDateConverter,
  "roi-calculator": roiCalculator,
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
  const authored = contentBySlug[slug];

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
      title: `How the ${toolName} Calculates the Result`,
      explanation:
        `The ${toolName} uses the values entered in the calculator to produce the displayed result. Refer to the calculator fields and result breakdown for the variables included in the calculation.`,
    },

    faqs: [
      {
        question: `What is the ${toolName}?`,
        answer:
          `The ${toolName} is an online tool that calculates a result from the information you enter and presents it in an easy-to-read format.`,
      },
      {
        question: `How do I use the ${toolName}?`,
        answer:
          `Enter the requested values in the calculator fields and review the result. You can change the inputs to compare different scenarios.`,
      },
      {
        question: `Can I use the ${toolName} for important decisions?`,
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
 * metadataBase: new URL("https://oncalculator.tech")
 */
export function getCalculatorMetadata(
  content: CalculatorContent,
  canonicalPath?: string
): Metadata {
  const { title, description } = content.seo;

  return {
    title,
    description,

    ...(canonicalPath
      ? {
          alternates: {
            canonical: canonicalPath,
          },
        }
      : {}),

    openGraph: {
      title,
      description,
      type: "website",
      siteName: "OnCalculator",
      ...(canonicalPath
        ? {
            url: canonicalPath,
          }
        : {}),
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
