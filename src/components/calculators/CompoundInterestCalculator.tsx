"use client";

import { useMemo, useState } from "react";

import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

type CompoundingFrequency =
  | "annually"
  | "semiannually"
  | "quarterly"
  | "monthly"
  | "daily"
  | "continuous";

type ContributionTiming =
  | "end"
  | "beginning";

interface YearlyResult {
  year: number;
  balance: number;
  contributed: number;
  interestEarned: number;
}

const COMPOUNDING_OPTIONS: {
  value: CompoundingFrequency;
  label: string;
  periods: number | null;
}[] = [
  {
    value: "annually",
    label: "Annually",
    periods: 1,
  },
  {
    value: "semiannually",
    label: "Semi-annually",
    periods: 2,
  },
  {
    value: "quarterly",
    label: "Quarterly",
    periods: 4,
  },
  {
    value: "monthly",
    label: "Monthly",
    periods: 12,
  },
  {
    value: "daily",
    label: "Daily",
    periods: 365,
  },
  {
    value: "continuous",
    label: "Continuously",
    periods: null,
  },
];

export function CompoundInterestCalculator() {
  const { region, config } =
    useRegion();

  const formatters = useMemo(
    () => makeFormatters(region),
    [region]
  );

  const [principal, setPrincipal] =
    useState(10000);

  const [monthlyContribution, setMonthlyContribution] =
    useState(500);

  const [annualRate, setAnnualRate] =
    useState(8);

  const [years, setYears] =
    useState(10);

  const [compounding, setCompounding] =
    useState<CompoundingFrequency>(
      "monthly"
    );

  const [contributionTiming, setContributionTiming] =
    useState<ContributionTiming>(
      "end"
    );

  const result = useMemo(() => {
    const safePrincipal =
      Math.max(0, principal);

    const safeContribution =
      Math.max(
        0,
        monthlyContribution
      );

    const safeYears =
      Math.max(0, years);

    const rate =
      Math.max(0, annualRate) /
      100;

    const months =
      Math.round(
        safeYears * 12
      );

    /*
     * Calculate an equivalent monthly
     * growth rate based on the selected
     * compounding frequency.
     *
     * Example:
     * Monthly compounding:
     * (1 + r/12)^(12/12) - 1
     */
    let monthlyRate = 0;

    if (
      compounding ===
      "continuous"
    ) {
      monthlyRate =
        Math.exp(rate / 12) -
        1;
    } else {
      const option =
        COMPOUNDING_OPTIONS.find(
          (item) =>
            item.value ===
            compounding
        );

      const periods =
        option?.periods ?? 12;

      monthlyRate =
        Math.pow(
          1 +
            rate /
              periods,
          periods / 12
        ) - 1;
    }

    let balance =
      safePrincipal;

    let totalContributions =
      safePrincipal;

    const yearlyResults: YearlyResult[] =
      [];

    for (
      let month = 1;
      month <= months;
      month++
    ) {
      /*
       * Contribution at beginning
       * receives this month's growth.
       */
      if (
        contributionTiming ===
        "beginning"
      ) {
        balance +=
          safeContribution;

        totalContributions +=
          safeContribution;
      }

      /*
       * Apply compound growth.
       */
      balance *=
        1 + monthlyRate;

      /*
       * End-of-month contribution
       * is deposited after growth.
       */
      if (
        contributionTiming ===
        "end"
      ) {
        balance +=
          safeContribution;

        totalContributions +=
          safeContribution;
      }

      /*
       * Add a row every 12 months.
       */
      if (
        month % 12 === 0
      ) {
        yearlyResults.push({
          year: month / 12,

          balance,

          contributed:
            totalContributions,

          interestEarned:
            Math.max(
              0,
              balance -
                totalContributions
            ),
        });
      }
    }

    /*
     * Handle partial final year
     * such as 5.5 years.
     */
    if (
      months > 0 &&
      months % 12 !== 0
    ) {
      yearlyResults.push({
        year:
          Math.round(
            (months / 12) *
              100
          ) / 100,

        balance,

        contributed:
          totalContributions,

        interestEarned:
          Math.max(
            0,
            balance -
              totalContributions
          ),
      });
    }

    const interestEarned =
      Math.max(
        0,
        balance -
          totalContributions
      );

    const contributionTotal =
      safeContribution *
      months;

    const interestShare =
      balance > 0
        ? (interestEarned /
            balance) *
          100
        : 0;

    const contributionShare =
      balance > 0
        ? (totalContributions /
            balance) *
          100
        : 0;

    return {
      futureValue: balance,

      initialPrincipal:
        safePrincipal,

      contributionTotal,

      totalContributions,

      interestEarned,

      monthlyRate,

      effectiveAnnualRate:
        Math.pow(
          1 +
            monthlyRate,
          12
        ) - 1,

      interestShare,

      contributionShare,

      yearlyResults,
    };
  }, [
    principal,
    monthlyContribution,
    annualRate,
    years,
    compounding,
    contributionTiming,
  ]);

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────
          INPUTS
      ───────────────────────────────────── */}

      <div className="grid gap-4 md:grid-cols-2">
        <NumberField
          label="Initial investment"
          hint="The amount you are starting with."
          value={principal}
          onChange={setPrincipal}
          prefix={
            config.currency.symbol
          }
          step={100}
        />

        <NumberField
          label="Monthly contribution"
          hint="How much you plan to add every month."
          value={
            monthlyContribution
          }
          onChange={
            setMonthlyContribution
          }
          prefix={
            config.currency.symbol
          }
          step={50}
        />

        <NumberField
          label="Annual interest rate"
          hint="Expected yearly interest or return."
          value={annualRate}
          onChange={setAnnualRate}
          suffix="%"
          step={0.1}
        />

        <NumberField
          label="Investment period"
          hint="How long the money will remain invested."
          value={years}
          onChange={setYears}
          suffix="years"
          step={1}
        />

        {/* Compounding */}

        <label className="block">
          <span className="text-xs font-semibold text-slate-700">
            Compounding frequency
          </span>

          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            How often interest is
            added to the balance.
          </p>

          <select
            value={compounding}
            onChange={(event) =>
              setCompounding(
                event.target
                  .value as CompoundingFrequency
              )
            }
            className="
              mt-2
              w-full
              rounded-xl
              border
              border-slate-300
              bg-white
              px-3
              py-3
              text-sm
              font-medium
              text-slate-900
              outline-none
              transition

              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
          >
            {COMPOUNDING_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              )
            )}
          </select>
        </label>

        {/* Contribution timing */}

        <label className="block">
          <span className="text-xs font-semibold text-slate-700">
            Contribution timing
          </span>

          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            Choose when monthly
            contributions are added.
          </p>

          <select
            value={
              contributionTiming
            }
            onChange={(event) =>
              setContributionTiming(
                event.target
                  .value as ContributionTiming
              )
            }
            className="
              mt-2
              w-full
              rounded-xl
              border
              border-slate-300
              bg-white
              px-3
              py-3
              text-sm
              font-medium
              text-slate-900
              outline-none
              transition

              focus:border-blue-500
              focus:ring-4
              focus:ring-blue-500/10
            "
          >
            <option value="end">
              End of each month
            </option>

            <option value="beginning">
              Beginning of each month
            </option>
          </select>
        </label>
      </div>

      {/* ─────────────────────────────────────
          MAIN RESULT
      ───────────────────────────────────── */}

      <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          Estimated future value
        </p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {formatters.money(
            result.futureValue
          )}
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700">
          After{" "}
          <strong>
            {years}{" "}
            {years === 1
              ? "year"
              : "years"}
          </strong>
          , your investment could grow
          to approximately{" "}
          <strong>
            {formatters.money(
              result.futureValue
            )}
          </strong>
          .
        </p>
      </div>

      {/* ─────────────────────────────────────
          RESULT CARDS
      ───────────────────────────────────── */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard
          label="Initial investment"
          value={formatters.money(
            result.initialPrincipal
          )}
          description="Amount you started with"
        />

        <ResultCard
          label="Additional contributions"
          value={formatters.money(
            result.contributionTotal
          )}
          description="Money added over time"
        />

        <ResultCard
          label="Total contributed"
          value={formatters.money(
            result.totalContributions
          )}
          description="Your own money invested"
        />

        <ResultCard
          label="Interest earned"
          value={formatters.money(
            result.interestEarned
          )}
          description="Growth generated by compounding"
          highlight
        />
      </div>

      {/* ─────────────────────────────────────
          EXPLANATION
      ───────────────────────────────────── */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">
          What does your result
          mean?
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          You would personally
          contribute approximately{" "}
          <strong className="font-semibold text-slate-900">
            {formatters.money(
              result.totalContributions
            )}
          </strong>{" "}
          over the investment period.
          Compound growth would add an
          estimated{" "}
          <strong className="font-semibold text-emerald-700">
            {formatters.money(
              result.interestEarned
            )}
          </strong>
          , bringing the final balance
          to approximately{" "}
          <strong className="font-semibold text-slate-950">
            {formatters.money(
              result.futureValue
            )}
          </strong>
          .
        </p>

        {result.futureValue >
          0 && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Approximately{" "}
            {result.interestShare.toFixed(
              1
            )}
            % of the final balance
            comes from compound growth,
            while{" "}
            {result.contributionShare.toFixed(
              1
            )}
            % comes from the money you
            contributed.
          </p>
        )}
      </div>

      {/* ─────────────────────────────────────
          GROWTH BREAKDOWN
      ───────────────────────────────────── */}

      <div className="mt-6 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          Your investment growth
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Compare how much of the
          final balance comes from your
          contributions and how much
          comes from compound interest.
        </p>

        <div className="mt-5">
          <GrowthBar
            label="Money contributed"
            amount={formatters.money(
              result.totalContributions
            )}
            percentage={
              result.contributionShare
            }
            color="bg-blue-500"
          />

          <div className="mt-4">
            <GrowthBar
              label="Interest earned"
              amount={formatters.money(
                result.interestEarned
              )}
              percentage={
                result.interestShare
              }
              color="bg-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────
          RATE INFORMATION
      ───────────────────────────────────── */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Stated annual rate"
          value={`${annualRate.toFixed(
            2
          )}%`}
        />

        <InfoCard
          label="Effective annual rate"
          value={`${(
            result.effectiveAnnualRate *
            100
          ).toFixed(2)}%`}
        />
      </div>

      {/* ─────────────────────────────────────
          YEAR BY YEAR TABLE
      ───────────────────────────────────── */}

      {result.yearlyResults.length >
        0 && (
        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
            <h3 className="text-sm font-bold text-slate-900">
              Year-by-year growth
            </h3>

            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              See how your balance and
              compound interest grow
              over time.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">
                    Year
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Contributed
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Interest
                  </th>

                  <th className="px-4 py-3 text-right font-semibold">
                    Balance
                  </th>
                </tr>
              </thead>

              <tbody>
                {result.yearlyResults.map(
                  (row) => (
                    <tr
                      key={row.year}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {Number.isInteger(
                          row.year
                        )
                          ? `Year ${row.year}`
                          : `${row.year} years`}
                      </td>

                      <td className="px-4 py-3 text-right text-xs text-slate-600">
                        {formatters.money(
                          row.contributed
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-medium text-emerald-700">
                        {formatters.money(
                          row.interestEarned
                        )}
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-bold text-slate-900">
                        {formatters.money(
                          row.balance
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────
          EDUCATIONAL CONTENT
      ───────────────────────────────────── */}

      <div className="mt-7 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          How compound interest works
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          Compound interest means you
          earn returns not only on your
          original investment but also
          on the interest that has
          already accumulated. As the
          balance grows, the amount
          generating future interest
          becomes larger.
        </p>

        <p className="mt-3 text-xs leading-6 text-slate-600">
          Regular contributions can
          significantly increase the
          final balance because each
          contribution also gets time
          to compound. Generally,
          investing earlier gives your
          money more time to benefit
          from compound growth.
        </p>
      </div>

      {/* DISCLAIMER */}

      <p className="mt-5 text-[11px] leading-5 text-slate-500">
        This calculator provides an
        estimate based on a constant
        interest rate and regular
        contributions. Actual
        investment returns, bank rates,
        taxes, fees and inflation may
        cause real results to differ.
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════
   NUMBER INPUT
════════════════════════════════════════════ */

function NumberField({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (
    value: number
  ) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">
        {label}
      </span>

      {hint && (
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          {hint}
        </p>
      )}

      <div
        className="
          mt-2
          flex
          items-center
          rounded-xl
          border
          border-slate-300
          bg-white
          transition

          focus-within:border-blue-500
          focus-within:ring-4
          focus-within:ring-blue-500/10
        "
      >
        {prefix && (
          <span className="pl-3 text-sm font-medium text-slate-500">
            {prefix}
          </span>
        )}

        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(event) => {
            const nextValue =
              Number(
                event.target.value
              );

            onChange(
              Number.isFinite(
                nextValue
              )
                ? nextValue
                : 0
            );
          }}
          className="
            min-w-0
            flex-1
            bg-transparent
            px-3
            py-3
            text-sm
            font-semibold
            text-slate-900
            outline-none
          "
        />

        {suffix && (
          <span className="pr-3 text-xs font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

/* ════════════════════════════════════════════
   RESULT CARD
════════════════════════════════════════════ */

function ResultCard({
  label,
  value,
  description,
  highlight = false,
}: {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4

        ${
          highlight
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <p
        className={`
          text-[10px]
          font-bold
          uppercase
          tracking-wide

          ${
            highlight
              ? "text-emerald-700"
              : "text-slate-500"
          }
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-lg
          font-bold

          ${
            highlight
              ? "text-emerald-900"
              : "text-slate-900"
          }
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════
   GROWTH BAR
════════════════════════════════════════════ */

function GrowthBar({
  label,
  amount,
  percentage,
  color,
}: {
  label: string;
  amount: string;
  percentage: number;
  color: string;
}) {
  const safePercentage =
    Math.max(
      0,
      Math.min(
        100,
        percentage
      )
    );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-600">
          {label}
        </p>

        <p className="text-xs font-bold text-slate-900">
          {amount}
        </p>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-right text-[10px] text-slate-500">
        {safePercentage.toFixed(
          1
        )}
        % of final balance
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════
   INFO CARD
════════════════════════════════════════════ */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}