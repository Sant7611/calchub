import Link from "next/link";
import { TaxCalculator } from "@/components/calculators/TaxCalculator";
import { SalaryCalculator } from "@/components/calculators/SalaryCalculator";
import { FaqSection } from "@/components/seo/FaqSection";
import {
  RelatedCalculators,
  RelatedGuides,
} from "@/components/seo/CalculatorInternalLinks";
import { getRegionConfig, type Region } from "@/config/regions";

export type FinanceCalculatorKind = "tax" | "salary";
export const FINANCE_REGIONS: Exclude<Region, "global">[] = ["nepal", "india", "usa", "uk", "canada", "australia"];

function getSeoContent(kind: FinanceCalculatorKind, region: Region) {
  const config = getRegionConfig(region);
  const location = region === "global" ? "your selected region" : config.name;
  const taxYear = config.tax.taxYear;
  const currency = config.currency.code;

  if (kind === "tax") {
    return {
      intro: `Estimate income tax, supported payroll deductions, effective tax rate, and take-home income for ${location}. Calculations use ${taxYear} settings and display amounts in ${currency}.`,
      heading: `Understanding your ${region === "global" ? "regional" : config.name} tax estimate`,
      details: `The calculator applies the configured progressive tax bands and supported employee payroll deductions for ${location}. Allowances, credits, local taxes, filing status, benefits, and individual eligibility can change the final amount.`,
      faqs: [
        { question: `How is income tax calculated for ${location}?`, answer: `The calculator applies the configured ${taxYear} progressive bands to taxable income and includes supported payroll deductions. Each portion of income is taxed only at the rate for its band.` },
        { question: `What currency does this ${region === "global" ? "tax" : config.name} calculator use?`, answer: `Amounts are displayed in ${currency}. Select another region to calculate with another country's configured currency and rules.` },
        { question: "Is this result suitable for filing a tax return?", answer: "No. The result is an estimate for planning and comparison. Confirm current rules and your personal deductions, credits, exemptions, and filing requirements with official guidance or a qualified professional." },
      ],
    };
  }

  return {
    intro: `Estimate gross salary, income tax, supported payroll deductions, and take-home pay for ${location}. Calculations use ${taxYear} settings, local working-hour defaults, and ${currency}.`,
    heading: `Understanding your ${region === "global" ? "regional" : config.name} salary estimate`,
    details: `The salary calculator converts hourly pay and working time into annual and per-period amounts, then uses the configured tax and payroll rules for ${location}. Employer benefits, bonuses, credits, overtime rules, and personal circumstances may change actual payslip results.`,
    faqs: [
      { question: `How is salary calculated for ${location}?`, answer: `Gross annual salary is estimated from hourly pay, hours per week, and weeks worked. The calculator then applies the configured ${taxYear} tax and supported payroll rules.` },
      { question: "How is take-home pay calculated?", answer: "Estimated take-home pay is gross salary minus calculated income tax, supported employee payroll contributions, and any optional deduction entered in the calculator." },
      { question: `Does this salary calculator use ${currency}?`, answer: `Yes. This page displays salary and deduction estimates in ${currency}. Changing the region also changes the configured currency, working defaults, and tax rules.` },
    ],
  };
}

export function financePageTitle(kind: FinanceCalculatorKind, region: Region) {
  const name = region === "global" ? "Regional" : getRegionConfig(region).name;
  return kind === "tax" ? `${name} Income Tax Calculator` : `${name} Salary Calculator`;
}

export function FinanceCalculatorPage({ kind, region }: { kind: FinanceCalculatorKind; region: Region }) {
  const title = financePageTitle(kind, region);
  const content = getSeoContent(kind, region);
  const base = kind === "tax" ? "/finance/tax-calc" : "/finance/salary-calc";
  const toolSlug = kind === "tax" ? "tax-calculator" : "salary-calculator";
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: title, applicationCategory: "FinanceApplication", operatingSystem: "Web", description: content.intro };

  return <main className="mx-auto max-w-6xl px-3 pb-12 pt-5 sm:px-5 sm:pt-7 lg:px-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500"><Link href="/finance" className="hover:text-indigo-600">Finance</Link><span className="mx-2">/</span><Link href={base} className="hover:text-indigo-600">{kind === "tax" ? "Tax calculator" : "Salary calculator"}</Link>{region !== "global" && <><span className="mx-2">/</span><span>{getRegionConfig(region).name}</span></>}</nav>
    <div className="mt-4 min-w-0 rounded-2xl bg-slate-50/70 p-0 sm:p-3 lg:p-4">{kind === "tax" ? <TaxCalculator defaultRegion={region} /> : <SalaryCalculator defaultRegion={region} />}</div>
    <div className="max-w-4xl">
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">{content.intro}</p>
      {region === "nepal" ? <RelatedGuides toolSlug={toolSlug} /> : null}
      <section className="mt-12"><h2 className="text-2xl font-bold text-slate-900">{content.heading}</h2><p className="mt-4 leading-relaxed text-slate-600">{content.details}</p></section>
      <FaqSection faqs={content.faqs} />
    </div>
    <section className="mt-12"><h2 className="text-2xl font-bold text-slate-900">{region === "global" ? "Explore Calculators by Region" : "Related Regional Calculators"}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{FINANCE_REGIONS.filter((item) => item !== region).map((item) => <Link key={item} href={`${base}/${item}`} className="rounded-xl border border-slate-200 bg-white p-4 font-semibold text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50">{getRegionConfig(item).name} {kind === "tax" ? "Tax" : "Salary"} Calculator</Link>)}</div></section>
    <RelatedCalculators toolSlug={toolSlug} />
  </main>;
}
