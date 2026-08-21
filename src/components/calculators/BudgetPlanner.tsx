"use client";

import { useMemo, useState } from "react";

import {
  Bar,
  Field,
  NumInput,
} from "./shared";

import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/**
 * 50/30/20 Budget Calculator
 *
 * 50% → Needs
 * 30% → Wants
 * 20% → Savings / financial goals
 */
export function BudgetPlanner() {
  const { region, config } =
    useRegion();

  const formatters = useMemo(
    () => makeFormatters(region),
    [region]
  );

  const [income, setIncome] =
    useState(5200);

  const safeIncome =
    Math.max(0, income);

  const needs =
    safeIncome * 0.5;

  const wants =
    safeIncome * 0.3;

  const savings =
    safeIncome * 0.2;

  return (
    <div className="w-full">
      {/* INPUT */}

      <div className="max-w-sm">
        <Field
          label={`Monthly net income (${config.currency.code})`}
          hint="Enter the amount you actually receive each month after tax and other deductions."
        >
          <NumInput
            value={income}
            onChange={setIncome}
            prefix={
              config.currency.symbol
            }
            step={100}
          />
        </Field>
      </div>

      {/* RESULT INTRODUCTION */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-medium text-slate-500">
          Your monthly take-home income
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {formatters.money(
            safeIncome
          )}
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Based on the 50/30/20
          budgeting guideline, here is
          one way you could divide your
          monthly income.
        </p>
      </div>

      {/* ALLOCATION BARS */}

      <div className="mt-6 space-y-6">
        {/* NEEDS */}

        <div>
          <Bar
            label="Needs · 50%"
            value={formatters.money(
              needs
            )}
            pct={50}
            color="bg-emerald-500"
          />

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Aim to spend around{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(
                needs
              )}
            </strong>{" "}
            or less each month on
            essential expenses you
            normally cannot avoid.
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Examples: rent or mortgage,
            groceries, electricity,
            water, transportation,
            insurance and essential
            healthcare.
          </p>
        </div>

        {/* WANTS */}

        <div>
          <Bar
            label="Wants · 30%"
            value={formatters.money(
              wants
            )}
            pct={30}
            color="bg-amber-500"
          />

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Around{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(
                wants
              )}
            </strong>{" "}
            can be used for optional
            spending that improves your
            lifestyle but is not
            essential.
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Examples: restaurants,
            entertainment, shopping,
            streaming subscriptions,
            hobbies and vacations.
          </p>
        </div>

        {/* SAVINGS */}

        <div>
          <Bar
            label="Savings & Goals · 20%"
            value={formatters.money(
              savings
            )}
            pct={20}
            color="bg-blue-500"
          />

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Try to set aside about{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(
                savings
              )}
            </strong>{" "}
            each month for your future
            financial goals.
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Examples: emergency fund,
            savings, investments,
            retirement contributions or
            paying down debt faster.
          </p>
        </div>
      </div>

      {/* EXACT OUTCOME */}

      <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          What your result means
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          With a monthly take-home
          income of{" "}
          <strong className="text-slate-950">
            {formatters.money(
              safeIncome
            )}
          </strong>
          , the 50/30/20 guideline
          suggests spending no more
          than approximately{" "}
          <strong className="text-slate-950">
            {formatters.money(
              needs
            )}
          </strong>{" "}
          on needs and{" "}
          <strong className="text-slate-950">
            {formatters.money(
              wants
            )}
          </strong>{" "}
          on wants, while aiming to
          direct approximately{" "}
          <strong className="text-slate-950">
            {formatters.money(
              savings
            )}
          </strong>{" "}
          toward savings and financial
          goals every month.
        </p>
      </div>

      {/* QUICK SUMMARY */}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <BudgetSummary
          label="Needs"
          amount={formatters.money(
            needs
          )}
          description="Maximum suggested essential spending"
        />

        <BudgetSummary
          label="Wants"
          amount={formatters.money(
            wants
          )}
          description="Suggested lifestyle spending"
        />

        <BudgetSummary
          label="Savings"
          amount={formatters.money(
            savings
          )}
          description="Suggested amount for your future"
        />
      </div>

      {/* EDUCATIONAL SECTION */}

      <div className="mt-7 rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          How should you use these
          numbers?
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          Treat these amounts as
          budgeting targets rather than
          strict limits. First compare
          your actual monthly spending
          with each category. If your
          needs are higher than 50%,
          you may need to temporarily
          reduce wants or adjust your
          savings target.
        </p>

        <p className="mt-3 text-xs leading-6 text-slate-600">
          Similarly, spending less than
          the suggested amount on wants
          does not mean you need to
          spend the remaining money.
          You can move the difference
          toward savings, investments,
          debt repayment or another
          financial goal.
        </p>
      </div>

      {/* DISCLAIMER */}

      <p className="mt-5 text-[11px] leading-5 text-slate-500">
        The 50/30/20 rule is a general
        budgeting guideline, not a
        requirement. Your ideal budget
        may differ depending on income,
        living costs, family size,
        debts, location and financial
        goals.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SUMMARY CARD
───────────────────────────────────────────── */

function BudgetSummary({
  label,
  amount,
  description,
}: {
  label: string;
  amount: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {amount}
      </p>

      <p className="mt-2 text-[11px] leading-4 text-slate-500">
        {description}
      </p>
    </div>
  );
}