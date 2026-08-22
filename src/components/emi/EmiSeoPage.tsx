import Link from "next/link";
import { EmiCalculator, type LoanType } from "@/components/calculators/EmiCalculator";
import { FaqSection } from "@/components/seo/FaqSection";
import {
  RelatedCalculators,
  RelatedGuides,
} from "@/components/seo/CalculatorInternalLinks";

type Faq = { question: string; answer: string };
type Page = { heading: string; intro: string; details: string; faqs: Faq[] };

const pages: Record<LoanType, Page> = {
  general: { heading: "EMI Calculator", intro: "Estimate EMI for home, car, bike, personal, education, and business loans using the amount, annual interest rate, and repayment tenure you choose.", details: "EMI is a fixed monthly installment for a standard reducing-balance loan. A longer tenure generally lowers the monthly payment but can increase total interest.", faqs: [{ question: "What is EMI?", answer: "EMI means Equated Monthly Installment: the regular monthly payment that repays principal and interest." }, { question: "How is EMI calculated?", answer: "The calculator uses the standard reducing-balance formula with principal, monthly interest rate, and number of monthly installments." }, { question: "Are preset interest rates live?", answer: "No. Presets are illustrative starting values that you can replace with your lender's quoted rate." }] },
  home: { heading: "Home Loan EMI Calculator", intro: "Calculate an estimated monthly home loan EMI from your loan amount, interest rate, and tenure before comparing financing options.", details: "Home loan repayments are commonly calculated on a reducing balance, so each installment covers that month's interest first and then reduces principal.", faqs: [{ question: "How is home loan EMI calculated?", answer: "It is calculated from the principal, annual interest rate, and repayment term using a reducing-balance formula." }, { question: "Does a longer home loan tenure lower EMI?", answer: "Usually yes, because repayment is spread over more months, though total interest may rise." }, { question: "Can I calculate EMI before applying?", answer: "Yes. Use your planned loan amount and a quoted or illustrative APR to estimate affordability." }] },
  car: { heading: "Car & Vehicle Loan EMI Calculator", intro: "Use this car loan EMI calculator to estimate a vehicle loan monthly payment, total interest, and total repayment for new or used car financing.", details: "Your down payment affects the amount you need to borrow. Enter the remaining loan amount, then compare different tenures and quoted interest rates.", faqs: [{ question: "How is car loan EMI calculated?", answer: "It uses the vehicle loan amount, annual interest rate, and tenure to calculate a reducing-balance monthly installment." }, { question: "Can this calculator be used for used cars?", answer: "Yes. Enter the actual loan amount, rate, and tenure offered for the used vehicle." }, { question: "How does a down payment affect vehicle EMI?", answer: "A larger down payment lowers the loan amount, which generally lowers the EMI and total interest." }] },
  bike: { heading: "Bike & Two-Wheeler Loan EMI Calculator", intro: "Estimate bike loan EMI for a motorcycle, scooter, or other two-wheeler with your financing amount, APR, and repayment tenure.", details: "The result is an estimate for a standard installment loan. Enter the exact loan amount after any deposit or trade-in value.", faqs: [{ question: "How is bike loan EMI calculated?", answer: "The calculator applies the standard reducing-balance formula to the loan amount, rate, and term." }, { question: "Can this be used for motorcycles or scooters?", answer: "Yes. It works for any two-wheeler loan with regular monthly repayments." }, { question: "How does tenure affect two-wheeler EMI?", answer: "More months normally reduce the EMI but can increase total interest paid." }] },
  personal: { heading: "Personal Loan EMI Calculator", intro: "Calculate an estimated personal loan monthly EMI, total interest, and total repayment from the principal, APR, and tenure.", details: "Personal loans can have different rates and fees from secured loans. Use the APR supplied by your lender and compare several repayment terms.", faqs: [{ question: "How is personal loan EMI calculated?", answer: "The standard reducing-balance formula uses the amount borrowed, annual rate, and number of monthly payments." }, { question: "How does APR affect personal loan EMI?", answer: "A higher annual percentage rate increases the monthly interest charge and generally the EMI." }, { question: "Does early repayment reduce interest?", answer: "It often can, but check your lender's prepayment terms and fees." }] },
  education: { heading: "Education Loan EMI Calculator", intro: "Estimate education or student loan repayment using the planned loan amount, interest rate, and repayment tenure.", details: "This calculator models regular monthly repayments only. It does not assume a country-specific moratorium, subsidy, or lender policy.", faqs: [{ question: "How is education loan EMI calculated?", answer: "It calculates a regular reducing-balance installment from the principal, annual rate, and term." }, { question: "How does tenure affect study-loan repayment?", answer: "A longer tenure generally lowers the monthly payment while increasing the time interest can accrue." }] },
  business: { heading: "Business Loan EMI Calculator", intro: "Estimate monthly business loan repayment, total interest, and total repayment for working capital, startup, or business financing.", details: "Use the actual amount financed rather than the purchase price. This tool is an estimate and does not include lender-specific fees or changing-rate terms.", faqs: [{ question: "How is business loan EMI calculated?", answer: "It uses the standard reducing-balance installment formula with the amount, annual rate, and tenure." }, { question: "How does interest rate affect business EMI?", answer: "A higher rate increases interest charged on the outstanding balance and usually raises the EMI." }] },
};

const related: { type: LoanType; label: string; href: string }[] = [
  { type: "home", label: "Home Loan EMI", href: "/emi-calculator/home-loan" }, { type: "car", label: "Car & Vehicle Loan EMI", href: "/emi-calculator/car-loan" }, { type: "bike", label: "Bike Loan EMI", href: "/emi-calculator/bike-loan" }, { type: "personal", label: "Personal Loan EMI", href: "/emi-calculator/personal-loan" }, { type: "education", label: "Education Loan EMI", href: "/emi-calculator/education-loan" }, { type: "business", label: "Business Loan EMI", href: "/emi-calculator/business-loan" },
];

export function EmiSeoPage({ loanType }: { loanType: LoanType }) {
  const page = pages[loanType];
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: page.heading, applicationCategory: "FinanceApplication", operatingSystem: "Web", description: page.intro };
  const showNepalCarGuide = loanType === "general" || loanType === "car";

  return <main className="mx-auto max-w-6xl px-3 pb-12 pt-5 sm:px-5 sm:pt-7 lg:px-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <div className="min-w-0 rounded-2xl bg-slate-50/70 p-0 sm:p-3 lg:p-4"><EmiCalculator defaultLoanType={loanType} /></div>
    <div className="max-w-4xl">
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{page.heading}</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">{page.intro}</p>
      {showNepalCarGuide ? <RelatedGuides toolSlug="emi-calculator" /> : null}
      <section className="mt-12"><h2 className="text-2xl font-bold text-slate-900">Understanding your repayment</h2><p className="mt-4 leading-relaxed text-slate-600">{page.details}</p></section>
      <FaqSection faqs={page.faqs} />
    </div>
    <section className="mt-12"><h2 className="text-2xl font-bold text-slate-900">{loanType === "general" ? "Explore EMI Calculators by Loan Type" : "Related EMI Calculators"}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{related.filter((item) => item.type !== loanType).slice(0, loanType === "general" ? 6 : 3).map((item) => <Link key={item.type} href={item.href} className="rounded-xl border border-slate-200 bg-white p-4 font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50">{item.label}</Link>)}</div></section>
    <RelatedCalculators toolSlug="emi-calculator" />
  </main>;
}
