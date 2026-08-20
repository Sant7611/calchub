"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid, currency } from "./shared";

/** Fixed-rate amortized loan. Mirrors the registry's `loan-calculator`. */
export function LoanCalculator() {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(5);

  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? amount / n : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = monthly * n;
  const interest = total - amount;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Loan amount">
          <NumInput value={amount} onChange={setAmount} prefix="$" step={500} />
        </Field>
        <Field label="Interest rate (APR)">
          <NumInput value={rate} onChange={setRate} suffix="%" step={0.1} />
        </Field>
        <Field label="Term">
          <NumInput value={years} onChange={setYears} suffix="yrs" min={1} />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label="Monthly payment" value={currency(monthly, 2)} />
        <Stat label="Total interest" value={currency(interest)} />
        <Stat label="Total repaid" value={currency(total)} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        Fully-amortized, fixed-rate schedule · {n} monthly payments of {currency(monthly, 2)}.
      </p>
    </div>
  );
}
