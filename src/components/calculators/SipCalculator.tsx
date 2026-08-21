"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

type SipFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

interface FrequencyConfig {
  label: string;
  investmentLabel: string;
  periodsPerYear: number;
  description: string;
}

interface SipCalculation {
  totalInvested: number;
  estimatedReturns: number;
  futureValue: number;

  totalContributions: number;

  finalContribution: number;

  initialAnnualInvestment: number;
  finalAnnualInvestment: number;

  returnOnInvestment: number;
  wealthMultiple: number;

  periodicRate: number;
}

interface ProjectionPoint {
  year: number;
  invested: number;
  returns: number;
  value: number;
}

interface SipCalculationResult {
  result: SipCalculation;
  projection: ProjectionPoint[];
}

/* ──────────────────────────────────────────────────────────
   Contribution Frequencies
────────────────────────────────────────────────────────── */

const SIP_FREQUENCIES: Record<
  SipFrequency,
  FrequencyConfig
> = {
  daily: {
    label: "Daily",
    investmentLabel: "Daily Investment",
    periodsPerYear: 365,
    description: "Invest every day",
  },

  weekly: {
    label: "Weekly",
    investmentLabel: "Weekly Investment",
    periodsPerYear: 52,
    description: "Invest once every week",
  },

  biweekly: {
    label: "Biweekly",
    investmentLabel: "Biweekly Investment",
    periodsPerYear: 26,
    description: "Invest every two weeks",
  },

  monthly: {
    label: "Monthly",
    investmentLabel: "Monthly Investment",
    periodsPerYear: 12,
    description: "Invest once every month",
  },

  quarterly: {
    label: "Quarterly",
    investmentLabel: "Quarterly Investment",
    periodsPerYear: 4,
    description: "Invest every three months",
  },

  yearly: {
    label: "Yearly",
    investmentLabel: "Yearly Investment",
    periodsPerYear: 1,
    description: "Invest once every year",
  },
};

const FREQUENCY_OPTIONS = Object.entries(
  SIP_FREQUENCIES
) as [
  SipFrequency,
  FrequencyConfig,
][];

/* ──────────────────────────────────────────────────────────
   SEO / FAQ
────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question: "What is a SIP Calculator?",
    answer:
      "A SIP Calculator estimates how regular investments may grow over time based on contribution amount, investment frequency, expected annual return, investment duration and optional annual step-up.",
  },

  {
    question:
      "Can I calculate daily, weekly and monthly SIP investments?",
    answer:
      "Yes. CalcHub supports daily, weekly, biweekly, monthly, quarterly and yearly recurring investment frequencies.",
  },

  {
    question:
      "What is the most common SIP frequency?",
    answer:
      "Monthly SIP is one of the most commonly used contribution frequencies, although investors may choose daily, weekly, quarterly or other schedules depending on their investment plan.",
  },

  {
    question:
      "How does investment frequency affect SIP returns?",
    answer:
      "More frequent investments spread contributions across more dates. Each contribution compounds for a different amount of time, so contribution frequency can affect the estimated future value.",
  },

  {
    question: "What is a Step-Up SIP?",
    answer:
      "A Step-Up SIP increases the recurring contribution by a selected percentage each year. It can help investors gradually increase investments as their income grows.",
  },

  {
    question:
      "Can Step-Up SIP be used with weekly or daily investments?",
    answer:
      "Yes. CalcHub applies the selected annual step-up to the recurring contribution after each completed investment year, regardless of whether contributions are daily, weekly, monthly or another supported frequency.",
  },

  {
    question:
      "Are SIP Calculator returns guaranteed?",
    answer:
      "No. SIP Calculator results are projections based on the expected return entered by the user. Actual investment and mutual fund returns depend on market performance and are not guaranteed.",
  },

  {
    question:
      "What does estimated return mean?",
    answer:
      "Estimated return is the projected investment growth above the total amount contributed. It is calculated using the expected annual return selected by the user.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",

  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",

    name: item.question,

    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

/* ──────────────────────────────────────────────────────────
   SIP Calculation
────────────────────────────────────────────────────────── */

/**
 * Contribution timing assumption:
 *
 * Each recurring contribution is made at the END
 * of its contribution period.
 *
 * Examples:
 *
 * Daily:
 * existing balance grows for one day → contribution added
 *
 * Monthly:
 * existing balance grows for one month → contribution added
 *
 * Annual return is distributed across the selected
 * number of contribution periods:
 *
 * periodicRate =
 * annualReturn / periodsPerYear
 *
 * This keeps the calculator predictable across:
 *
 * daily
 * weekly
 * biweekly
 * monthly
 * quarterly
 * yearly
 */

function calculateSip(
  contributionAmount: number,
  annualReturn: number,
  years: number,
  annualStepUp: number,
  frequency: SipFrequency
): SipCalculationResult {
  const frequencyConfig =
    SIP_FREQUENCIES[frequency];

  const periodsPerYear =
    frequencyConfig.periodsPerYear;

  const contribution = Math.max(
    0,
    contributionAmount
  );

  const yearlyReturn = Math.max(
    0,
    annualReturn
  );

  const investmentYears = Math.max(
    1,
    Math.round(years)
  );

  const stepUpRate =
    Math.max(0, annualStepUp) / 100;

  const totalPeriods =
    investmentYears *
    periodsPerYear;

  const periodicRate =
    yearlyReturn /
    100 /
    periodsPerYear;

  let currentContribution =
    contribution;

  let invested = 0;

  let balance = 0;

  const projection: ProjectionPoint[] =
    [];

  for (
    let period = 1;
    period <= totalPeriods;
    period += 1
  ) {
    /* Investment growth */

    balance *= 1 + periodicRate;

    /* Current contribution */

    balance += currentContribution;

    invested += currentContribution;

    /* End of one investment year */

    if (
      period % periodsPerYear === 0
    ) {
      const year =
        period / periodsPerYear;

      projection.push({
        year,

        invested,

        returns: Math.max(
          0,
          balance - invested
        ),

        value: balance,
      });

      /*
       * Apply annual Step-Up for
       * the following year.
       */

      if (
        annualStepUp > 0 &&
        period < totalPeriods
      ) {
        currentContribution *=
          1 + stepUpRate;
      }
    }
  }

  const estimatedReturns = Math.max(
    0,
    balance - invested
  );

  const returnOnInvestment =
    invested > 0
      ? (estimatedReturns /
          invested) *
        100
      : 0;

  const wealthMultiple =
    invested > 0
      ? balance / invested
      : 0;

  return {
    result: {
      totalInvested: invested,

      estimatedReturns,

      futureValue: balance,

      totalContributions:
        totalPeriods,

      finalContribution:
        currentContribution,

      initialAnnualInvestment:
        contribution *
        periodsPerYear,

      finalAnnualInvestment:
        currentContribution *
        periodsPerYear,

      returnOnInvestment,

      wealthMultiple,

      periodicRate:
        periodicRate * 100,
    },

    projection,
  };
}

/* ──────────────────────────────────────────────────────────
   Main Calculator
────────────────────────────────────────────────────────── */

export function SipCalculator() {
  /* ── Regional configuration ─────────────────────────── */

  const {
    region,
    config,
  } = useRegion();

  const formatters = useMemo(
    () => makeFormatters(region),
    [region]
  );

  /* ── Inputs ─────────────────────────────────────────── */

  const [
    contributionAmount,
    setContributionAmount,
  ] = useState(5000);

  const [
    frequency,
    setFrequency,
  ] =
    useState<SipFrequency>(
      "monthly"
    );

  const [
    annualReturn,
    setAnnualReturn,
  ] = useState(12);

  const [
    investmentYears,
    setInvestmentYears,
  ] = useState(10);

  const [
    annualStepUp,
    setAnnualStepUp,
  ] = useState(0);

  /* ── Frequency config ───────────────────────────────── */

  const frequencyConfig =
    SIP_FREQUENCIES[frequency];

  /* ── Calculation ────────────────────────────────────── */

  const {
    result,
    projection,
  } = useMemo(
    () =>
      calculateSip(
        contributionAmount,
        annualReturn,
        investmentYears,
        annualStepUp,
        frequency
      ),
    [
      contributionAmount,
      annualReturn,
      investmentYears,
      annualStepUp,
      frequency,
    ]
  );

  /* ── Formatting ─────────────────────────────────────── */

  const currencyDecimals =
    config.currency.decimals ?? 2;

  function money(
    value: number
  ): string {
    if (!Number.isFinite(value)) {
      return "—";
    }

    return formatters.money(
      value,
      currencyDecimals
    );
  }

  function number(
    value: number,
    decimals = 0
  ): string {
    if (!Number.isFinite(value)) {
      return "—";
    }

    return formatters.fmt(
      value,
      decimals
    );
  }

  /* ── Investment breakdown ───────────────────────────── */

  const investedShare =
    result.futureValue > 0
      ? clamp(
          (result.totalInvested /
            result.futureValue) *
            100,
          0,
          100
        )
      : 0;

  const returnShare =
    result.futureValue > 0
      ? clamp(
          (result.estimatedReturns /
            result.futureValue) *
            100,
          0,
          100
        )
      : 0;

  /* ── Chart normalization ────────────────────────────── */

  const maxProjectionValue =
    Math.max(
      ...projection.map(
        (point) => point.value
      ),
      1
    );

  /* ───────────────────────────────────────────────────── */

  return (
    <div className="
      mx-auto
      w-full
      max-w-[820px]
    ">

      {/* FAQ JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              FAQ_SCHEMA
            ),
        }}
      />

      {/* ────────────────────────────────────────────────
          SEO Heading
      ──────────────────────────────────────────────── */}

      <header className="
        mb-6
        text-center
      ">

        <p className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-blue-600
        ">
          CalcHub Investment Tools
        </p>

        <h2 className="
          mt-2
          text-2xl
          font-bold
          tracking-tight
          text-slate-950
          sm:text-3xl
        ">

          SIP Calculator

          <span className="
            block
            text-blue-600
          ">
            Daily, Weekly & Monthly
            SIP Return Calculator
          </span>

        </h2>

        <p className="
          mx-auto
          mt-3
          max-w-2xl
          text-sm
          leading-6
          text-slate-600
        ">

          Calculate SIP investment
          returns instantly with daily,
          weekly, biweekly, monthly,
          quarterly or yearly
          contributions. Estimate your
          invested amount, investment
          returns and future value with
          CalcHub&apos;s free SIP
          Calculator.

        </p>

      </header>

      {/* ────────────────────────────────────────────────
          Calculator Card
      ──────────────────────────────────────────────── */}

      <section
        aria-label="SIP investment calculator"
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {/* Header */}

        <div className="
          border-b
          border-slate-200
          bg-slate-50
          px-5
          py-4
          sm:px-6
        ">

          <div className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-3
          ">

            <div>

              <p className="
                text-xs
                font-medium
                text-slate-500
              ">
                Systematic Investment Plan
              </p>

              <div className="
                mt-1
                flex
                items-center
                gap-2
              ">

                <span className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-emerald-500
                " />

                <span className="
                  text-sm
                  font-semibold
                  text-slate-700
                ">
                  Instant SIP Projection
                </span>

              </div>

            </div>

            <div className="
              text-left
              sm:text-right
            ">

              <p className="
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-400
              ">
                Currency
              </p>

              <p className="
                mt-1
                text-xs
                font-bold
                text-slate-700
              ">
                {config.currency.code}
                {" · "}
                {config.name}
              </p>

            </div>

          </div>

        </div>

        {/* Calculator */}

        <div className="
          p-5
          sm:p-6
        ">

          {/* ────────────────────────────────────────────
              Contribution Frequency
          ──────────────────────────────────────────── */}

          <div>

            <p className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-slate-500
            ">
              Investment Frequency
            </p>

            <p className="
              mt-1
              text-[10px]
              text-slate-400
            ">
              Choose how often you
              contribute to your SIP.
            </p>

            <div className="
              mt-3
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
            ">

              {FREQUENCY_OPTIONS.map(
                ([
                  value,
                  item,
                ]) => {

                  const active =
                    frequency ===
                    value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFrequency(
                          value
                        )
                      }
                      className={`
                        rounded-xl
                        border
                        px-3
                        py-3
                        text-left
                        transition-all
                        duration-200
                        ${
                          active
                            ? `
                              border-blue-500
                              bg-blue-50
                              shadow-sm
                            `
                            : `
                              border-slate-200
                              bg-white
                              hover:border-blue-300
                              hover:bg-blue-50/40
                            `
                        }
                      `}
                    >

                      <p
                        className={`
                          text-xs
                          font-bold
                          ${
                            active
                              ? "text-blue-700"
                              : "text-slate-700"
                          }
                        `}
                      >
                        {item.label}
                      </p>

                      <p className="
                        mt-1
                        text-[9px]
                        leading-4
                        text-slate-400
                      ">
                        {
                          item.description
                        }
                      </p>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* ────────────────────────────────────────────
              Main Inputs
          ──────────────────────────────────────────── */}

          <div className="
            mt-6
            grid
            gap-5
            sm:grid-cols-2
          ">

            {/* Contribution */}

            <InputSection
              label={
                frequencyConfig.investmentLabel
              }
              description={`Amount invested ${frequencyConfig.label.toLowerCase()}`}
            >

              <MoneyInput
                symbol={
                  config.currency.symbol
                }
                currency={
                  config.currency.code
                }
                value={
                  contributionAmount
                }
                onChange={
                  setContributionAmount
                }
              />

            </InputSection>

            {/* Return */}

            <InputSection
              label="Expected Annual Return"
              description="Estimated yearly return on your investment"
            >

              <NumberInput
                value={
                  annualReturn
                }
                min={0}
                max={60}
                step={0.5}
                suffix="% p.a."
                onChange={
                  setAnnualReturn
                }
              />

            </InputSection>

            {/* Years */}

            <InputSection
              label="Investment Period"
              description="How long you plan to continue investing"
            >

              <NumberInput
                value={
                  investmentYears
                }
                min={1}
                max={50}
                step={1}
                suffix={
                  investmentYears ===
                  1
                    ? "year"
                    : "years"
                }
                onChange={
                  setInvestmentYears
                }
              />

            </InputSection>

            {/* Step Up */}

            <InputSection
              label="Annual SIP Step-Up"
              description="Optional annual increase in contribution"
            >

              <NumberInput
                value={
                  annualStepUp
                }
                min={0}
                max={100}
                step={1}
                suffix="% yearly"
                onChange={
                  setAnnualStepUp
                }
              />

            </InputSection>

          </div>

          {/* ────────────────────────────────────────────
              Quick Sliders
          ──────────────────────────────────────────── */}

          <div className="
            mt-6
            space-y-5
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
          ">

            <RangeInput
              label={
                frequencyConfig.investmentLabel
              }
              value={
                contributionAmount
              }
              min={100}
              max={100000}
              step={100}
              display={
                money(
                  contributionAmount
                )
              }
              onChange={
                setContributionAmount
              }
            />

            <RangeInput
              label="Expected Annual Return"
              value={
                annualReturn
              }
              min={1}
              max={30}
              step={0.5}
              display={`${annualReturn}%`}
              onChange={
                setAnnualReturn
              }
            />

            <RangeInput
              label="Investment Period"
              value={
                investmentYears
              }
              min={1}
              max={40}
              step={1}
              display={`${investmentYears} ${
                investmentYears ===
                1
                  ? "year"
                  : "years"
              }`}
              onChange={
                setInvestmentYears
              }
            />

            <RangeInput
              label="Annual Step-Up"
              value={
                annualStepUp
              }
              min={0}
              max={30}
              step={1}
              display={`${annualStepUp}%`}
              onChange={
                setAnnualStepUp
              }
            />

          </div>

          {/* ────────────────────────────────────────────
              Frequency Summary
          ──────────────────────────────────────────── */}

          <div className="
            mt-4
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
          ">

            <MetricCard
              label="Frequency"
              value={
                frequencyConfig.label
              }
            />

            <MetricCard
              label="Contributions / Year"
              value={number(
                frequencyConfig.periodsPerYear
              )}
            />

            <MetricCard
              label="Starting / Year"
              value={money(
                result.initialAnnualInvestment
              )}
            />

            <MetricCard
              label="Total Contributions"
              value={number(
                result.totalContributions
              )}
            />

          </div>

          {/* ────────────────────────────────────────────
              Main Results
          ──────────────────────────────────────────── */}

          <section
            aria-live="polite"
            className="
              mt-6
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

            <div className="
              px-5
              py-6
              sm:px-6
            ">

              <p className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-500
              ">
                Estimated Future Value
              </p>

              <p className="
                mt-2
                break-words
                text-3xl
                font-bold
                tracking-tight
                text-slate-900
                sm:text-4xl
              ">
                {money(
                  result.futureValue
                )}
              </p>

              <p className="
                mt-3
                text-sm
                leading-6
                text-slate-500
              ">

                Investing{" "}

                <strong className="
                  text-slate-700
                ">
                  {money(
                    contributionAmount
                  )}
                </strong>

                {" "}
                {frequencyConfig.label.toLowerCase()}

                {" "}for{" "}

                <strong className="
                  text-slate-700
                ">
                  {investmentYears}{" "}
                  {investmentYears ===
                  1
                    ? "year"
                    : "years"}
                </strong>

                {" "}at an expected{" "}

                <strong className="
                  text-slate-700
                ">
                  {annualReturn}%
                </strong>

                {" "}annual return.

              </p>

            </div>

            <div className="
              grid
              border-t
              border-blue-200
              bg-white/70
              sm:grid-cols-3
            ">

              <ResultItem
                label="Total Invested"
                value={money(
                  result.totalInvested
                )}
              />

              <ResultItem
                label="Estimated Returns"
                value={money(
                  result.estimatedReturns
                )}
                positive
              />

              <ResultItem
                label={`Final ${frequencyConfig.label} SIP`}
                value={money(
                  result.finalContribution
                )}
              />

            </div>

          </section>

          {/* ────────────────────────────────────────────
              Investment Breakdown
          ──────────────────────────────────────────── */}

          <div className="
            mt-4
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
          ">

            <div className="
              flex
              items-center
              justify-between
              gap-3
            ">

              <p className="
                text-xs
                font-bold
                text-slate-700
              ">
                Investment Breakdown
              </p>

              <p className="
                text-[10px]
                text-slate-400
              ">
                Future value
              </p>

            </div>

            <div className="
              mt-4
              flex
              h-3
              overflow-hidden
              rounded-full
              bg-slate-100
            ">

              <div
                className="
                  bg-blue-500
                "
                style={{
                  width:
                    `${investedShare}%`,
                }}
              />

              <div
                className="
                  bg-emerald-500
                "
                style={{
                  width:
                    `${returnShare}%`,
                }}
              />

            </div>

            <div className="
              mt-3
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
            ">

              <BreakdownLegend
                color="bg-blue-500"
                label="Invested"
                value={`${number(
                  investedShare,
                  1
                )}%`}
              />

              <BreakdownLegend
                color="bg-emerald-500"
                label="Estimated Returns"
                value={`${number(
                  returnShare,
                  1
                )}%`}
                positive
              />

            </div>

          </div>

          {/* ────────────────────────────────────────────
              Detailed Metrics
          ──────────────────────────────────────────── */}

          <div className="
            mt-4
            grid
            grid-cols-2
            gap-3
            sm:grid-cols-4
          ">

            <MetricCard
              label="Periodic Return"
              value={`${number(
                result.periodicRate,
                4
              )}%`}
            />

            <MetricCard
              label="Return on Investment"
              value={`${number(
                result.returnOnInvestment,
                1
              )}%`}
            />

            <MetricCard
              label="Wealth Multiple"
              value={`${number(
                result.wealthMultiple,
                2
              )}×`}
            />

            <MetricCard
              label="Final Annual Investment"
              value={money(
                result.finalAnnualInvestment
              )}
            />

          </div>

          {/* ────────────────────────────────────────────
              Growth Projection
          ──────────────────────────────────────────── */}

          <section className="
            mt-5
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-4
            sm:p-5
          ">

            <p className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-blue-500
            ">
              SIP Growth Projection
            </p>

            <h3 className="
              mt-1
              text-sm
              font-bold
              text-slate-900
            ">
              Investment Growth Over Time
            </h3>

            <p className="
              mt-1
              text-[10px]
              text-slate-400
            ">
              Year-by-year projection for
              your{" "}
              {
                frequencyConfig.label.toLowerCase()
              }{" "}
              investment plan.
            </p>

            {/* Dependency-free chart */}

            <div className="
              mt-5
              flex
              h-[190px]
              items-end
              gap-1.5
              overflow-x-auto
              border-b
              border-slate-200
              pb-1
            ">

              {projection.map(
                (point) => {

                  const valueHeight =
                    Math.max(
                      5,

                      (point.value /
                        maxProjectionValue) *
                        100
                    );

                  const investedHeight =
                    Math.max(
                      2,

                      (point.invested /
                        maxProjectionValue) *
                        100
                    );

                  return (
                    <div
                      key={
                        point.year
                      }
                      className="
                        flex
                        min-w-[28px]
                        flex-1
                        flex-col
                        items-center
                        justify-end
                      "
                    >

                      <div className="
                        relative
                        flex
                        h-[150px]
                        w-full
                        max-w-[38px]
                        items-end
                      ">

                        {/* Total value */}

                        <div
                          title={`Year ${
                            point.year
                          }: ${money(
                            point.value
                          )}`}
                          className="
                            absolute
                            bottom-0
                            w-full
                            rounded-t-md
                            bg-emerald-200
                          "
                          style={{
                            height:
                              `${valueHeight}%`,
                          }}
                        />

                        {/* Invested */}

                        <div
                          title={`Invested: ${money(
                            point.invested
                          )}`}
                          className="
                            absolute
                            bottom-0
                            w-full
                            rounded-t-md
                            bg-blue-500
                          "
                          style={{
                            height:
                              `${investedHeight}%`,
                          }}
                        />

                      </div>

                      <span className="
                        mt-1
                        text-[8px]
                        font-bold
                        text-slate-400
                      ">
                        {point.year}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

            <div className="
              mt-3
              flex
              flex-wrap
              gap-4
              text-[9px]
              font-semibold
              text-slate-500
            ">

              <span className="
                flex
                items-center
                gap-1.5
              ">

                <span className="
                  h-2.5
                  w-2.5
                  rounded-sm
                  bg-blue-500
                " />

                Invested

              </span>

              <span className="
                flex
                items-center
                gap-1.5
              ">

                <span className="
                  h-2.5
                  w-2.5
                  rounded-sm
                  bg-emerald-200
                " />

                Total Value

              </span>

            </div>

          </section>

          {/* ────────────────────────────────────────────
              Yearly Projection Table
          ──────────────────────────────────────────── */}

          <details className="
            group
            mt-5
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            open:shadow-sm
          ">

            <summary className="
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
              hover:bg-slate-100
            ">

              <span>
                Year-by-Year Projection
              </span>

              <span className="
                text-slate-400
                transition-transform
                group-open:rotate-180
              ">
                ▼
              </span>

            </summary>

            <div className="
              overflow-x-auto
              border-t
              border-slate-200
              bg-white
            ">

              <table className="
                w-full
                min-w-[600px]
                text-left
                text-xs
              ">

                <thead className="
                  bg-slate-50
                ">

                  <tr className="
                    text-[10px]
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">

                    <th className="
                      px-4
                      py-3
                    ">
                      Year
                    </th>

                    <th className="
                      px-4
                      py-3
                    ">
                      Invested
                    </th>

                    <th className="
                      px-4
                      py-3
                    ">
                      Returns
                    </th>

                    <th className="
                      px-4
                      py-3
                    ">
                      Total Value
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {projection.map(
                    (point) => (
                      <tr
                        key={
                          point.year
                        }
                        className="
                          border-t
                          border-slate-100
                        "
                      >

                        <td className="
                          px-4
                          py-3
                          font-bold
                          text-slate-700
                        ">
                          {point.year}
                        </td>

                        <td className="
                          px-4
                          py-3
                          text-slate-600
                        ">
                          {money(
                            point.invested
                          )}
                        </td>

                        <td className="
                          px-4
                          py-3
                          font-semibold
                          text-emerald-700
                        ">
                          {money(
                            point.returns
                          )}
                        </td>

                        <td className="
                          px-4
                          py-3
                          font-bold
                          text-slate-900
                        ">
                          {money(
                            point.value
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          </details>

          {/* Disclaimer */}

          <div className="
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
          ">

            <div className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-amber-100
            ">
              ⚠
            </div>

            <div>

              <p className="
                text-xs
                font-bold
                text-amber-900
              ">
                Estimated investment
                returns only
              </p>

              <p className="
                mt-1
                text-[11px]
                leading-relaxed
                text-amber-800
              ">
                This SIP Calculator
                provides projections
                based on the contribution
                amount, investment
                frequency and expected
                return entered by you.
                Actual investment returns
                can vary because of market
                performance, fees, taxes
                and other factors. Daily
                calculations assume 365
                contribution periods per
                year and weekly
                calculations use 52.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ────────────────────────────────────────────────
          SEO Content
      ──────────────────────────────────────────────── */}

      <article className="
        mt-8
        space-y-5
      ">

        <SeoSection title="SIP Calculator – Calculate Investment Returns Instantly">

          <p>
            CalcHub&apos;s SIP Calculator
            helps you estimate the future
            value of recurring investments.
            Enter your investment amount,
            contribution frequency,
            expected annual return and
            investment duration to
            instantly calculate your total
            invested amount, estimated
            returns and projected future
            value.
          </p>

          <p>
            You can calculate daily,
            weekly, biweekly, monthly,
            quarterly and yearly SIP
            investment plans. The
            calculator also supports
            annual Step-Up SIP
            contributions.
          </p>

        </SeoSection>

        <SeoSection title="Daily, Weekly and Monthly SIP Calculator">

          <p>
            SIP investments do not
            necessarily have to be made
            monthly. Depending on the
            investment platform and
            financial product, recurring
            investments may be scheduled
            daily, weekly, every two weeks,
            monthly, quarterly or yearly.
          </p>

          <p>
            CalcHub adjusts the number of
            investment contributions and
            periodic compounding
            automatically when you change
            the SIP frequency.
          </p>

          <div className="
            grid
            gap-3
            sm:grid-cols-2
          ">

            {FREQUENCY_OPTIONS.map(
              ([key, item]) => (
                <FeatureCard
                  key={key}
                  title={`${item.label} SIP`}
                  description={`${item.description}. Approximately ${item.periodsPerYear} contributions are calculated per year.`}
                />
              )
            )}

          </div>

        </SeoSection>

        <SeoSection title="What is a SIP?">

          <p>
            SIP stands for Systematic
            Investment Plan. It is a method
            of investing money at regular
            intervals instead of making
            only one large investment.
          </p>

          <p>
            A recurring investment plan
            can help investors maintain
            investment discipline and
            gradually build their
            investment portfolio over
            time.
          </p>

        </SeoSection>

        <SeoSection title="How Does the SIP Calculator Work?">

          <p>
            CalcHub calculates each
            recurring contribution
            separately. Existing investment
            value first receives the
            expected return for the
            selected contribution period,
            after which the next
            contribution is added.
          </p>

          <div className="
            rounded-xl
            border
            border-blue-100
            bg-blue-50
            p-4
          ">

            <p className="
              text-xs
              font-bold
              text-blue-900
            ">
              Periodic return calculation
            </p>

            <p className="
              mt-2
              overflow-x-auto
              font-mono
              text-sm
              font-bold
              text-blue-800
            ">
              Periodic Rate =
              Annual Return ÷
              Contributions Per Year
            </p>

            <p className="
              mt-3
              text-xs
              leading-6
              text-blue-800
            ">
              For example, a monthly SIP
              uses 12 contribution periods
              per year, while a weekly SIP
              uses approximately 52.
            </p>

          </div>

        </SeoSection>

        <SeoSection title="How to Use the SIP Calculator">

          <Steps
            items={[
              "Choose how often you want to invest: daily, weekly, biweekly, monthly, quarterly or yearly.",
              "Enter the amount you plan to invest each contribution period.",
              "Enter your expected annual rate of return.",
              "Select how many years you plan to continue investing.",
              "Optionally enter an annual Step-Up percentage.",
              "Review your invested amount, estimated returns and future investment value instantly.",
            ]}
          />

        </SeoSection>

        <SeoSection title="What is Step-Up SIP?">

          <p>
            A Step-Up SIP increases your
            recurring investment by a
            selected percentage each year.
            This can allow investment
            contributions to grow together
            with your income.
          </p>

          <p>
            Step-Up works with every
            contribution frequency in this
            calculator. For example, if
            your weekly investment is
            increased by 10% annually, the
            weekly contribution used
            during the following year will
            be 10% higher.
          </p>

        </SeoSection>

        <SeoSection title="SIP Contribution Frequency Comparison">

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              min-w-[600px]
              border-collapse
              text-left
              text-xs
            ">

              <thead>

                <tr className="
                  border-b
                  border-slate-200
                ">

                  <th className="
                    px-3
                    py-3
                    font-bold
                    text-slate-900
                  ">
                    Frequency
                  </th>

                  <th className="
                    px-3
                    py-3
                    font-bold
                    text-slate-900
                  ">
                    Contributions / Year
                  </th>

                  <th className="
                    px-3
                    py-3
                    font-bold
                    text-slate-900
                  ">
                    Schedule
                  </th>

                </tr>

              </thead>

              <tbody className="
                text-slate-600
              ">

                {FREQUENCY_OPTIONS.map(
                  ([key, item]) => (
                    <tr
                      key={key}
                      className="
                        border-b
                        border-slate-100
                        last:border-0
                      "
                    >

                      <td className="
                        px-3
                        py-3
                        font-semibold
                        text-slate-700
                      ">
                        {item.label}
                      </td>

                      <td className="
                        px-3
                        py-3
                      ">
                        {
                          item.periodsPerYear
                        }
                      </td>

                      <td className="
                        px-3
                        py-3
                      ">
                        {item.description}
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </SeoSection>

        <SeoSection title="Frequently Asked Questions">

          <div className="
            divide-y
            divide-slate-200
          ">

            {FAQ_ITEMS.map(
              (item) => (
                <details
                  key={
                    item.question
                  }
                  className="
                    group
                    py-4
                    first:pt-0
                    last:pb-0
                  "
                >

                  <summary className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-4
                    text-sm
                    font-bold
                    text-slate-800
                  ">

                    <span>
                      {item.question}
                    </span>

                    <span className="
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-100
                      text-slate-500
                      transition
                      group-open:rotate-45
                    ">
                      +
                    </span>

                  </summary>

                  <p className="
                    mt-3
                    pr-8
                    text-sm
                    leading-6
                    text-slate-600
                  ">
                    {item.answer}
                  </p>

                </details>
              )
            )}

          </div>

        </SeoSection>

      </article>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Input Section
────────────────────────────────────────────────────────── */

function InputSection({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>

      <div className="
        mb-2
      ">

        <p className="
          text-xs
          font-bold
          uppercase
          tracking-wider
          text-slate-500
        ">
          {label}
        </p>

        <p className="
          mt-1
          text-[10px]
          text-slate-400
        ">
          {description}
        </p>

      </div>

      {children}

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Money Input
────────────────────────────────────────────────────────── */

function MoneyInput({
  symbol,
  currency,
  value,
  onChange,
}: {
  symbol: string;
  currency: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="
      group
      flex
      overflow-hidden
      rounded-xl
      border
      border-slate-300
      bg-white
      shadow-sm
      transition-all
      duration-200
      hover:border-blue-400
      focus-within:border-blue-500
      focus-within:ring-4
      focus-within:ring-blue-500/10
    ">

      <div className="
        flex
        min-w-[58px]
        items-center
        justify-center
        border-r
        border-slate-200
        bg-slate-50
        px-3
        text-sm
        font-bold
        text-slate-600
      ">
        {symbol}
      </div>

      <input
        type="number"
        value={value}
        min={0}
        step={100}
        onChange={(
          event: ChangeEvent<HTMLInputElement>
        ) => {

          const next = Number(
            event.target.value
          );

          onChange(
            Number.isFinite(next)
              ? Math.max(
                  0,
                  next
                )
              : 0
          );
        }}
        className="
          min-w-0
          flex-1
          bg-transparent
          px-4
          py-3.5
          text-lg
          font-bold
          text-slate-900
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      <div className="
        flex
        items-center
        border-l
        border-slate-200
        bg-slate-50
        px-3
        text-[10px]
        font-bold
        text-slate-500
      ">
        {currency}
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Number Input
────────────────────────────────────────────────────────── */

function NumberInput({
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="
      flex
      overflow-hidden
      rounded-xl
      border
      border-slate-300
      bg-white
      shadow-sm
      transition-all
      hover:border-blue-400
      focus-within:border-blue-500
      focus-within:ring-4
      focus-within:ring-blue-500/10
    ">

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(
          event: ChangeEvent<HTMLInputElement>
        ) => {

          const next = Number(
            event.target.value
          );

          onChange(
            Number.isFinite(next)
              ? clamp(
                  next,
                  min,
                  max
                )
              : min
          );
        }}
        className="
          min-w-0
          flex-1
          bg-transparent
          px-4
          py-3.5
          text-lg
          font-bold
          text-slate-900
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      <div className="
        flex
        items-center
        border-l
        border-slate-200
        bg-slate-50
        px-3
        text-[10px]
        font-bold
        text-slate-500
      ">
        {suffix}
      </div>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Range Input
────────────────────────────────────────────────────────── */

function RangeInput({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>

      <div className="
        mb-2
        flex
        items-center
        justify-between
        gap-4
      ">

        <span className="
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-slate-500
        ">
          {label}
        </span>

        <span className="
          text-xs
          font-bold
          text-blue-700
        ">
          {display}
        </span>

      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(
          value,
          min,
          max
        )}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="
          h-2
          w-full
          cursor-pointer
          accent-blue-600
        "
      />

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Result Item
────────────────────────────────────────────────────────── */

function ResultItem({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="
      border-b
      border-blue-100
      px-5
      py-4
      last:border-b-0
      sm:border-b-0
      sm:border-r
      sm:last:border-r-0
    ">

      <p className="
        text-[9px]
        font-bold
        uppercase
        tracking-wider
        text-slate-400
      ">
        {label}
      </p>

      <p
        className={`
          mt-1.5
          break-words
          text-sm
          font-bold
          ${
            positive
              ? "text-emerald-700"
              : "text-slate-800"
          }
        `}
      >
        {value}
      </p>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Metric Card
────────────────────────────────────────────────────────── */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-3
      text-center
      transition
      hover:border-blue-300
      hover:bg-blue-50
    ">

      <p className="
        break-words
        text-xs
        font-bold
        text-slate-800
      ">
        {value}
      </p>

      <p className="
        mt-1
        text-[8px]
        font-bold
        uppercase
        tracking-wider
        text-slate-400
      ">
        {label}
      </p>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Breakdown Legend
────────────────────────────────────────────────────────── */

function BreakdownLegend({
  color,
  label,
  value,
  positive = false,
}: {
  color: string;
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <span
      className={`
        flex
        items-center
        gap-2
        text-[10px]
        font-semibold
        ${
          positive
            ? "text-emerald-700"
            : "text-blue-700"
        }
      `}
    >

      <span
        className={`
          h-2.5
          w-2.5
          rounded-sm
          ${color}
        `}
      />

      {label} {value}

    </span>
  );
}

/* ──────────────────────────────────────────────────────────
   SEO Section
────────────────────────────────────────────────────────── */

function SeoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      sm:p-6
    ">

      <h2 className="
        text-lg
        font-bold
        tracking-tight
        text-slate-950
        sm:text-xl
      ">
        {title}
      </h2>

      <div className="
        mt-3
        space-y-3
        text-sm
        leading-7
        text-slate-600
      ">
        {children}
      </div>

    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Steps
────────────────────────────────────────────────────────── */

function Steps({
  items,
}: {
  items: string[];
}) {
  return (
    <div className="
      space-y-3
    ">

      {items.map(
        (item, index) => (
          <div
            key={item}
            className="
              flex
              items-start
              gap-3
            "
          >

            <span className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-[11px]
              font-bold
              text-blue-700
            ">
              {index + 1}
            </span>

            <p className="
              pt-0.5
            ">
              {item}
            </p>

          </div>
        )
      )}

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Feature Card
────────────────────────────────────────────────────────── */

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-4
      transition
      hover:border-blue-300
      hover:bg-blue-50
    ">

      <p className="
        text-xs
        font-bold
        text-slate-900
      ">
        {title}
      </p>

      <p className="
        mt-1.5
        text-xs
        leading-6
        text-slate-600
      ">
        {description}
      </p>

    </div>
  );
}

export default SipCalculator;
