"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/** Region-aware progressive tax calculator with filing status and payroll deductions. */
export function TaxCalculator() {
  const { region, config } = useRegion();
  const formatters = makeFormatters(region);
  
  const [income, setIncome] = useState(85000);
  const [filingStatus, setFilingStatus] = useState("single");

  // Calculate tax using region brackets (simplified - same brackets for all statuses in this demo)
  let tax = 0;
  let remainingIncome = income;
  for (const bracket of config.tax.brackets) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = bracket.limit !== null 
      ? Math.min(remainingIncome, bracket.limit) 
      : remainingIncome;
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= bracket.limit ?? remainingIncome;
  }

  // Calculate payroll deductions based on region
  let totalDeductions = 0;
  const deductionDetails: { label: string; amount: number }[] = [];
  if (config.tax.payrollDeductions) {
    for (const ded of config.tax.payrollDeductions) {
      const amount = income * ded.rate;
      totalDeductions += amount;
      deductionDetails.push({ label: ded.name, amount });
    }
  }

  const effective = income > 0 ? (tax / income) * 100 : 0;
  const takeHome = income - tax - totalDeductions;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Annual income (${config.currency.code})`}>
          <NumInput value={income} onChange={setIncome} prefix={config.currency.symbol} step={1000} />
        </Field>
        <div className="sm:col-span-2">
          <Field 
            label="Filing Status" 
            hint={`${config.tax.taxYear} · ${config.isEstimate ? "Estimate" : "Verified"} brackets`}
          >
            <select
              value={filingStatus}
              onChange={(e) => setFilingStatus(e.target.value)}
              className="h-[42px] w-full rounded-lg border border-ink-600 bg-ink-850 px-3 font-mono text-[13px] text-fog-300 outline-none focus:border-mint-500/60 focus:ring-2 focus:ring-mint-500/20"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
              <option value="head">Head of Household</option>
            </select>
          </Field>
        </div>
      </div>

      <StatGrid>
        <Stat accent label="Take-home pay" value={formatters.money(takeHome)} sub={`${formatters.money(takeHome / 12)} / month`} />
        <Stat label={config.consumptionTax.label === "VAT" ? "Income Tax" : "Tax"} value={formatters.money(tax)} />
        <Stat label="Effective rate" value={`${formatters.fmt(effective, 1)}%`} />
      </StatGrid>

      {deductionDetails.length > 0 && (
        <div className="mt-4 rounded-xl border border-ink-600/70 bg-ink-850/80 p-4">
          <p className="font-mono text-[10px] font-semibold tracking-widest text-fog-500 uppercase mb-3">
            Payroll Deductions
          </p>
          <div className="space-y-1">
            {deductionDetails.map((d) => (
              <div key={d.label} className="flex justify-between text-[13px] text-fog-300">
                <span>{d.label}</span>
                <span className="font-mono">{formatters.money(d.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {config.isEstimate && config.estimateNote && (
          <p className="text-[11.5px] text-amber-400">
            ⚠️ <strong>Estimate:</strong> {config.estimateNote}
          </p>
        )}
        <p className="text-[11.5px] text-fog-600">
          Estimate only — excludes deductions, credits, state/provincial taxes, and other adjustments.
          For {region === "global" ? "illustrative purposes" : `${config.name}`} calculations, consult a tax professional.
        </p>
      </div>
    </div>
  );
}
