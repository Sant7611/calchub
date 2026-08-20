"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid, currency, number } from "./shared";

/** Simplified progressive brackets (demo). Mirrors `tax-calculator`. */
const BRACKETS = [
  { upTo: 11600, rate: 0.1 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: Infinity, rate: 0.32 },
];

export function TaxCalculator() {
  const [income, setIncome] = useState(85000);

  let tax = 0;
  let prev = 0;
  for (const b of BRACKETS) {
    if (income > prev) {
      tax += (Math.min(income, b.upTo) - prev) * b.rate;
      prev = b.upTo;
    }
  }
  const effective = income > 0 ? (tax / income) * 100 : 0;
  const takeHome = income - tax;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Annual income">
          <NumInput value={income} onChange={setIncome} prefix="$" step={1000} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Filing" hint="Demo uses illustrative single-filer brackets.">
            <div className="flex h-[42px] items-center rounded-lg border border-ink-600 bg-ink-850 px-3 font-mono text-[13px] text-fog-300">
              Single · simplified brackets
            </div>
          </Field>
        </div>
      </div>

      <StatGrid>
        <Stat accent label="Take-home pay" value={currency(takeHome)} sub={`${currency(takeHome / 12)} / month`} />
        <Stat label="Tax owed" value={currency(tax)} />
        <Stat label="Effective rate" value={`${number(effective, 1)}%`} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        Estimate only — excludes deductions, credits, state and payroll taxes.
      </p>
    </div>
  );
}
