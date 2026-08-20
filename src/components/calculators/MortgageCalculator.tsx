"use client";

import { useMemo, useState } from "react";

import { useRegion } from "@/store/useRegionStore";
import {
  getAllRegions,
  type Region,
} from "@/config/regions";
import { makeFormatters } from "@/lib/format";

/* ──────────────────────────────────────────────────────────
   Region options

   Generated from regions.ts.
   Adding another region there automatically makes it
   available in this calculator.
────────────────────────────────────────────────────────── */

const REGION_OPTIONS = getAllRegions();

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

interface MortgageCalculation {
  downPayment: number;
  loanAmount: number;

  principalAndInterest: number;

  propertyTaxMonthly: number;
  insuranceMonthly: number;
  additionalMonthlyFee: number;

  totalMonthlyPayment: number;

  lifetimeInterest: number;

  totalLoanPayments: number;

  totalPropertyTax: number;
  totalInsurance: number;
  totalAdditionalFees: number;

  totalCostIncludingDownPayment: number;
}

/* ──────────────────────────────────────────────────────────
   Main Calculator
────────────────────────────────────────────────────────── */

export function MortgageCalculator() {
  const {
    region,
    setRegion,
    config,
  } = useRegion();

  /*
   * Re-create the formatter only when the selected
   * region changes.
   */
  const formatters = useMemo(
    () => makeFormatters(region),
    [region]
  );

  /* ─────────────────────────────────────────────────────
     Mortgage inputs
  ───────────────────────────────────────────────────── */

  const [price, setPrice] =
    useState(420000);

  const [downPct, setDownPct] =
    useState(20);

  const [rate, setRate] =
    useState(6.1);

  const [years, setYears] =
    useState(30);

  /* ─────────────────────────────────────────────────────
     Additional housing costs
  ───────────────────────────────────────────────────── */

  const [
    propertyTaxRate,
    setPropertyTaxRate,
  ] = useState(1.2);

  const [
    insuranceAnnual,
    setInsuranceAnnual,
  ] = useState(1200);

  const [
    additionalMonthlyFee,
    setAdditionalMonthlyFee,
  ] = useState(0);

  /* ─────────────────────────────────────────────────────
     Regional terminology
  ───────────────────────────────────────────────────── */

  const propertyTaxLabel =
    config.loan.terminology.propertyTax;

  const insuranceLabel =
    config.loan.terminology.insurance;

  const additionalFeeLabel =
    config.loan.terminology.hoaOrServiceCharge;

  /* ─────────────────────────────────────────────────────
     Validation
  ───────────────────────────────────────────────────── */

  const errors = useMemo(() => {
    const validationErrors: string[] = [];

    if (price <= 0) {
      validationErrors.push(
        "Home price must be greater than zero."
      );
    }

    if (
      downPct < 0 ||
      downPct > 100
    ) {
      validationErrors.push(
        "Down payment must be between 0% and 100%."
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

    if (propertyTaxRate < 0) {
      validationErrors.push(
        `${propertyTaxLabel} cannot be negative.`
      );
    }

    if (insuranceAnnual < 0) {
      validationErrors.push(
        `${insuranceLabel} cannot be negative.`
      );
    }

    if (additionalMonthlyFee < 0) {
      validationErrors.push(
        `${additionalFeeLabel} cannot be negative.`
      );
    }

    return validationErrors;
  }, [
    price,
    downPct,
    rate,
    years,
    propertyTaxRate,
    insuranceAnnual,
    additionalMonthlyFee,
    propertyTaxLabel,
    insuranceLabel,
    additionalFeeLabel,
  ]);

  const isValid =
    errors.length === 0;

  /* ─────────────────────────────────────────────────────
     Mortgage calculation
  ───────────────────────────────────────────────────── */

  const calculation =
    useMemo<MortgageCalculation>(() => {
      if (!isValid) {
        return {
          downPayment: 0,
          loanAmount: 0,

          principalAndInterest: 0,

          propertyTaxMonthly: 0,
          insuranceMonthly: 0,
          additionalMonthlyFee: 0,

          totalMonthlyPayment: 0,

          lifetimeInterest: 0,

          totalLoanPayments: 0,

          totalPropertyTax: 0,
          totalInsurance: 0,
          totalAdditionalFees: 0,

          totalCostIncludingDownPayment: 0,
        };
      }

      /* ── Down payment ─────────────────────────────── */

      const downPayment =
        price * (downPct / 100);

      const loanAmount =
        Math.max(
          0,
          price - downPayment
        );

      /* ── Loan values ──────────────────────────────── */

      const monthlyInterestRate =
        rate / 100 / 12;

      const totalPayments =
        years * 12;

      let principalAndInterest = 0;

      /*
       * Standard fixed-rate mortgage
       * amortization formula.
       *
       * Zero-interest loans require a
       * separate calculation.
       */

      if (
        loanAmount > 0 &&
        totalPayments > 0
      ) {
        if (
          monthlyInterestRate === 0
        ) {
          principalAndInterest =
            loanAmount /
            totalPayments;
        } else {
          const growthFactor =
            Math.pow(
              1 +
                monthlyInterestRate,
              totalPayments
            );

          principalAndInterest =
            (
              loanAmount *
              monthlyInterestRate *
              growthFactor
            ) /
            (growthFactor - 1);
        }
      }

      /* ── Property costs ───────────────────────────── */

      const propertyTaxMonthly =
        (
          price *
          (propertyTaxRate / 100)
        ) / 12;

      const insuranceMonthly =
        insuranceAnnual / 12;

      /* ── Monthly payment ──────────────────────────── */

      const totalMonthlyPayment =
        principalAndInterest +
        propertyTaxMonthly +
        insuranceMonthly +
        additionalMonthlyFee;

      /* ── Lifetime values ──────────────────────────── */

      const totalLoanPayments =
        principalAndInterest *
        totalPayments;

      const lifetimeInterest =
        Math.max(
          0,
          totalLoanPayments -
            loanAmount
        );

      const totalPropertyTax =
        propertyTaxMonthly *
        totalPayments;

      const totalInsurance =
        insuranceMonthly *
        totalPayments;

      const totalAdditionalFees =
        additionalMonthlyFee *
        totalPayments;

      const totalCostIncludingDownPayment =
        downPayment +
        totalLoanPayments +
        totalPropertyTax +
        totalInsurance +
        totalAdditionalFees;

      return {
        downPayment,
        loanAmount,

        principalAndInterest,

        propertyTaxMonthly,
        insuranceMonthly,
        additionalMonthlyFee,

        totalMonthlyPayment,

        lifetimeInterest,

        totalLoanPayments,

        totalPropertyTax,
        totalInsurance,
        totalAdditionalFees,

        totalCostIncludingDownPayment,
      };
    }, [
      isValid,
      price,
      downPct,
      rate,
      years,
      propertyTaxRate,
      insuranceAnnual,
      additionalMonthlyFee,
    ]);

  /* ─────────────────────────────────────────────────────
     Payment breakdown percentages
  ───────────────────────────────────────────────────── */

  const monthlyTotal =
    calculation.totalMonthlyPayment;

  const getShare = (
    value: number
  ) =>
    monthlyTotal > 0
      ? (value / monthlyTotal) * 100
      : 0;

  const principalShare =
    getShare(
      calculation.principalAndInterest
    );

  const propertyTaxShare =
    getShare(
      calculation.propertyTaxMonthly
    );

  const insuranceShare =
    getShare(
      calculation.insuranceMonthly
    );

  const feeShare =
    getShare(
      calculation.additionalMonthlyFee
    );

  /* ─────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────── */

  return (
    <section
      aria-labelledby="mortgage-calculator-heading"
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* ══════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════ */}

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
          {/* Title */}

          <div>
            <h2
              id="mortgage-calculator-heading"
              className="
                text-lg
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Mortgage Payment Calculator
            </h2>

            <p
              className="
                mt-1
                max-w-2xl
                text-sm
                leading-relaxed
                text-slate-600
              "
            >
              Estimate your monthly mortgage payment,
              principal and interest,{" "}
              {propertyTaxLabel.toLowerCase()},
              {` ${insuranceLabel.toLowerCase()}`},
              and{" "}
              {additionalFeeLabel.toLowerCase()}.
            </p>
          </div>

          {/* Region selector */}

          <RegionSelector
            region={region}
            setRegion={setRegion}
          />
        </div>

        {/* Region information */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <RegionBadge
            label="Currency"
            value={`${config.currency.code} (${config.currency.symbol})`}
          />

          <RegionBadge
            label="Property Cost"
            value={propertyTaxLabel}
          />

          <RegionBadge
            label="Insurance"
            value={insuranceLabel}
          />

          <RegionBadge
            label="Recurring Fee"
            value={additionalFeeLabel}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════════════ */}

      <div className="p-5 sm:p-6">

        {/* ── Region notice ───────────────────────────── */}

        <div
          className="
            mb-5
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            px-4
            py-3
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
              bg-blue-100
              text-sm
            "
          >
            🌍
          </div>

          <div>
            <p
              className="
                text-xs
                font-bold
                text-blue-900
              "
            >
              {config.name} mortgage mode
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-relaxed
                text-blue-700
              "
            >
              Values are displayed in{" "}
              {config.currency.code} and
              regional housing terminology is
              automatically adjusted.
              Changing region does not convert
              previously entered monetary values.
            </p>
          </div>
        </div>

        {/* ── Validation errors ──────────────────────── */}

        {errors.length > 0 && (
          <div
            role="alert"
            className="
              mb-5
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
              Please check your mortgage inputs
            </p>

            <ul className="mt-2 space-y-1">
              {errors.map(
                (error) => (
                  <li
                    key={error}
                    className="
                      flex
                      items-start
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
            LOAN DETAILS
        ══════════════════════════════════════════════ */}

        <fieldset>
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
              Enter the property value,
              down payment, annual mortgage
              interest rate, and loan term.
            </p>
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <MortgageInput
              id="mortgage-home-price"
              label={`Home price (${config.currency.code})`}
              value={price}
              onChange={setPrice}
              prefix={
                config.currency.symbol
              }
              step={5000}
              min={0}
              hint="Property purchase price"
            />

            <MortgageInput
              id="mortgage-down-payment"
              label="Down payment"
              value={downPct}
              onChange={setDownPct}
              suffix="%"
              step={1}
              min={0}
              max={100}
              hint={
                isValid
                  ? formatters.money(
                      calculation.downPayment,
                      0
                    )
                  : undefined
              }
            />

            <MortgageInput
              id="mortgage-interest-rate"
              label="Interest rate (APR)"
              value={rate}
              onChange={setRate}
              suffix="%"
              step={0.1}
              min={0}
              hint="Annual percentage rate"
            />

            <MortgageInput
              id="mortgage-loan-term"
              label="Loan term"
              value={years}
              onChange={setYears}
              suffix="years"
              step={1}
              min={1}
              max={50}
              hint={`${years * 12} monthly payments`}
            />
          </div>
        </fieldset>

        {/* ══════════════════════════════════════════════
            PROPERTY COSTS
        ══════════════════════════════════════════════ */}

        <fieldset
          className="
            mt-7
            rounded-2xl
            border
            border-slate-200
            bg-slate-50/70
            p-4
            sm:p-5
          "
        >
          <div className="mb-4">
            <legend
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              Estimated property costs
            </legend>

            <p
              className="
                mt-1
                text-xs
                leading-relaxed
                text-slate-500
              "
            >
              Add recurring housing expenses
              for a more realistic monthly
              payment estimate.
            </p>
          </div>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            <MortgageInput
              id="mortgage-property-tax"
              label={`${propertyTaxLabel} (annual)`}
              value={propertyTaxRate}
              onChange={
                setPropertyTaxRate
              }
              suffix="%"
              step={0.1}
              min={0}
              hint={
                isValid
                  ? `${formatters.money(
                      calculation.propertyTaxMonthly,
                      2
                    )}/month`
                  : undefined
              }
            />

            <MortgageInput
              id="mortgage-home-insurance"
              label={`${insuranceLabel} (annual)`}
              value={insuranceAnnual}
              onChange={
                setInsuranceAnnual
              }
              prefix={
                config.currency.symbol
              }
              step={100}
              min={0}
              hint={
                isValid
                  ? `${formatters.money(
                      calculation.insuranceMonthly,
                      2
                    )}/month`
                  : undefined
              }
            />

            <MortgageInput
              id="mortgage-recurring-fee"
              label={`${additionalFeeLabel} (monthly)`}
              value={
                additionalMonthlyFee
              }
              onChange={
                setAdditionalMonthlyFee
              }
              prefix={
                config.currency.symbol
              }
              step={50}
              min={0}
              hint="Optional recurring cost"
            />
          </div>
        </fieldset>

        {/* ══════════════════════════════════════════════
            MAIN RESULT
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
          <div className="px-5 py-6 sm:px-6">
            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-blue-600
              "
            >
              Estimated Monthly Mortgage Payment
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
                  calculation.totalMonthlyPayment,
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
                {config.currency.code}
                {" / month"}
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
              Estimated payment including
              principal, interest,{" "}
              {propertyTaxLabel.toLowerCase()},
              {" "}
              {insuranceLabel.toLowerCase()}
              {additionalMonthlyFee > 0
                ? `, and ${additionalFeeLabel.toLowerCase()}`
                : ""}
              .
            </p>
          </div>

          {/* ── Breakdown ────────────────────────────── */}

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
                Monthly payment breakdown
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
                Estimated
              </span>
            </div>

            <div className="space-y-4">
              <PaymentBreakdown
                label="Principal & interest"
                value={formatters.money(
                  calculation.principalAndInterest,
                  2
                )}
                percentage={
                  principalShare
                }
                color="bg-blue-500"
              />

              <PaymentBreakdown
                label={
                  propertyTaxLabel
                }
                value={formatters.money(
                  calculation.propertyTaxMonthly,
                  2
                )}
                percentage={
                  propertyTaxShare
                }
                color="bg-emerald-500"
              />

              <PaymentBreakdown
                label={insuranceLabel}
                value={formatters.money(
                  calculation.insuranceMonthly,
                  2
                )}
                percentage={
                  insuranceShare
                }
                color="bg-violet-500"
              />

              {additionalMonthlyFee >
                0 && (
                <PaymentBreakdown
                  label={
                    additionalFeeLabel
                  }
                  value={formatters.money(
                    calculation.additionalMonthlyFee,
                    2
                  )}
                  percentage={
                    feeShare
                  }
                  color="bg-amber-500"
                />
              )}
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
          <MortgageStat
            label="Loan Amount"
            value={formatters.money(
              calculation.loanAmount,
              0
            )}
            sub={`After ${formatters.money(
              calculation.downPayment,
              0
            )} down`}
            color="blue"
          />

          <MortgageStat
            label="Principal & Interest"
            value={formatters.money(
              calculation.principalAndInterest,
              2
            )}
            sub="Monthly"
            color="emerald"
          />

          <MortgageStat
            label="Lifetime Interest"
            value={formatters.money(
              calculation.lifetimeInterest,
              0
            )}
            sub={`Over ${years} years`}
            color="amber"
          />

          <MortgageStat
            label="Total Loan Payments"
            value={formatters.money(
              calculation.totalLoanPayments,
              0
            )}
            sub="Principal + interest"
            color="violet"
          />
        </div>

        {/* ══════════════════════════════════════════════
            DETAILED SUMMARY
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
              View detailed mortgage summary
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
              label="Region"
              value={config.name}
            />

            <SummaryRow
              label="Currency"
              value={
                config.currency.code
              }
            />

            <SummaryRow
              label="Home price"
              value={formatters.money(
                price,
                0
              )}
            />

            <SummaryRow
              label="Down payment"
              value={`${formatters.money(
                calculation.downPayment,
                0
              )} (${formatters.fmt(
                downPct,
                1
              )}%)`}
            />

            <SummaryRow
              label="Mortgage amount"
              value={formatters.money(
                calculation.loanAmount,
                0
              )}
            />

            <SummaryRow
              label="Interest rate"
              value={`${formatters.fmt(
                rate,
                2
              )}% APR`}
            />

            <SummaryRow
              label="Loan term"
              value={`${years} years (${
                years * 12
              } payments)`}
            />

            <SummaryRow
              label="Lifetime mortgage interest"
              value={formatters.money(
                calculation.lifetimeInterest,
                0
              )}
            />

            <SummaryRow
              label="Estimated total housing cost"
              value={formatters.money(
                calculation.totalCostIncludingDownPayment,
                0
              )}
              last
            />
          </div>
        </details>

        {/* ══════════════════════════════════════════════
            SEO / EDUCATIONAL CONTENT
        ══════════════════════════════════════════════ */}

        <div
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
              text-sm
              font-bold
              text-slate-900
            "
          >
            How this mortgage calculator works
          </h3>

          <p
            className="
              mt-2
              text-xs
              leading-6
              text-slate-600
            "
          >
            This mortgage calculator estimates
            your monthly home loan payment using
            the property price, down payment,
            annual interest rate, and loan term.
            The principal and interest portion uses
            the standard fixed-rate mortgage
            amortization formula.
          </p>

          <p
            className="
              mt-2
              text-xs
              leading-6
              text-slate-600
            "
          >
            In {config.name} mode, monetary
            values are displayed in{" "}
            {config.currency.code}. The calculator
            also uses region-specific terminology
            such as {propertyTaxLabel},{" "}
            {insuranceLabel}, and{" "}
            {additionalFeeLabel}.
          </p>

          <div
            className="
              mt-4
              grid
              gap-3
              sm:grid-cols-3
            "
          >
            <ExplanationCard
              title="Principal"
              description="The mortgage amount borrowed after subtracting your down payment from the home price."
            />

            <ExplanationCard
              title="Interest"
              description="The amount charged by the lender for borrowing the mortgage principal."
            />

            <ExplanationCard
              title="Housing costs"
              description={`Additional costs may include ${propertyTaxLabel.toLowerCase()}, ${insuranceLabel.toLowerCase()}, and ${additionalFeeLabel.toLowerCase()}.`}
            />
          </div>
        </div>

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
              Mortgage estimate only
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-relaxed
                text-amber-800
              "
            >
              This calculator provides an
              estimate and is not a mortgage
              offer or financial advice.
              Actual lender rates, taxes,
              insurance premiums, closing
              costs, fees, and repayment
              conditions may vary.
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
  setRegion,
}: {
  region: Region;
  setRegion: (
    region: Region
  ) => void;
}) {
  return (
    <label
      className="
        block
        w-full
        lg:w-[260px]
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
            setRegion(
              event.target
                .value as Region
            )
          }
          aria-label="Select mortgage calculation region"
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
            focus:bg-white
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
                {option.name}
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
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   REGION BADGE
══════════════════════════════════════════════════════════ */

function RegionBadge({
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
   INPUT
══════════════════════════════════════════════════════════ */

function MortgageInput({
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
   PAYMENT BREAKDOWN
══════════════════════════════════════════════════════════ */

function PaymentBreakdown({
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
        {" of monthly payment"}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════ */

function MortgageStat({
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

      value:
        "text-blue-700",
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
   SEO INFORMATION CARD
══════════════════════════════════════════════════════════ */

function ExplanationCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        transition-all
        duration-200

        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-sm
      "
    >
      <h4
        className="
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
        {description}
      </p>
    </article>
  );
}