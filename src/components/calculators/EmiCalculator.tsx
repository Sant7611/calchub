"use client";

import { useMemo, useState } from "react";

import {
  getAllRegions,
  getRegionConfig,
  type Region,
} from "@/config/regions";

import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/* ══════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════ */

export type LoanType =
  | "home"
  | "car"
  | "bike"
  | "personal"
  | "education"
  | "business"
  | "general";

interface LoanTypeInfo {
  label: string;
  shortLabel: string;
  icon: string;
  description: string;

  /*
   * Used only to generate sensible starting values.
   * These are NOT live lender rates.
   */
  amountMultiplier: number;
  rateAdjustment: number;
  defaultYears: number;
}

interface EmiResult {
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  totalMonths: number;

  firstMonthInterest: number;
  firstMonthPrincipal: number;

  interestRatio: number;
  principalShare: number;
  interestShare: number;
}

interface ScheduleRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

/* ══════════════════════════════════════════════════════════
   REGIONS
══════════════════════════════════════════════════════════ */

const REGION_OPTIONS = getAllRegions();

const REGION_FLAGS: Record<Region, string> = {
  global: "🌍",
  usa: "🇺🇸",
  nepal: "🇳🇵",
  india: "🇮🇳",
  uk: "🇬🇧",
  canada: "🇨🇦",
  australia: "🇦🇺",
};

/*
 * Illustrative defaults.
 *
 * They are only starting values for the calculator.
 * They should not be presented as current market rates.
 */

const BASE_LOAN_AMOUNTS: Record<Region, number> = {
  global: 10_000,
  usa: 25_000,
  nepal: 1_000_000,
  india: 1_000_000,
  uk: 20_000,
  canada: 30_000,
  australia: 40_000,
};

const BASE_INTEREST_RATES: Record<Region, number> = {
  global: 5,
  usa: 6.5,
  nepal: 11,
  india: 8.5,
  uk: 5.25,
  canada: 5.5,
  australia: 6,
};

/* ══════════════════════════════════════════════════════════
   LOAN TYPES
══════════════════════════════════════════════════════════ */

const LOAN_TYPES: Record<LoanType, LoanTypeInfo> = {
  home: {
    label: "Home Loan",
    shortLabel: "Home",
    icon: "🏠",
    description:
      "Estimate monthly EMI for a home purchase, housing loan, or mortgage-style loan.",
    amountMultiplier: 8,
    rateAdjustment: -1,
    defaultYears: 20,
  },

  car: {
    label: "Car Loan",
    shortLabel: "Car",
    icon: "🚗",
    description:
      "Calculate vehicle finance EMI for a new or used car purchase.",
    amountMultiplier: 2,
    rateAdjustment: 0,
    defaultYears: 5,
  },

  bike: {
    label: "Bike Loan",
    shortLabel: "Bike",
    icon: "🏍️",
    description:
      "Estimate EMI for motorcycles, scooters, and other two-wheeler financing.",
    amountMultiplier: 0.35,
    rateAdjustment: 1,
    defaultYears: 3,
  },

  personal: {
    label: "Personal Loan",
    shortLabel: "Personal",
    icon: "💳",
    description:
      "Estimate monthly repayments for unsecured personal borrowing.",
    amountMultiplier: 1,
    rateAdjustment: 3,
    defaultYears: 5,
  },

  education: {
    label: "Education Loan",
    shortLabel: "Education",
    icon: "🎓",
    description:
      "Calculate EMI for education, tuition, study, and student financing.",
    amountMultiplier: 1.5,
    rateAdjustment: 0.5,
    defaultYears: 7,
  },

  business: {
    label: "Business Loan",
    shortLabel: "Business",
    icon: "💼",
    description:
      "Estimate repayments for business, startup, and working-capital loans.",
    amountMultiplier: 3,
    rateAdjustment: 2,
    defaultYears: 7,
  },

  general: {
    label: "General Loan",
    shortLabel: "General",
    icon: "🧮",
    description:
      "Calculate EMI for any standard reducing-balance installment loan.",
    amountMultiplier: 1,
    rateAdjustment: 0,
    defaultYears: 5,
  },
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */

function getDefaultValues(
  region: Region,
  loanType: LoanType
) {
  const type = LOAN_TYPES[loanType];

  const amount = Math.max(
    1,
    Math.round(
      BASE_LOAN_AMOUNTS[region] *
        type.amountMultiplier
    )
  );

  const rate = Math.max(
    0,
    BASE_INTEREST_RATES[region] +
      type.rateAdjustment
  );

  return {
    amount,
    rate,
    years: type.defaultYears,
  };
}

/**
 * Standard reducing-balance EMI formula:
 *
 * EMI =
 * P × R × (1 + R)^N
 * ------------------
 *      (1 + R)^N - 1
 *
 * P = principal
 * R = monthly interest rate
 * N = total number of payments
 */
function calculateEmi(
  amount: number,
  annualRate: number,
  years: number
): EmiResult {
  const totalMonths = years * 12;

  if (
    amount <= 0 ||
    totalMonths <= 0 ||
    annualRate < 0
  ) {
    return {
      monthlyEmi: 0,
      totalInterest: 0,
      totalRepayment: 0,
      totalMonths: 0,

      firstMonthInterest: 0,
      firstMonthPrincipal: 0,

      interestRatio: 0,
      principalShare: 0,
      interestShare: 0,
    };
  }

  const monthlyRate =
    annualRate / 100 / 12;

  let monthlyEmi = 0;

  if (monthlyRate === 0) {
    monthlyEmi =
      amount / totalMonths;
  } else {
    const growthFactor = Math.pow(
      1 + monthlyRate,
      totalMonths
    );

    monthlyEmi =
      (amount *
        monthlyRate *
        growthFactor) /
      (growthFactor - 1);
  }

  const totalRepayment =
    monthlyEmi * totalMonths;

  const totalInterest =
    Math.max(
      0,
      totalRepayment - amount
    );

  const firstMonthInterest =
    amount * monthlyRate;

  const firstMonthPrincipal =
    Math.max(
      0,
      monthlyEmi -
        firstMonthInterest
    );

  const interestRatio =
    amount > 0
      ? (totalInterest / amount) * 100
      : 0;

  const principalShare =
    totalRepayment > 0
      ? (amount / totalRepayment) * 100
      : 0;

  const interestShare =
    totalRepayment > 0
      ? (totalInterest /
          totalRepayment) *
        100
      : 0;

  return {
    monthlyEmi,
    totalInterest,
    totalRepayment,
    totalMonths,

    firstMonthInterest,
    firstMonthPrincipal,

    interestRatio,
    principalShare,
    interestShare,
  };
}

function buildAmortizationPreview(
  amount: number,
  annualRate: number,
  years: number,
  monthlyEmi: number
): ScheduleRow[] {
  if (
    amount <= 0 ||
    years <= 0 ||
    monthlyEmi <= 0
  ) {
    return [];
  }

  const monthlyRate =
    annualRate / 100 / 12;

  const maxMonths = Math.min(
    years * 12,
    12
  );

  let balance = amount;

  const rows: ScheduleRow[] = [];

  for (
    let month = 1;
    month <= maxMonths;
    month++
  ) {
    const interest =
      balance * monthlyRate;

    const principal =
      monthlyRate === 0
        ? monthlyEmi
        : monthlyEmi - interest;

    const actualPrincipal =
      Math.min(
        balance,
        Math.max(0, principal)
      );

    balance = Math.max(
      0,
      balance - actualPrincipal
    );

    rows.push({
      month,
      emi:
        balance === 0
          ? actualPrincipal + interest
          : monthlyEmi,
      principal: actualPrincipal,
      interest,
      balance,
    });

    if (balance <= 0) {
      break;
    }
  }

  return rows;
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */

interface LoanCalculatorProps {
  defaultLoanType?: LoanType;
}

export function EmiCalculator({ defaultLoanType = "general" }: LoanCalculatorProps) {
  const {
    region,
    setRegion,
    config,
  } = useRegion();

  const formatters = useMemo(
    () => makeFormatters(region),
    [region]
  );

  /* ── Loan type ─────────────────────────────────────── */

  const [loanType, setLoanType] =
    useState<LoanType>(defaultLoanType);

  const initialValues =
    getDefaultValues(
      region,
      defaultLoanType
    );

  /* ── Loan state ────────────────────────────────────── */

  const [amount, setAmount] =
    useState(initialValues.amount);

  const [rate, setRate] =
    useState(initialValues.rate);

  const [years, setYears] =
    useState(initialValues.years);

  /* ── Validation ────────────────────────────────────── */

  const errors = useMemo(() => {
    const validationErrors: string[] =
      [];

    if (amount <= 0) {
      validationErrors.push(
        "Loan amount must be greater than zero."
      );
    }

    if (rate < 0) {
      validationErrors.push(
        "Interest rate cannot be negative."
      );
    }

    if (
      years < 1 ||
      years > 50
    ) {
      validationErrors.push(
        "Loan term must be between 1 and 50 years."
      );
    }

    return validationErrors;
  }, [amount, rate, years]);

  const isValid =
    errors.length === 0;

  /* ── EMI calculation ───────────────────────────────── */

  const result = useMemo(() => {
    if (!isValid) {
      return calculateEmi(
        0,
        0,
        0
      );
    }

    return calculateEmi(
      amount,
      rate,
      years
    );
  }, [
    amount,
    rate,
    years,
    isValid,
  ]);

  /* ── Amortization preview ──────────────────────────── */

  const amortizationPreview =
    useMemo(
      () =>
        isValid
          ? buildAmortizationPreview(
              amount,
              rate,
              years,
              result.monthlyEmi
            )
          : [],
      [
        amount,
        rate,
        years,
        result.monthlyEmi,
        isValid,
      ]
    );

  /* ── Selection handlers ────────────────────────────── */

  function handleRegionChange(
    newRegion: Region
  ) {
    setRegion(newRegion);

    const defaults =
      getDefaultValues(
        newRegion,
        loanType
      );

    setAmount(defaults.amount);
    setRate(defaults.rate);
    setYears(defaults.years);
  }

  function handleLoanTypeChange(
    newLoanType: LoanType
  ) {
    setLoanType(newLoanType);

    const defaults =
      getDefaultValues(
        region,
        newLoanType
      );

    setAmount(defaults.amount);
    setRate(defaults.rate);
    setYears(defaults.years);
  }

  const selectedLoan =
    LOAN_TYPES[loanType];

  /* ══════════════════════════════════════════════════════ */

  return (
    <section
      aria-labelledby="emi-calculator-heading"
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* ════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════ */}

      <div
        className="
          border-b
          border-slate-200
          bg-gradient-to-r
          from-blue-50
          via-indigo-50
          to-white
          px-5
          py-5
          sm:px-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div>
            <h2
              id="emi-calculator-heading"
              className="
                text-xl
                font-bold
                tracking-tight
                text-slate-950
              "
            >
              EMI Calculator
            </h2>

            <p
              className="
                mt-1
                max-w-3xl
                text-sm
                leading-relaxed
                text-slate-600
              "
            >
              Calculate monthly EMI,
              total interest, and total
              repayment for home loans,
              car loans, vehicle loans,
              bike loans, personal loans,
              education loans, and
              business loans.
            </p>
          </div>

          <RegionSelector
            region={region}
            onChange={
              handleRegionChange
            }
          />
        </div>

        {/* Regional info */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <InfoBadge
            label="Region"
            value={config.name}
          />

          <InfoBadge
            label="Currency"
            value={`${config.currency.code} (${config.currency.symbol})`}
          />

          <InfoBadge
            label="Method"
            value="Reducing Balance"
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          BODY
      ════════════════════════════════════════════════ */}

      <div className="p-5 sm:p-6">

        {/* ─────────────────────────────────────────────
            LOAN TYPE SELECTOR
        ───────────────────────────────────────────── */}

        <div>
          <div className="mb-3">
            <h3
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              Select loan type
            </h3>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Choose a loan category to load
              convenient starting values. You
              can edit every value manually.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
              lg:grid-cols-7
            "
          >
            {(
              Object.keys(
                LOAN_TYPES
              ) as LoanType[]
            ).map((type) => {
              const info =
                LOAN_TYPES[type];

              const selected =
                loanType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    handleLoanTypeChange(
                      type
                    )
                  }
                  aria-pressed={
                    selected
                  }
                  className={`
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-left
                    transition-all
                    duration-200

                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-500/10

                    ${
                      selected
                        ? `
                          border-blue-500
                          bg-blue-600
                          text-white
                          shadow-md
                          shadow-blue-500/20
                        `
                        : `
                          border-slate-200
                          bg-white
                          text-slate-700
                          hover:-translate-y-0.5
                          hover:border-blue-300
                          hover:bg-blue-50
                          hover:shadow-sm
                        `
                    }
                  `}
                >
                  <span
                    className="
                      block
                      text-xl
                    "
                  >
                    {info.icon}
                  </span>

                  <span
                    className="
                      mt-1
                      block
                      text-xs
                      font-bold
                    "
                  >
                    {info.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="
              mt-3
              rounded-xl
              border
              border-blue-100
              bg-blue-50/70
              px-4
              py-3
            "
          >
            <p
              className="
                text-xs
                font-bold
                text-blue-900
              "
            >
              {selectedLoan.icon}{" "}
              {selectedLoan.label}
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-relaxed
                text-blue-700
              "
            >
              {
                selectedLoan.description
              }
            </p>

            <p
              className="
                mt-1
                text-[10px]
                text-blue-600
              "
            >
              Starting amounts and rates
              are illustrative calculator
              defaults, not current lender
              offers.
            </p>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            ERRORS
        ───────────────────────────────────────────── */}

        {errors.length > 0 && (
          <div
            role="alert"
            className="
              mt-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
            "
          >
            <p
              className="
                text-xs
                font-bold
                text-red-900
              "
            >
              Please check your loan details
            </p>

            <ul className="mt-2 space-y-1">
              {errors.map(
                (error) => (
                  <li
                    key={error}
                    className="
                      flex
                      gap-2
                      text-xs
                      text-red-700
                    "
                  >
                    <span>⚠</span>

                    <span>
                      {error}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            INPUTS
        ══════════════════════════════════════════════ */}

        <fieldset className="mt-6">
          <div className="mb-4">
            <legend
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              Loan details
            </legend>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Enter the principal amount,
              annual interest rate, and
              repayment period.
            </p>
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-3
            "
          >
            <EmiInput
              id="emi-loan-amount"
              label={`Loan amount (${config.currency.code})`}
              value={amount}
              onChange={setAmount}
              prefix={
                config.currency.symbol
              }
              step={
                region === "nepal" ||
                region === "india"
                  ? 10_000
                  : 500
              }
              min={0}
              hint="Principal amount borrowed"
            />

            <EmiInput
              id="emi-interest-rate"
              label="Interest rate (APR)"
              value={rate}
              onChange={setRate}
              suffix="%"
              step={0.1}
              min={0}
              hint="Annual percentage rate"
            />

            <EmiInput
              id="emi-loan-term"
              label="Loan tenure"
              value={years}
              onChange={setYears}
              suffix="years"
              step={1}
              min={1}
              max={50}
              hint={`${years * 12} monthly installments`}
            />
          </div>
        </fieldset>

        {/* ══════════════════════════════════════════════
            PRIMARY RESULT
        ══════════════════════════════════════════════ */}

        <div
          className="
            mt-7
            overflow-hidden
            rounded-2xl
            border
            border-blue-200
            bg-gradient-to-br
            from-blue-50
            via-indigo-50
            to-white
            shadow-sm
          "
        >
          <div
            className="
              px-5
              py-6
              sm:px-6
            "
          >
            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-600
              "
            >
              Monthly EMI
            </p>

            <div
              className="
                mt-2
                flex
                flex-wrap
                items-baseline
                gap-3
              "
            >
              <p
                className="
                  break-all
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  sm:text-4xl
                "
              >
                {formatters.money(
                  result.monthlyEmi,
                  2
                )}
              </p>

              <span
                className="
                  rounded-full
                  bg-blue-600
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                "
              >
                / month
              </span>
            </div>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                text-slate-600
              "
            >
              Estimated EMI for a{" "}
              <strong
                className="
                  text-slate-800
                "
              >
                {
                  selectedLoan.label
                }
              </strong>{" "}
              of{" "}
              {formatters.money(
                amount,
                0
              )}{" "}
              at {rate}% APR over{" "}
              {years} years.
            </p>
          </div>

          {/* ── Principal / Interest ─────────────────── */}

          <div
            className="
              border-t
              border-blue-200
              bg-white/80
              px-5
              py-5
              sm:px-6
            "
          >
            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >
              <h3
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Total repayment breakdown
              </h3>

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Principal vs interest
              </span>
            </div>

            <PaymentShare
              label="Principal"
              value={formatters.money(
                amount,
                0
              )}
              percentage={
                result.principalShare
              }
              color="bg-blue-500"
            />

            <div className="mt-4">
              <PaymentShare
                label="Interest"
                value={formatters.money(
                  result.totalInterest,
                  0
                )}
                percentage={
                  result.interestShare
                }
                color="bg-amber-500"
              />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            STATS
        ══════════════════════════════════════════════ */}

        <div
          className="
            mt-4
            grid
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <EmiStat
            label="Total Interest"
            value={formatters.money(
              result.totalInterest,
              0
            )}
            sub="Cost of borrowing"
            color="amber"
          />

          <EmiStat
            label="Total Repayment"
            value={formatters.money(
              result.totalRepayment,
              0
            )}
            sub="Principal + interest"
            color="emerald"
          />

          <EmiStat
            label="Total Installments"
            value={`${result.totalMonths}`}
            sub="Monthly payments"
            color="blue"
          />

          <EmiStat
            label="Interest Ratio"
            value={`${result.interestRatio.toFixed(
              1
            )}%`}
            sub="Interest vs principal"
            color="violet"
          />
        </div>

        {/* ══════════════════════════════════════════════
            LOAN SUMMARY
        ══════════════════════════════════════════════ */}

        <details
          className="
            group
            mt-5
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            transition-all
            open:shadow-sm
          "
        >
          <summary
            className="
              flex
              cursor-pointer
              list-none
              items-center
              justify-between
              px-4
              py-3.5
              text-sm
              font-semibold
              text-slate-700
              transition-colors
              hover:bg-slate-100
            "
          >
            <span>
              View detailed loan summary
            </span>

            <span
              className="
                text-slate-400
                transition-transform
                duration-200
                group-open:rotate-180
              "
            >
              ▼
            </span>
          </summary>

          <div
            className="
              border-t
              border-slate-200
              bg-white
            "
          >
            <SummaryRow
              label="Loan type"
              value={
                selectedLoan.label
              }
            />

            <SummaryRow
              label="Region"
              value={config.name}
            />

            <SummaryRow
              label="Principal"
              value={formatters.money(
                amount,
                0
              )}
            />

            <SummaryRow
              label="Annual interest rate"
              value={`${rate.toFixed(
                2
              )}% APR`}
            />

            <SummaryRow
              label="Loan tenure"
              value={`${years} years`}
            />

            <SummaryRow
              label="Number of installments"
              value={`${result.totalMonths} months`}
            />

            <SummaryRow
              label="Monthly EMI"
              value={formatters.money(
                result.monthlyEmi,
                2
              )}
            />

            <SummaryRow
              label="First-month principal"
              value={formatters.money(
                result.firstMonthPrincipal,
                2
              )}
            />

            <SummaryRow
              label="First-month interest"
              value={formatters.money(
                result.firstMonthInterest,
                2
              )}
            />

            <SummaryRow
              label="Total interest"
              value={formatters.money(
                result.totalInterest,
                0
              )}
            />

            <SummaryRow
              label="Total repayment"
              value={formatters.money(
                result.totalRepayment,
                0
              )}
              last
            />
          </div>
        </details>

        {/* ══════════════════════════════════════════════
            AMORTIZATION
        ══════════════════════════════════════════════ */}

        {amortizationPreview.length >
          0 && (
          <details
            className="
              group
              mt-4
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              transition-all
              open:shadow-sm
            "
          >
            <summary
              className="
                flex
                cursor-pointer
                list-none
                items-center
                justify-between
                px-4
                py-3.5
                text-sm
                font-semibold
                text-slate-700
                transition-colors
                hover:bg-slate-100
              "
            >
              <span>
                First-year amortization preview
              </span>

              <span
                className="
                  text-slate-400
                  transition-transform
                  duration-200
                  group-open:rotate-180
                "
              >
                ▼
              </span>
            </summary>

            <div
              className="
                overflow-x-auto
                border-t
                border-slate-200
                bg-white
              "
            >
              <table
                className="
                  w-full
                  min-w-[620px]
                  text-left
                  text-xs
                "
              >
                <thead
                  className="
                    bg-slate-50
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  <tr>
                    <th className="px-4 py-3">
                      Month
                    </th>

                    <th className="px-4 py-3">
                      EMI
                    </th>

                    <th className="px-4 py-3">
                      Principal
                    </th>

                    <th className="px-4 py-3">
                      Interest
                    </th>

                    <th className="px-4 py-3">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {amortizationPreview.map(
                    (row) => (
                      <tr
                        key={
                          row.month
                        }
                        className="
                          border-t
                          border-slate-100
                          transition-colors
                          hover:bg-blue-50/40
                        "
                      >
                        <td
                          className="
                            px-4
                            py-3
                            font-semibold
                            text-slate-700
                          "
                        >
                          {row.month}
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            font-mono
                          "
                        >
                          {formatters.money(
                            row.emi,
                            2
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            font-mono
                            text-blue-700
                          "
                        >
                          {formatters.money(
                            row.principal,
                            2
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            font-mono
                            text-amber-700
                          "
                        >
                          {formatters.money(
                            row.interest,
                            2
                          )}
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            font-mono
                            text-slate-600
                          "
                        >
                          {formatters.money(
                            row.balance,
                            2
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </details>
        )}

        {/* ══════════════════════════════════════════════
            SEO CONTENT
        ══════════════════════════════════════════════ */}

        <article
          className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            p-5
          "
        >
          <h3
            className="
              text-base
              font-bold
              text-slate-900
            "
          >
            How to use the EMI calculator
          </h3>

          <p
            className="
              mt-2
              text-xs
              leading-6
              text-slate-600
            "
          >
            Enter your loan amount,
            annual interest rate, and
            repayment tenure to calculate
            your estimated Equated Monthly
            Installment (EMI). The calculator
            also shows total interest,
            total repayment, and an
            amortization preview.
          </p>

          <h3
            className="
              mt-5
              text-sm
              font-bold
              text-slate-900
            "
          >
            What is EMI?
          </h3>

          <p
            className="
              mt-2
              text-xs
              leading-6
              text-slate-600
            "
          >
            EMI stands for Equated Monthly
            Installment. It is the fixed
            monthly amount generally paid
            toward a reducing-balance loan.
            Each installment contains a
            principal portion and an
            interest portion. During the
            earlier stages of many loans,
            a larger share may go toward
            interest, while the principal
            portion gradually increases.
          </p>

          {/* Formula */}

          <div
            className="
              mt-4
              rounded-xl
              border
              border-indigo-200
              bg-indigo-50
              px-4
              py-4
            "
          >
            <h4
              className="
                text-xs
                font-bold
                text-indigo-900
              "
            >
              EMI formula
            </h4>

            <p
              className="
                mt-2
                overflow-x-auto
                font-mono
                text-sm
                font-semibold
                text-indigo-700
              "
            >
              EMI = [P × R ×
              (1 + R)ⁿ] ÷
              [(1 + R)ⁿ − 1]
            </p>

            <div
              className="
                mt-3
                space-y-1
                text-[11px]
                text-indigo-700
              "
            >
              <p>
                <strong>P</strong> =
                Principal loan amount
              </p>

              <p>
                <strong>R</strong> =
                Monthly interest rate
              </p>

              <p>
                <strong>N</strong> =
                Number of monthly
                installments
              </p>
            </div>
          </div>

          {/* Loan type SEO cards */}

          <h3
            className="
              mt-6
              text-sm
              font-bold
              text-slate-900
            "
          >
            EMI calculators by loan type
          </h3>

          <div
            className="
              mt-3
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            <SeoLoanCard
              title="Home Loan EMI Calculator"
              icon="🏠"
              text="Estimate monthly payments for a home loan or housing finance using the loan amount, interest rate, and repayment term."
            />

            <SeoLoanCard
              title="Car Loan EMI Calculator"
              icon="🚗"
              text="Calculate monthly vehicle loan repayments and compare total interest for different car-financing terms."
            />

            <SeoLoanCard
              title="Bike Loan EMI Calculator"
              icon="🏍️"
              text="Estimate EMI for motorcycle, scooter, and other two-wheeler loans."
            />

            <SeoLoanCard
              title="Personal Loan EMI Calculator"
              icon="💳"
              text="Calculate monthly installments and total borrowing costs for personal loans."
            />

            <SeoLoanCard
              title="Education Loan EMI Calculator"
              icon="🎓"
              text="Estimate repayments for tuition, study, student, and higher-education financing."
            />

            <SeoLoanCard
              title="Business Loan EMI Calculator"
              icon="💼"
              text="Calculate repayment estimates for business loans, startup funding, and working-capital borrowing."
            />
          </div>

          {/* FAQ */}

          <div className="mt-6">
            <h3
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              EMI Calculator FAQs
            </h3>

            <div className="mt-3 space-y-2">
              <FaqItem
                question="What does EMI mean?"
                answer="EMI means Equated Monthly Installment. It is the recurring monthly payment used to repay a loan over a specified tenure."
              />

              <FaqItem
                question="How is loan EMI calculated?"
                answer="EMI is calculated using the principal loan amount, monthly interest rate, and total number of monthly installments. This calculator uses the standard reducing-balance EMI formula."
              />

              <FaqItem
                question="Does a longer loan tenure reduce EMI?"
                answer="Usually, a longer tenure reduces the monthly EMI because repayment is spread over more months. However, it can increase the total interest paid over the life of the loan."
              />

              <FaqItem
                question="Does a higher interest rate increase EMI?"
                answer="Yes. For the same loan amount and tenure, a higher interest rate generally increases both the monthly EMI and the total interest cost."
              />

              <FaqItem
                question="Can I use this for car and vehicle loans?"
                answer="Yes. You can use the car loan option for vehicle financing and adjust the loan amount, rate, and tenure to match the lender's terms."
              />

              <FaqItem
                question="Are the interest rates shown live lender rates?"
                answer="No. Preset values are illustrative starting points only. Enter the actual interest rate offered by your bank, lender, or financial institution for a more relevant estimate."
              />
            </div>
          </div>
        </article>

        {/* ══════════════════════════════════════════════
            DISCLAIMER
        ══════════════════════════════════════════════ */}

        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            px-4
            py-3.5
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-amber-100
            "
          >
            ⚠
          </div>

          <div>
            <p
              className="
                text-xs
                font-bold
                text-amber-900
              "
            >
              EMI estimate only
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-relaxed
                text-amber-800
              "
            >
              Results are estimates and
              should not be considered a
              loan offer or financial
              advice. Actual EMI may differ
              because of lender fees,
              processing charges,
              insurance, taxes, floating
              interest rates, repayment
              schedules, rounding methods,
              and other conditions.
              {config.isEstimate &&
              config.estimateNote
                ? ` ${config.estimateNote}`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   REGION SELECTOR
══════════════════════════════════════════════════════════ */

function RegionSelector({
  region,
  onChange,
}: {
  region: Region;
  onChange: (
    region: Region
  ) => void;
}) {
  const config =
    getRegionConfig(region);

  return (
    <label
      className="
        block
        w-full
        lg:w-[280px]
      "
    >
      <span
        className="
          mb-1.5
          block
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-slate-500
        "
      >
        Calculation Region
      </span>

      <div
        className="
          group
          relative
        "
      >
        <select
          value={region}
          onChange={(event) =>
            onChange(
              event.target
                .value as Region
            )
          }
          aria-label="Select EMI calculator region"
          className="
            w-full
            cursor-pointer
            appearance-none
            rounded-xl
            border
            border-blue-200
            bg-white
            px-4
            py-3
            pr-10
            text-sm
            font-bold
            text-slate-800
            shadow-sm
            outline-none
            transition-all
            duration-200

            hover:border-blue-400
            hover:bg-blue-50

            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-500/10
          "
        >
          {REGION_OPTIONS.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {
                  REGION_FLAGS[
                    option.value
                  ]
                }{" "}
                {option.name} (
                {getRegionConfig(
                  option.value
                ).currency.code}
                )
              </option>
            )
          )}
        </select>

        <span
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-3
            flex
            items-center
            text-slate-400
            transition-colors
            group-hover:text-blue-600
          "
        >
          ▼
        </span>
      </div>

      <p
        className="
          mt-1.5
          text-[10px]
          text-slate-400
        "
      >
        {config.currency.code} ·{" "}
        {config.currency.symbol}
      </p>
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   INPUT
══════════════════════════════════════════════════════════ */

function EmiInput({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
  max,
  hint,
}: {
  id: string;
  label: string;
  value: number;

  onChange: (
    value: number
  ) => void;

  prefix?: string;
  suffix?: string;

  step?: number;
  min?: number;
  max?: number;

  hint?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="block"
    >
      <span
        className="
          mb-2
          block
          text-[11px]
          font-bold
          uppercase
          tracking-wider
          text-slate-500
        "
      >
        {label}
      </span>

      <div
        className="
          flex
          min-h-12
          overflow-hidden
          rounded-xl
          border
          border-slate-300
          bg-white
          shadow-sm
          transition-all
          duration-200

          hover:border-blue-400
          hover:shadow-md

          focus-within:border-blue-500
          focus-within:ring-4
          focus-within:ring-blue-500/10
        "
      >
        {prefix && (
          <span
            className="
              flex
              items-center
              border-r
              border-slate-200
              bg-slate-50
              px-3
              font-semibold
              text-slate-500
            "
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          type="number"
          value={
            Number.isFinite(value)
              ? value
              : 0
          }
          step={step}
          min={min}
          max={max}
          onChange={(event) => {
            const parsed =
              Number(
                event.target.value
              );

            onChange(
              Number.isFinite(parsed)
                ? parsed
                : 0
            );
          }}
          className="
            min-w-0
            flex-1
            bg-transparent
            px-3
            py-3
            font-mono
            text-sm
            font-semibold
            text-slate-900
            outline-none

            [appearance:textfield]

            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          "
        />

        {suffix && (
          <span
            className="
              flex
              items-center
              border-l
              border-slate-200
              bg-slate-50
              px-3
              text-xs
              font-bold
              text-slate-500
            "
          >
            {suffix}
          </span>
        )}
      </div>

      {hint && (
        <span
          className="
            mt-1.5
            block
            text-[11px]
            text-slate-400
          "
        >
          {hint}
        </span>
      )}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   INFO BADGE
══════════════════════════════════════════════════════════ */

function InfoBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-blue-100
        bg-white/80
        px-3
        py-1.5
        shadow-sm
        transition-all
        duration-200

        hover:border-blue-300
        hover:bg-white
      "
    >
      <span
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </span>

      <span
        className="
          ml-2
          text-[11px]
          font-semibold
          text-slate-700
        "
      >
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   RESULT CARD
══════════════════════════════════════════════════════════ */

function EmiStat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;

  color:
    | "blue"
    | "emerald"
    | "amber"
    | "violet";
}) {
  const styles = {
    blue: {
      card:
        "border-blue-200 bg-blue-50 hover:border-blue-300",

      value: "text-blue-700",
    },

    emerald: {
      card:
        "border-emerald-200 bg-emerald-50 hover:border-emerald-300",

      value:
        "text-emerald-700",
    },

    amber: {
      card:
        "border-amber-200 bg-amber-50 hover:border-amber-300",

      value:
        "text-amber-700",
    },

    violet: {
      card:
        "border-violet-200 bg-violet-50 hover:border-violet-300",

      value:
        "text-violet-700",
    },
  };

  const selected =
    styles[color];

  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:shadow-md

        ${selected.card}
      `}
    >
      <p
        className="
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1.5
          text-xl
          font-bold
          tracking-tight

          ${selected.value}
        `}
      >
        {value}
      </p>

      {sub && (
        <p
          className="
            mt-1
            text-[11px]
            text-slate-500
          "
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PRINCIPAL / INTEREST SHARE
══════════════════════════════════════════════════════════ */

function PaymentShare({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: string;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div
        className="
          mb-1.5
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-xs
            font-semibold
            text-slate-600
          "
        >
          {label}
        </span>

        <span
          className="
            font-mono
            text-xs
            font-bold
            text-slate-800
          "
        >
          {value}
        </span>
      </div>

      <div
        className="
          h-2
          overflow-hidden
          rounded-full
          bg-slate-100
        "
      >
        <div
          className={`
            h-full
            rounded-full
            ${color}
            transition-all
            duration-500
          `}
          style={{
            width: `${Math.max(
              0,
              Math.min(
                100,
                percentage
              )
            )}%`,
          }}
        />
      </div>

      <p
        className="
          mt-1
          text-right
          text-[10px]
          text-slate-400
        "
      >
        {percentage.toFixed(1)}%
        {" of total repayment"}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUMMARY ROW
══════════════════════════════════════════════════════════ */

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        flex
        flex-wrap
        items-center
        justify-between
        gap-3
        px-4
        py-3
        transition-colors
        hover:bg-slate-50

        ${
          last
            ? ""
            : "border-b border-slate-100"
        }
      `}
    >
      <span
        className="
          text-xs
          font-medium
          text-slate-500
        "
      >
        {label}
      </span>

      <span
        className="
          font-mono
          text-xs
          font-bold
          text-slate-800
        "
      >
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEO LOAN CARD
══════════════════════════════════════════════════════════ */

function SeoLoanCard({
  title,
  icon,
  text,
}: {
  title: string;
  icon: string;
  text: string;
}) {
  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-blue-300
        hover:shadow-sm
      "
    >
      <span className="text-xl">
        {icon}
      </span>

      <h4
        className="
          mt-2
          text-xs
          font-bold
          text-slate-800
        "
      >
        {title}
      </h4>

      <p
        className="
          mt-1.5
          text-[11px]
          leading-relaxed
          text-slate-500
        "
      >
        {text}
      </p>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════ */

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >
      <summary
        className="
          flex
          cursor-pointer
          list-none
          items-center
          justify-between
          gap-4
          px-4
          py-3
          text-xs
          font-bold
          text-slate-700
          transition-colors

          hover:bg-blue-50
          hover:text-blue-700
        "
      >
        {question}

        <span
          className="
            shrink-0
            text-slate-400
            transition-transform
            duration-200
            group-open:rotate-180
          "
        >
          ▼
        </span>
      </summary>

      <div
        className="
          border-t
          border-slate-100
          px-4
          py-3
        "
      >
        <p
          className="
            text-[11px]
            leading-6
            text-slate-600
          "
        >
          {answer}
        </p>
      </div>
    </details>
  );
}
