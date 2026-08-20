"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/** Simplified progressive brackets (demo). Mirrors `tax-calculator`. */
export function TaxCalculator() {
  const { region, config } = useRegion();
  const formatters = makeFormatters(region);
  
  const [income, setIncome] = useState(85000);

  let tax = 0;
  let prev = 0;
  for (const b of config.taxBrackets) {
    if (income > prev) {
      tax += (Math.min(income, b.limit) - prev) * b.rate;
      prev = b.limit;
    }
  }
  const effective = income > 0 ? (tax / income) * 100 : 0;
  const takeHome = income - tax;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Annual income (${config.currencyCode})`}>
          <NumInput value={income} onChange={setIncome} prefix={config.currencySymbol} step={1000} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Filing" hint={`Demo uses ${config.taxYear} brackets.`}>
            <div className="flex h-[42px] items-center rounded-lg border border-ink-600 bg-ink-850 px-3 font-mono text-[13px] text-fog-300">
              {config.defaultTaxLabel} · simplified brackets
            </div>
          </Field>
        </div>
      </div>

      <StatGrid>
        <Stat accent label="Take-home pay" value={formatters.money(takeHome)} sub={`${formatters.money(takeHome / 12)} / month`} />
        <Stat label="Tax owed" value={formatters.money(tax)} />
        <Stat label="Effective rate" value={`${formatters.fmt(effective, 1)}%`} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        Estimate only — excludes deductions, credits, state and payroll taxes.
      </p>
    </div>
  );
}
