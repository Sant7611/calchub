import { useState } from "react";
import { Field, NumInput, Stat, StatGrid, currency } from "./shared";

/** Home price → monthly mortgage. Mirrors `mortgage-calculator`. */
export function MortgageCalculator() {
  const [price, setPrice] = useState(420000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.1);
  const [years, setYears] = useState(30);

  const down = price * (downPct / 100);
  const principal = price - down;
  const r = rate / 100 / 12;
  const n = years * 12;
  const monthly = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const interest = monthly * n - principal;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Home price">
          <NumInput value={price} onChange={setPrice} prefix="$" step={5000} />
        </Field>
        <Field label="Down payment">
          <NumInput value={downPct} onChange={setDownPct} suffix="%" step={1} />
        </Field>
        <Field label="Rate (APR)">
          <NumInput value={rate} onChange={setRate} suffix="%" step={0.1} />
        </Field>
        <Field label="Term">
          <NumInput value={years} onChange={setYears} suffix="yrs" min={1} />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label="Monthly (P&I)" value={currency(monthly, 2)} />
        <Stat label="Loan amount" value={currency(principal)} sub={`after ${currency(down)} down`} />
        <Stat label="Lifetime interest" value={currency(interest)} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        Principal &amp; interest only — add taxes, insurance and HOA for a full monthly budget.
      </p>
    </div>
  );
}
