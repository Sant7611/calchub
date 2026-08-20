"use client";

import { useMemo, useState } from "react";
import { Field, NumInput } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

function calculateTax(income: number, brackets: { limit: number | null; rate: number }[], waiveFirstBand: boolean) {
  let remaining = Math.max(0, income);
  let total = 0;
  for (let index = 0; index < brackets.length && remaining > 0; index += 1) {
    const bracket = brackets[index];
    const amount = Math.min(remaining, bracket.limit ?? remaining);
    total += amount * (waiveFirstBand && index === 0 ? 0 : bracket.rate);
    remaining -= amount;
  }
  return total;
}

export function SalaryTaxInterface() {
  const { region, config } = useRegion();
  const { money } = makeFormatters(region);
  const isNepal = region === "nepal";
  const [status, setStatus] = useState<"unmarried" | "married">("unmarried");
  const [ssfContributor, setSsfContributor] = useState(false);
  const [femaleEmployee, setFemaleEmployee] = useState(false);
  const [monthlySalary, setMonthlySalary] = useState(50_000);
  const [months, setMonths] = useState(12);
  const [bonus, setBonus] = useState(0);
  const [ssf, setSsf] = useState(0);
  const [epf, setEpf] = useState(0);
  const [cit, setCit] = useState(0);
  const [life, setLife] = useState(0);
  const [medical, setMedical] = useState(0);

  const result = useMemo(() => {
    const totalIncome = Math.max(0, monthlySalary) * Math.max(0, months) + Math.max(0, bonus);
    const retirement = Math.max(0, ssf) + Math.max(0, epf) + Math.max(0, cit);
    const lifeApplied = Math.min(Math.max(0, life), isNepal ? 40_000 : Math.max(0, life));
    const medicalApplied = Math.min(Math.max(0, medical), isNepal ? 20_000 : Math.max(0, medical));
    const totalDeduction = retirement + lifeApplied + medicalApplied;
    const assessable = Math.max(0, totalIncome - totalDeduction);
    let tax = calculateTax(assessable, config.tax.brackets, isNepal && ssfContributor);
    if (isNepal && femaleEmployee && status === "unmarried") tax *= 0.9;
    return { totalIncome, retirement, lifeApplied, medicalApplied, totalDeduction, assessable, tax };
  }, [bonus, cit, config.tax.brackets, epf, femaleEmployee, isNepal, life, medical, months, monthlySalary, ssf, ssfContributor, status]);

  const amountInput = (label: string, value: number, onChange: (value: number) => void, hint?: string) => <Field label={label} hint={hint}><NumInput value={value} onChange={onChange} prefix={config.currency.symbol} step={1000} /></Field>;

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,.85fr)]">
    <div className="space-y-5">
      <section className="rounded-2xl border border-ink-600/70 bg-ink-850/80 p-5" aria-labelledby="salary-details-heading">
        <h2 id="salary-details-heading" className="font-display text-xl font-bold text-fog-100">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-widest text-fog-500">Nature of employee</p><div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Nature of employee">{(["unmarried", "married"] as const).map((item) => <button key={item} type="button" role="radio" aria-checked={status === item} onClick={() => setStatus(item)} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${status === item ? "border-mint-500/60 bg-mint-500/10 text-mint-300" : "border-ink-600 bg-ink-800 text-fog-400 hover:border-ink-500"}`}>{item === "unmarried" ? "Unmarried" : "Married"}</button>)}</div></div>
          <div className="space-y-2"><label className="flex cursor-pointer gap-3 rounded-lg border border-ink-600 bg-ink-800 p-3 text-sm text-fog-300"><input type="checkbox" checked={ssfContributor} onChange={(event) => setSsfContributor(event.target.checked)} className="mt-0.5 h-4 w-4 accent-mint-500" /><span><strong className="block text-fog-100">SSF contributor</strong><span className="text-xs text-fog-500">{isNepal ? "Waives the configured first-band social security tax." : "Track the contribution below."}</span></span></label><label className="flex cursor-pointer gap-3 rounded-lg border border-ink-600 bg-ink-800 p-3 text-sm text-fog-300"><input type="checkbox" checked={femaleEmployee} onChange={(event) => setFemaleEmployee(event.target.checked)} className="mt-0.5 h-4 w-4 accent-mint-500" /><span><strong className="block text-fog-100">Female employee</strong><span className="text-xs text-fog-500">{isNepal ? "Applies the illustrative unmarried-employee rebate." : "May affect local rules."}</span></span></label></div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-600/70 bg-ink-850/80 p-5" aria-labelledby="annual-income-heading">
        <h2 id="annual-income-heading" className="font-display text-xl font-bold text-fog-100">Annual income</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">{amountInput(`Monthly salary (${config.currency.code})`, monthlySalary, setMonthlySalary)}<Field label="No. of months"><NumInput value={months} onChange={setMonths} suffix="months" step={1} min={1} max={24} /></Field>{amountInput("Bonus", bonus, setBonus)}</div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-mint-500/30 bg-mint-500/5 px-4 py-3"><span className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-fog-500">Total salary</span><strong className="font-display text-2xl text-mint-300">{money(result.totalIncome)}</strong></div>
      </section>

      <section className="rounded-2xl border border-ink-600/70 bg-ink-850/80 p-5" aria-labelledby="annual-deductions-heading">
        <h2 id="annual-deductions-heading" className="font-display text-xl font-bold text-fog-100">Annual deductions</h2><p className="mt-1 text-sm text-fog-500">Enter eligible annual deductions for the selected region.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{amountInput("Social Security Fund (SSF)", ssf, setSsf)}{amountInput("Employees Provident Fund (EPF)", epf, setEpf)}{amountInput("Citizen Investment Trust (CIT)", cit, setCit)}{amountInput("Life insurance", life, setLife, isNepal ? "Maximum Rs. 40,000 applied" : undefined)}{amountInput("Medical insurance", medical, setMedical, isNepal ? "Maximum Rs. 20,000 applied" : undefined)}</div>
      </section>
    </div>

    <aside className="h-fit rounded-2xl border border-mint-500/30 bg-gradient-to-b from-mint-500/10 to-ink-850 p-5 shadow-lg shadow-mint-950/20 lg:sticky lg:top-6">
      <p className="font-mono text-[10.5px] font-semibold uppercase tracking-widest text-mint-400">Estimated tax</p><p className="mt-3 text-sm text-fog-400">Net tax liability</p><p className="mt-1 font-display text-4xl font-bold tracking-tight text-mint-300">{money(result.tax)}</p><p className="mt-1 text-sm text-fog-500">{money(result.tax / 12)} per month</p>
      <dl className="mt-6 space-y-3 border-t border-ink-600 pt-5 text-sm"><div className="flex justify-between gap-4"><dt className="text-fog-500">Total income</dt><dd className="font-mono text-fog-100">{money(result.totalIncome)}</dd></div><div className="flex justify-between gap-4"><dt className="text-fog-500">SSF + EPF + CIT</dt><dd className="font-mono text-fog-100">{money(result.retirement)}</dd></div><div className="flex justify-between gap-4"><dt className="text-fog-500">Life insurance applied</dt><dd className="font-mono text-fog-100">{money(result.lifeApplied)}</dd></div><div className="flex justify-between gap-4"><dt className="text-fog-500">Medical insurance applied</dt><dd className="font-mono text-fog-100">{money(result.medicalApplied)}</dd></div><div className="flex justify-between gap-4 border-t border-ink-600 pt-3"><dt className="font-semibold text-fog-200">Net assessable</dt><dd className="font-mono font-semibold text-fog-100">{money(result.assessable)}</dd></div></dl>
      <details className="mt-6 rounded-xl border border-ink-600 bg-ink-850/70"><summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-fog-200 hover:text-mint-300">View detailed breakdown</summary><p className="border-t border-ink-600 px-4 py-3 text-xs leading-relaxed text-fog-500">This estimate uses {config.tax.taxYear} progressive bands for {config.name}. Confirm deductions, rebates, and filing obligations with a qualified tax professional.</p></details>
    </aside>
  </div>;
}
