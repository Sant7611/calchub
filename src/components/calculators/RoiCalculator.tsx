"use client";

import { useMemo, useState } from "react";

import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

export function ROICalculator() {
  const { region, config } = useRegion();

  const formatters = useMemo(() => makeFormatters(region), [region]);

  const [initialInvestment, setInitialInvestment] = useState(10000);

  const [additionalCosts, setAdditionalCosts] = useState(1000);

  const [finalValue, setFinalValue] = useState(14000);

  const [additionalIncome, setAdditionalIncome] = useState(500);

  const [years, setYears] = useState(2);

  const result = useMemo(() => {
    const initial = Math.max(0, initialInvestment);

    const costs = Math.max(0, additionalCosts);

    const endingValue = Math.max(0, finalValue);

    const income = Math.max(0, additionalIncome);

    const duration = Math.max(0, years);

    /*
     * Everything the user actually
     * invested or spent.
     */
    const totalInvested = initial + costs;

    /*
     * Everything the user received.
     */
    const totalReturn = endingValue + income;

    /*
     * Net profit or loss.
     */
    const netProfit = totalReturn - totalInvested;

    /*
     * ROI %
     *
     * ROI =
     * Net Profit / Total Investment × 100
     */
    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    /*
     * Investment multiple.
     *
     * Example:
     * 1.40x means the investment
     * returned 1.4 times the amount
     * invested.
     */
    const investmentMultiple =
      totalInvested > 0 ? totalReturn / totalInvested : 0;

    /*
     * Annualized ROI.
     *
     * This converts the overall
     * investment growth into an
     * equivalent compounded yearly
     * return.
     */
    let annualizedROI: number | null = null;

    if (totalInvested > 0 && totalReturn > 0 && duration > 0) {
      annualizedROI =
        (Math.pow(totalReturn / totalInvested, 1 / duration) - 1) * 100;
    }

    const amountToBreakEven = Math.max(0, totalInvested - totalReturn);

    const amountAboveBreakEven = Math.max(0, totalReturn - totalInvested);

    const returnShare =
      totalInvested > 0
        ? Math.min(100, (totalReturn / totalInvested) * 100)
        : 0;

    const status: "profit" | "loss" | "break-even" =
      netProfit > 0 ? "profit" : netProfit < 0 ? "loss" : "break-even";

    return {
      totalInvested,
      totalReturn,
      netProfit,
      roi,
      annualizedROI,
      investmentMultiple,
      amountToBreakEven,
      amountAboveBreakEven,
      returnShare,
      status,
    };
  }, [initialInvestment, additionalCosts, finalValue, additionalIncome, years]);

  const statusStyles = {
    profit: {
      box: "border-emerald-200 bg-emerald-50",
      label: "text-emerald-700",
      value: "text-emerald-900",
      badge: "bg-emerald-100 text-emerald-700",
      title: "Positive return",
    },

    loss: {
      box: "border-red-200 bg-red-50",
      label: "text-red-700",
      value: "text-red-900",
      badge: "bg-red-100 text-red-700",
      title: "Negative return",
    },

    "break-even": {
      box: "border-amber-200 bg-amber-50",
      label: "text-amber-700",
      value: "text-amber-900",
      badge: "bg-amber-100 text-amber-700",
      title: "Break even",
    },
  };

  const currentStatus = statusStyles[result.status];

  return (
    <div className="w-full">
      {/* =========================================
          INPUTS
      ========================================= */}

      <div className="grid gap-4 md:grid-cols-2">
        <NumberField
          label="Initial investment"
          hint="The amount you originally invested."
          value={initialInvestment}
          onChange={setInitialInvestment}
          prefix={config.currency.symbol}
          step={100}
        />

        <NumberField
          label="Additional costs"
          hint="Fees, maintenance, advertising, commissions or other investment-related expenses."
          value={additionalCosts}
          onChange={setAdditionalCosts}
          prefix={config.currency.symbol}
          step={100}
        />

        <NumberField
          label="Final value"
          hint="The current or final value of the investment."
          value={finalValue}
          onChange={setFinalValue}
          prefix={config.currency.symbol}
          step={100}
        />

        <NumberField
          label="Additional income received"
          hint="Dividends, rent, interest, distributions or other income received."
          value={additionalIncome}
          onChange={setAdditionalIncome}
          prefix={config.currency.symbol}
          step={100}
        />

        <NumberField
          label="Investment period"
          hint="Used to estimate the annualized return."
          value={years}
          onChange={setYears}
          suffix="years"
          step={0.5}
        />
      </div>

      {/* =========================================
          MAIN ROI RESULT
      ========================================= */}

      <div
        className={`
          mt-7
          rounded-2xl
          border
          p-5
          sm:p-6

          ${currentStatus.box}
        `}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className={`
                text-xs
                font-bold
                uppercase
                tracking-wide

                ${currentStatus.label}
              `}
            >
              Return on investment
            </p>

            <p
              className={`
                mt-2
                text-4xl
                font-bold
                tracking-tight
                sm:text-5xl

                ${currentStatus.value}
              `}
            >
              {formatPercent(result.roi)}
            </p>
          </div>

          <span
            className={`
              rounded-full
              px-3
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wide

              ${currentStatus.badge}
            `}
          >
            {currentStatus.title}
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">
          Your total investment of{" "}
          <strong className="text-slate-950">
            {formatters.money(result.totalInvested)}
          </strong>{" "}
          produced a total value of{" "}
          <strong className="text-slate-950">
            {formatters.money(result.totalReturn)}
          </strong>
          .
        </p>
      </div>

      {/* =========================================
          RESULT CARDS
      ========================================= */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ResultCard
          label="Total invested"
          value={formatters.money(result.totalInvested)}
          description="Initial investment plus additional costs"
        />

        <ResultCard
          label="Total value received"
          value={formatters.money(result.totalReturn)}
          description="Final value plus additional income"
        />

        <ResultCard
          label={result.netProfit >= 0 ? "Net profit" : "Net loss"}
          value={formatters.money(Math.abs(result.netProfit))}
          description={
            result.netProfit >= 0
              ? "Amount earned above your investment"
              : "Amount lost compared with your investment"
          }
          status={
            result.netProfit > 0
              ? "positive"
              : result.netProfit < 0
                ? "negative"
                : "neutral"
          }
        />

        <ResultCard
          label="Investment multiple"
          value={`${result.investmentMultiple.toFixed(2)}×`}
          description="Total return compared with money invested"
        />
      </div>

      {/* =========================================
          WHAT THE RESULT MEANS
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">
          What does your ROI mean?
        </h3>

        {result.status === "profit" && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You invested a total of{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(result.totalInvested)}
            </strong>{" "}
            and received{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(result.totalReturn)}
            </strong>
            . That means you made a net profit of{" "}
            <strong className="font-semibold text-emerald-700">
              {formatters.money(result.netProfit)}
            </strong>
            , giving you an ROI of{" "}
            <strong className="font-semibold text-emerald-700">
              {formatPercent(result.roi)}
            </strong>
            .
          </p>
        )}

        {result.status === "loss" && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You invested a total of{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(result.totalInvested)}
            </strong>{" "}
            but received only{" "}
            <strong className="font-semibold text-slate-900">
              {formatters.money(result.totalReturn)}
            </strong>
            . This represents a loss of{" "}
            <strong className="font-semibold text-red-700">
              {formatters.money(Math.abs(result.netProfit))}
            </strong>
            , resulting in an ROI of{" "}
            <strong className="font-semibold text-red-700">
              {formatPercent(result.roi)}
            </strong>
            .
          </p>
        )}

        {result.status === "break-even" && (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your total return is equal to the amount you invested. You have
            currently neither made a profit nor suffered a loss, giving you an
            ROI of 0%.
          </p>
        )}
      </div>

      {/* =========================================
          ANNUALIZED RETURN
      ========================================= */}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Total ROI"
          value={formatPercent(result.roi)}
          description="Return across the entire investment period"
        />

        <InfoCard
          label="Annualized ROI"
          value={
            result.annualizedROI !== null
              ? formatPercent(result.annualizedROI)
              : "N/A"
          }
          description="Equivalent compounded return per year"
        />

        <InfoCard
          label="Investment period"
          value={`${years} ${years === 1 ? "year" : "years"}`}
          description="Time used for annualized ROI"
        />
      </div>

      {/* =========================================
          BREAK-EVEN INFORMATION
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          Break-even position
        </h3>

        {result.status === "loss" ? (
          <>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              You still need an additional{" "}
              <strong className="font-semibold text-slate-900">
                {formatters.money(result.amountToBreakEven)}
              </strong>{" "}
              in value or income to recover your total investment.
            </p>

            <ProgressBar percentage={result.returnShare} />

            <p className="mt-2 text-[11px] text-slate-500">
              You have recovered approximately {result.returnShare.toFixed(1)}%
              of your investment.
            </p>
          </>
        ) : result.status === "profit" ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You are currently{" "}
            <strong className="font-semibold text-emerald-700">
              {formatters.money(result.amountAboveBreakEven)}
            </strong>{" "}
            above your break-even point.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You have exactly recovered your total investment and are currently
            at the break-even point.
          </p>
        )}
      </div>

      {/* =========================================
          HOW ROI IS CALCULATED
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          How is ROI calculated?
        </h3>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-mono text-xs leading-6 text-slate-700">
            ROI = (Net Profit ÷ Total Investment) × 100
          </p>
        </div>

        <p className="mt-4 text-xs leading-6 text-slate-600">
          In this calculator, total investment includes both the initial
          investment and any additional costs. Total return includes the final
          value of the investment plus any additional income you received.
        </p>
      </div>

      {/* =========================================
          YOUR CALCULATION
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">Your calculation</h3>

        <div className="mt-4 space-y-3">
          <CalculationRow
            label="Initial investment"
            value={formatters.money(initialInvestment)}
          />

          <CalculationRow
            label="Additional costs"
            value={formatters.money(additionalCosts)}
          />

          <CalculationRow
            label="Total invested"
            value={formatters.money(result.totalInvested)}
            strong
          />

          <div className="border-t border-slate-200" />

          <CalculationRow
            label="Final value"
            value={formatters.money(finalValue)}
          />

          <CalculationRow
            label="Additional income"
            value={formatters.money(additionalIncome)}
          />

          <CalculationRow
            label="Total return"
            value={formatters.money(result.totalReturn)}
            strong
          />

          <div className="border-t border-slate-200" />

          <CalculationRow
            label={result.netProfit >= 0 ? "Net profit" : "Net loss"}
            value={formatters.money(Math.abs(result.netProfit))}
            strong
          />

          <CalculationRow
            label="ROI"
            value={formatPercent(result.roi)}
            strong
          />
        </div>
      </div>

      {/* =========================================
          EDUCATIONAL CONTENT
      ========================================= */}

      <div className="mt-7 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          How to interpret ROI
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          A positive ROI means the investment generated more value than it cost.
          A negative ROI means the investment lost value, while an ROI of 0%
          means you recovered exactly what you invested.
        </p>

        <p className="mt-3 text-xs leading-6 text-slate-600">
          ROI is useful for comparing investments, but the time required to
          produce the return also matters. For example, a 30% return earned in
          one year is very different from the same 30% return earned over ten
          years. That is why this calculator also shows an annualized return.
        </p>
      </div>

      {/* DISCLAIMER */}

      <p className="mt-5 text-[11px] leading-5 text-slate-500">
        This calculator provides a general ROI estimate. It does not
        automatically account for taxes, inflation, financing costs, risk,
        changing cash flows or the time value of money. Consider those factors
        when evaluating real-world investments.
      </p>
    </div>
  );
}

/* =============================================
   NUMBER FIELD
============================================= */

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

  onChange: (value: number) => void;

  prefix?: string;
  suffix?: string;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">{label}</span>

      {hint && (
        <p className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</p>
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
            const next = Number(event.target.value);

            onChange(Number.isFinite(next) ? next : 0);
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

/* =============================================
   RESULT CARD
============================================= */

function ResultCard({
  label,
  value,
  description,
  status = "neutral",
}: {
  label: string;
  value: string;
  description: string;

  status?: "positive" | "negative" | "neutral";
}) {
  const styles = {
    positive: "border-emerald-200 bg-emerald-50",

    negative: "border-red-200 bg-red-50",

    neutral: "border-slate-200 bg-white",
  };

  const valueStyles = {
    positive: "text-emerald-800",

    negative: "text-red-800",

    neutral: "text-slate-900",
  };

  return (
    <div
      className={`
        rounded-xl
        border
        p-4

        ${styles[status]}
      `}
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-lg
          font-bold

          ${valueStyles[status]}
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">{description}</p>
    </div>
  );
}

/* =============================================
   INFO CARD
============================================= */

function InfoCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">{description}</p>
    </div>
  );
}

/* =============================================
   CALCULATION ROW
============================================= */

function CalculationRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-xs font-semibold text-slate-800"
            : "text-xs text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-sm font-bold text-slate-900"
            : "text-xs font-medium text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
}

/* =============================================
   BREAK-EVEN PROGRESS
============================================= */

function ProgressBar({ percentage }: { percentage: number }) {
  const safePercentage = Math.max(0, Math.min(100, percentage));

  return (
    <div className="mt-4">
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{
            width: `${safePercentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =============================================
   FORMAT PERCENT
============================================= */

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) {
    return "0.00%";
  }

  const sign = value > 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}
