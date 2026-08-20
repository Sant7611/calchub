import { useState } from "react";
import { Bar, Field, NumInput, currency } from "./shared";

/** 50/30/20 allocation of net income. Mirrors `budget-planner`. */
export function BudgetPlanner() {
  const [income, setIncome] = useState(5200);

  const needs = income * 0.5;
  const wants = income * 0.3;
  const savings = income * 0.2;

  return (
    <div>
      <div className="max-w-xs">
        <Field label="Monthly net income" hint="After tax — what actually lands in your account.">
          <NumInput value={income} onChange={setIncome} prefix="$" step={100} />
        </Field>
      </div>

      <div className="mt-6 space-y-4">
        <Bar label="Needs · 50%" value={currency(needs)} pct={50} color="bg-mint-400" />
        <Bar label="Wants · 30%" value={currency(wants)} pct={30} color="bg-amber-400" />
        <Bar label="Savings · 20%" value={currency(savings)} pct={20} color="bg-sky-400" />
      </div>

      <p className="mt-5 text-[11.5px] text-fog-600">
        The 50/30/20 rule: essentials, lifestyle, then future-you. Adjust the split to match your goals.
      </p>
    </div>
  );
}
