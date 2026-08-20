"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  getAllRegions,
  getRegionConfig,
  type Region,
} from "@/config/regions";

import { useRegion } from "@/store/useRegionStore";

import { makeFormatters } from "@/lib/format";

import { calculateRegionalTax } from "@/lib/taxEngine";

import type {
  TaxContext,
  UsaFilingStatus,
  UkJurisdiction,
} from "@/lib/types";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */

const REGIONS =
  getAllRegions();

const REGION_FLAGS: Record<
  Region,
  string
> = {
  global: "🌍",
  usa: "🇺🇸",
  nepal: "🇳🇵",
  india: "🇮🇳",
  uk: "🇬🇧",
  canada: "🇨🇦",
  australia: "🇦🇺",
};

const PAY_PERIODS: Record<
  string,
  number
> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */

interface SalaryCalculatorProps {
  defaultRegion?: Region;
}

export function SalaryCalculator({ defaultRegion = "nepal" }: SalaryCalculatorProps) {
  const {
    setRegion: setGlobalRegion,
  } = useRegion();

  const [selectedRegion, setSelectedRegion] = useState<Region>(defaultRegion);
  const config = getRegionConfig(selectedRegion);

  const formatters = useMemo(
    () => makeFormatters(selectedRegion),
    [selectedRegion]
  );

  /* ── Salary inputs ─────────────────────────────────── */

  const [hourlyRate, setHourlyRate] =
    useState(25);

  const [
    hoursPerWeek,
    setHoursPerWeek,
  ] = useState(
    config.work.hoursPerWeek
  );

  const [
    weeksPerYear,
    setWeeksPerYear,
  ] = useState(52);

  const [
    payFrequency,
    setPayFrequency,
  ] = useState(
    config.work
      .defaultPayFrequency
  );

  /* ── Region-specific tax settings ─────────────────── */

  const [
    usaFilingStatus,
    setUsaFilingStatus,
  ] =
    useState<UsaFilingStatus>(
      "single"
    );

  const [
    ukJurisdiction,
    setUkJurisdiction,
  ] =
    useState<UkJurisdiction>(
      "england_wales_ni"
    );

  const [
    nepalSSFContributor,
    setNepalSSFContributor,
  ] = useState(false);

  const [
    australiaIncludeMedicare,
    setAustraliaIncludeMedicare,
  ] = useState(true);

  /* ── Optional personal deduction ───────────────────── */

  const [
    optionalDeductionRate,
    setOptionalDeductionRate,
  ] = useState(0);

  /* ── Validation ────────────────────────────────────── */

  const errors =
    useMemo(() => {
      const list: string[] = [];

      if (hourlyRate < 0) {
        list.push(
          "Hourly rate cannot be negative."
        );
      }

      if (
        hoursPerWeek < 1 ||
        hoursPerWeek > 168
      ) {
        list.push(
          "Hours per week must be between 1 and 168."
        );
      }

      if (
        weeksPerYear < 1 ||
        weeksPerYear > 52
      ) {
        list.push(
          "Weeks per year must be between 1 and 52."
        );
      }

      if (
        optionalDeductionRate <
          0 ||
        optionalDeductionRate >
          100
      ) {
        list.push(
          "Optional deduction must be between 0% and 100%."
        );
      }

      return list;
    }, [
      hourlyRate,
      hoursPerWeek,
      weeksPerYear,
      optionalDeductionRate,
    ]);

  const isValid =
    errors.length === 0;

  /* ── Gross annual salary ───────────────────────────── */

  const grossAnnual =
    isValid
      ? hourlyRate *
        hoursPerWeek *
        weeksPerYear
      : 0;

  /* ── Context ───────────────────────────────────────── */

  /* ── Tax result ────────────────────────────────────── */

  const taxResult =
    useMemo(
      () =>
        calculateRegionalTax(
          grossAnnual,
          selectedRegion,
          {
            usaFilingStatus,
            ukJurisdiction,
            nepalSSFContributor,
            australiaIncludeMedicare,
          } satisfies TaxContext
        ),
      [
        grossAnnual,
        selectedRegion,
        usaFilingStatus,
        ukJurisdiction,
        nepalSSFContributor,
        australiaIncludeMedicare,
      ]
    );

  /* ── User-defined optional deduction ──────────────── */

  const optionalDeduction =
    grossAnnual *
    (optionalDeductionRate /
      100);

  const estimatedAnnualTakeHome =
    Math.max(
      0,
      taxResult.estimatedTakeHome -
        optionalDeduction
    );

  /* ── Pay periods ───────────────────────────────────── */

  const periodsPerYear =
    PAY_PERIODS[
      payFrequency
    ] ?? 12;

  const grossPerPeriod =
    grossAnnual /
    periodsPerYear;

  const taxPerPeriod =
    taxResult.incomeTax /
    periodsPerYear;

  const payrollPerPeriod =
    taxResult.payrollDeductionsTotal /
    periodsPerYear;

  const optionalPerPeriod =
    optionalDeduction /
    periodsPerYear;

  const netPerPeriod =
    estimatedAnnualTakeHome /
    periodsPerYear;

  /* ── Shares ────────────────────────────────────────── */

  const totalDeductions =
    taxResult.totalGovernmentDeductions +
    optionalDeduction;

  const deductionPercent =
    grossAnnual > 0
      ? (totalDeductions /
          grossAnnual) *
        100
      : 0;

  const takeHomePercent =
    grossAnnual > 0
      ? (estimatedAnnualTakeHome /
          grossAnnual) *
        100
      : 0;

  /* ── Region change ─────────────────────────────────── */

  function handleRegionChange(
    newRegion: Region
  ) {
    const next =
      getRegionConfig(
        newRegion
      );

    setSelectedRegion(newRegion);
    setGlobalRegion(newRegion);

    setHoursPerWeek(
      next.work.hoursPerWeek
    );

    setPayFrequency(
      next.work
        .defaultPayFrequency
    );

    setOptionalDeductionRate(
      0
    );
  }

  /* ══════════════════════════════════════════════════════ */

  return (
    <section
      aria-labelledby="salary-calculator-title"
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* HEADER */}

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
              id="salary-calculator-title"
              className="
                text-xl
                font-bold
                tracking-tight
                text-slate-950
              "
            >
              Salary & Take-Home Pay Calculator
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
              Estimate gross salary,
              current income tax,
              employee payroll
              contributions and take-home
              pay using the selected
              region&apos;s current
              configured tax year.
            </p>
          </div>

          <RegionSelect
            region={selectedRegion}
            onChange={
              handleRegionChange
            }
          />
        </div>

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <Badge
            title="Region"
            value={config.name}
          />

          <Badge
            title="Currency"
            value={
              config.currency.code
            }
          />

          <Badge
            title="Tax Year"
            value={
              taxResult.meta
                .taxYear
            }
          />

          <Badge
            title="Verified"
            value={
              taxResult.meta
                .verifiedOn
            }
          />
        </div>
      </div>

      <div className="p-5 sm:p-6">

        {/* DATA QUALITY */}

        <div
          className="
            mb-6
            rounded-xl
            border
            border-blue-200
            bg-blue-50
            p-4
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-100
              "
            >
              ✓
            </span>

            <div>
              <p
                className="
                  text-xs
                  font-bold
                  text-blue-900
                "
              >
                Current rule set:{" "}
                {
                  taxResult.meta
                    .taxYear
                }
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
                  taxResult.meta
                    .description
                }
              </p>

              <p
                className="
                  mt-1
                  text-[10px]
                  text-blue-600
                "
              >
                Sources:{" "}
                {taxResult.meta.sourceNames.join(
                  " · "
                )}
              </p>
            </div>
          </div>
        </div>

        {/* VALIDATION */}

        {errors.length > 0 && (
          <div
            role="alert"
            className="
              mb-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              p-4
            "
          >
            {errors.map(
              (error) => (
                <p
                  key={error}
                  className="
                    text-xs
                    text-red-700
                  "
                >
                  ⚠ {error}
                </p>
              )
            )}
          </div>
        )}

        {/* REGION-SPECIFIC OPTIONS */}

        <RegionalOptions
          region={selectedRegion}
          usaFilingStatus={
            usaFilingStatus
          }
          onUsaFilingStatus={
            setUsaFilingStatus
          }
          ukJurisdiction={
            ukJurisdiction
          }
          onUkJurisdiction={
            setUkJurisdiction
          }
          nepalSSFContributor={
            nepalSSFContributor
          }
          onNepalSSFContributor={
            setNepalSSFContributor
          }
          australiaIncludeMedicare={
            australiaIncludeMedicare
          }
          onAustraliaIncludeMedicare={
            setAustraliaIncludeMedicare
          }
        />

        {/* INPUTS */}

        <fieldset>
          <legend
            className="
              mb-4
              text-sm
              font-bold
              text-slate-900
            "
          >
            Income details
          </legend>

          <div
            className="
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <SalaryInput
              id="salary-hourly-rate"
              label="Hourly Rate"
              value={hourlyRate}
              onChange={
                setHourlyRate
              }
              prefix={
                config.currency
                  .symbol
              }
              step={0.5}
              min={0}
            />

            <SalaryInput
              id="salary-hours-week"
              label="Hours / Week"
              value={
                hoursPerWeek
              }
              onChange={
                setHoursPerWeek
              }
              suffix="hrs"
              min={1}
              max={168}
            />

            <SalaryInput
              id="salary-weeks-year"
              label="Weeks / Year"
              value={
                weeksPerYear
              }
              onChange={
                setWeeksPerYear
              }
              suffix="weeks"
              min={1}
              max={52}
            />

            <PayFrequency
              value={
                payFrequency
              }
              options={
                config.work
                  .payFrequencies
              }
              onChange={
                setPayFrequency
              }
            />
          </div>
        </fieldset>

        {/* GROSS SALARY */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-5
          "
        >
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-slate-400
            "
          >
            Gross Annual Salary
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-slate-900
            "
          >
            {formatters.money(
              grossAnnual,
              2
            )}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-slate-500
            "
          >
            {hoursPerWeek} hrs ×{" "}
            {weeksPerYear} weeks ×{" "}
            {formatters.money(
              hourlyRate,
              2
            )}
          </p>
        </div>

        {/* OPTIONAL DEDUCTION */}

        <div
          className="
            mt-5
            rounded-xl
            border
            border-slate-200
            p-4
          "
        >
          <h3
            className="
              text-sm
              font-bold
              text-slate-900
            "
          >
            Optional Personal Deduction
          </h3>

          <p
            className="
              mt-1
              text-[11px]
              text-slate-500
            "
          >
            For personal retirement,
            pension, insurance or another
            voluntary deduction. This does
            not change statutory tax rules.
          </p>

          <div
            className="
              mt-4
              max-w-sm
            "
          >
            <SalaryInput
              id="optional-deduction"
              label="Deduction"
              value={
                optionalDeductionRate
              }
              onChange={
                setOptionalDeductionRate
              }
              suffix="%"
              step={0.5}
              min={0}
              max={100}
            />
          </div>
        </div>

        {/* MAIN RESULT */}

        <div
          className="
            mt-7
            overflow-hidden
            rounded-2xl
            border
            border-emerald-200
            bg-gradient-to-br
            from-emerald-50
            via-teal-50
            to-white
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
                text-emerald-600
              "
            >
              Estimated Take-Home Pay
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
                  text-3xl
                  font-bold
                  tracking-tight
                  text-slate-950
                  sm:text-4xl
                "
              >
                {formatters.money(
                  netPerPeriod,
                  2
                )}
              </p>

              <span
                className="
                  rounded-full
                  bg-emerald-600
                  px-3
                  py-1
                  text-xs
                  font-bold
                  text-white
                "
              >
                / {payFrequency}
              </span>
            </div>

            <p
              className="
                mt-3
                text-sm
                text-slate-600
              "
            >
              Estimated annual
              take-home:{" "}
              <strong>
                {formatters.money(
                  estimatedAnnualTakeHome,
                  2
                )}
              </strong>
            </p>
          </div>

          <div
            className="
              grid
              border-t
              border-emerald-200
              bg-white/80
              sm:grid-cols-4
            "
          >
            <ResultCell
              label="Gross"
              value={formatters.money(
                grossPerPeriod,
                2
              )}
            />

            <ResultCell
              label="Income Tax"
              value={`-${formatters.money(
                taxPerPeriod,
                2
              )}`}
              danger
            />

            <ResultCell
              label="Payroll"
              value={`-${formatters.money(
                payrollPerPeriod,
                2
              )}`}
              warning
            />

            <ResultCell
              label="Optional"
              value={`-${formatters.money(
                optionalPerPeriod,
                2
              )}`}
            />
          </div>
        </div>

        {/* CARDS */}

        <div
          className="
            mt-4
            grid
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <StatCard
            title="Income Tax"
            value={formatters.money(
              taxResult.incomeTax,
              0
            )}
            tone="red"
          />

          <StatCard
            title="Payroll Deductions"
            value={formatters.money(
              taxResult.payrollDeductionsTotal,
              0
            )}
            tone="amber"
          />

          <StatCard
            title="Total Deductions"
            value={formatters.money(
              totalDeductions,
              0
            )}
            subtitle={`${deductionPercent.toFixed(
              1
            )}% of gross`}
            tone="violet"
          />

          <StatCard
            title="Annual Take-Home"
            value={formatters.money(
              estimatedAnnualTakeHome,
              0
            )}
            subtitle={`${takeHomePercent.toFixed(
              1
            )}% of gross`}
            tone="emerald"
          />
        </div>

        {/* BREAKDOWN */}

        <details
          className="
            group
            mt-5
            overflow-hidden
            rounded-xl
            border
            border-slate-200
            bg-slate-50
          "
        >
          <summary
            className="
              flex
              cursor-pointer
              list-none
              justify-between
              px-4
              py-3.5
              text-sm
              font-bold
              text-slate-700
              hover:bg-slate-100
            "
          >
            Detailed Tax Breakdown

            <span
              className="
                transition-transform
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
              label="Gross income"
              value={formatters.money(
                grossAnnual,
                2
              )}
            />

            <SummaryRow
              label="Taxable income"
              value={formatters.money(
                taxResult.taxableIncome,
                2
              )}
            />

            {taxResult.deductionDetails.map(
              (item) => (
                <SummaryRow
                  key={
                    item.label
                  }
                  label={
                    item.label
                  }
                  value={`-${formatters.money(
                    item.amount,
                    2
                  )}`}
                />
              )
            )}

            {optionalDeduction >
              0 && (
              <SummaryRow
                label="Optional personal deduction"
                value={`-${formatters.money(
                  optionalDeduction,
                  2
                )}`}
              />
            )}

            <SummaryRow
              label="Estimated take-home"
              value={formatters.money(
                estimatedAnnualTakeHome,
                2
              )}
              positive
            />
          </div>
        </details>

        {/* LIMITATIONS */}

        <div
          className="
            mt-5
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            p-4
          "
        >
          <p
            className="
              text-xs
              font-bold
              text-amber-900
            "
          >
            Accuracy scope
          </p>

          <ul
            className="
              mt-2
              space-y-1
            "
          >
            {taxResult.meta.limitations.map(
              (limit) => (
                <li
                  key={limit}
                  className="
                    flex
                    gap-2
                    text-[11px]
                    leading-relaxed
                    text-amber-800
                  "
                >
                  <span>•</span>

                  <span>
                    {limit}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   REGION-SPECIFIC OPTIONS
══════════════════════════════════════════════════════════ */

function RegionalOptions({
  region,

  usaFilingStatus,
  onUsaFilingStatus,

  ukJurisdiction,
  onUkJurisdiction,

  nepalSSFContributor,
  onNepalSSFContributor,

  australiaIncludeMedicare,
  onAustraliaIncludeMedicare,
}: {
  region: Region;

  usaFilingStatus: UsaFilingStatus;

  onUsaFilingStatus: (
    value: UsaFilingStatus
  ) => void;

  ukJurisdiction: UkJurisdiction;

  onUkJurisdiction: (
    value: UkJurisdiction
  ) => void;

  nepalSSFContributor: boolean;

  onNepalSSFContributor: (
    value: boolean
  ) => void;

  australiaIncludeMedicare: boolean;

  onAustraliaIncludeMedicare: (
    value: boolean
  ) => void;
}) {
  if (region === "usa") {
    return (
      <OptionCard
        title="US Federal Tax Settings"
        description="Choose your 2026 federal filing status."
      >
        <SelectInput
          value={
            usaFilingStatus
          }
          onChange={(value) =>
            onUsaFilingStatus(
              value as UsaFilingStatus
            )
          }
          options={[
            {
              value: "single",
              label: "Single",
            },

            {
              value:
                "married_joint",
              label:
                "Married Filing Jointly",
            },

            {
              value:
                "married_separate",
              label:
                "Married Filing Separately",
            },

            {
              value:
                "head_household",
              label:
                "Head of Household",
            },
          ]}
        />
      </OptionCard>
    );
  }

  if (region === "uk") {
    return (
      <OptionCard
        title="UK Tax Region"
        description="Scotland uses separate income-tax bands."
      >
        <SelectInput
          value={
            ukJurisdiction
          }
          onChange={(value) =>
            onUkJurisdiction(
              value as UkJurisdiction
            )
          }
          options={[
            {
              value:
                "england_wales_ni",
              label:
                "England / Wales / Northern Ireland",
            },

            {
              value:
                "scotland",
              label: "Scotland",
            },
          ]}
        />
      </OptionCard>
    );
  }

  if (region === "nepal") {
    return (
      <OptionCard
        title="Nepal SSF Status"
        description="Qualifying SSF/pension contributors may not pay the first-band 1% social security tax."
      >
        <Toggle
          checked={
            nepalSSFContributor
          }
          onChange={
            onNepalSSFContributor
          }
          label="I qualify for the SSF/pension-fund first-band exemption"
        />
      </OptionCard>
    );
  }

  if (
    region === "australia"
  ) {
    return (
      <OptionCard
        title="Australian Medicare Levy"
        description="The normal levy is 2%; low-income reductions need additional personal information."
      >
        <Toggle
          checked={
            australiaIncludeMedicare
          }
          onChange={
            onAustraliaIncludeMedicare
          }
          label="Include standard 2% Medicare levy"
        />
      </OptionCard>
    );
  }

  if (region === "canada") {
    return (
      <div
        className="
          mb-6
          rounded-xl
          border
          border-amber-200
          bg-amber-50
          p-4
        "
      >
        <p
          className="
            text-xs
            font-bold
            text-amber-900
          "
        >
          Canada: federal estimate
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-relaxed
            text-amber-800
          "
        >
          Current 2026 federal
          income tax, CPP and EI
          are included. Provincial
          or territorial income tax
          is not included yet.
        </p>
      </div>
    );
  }

  return null;
}

/* ══════════════════════════════════════════════════════════
   SMALL UI COMPONENTS
══════════════════════════════════════════════════════════ */

function RegionSelect({
  region,
  onChange,
}: {
  region: Region;

  onChange: (
    region: Region
  ) => void;
}) {
  return (
    <label
      className="
        w-full
        lg:w-[290px]
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
        Region
      </span>

      <select
        value={region}
        onChange={(event) =>
          onChange(
            event.target
              .value as Region
          )
        }
        className="
          w-full
          cursor-pointer
          rounded-xl
          border
          border-blue-200
          bg-white
          px-4
          py-3
          text-sm
          font-bold
          text-slate-800
          shadow-sm
          outline-none
          transition

          hover:border-blue-400
          hover:bg-blue-50

          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
        "
      >
        {REGIONS.map(
          (item) => (
            <option
              key={
                item.value
              }
              value={
                item.value
              }
            >
              {
                REGION_FLAGS[
                  item.value
                ]
              }{" "}
              {item.name}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function SalaryInput({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
}: {
  id: string;
  label: string;
  value: number;

  onChange: (
    value: number
  ) => void;

  prefix?: string;
  suffix?: string;

  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label htmlFor={id}>
      <span
        className="
          mb-2
          block
          text-[10px]
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
          overflow-hidden
          rounded-xl
          border
          border-slate-300
          bg-white
          shadow-sm
          transition

          hover:border-blue-400

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
              text-sm
              font-bold
              text-slate-500
            "
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) =>
            onChange(
              Number(
                event.target
                  .value
              ) || 0
            )
          }
          className="
            min-w-0
            flex-1
            px-3
            py-3
            text-sm
            font-semibold
            text-slate-900
            outline-none
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
    </label>
  );
}

function PayFrequency({
  value,
  options,
  onChange,
}: {
  value: string;

  options: string[];

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label>
      <span
        className="
          mb-2
          block
          text-[10px]
          font-bold
          uppercase
          tracking-wider
          text-slate-500
        "
      >
        Pay Frequency
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-3
          py-3
          text-sm
          font-semibold
          outline-none
          transition

          hover:border-blue-400

          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
        "
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  );
}

function OptionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="
        mb-6
        rounded-xl
        border
        border-indigo-200
        bg-indigo-50
        p-4
      "
    >
      <p
        className="
          text-xs
          font-bold
          text-indigo-900
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          text-indigo-700
        "
      >
        {description}
      </p>

      <div className="mt-3">
        {children}
      </div>
    </div>
  );
}

function SelectInput({
  value,
  options,
  onChange,
}: {
  value: string;

  options: {
    value: string;
    label: string;
  }[];

  onChange: (
    value: string
  ) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      className="
        w-full
        max-w-md
        rounded-xl
        border
        border-indigo-200
        bg-white
        px-3
        py-2.5
        text-sm
        font-semibold
        text-slate-800
        outline-none

        hover:border-indigo-400

        focus:ring-4
        focus:ring-indigo-500/10
      "
    >
      {options.map(
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
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;

  onChange: (
    value: boolean
  ) => void;

  label: string;
}) {
  return (
    <label
      className="
        flex
        cursor-pointer
        items-center
        gap-3
      "
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() =>
          onChange(!checked)
        }
        className={`
          relative
          h-6
          w-11
          rounded-full
          transition

          ${
            checked
              ? "bg-indigo-600"
              : "bg-slate-300"
          }
        `}
      >
        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            transition

            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />
      </button>

      <span
        className="
          text-xs
          font-medium
          text-slate-700
        "
      >
        {label}
      </span>
    </label>
  );
}

function Badge({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-lg
        border
        border-blue-100
        bg-white
        px-3
        py-1.5
      "
    >
      <span
        className="
          text-[9px]
          font-bold
          uppercase
          text-slate-400
        "
      >
        {title}
      </span>

      <span
        className="
          ml-2
          text-[11px]
          font-bold
          text-slate-700
        "
      >
        {value}
      </span>
    </div>
  );
}

function ResultCell({
  label,
  value,
  danger,
  warning,
}: {
  label: string;
  value: string;
  danger?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className="
        border-b
        border-emerald-100
        p-4
        last:border-0
        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          font-mono
          text-xs
          font-bold

          ${
            danger
              ? "text-red-600"
              : warning
                ? "text-amber-600"
                : "text-slate-800"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle?: string;

  tone:
    | "red"
    | "amber"
    | "violet"
    | "emerald";
}) {
  const style = {
    red:
      "border-red-200 bg-red-50 text-red-700",

    amber:
      "border-amber-200 bg-amber-50 text-amber-700",

    violet:
      "border-violet-200 bg-violet-50 text-violet-700",

    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[tone];

  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        transition

        hover:-translate-y-0.5
        hover:shadow-md

        ${style}
      `}
    >
      <p
        className="
          text-[9px]
          font-bold
          uppercase
          text-slate-400
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xl
          font-bold
        "
      >
        {value}
      </p>

      {subtitle && (
        <p
          className="
            mt-1
            text-[10px]
            text-slate-500
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-slate-100
        px-4
        py-3
        last:border-0
        hover:bg-slate-50
      "
    >
      <span
        className="
          text-xs
          text-slate-500
        "
      >
        {label}
      </span>

      <span
        className={`
          font-mono
          text-xs
          font-bold

          ${
            positive
              ? "text-emerald-700"
              : "text-slate-800"
          }
        `}
      >
        {value}
      </span>
    </div>
  );
}
