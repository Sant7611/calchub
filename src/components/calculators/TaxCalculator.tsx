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
   TYPES
══════════════════════════════════════════════════════════ */

interface TaxCalculatorProps {
  /**
   * Use this for country-specific SEO pages.
   *
   * Example:
   *
   * <TaxCalculator defaultRegion="nepal" />
   */
  defaultRegion?: Region;
}

/* ══════════════════════════════════════════════════════════
   REGIONS
══════════════════════════════════════════════════════════ */

const REGION_OPTIONS =
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

/* ══════════════════════════════════════════════════════════
   DEFAULT INCOME VALUES

   These are only convenient input defaults.
   They are NOT tax thresholds or government data.
══════════════════════════════════════════════════════════ */

const DEFAULT_INCOME: Record<
  Region,
  number
> = {
  global: 50_000,

  usa: 75_000,

  nepal: 1_200_000,

  india: 1_200_000,

  uk: 45_000,

  canada: 70_000,

  australia: 90_000,
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */

export function TaxCalculator({
  defaultRegion = "nepal",
}: TaxCalculatorProps) {
  const {
    setRegion: setGlobalRegion,
  } = useRegion();

  /*
   * Keep an EMI-style local selection.
   *
   * This is important for country-specific SEO routes:
   *
   * /tax-calculator/nepal
   * <TaxCalculator defaultRegion="nepal" />
   *
   * The initial visible HTML will represent Nepal
   * rather than depending on persisted localStorage state.
   */
  const [
    selectedRegion,
    setSelectedRegion,
  ] =
    useState<Region>(
      defaultRegion
    );

  const config =
    getRegionConfig(
      selectedRegion
    );

  const formatters = useMemo(
    () =>
      makeFormatters(
        selectedRegion
      ),
    [selectedRegion]
  );

  /* ─────────────────────────────────────────────────────
     Main income
  ───────────────────────────────────────────────────── */

  const [
    annualIncome,
    setAnnualIncome,
  ] = useState(
    DEFAULT_INCOME[
      defaultRegion
    ]
  );

  /* ─────────────────────────────────────────────────────
     USA options
  ───────────────────────────────────────────────────── */

  const [
    usaFilingStatus,
    setUsaFilingStatus,
  ] =
    useState<UsaFilingStatus>(
      "single"
    );

  /* ─────────────────────────────────────────────────────
     UK options
  ───────────────────────────────────────────────────── */

  const [
    ukJurisdiction,
    setUkJurisdiction,
  ] =
    useState<UkJurisdiction>(
      "england_wales_ni"
    );

  /* ─────────────────────────────────────────────────────
     Nepal options
  ───────────────────────────────────────────────────── */

  const [
    nepalSSFContributor,
    setNepalSSFContributor,
  ] = useState(false);

  /* ─────────────────────────────────────────────────────
     Australia options
  ───────────────────────────────────────────────────── */

  const [
    australiaIncludeMedicare,
    setAustraliaIncludeMedicare,
  ] = useState(true);

  /* ══════════════════════════════════════════════════════
     VALIDATION
  ══════════════════════════════════════════════════════ */

  const errors = useMemo(
    () => {
      const list: string[] = [];

      if (annualIncome < 0) {
        list.push(
          "Annual income cannot be negative."
        );
      }

      if (
        !Number.isFinite(
          annualIncome
        )
      ) {
        list.push(
          "Please enter a valid annual income."
        );
      }

      return list;
    },
    [annualIncome]
  );

  const isValid =
    errors.length === 0;

  /* ══════════════════════════════════════════════════════
     TAX CONTEXT
  ══════════════════════════════════════════════════════ */

  const taxContext =
    useMemo<TaxContext>(
      () => ({
        usaFilingStatus,

        ukJurisdiction,

        nepalSSFContributor,

        australiaIncludeMedicare,
      }),
      [
        usaFilingStatus,
        ukJurisdiction,
        nepalSSFContributor,
        australiaIncludeMedicare,
      ]
    );

  /* ══════════════════════════════════════════════════════
     TAX CALCULATION
  ══════════════════════════════════════════════════════ */

  const result = useMemo(
    () =>
      calculateRegionalTax(
        isValid
          ? annualIncome
          : 0,

        selectedRegion,

        taxContext
      ),
    [
      annualIncome,
      selectedRegion,
      taxContext,
      isValid,
    ]
  );

  /* ══════════════════════════════════════════════════════
     DERIVED VALUES
  ══════════════════════════════════════════════════════ */

  const totalTaxAndPayroll =
    result.totalGovernmentDeductions;

  const afterTaxIncome =
    result.estimatedTakeHome;

  const monthlyAfterTax =
    afterTaxIncome / 12;

  const monthlyTax =
    totalTaxAndPayroll / 12;

  const effectiveRate =
    annualIncome > 0
      ? (totalTaxAndPayroll /
          annualIncome) *
        100
      : 0;

  const incomeTaxShare =
    annualIncome > 0
      ? (result.incomeTax /
          annualIncome) *
        100
      : 0;

  const payrollShare =
    annualIncome > 0
      ? (result.payrollDeductionsTotal /
          annualIncome) *
        100
      : 0;

  const takeHomeShare =
    annualIncome > 0
      ? (afterTaxIncome /
          annualIncome) *
        100
      : 0;

  /* ══════════════════════════════════════════════════════
     REGION CHANGE
  ══════════════════════════════════════════════════════ */

  function handleRegionChange(
    region: Region
  ) {
    setSelectedRegion(region);

    /*
     * Keep your application's global region
     * preference updated too.
     */
    setGlobalRegion(region);

    /*
     * Load a convenient example amount
     * for the newly selected currency.
     *
     * This is not currency conversion.
     */
    setAnnualIncome(
      DEFAULT_INCOME[region]
    );
  }

  /* ══════════════════════════════════════════════════════ */

  return (
    <section
      aria-labelledby="tax-calculator-title"
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

      <header
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
          <div className="max-w-3xl">
            {/* SEO-friendly visible heading */}

            <h2
              id="tax-calculator-title"
              className="
                text-xl
                font-bold
                tracking-tight
                text-slate-950
                sm:text-2xl
              "
            >
              Tax Calculator{" "}
              {config.name}
            </h2>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-slate-600
              "
            >
              Calculate estimated{" "}
              {config.name} income
              tax, statutory payroll
              deductions, effective tax
              rate, and after-tax income
              using the currently
              configured{" "}
              {result.meta.taxYear} tax
              rules.
            </p>
          </div>

          <RegionSelector
            region={
              selectedRegion
            }
            onChange={
              handleRegionChange
            }
          />
        </div>

        {/* Tax metadata */}

        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          <InfoBadge
            label="Country"
            value={config.name}
          />

          <InfoBadge
            label="Currency"
            value={`${config.currency.code} (${config.currency.symbol})`}
          />

          <InfoBadge
            label="Tax Year"
            value={
              result.meta.taxYear
            }
          />

          <InfoBadge
            label="Rules Checked"
            value={
              result.meta.verifiedOn
            }
          />
        </div>
      </header>

      {/* ════════════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════════════ */}

      <div className="p-5 sm:p-6">

        {/* ─────────────────────────────────────────────
            TAX DATA STATUS
        ───────────────────────────────────────────── */}

        <TaxDataNotice
          region={selectedRegion}
          description={
            result.meta.description
          }
          taxYear={
            result.meta.taxYear
          }
          sources={
            result.meta.sourceNames
          }
        />

        {/* ─────────────────────────────────────────────
            REGION SPECIFIC OPTIONS
        ───────────────────────────────────────────── */}

        <RegionalTaxOptions
          region={
            selectedRegion
          }

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

        {/* ─────────────────────────────────────────────
            VALIDATION
        ───────────────────────────────────────────── */}

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
              Please check your tax
              calculator input
            </p>

            <ul
              className="
                mt-2
                space-y-1
              "
            >
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
            INPUT
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
              Income details
            </legend>

            <p
              className="
                mt-1
                text-xs
                leading-relaxed
                text-slate-500
              "
            >
              Enter your annual gross
              employment income before
              income tax and statutory
              payroll deductions.
            </p>
          </div>

          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >
            <TaxInput
              id="annual-tax-income"
              label={`Annual income (${config.currency.code})`}
              value={
                annualIncome
              }
              onChange={
                setAnnualIncome
              }
              prefix={
                config.currency
                  .symbol
              }
              min={0}
              step={
                selectedRegion ===
                  "nepal" ||
                selectedRegion ===
                  "india"
                  ? 10_000
                  : 1_000
              }
              hint="Gross annual employment income"
            />

            <div
              className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4
              "
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
                Monthly gross equivalent
              </p>

              <p
                className="
                  mt-2
                  text-xl
                  font-bold
                  text-slate-900
                "
              >
                {formatters.money(
                  annualIncome / 12,
                  2
                )}
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  text-slate-500
                "
              >
                Before estimated tax
                and payroll deductions
              </p>
            </div>
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
              Estimated Total Tax &
              Statutory Deductions
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
                  totalTaxAndPayroll,
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
                "
              >
                {effectiveRate.toFixed(
                  1
                )}
                % effective
              </span>
            </div>

            <p
              className="
                mt-3
                max-w-2xl
                text-sm
                leading-relaxed
                text-slate-600
              "
            >
              Estimated from{" "}
              {formatters.money(
                annualIncome,
                0
              )}{" "}
              annual income under{" "}
              {result.meta.taxYear}.
            </p>
          </div>

          {/* ── Main breakdown ──────────────────────── */}

          <div
            className="
              grid
              border-t
              border-blue-200
              bg-white/80
              sm:grid-cols-3
            "
          >
            <ResultCell
              label="Income Tax"
              value={
                formatters.money(
                  result.incomeTax,
                  2
                )
              }
              tone="red"
            />

            <ResultCell
              label="Payroll / Levies"
              value={
                formatters.money(
                  result.payrollDeductionsTotal,
                  2
                )
              }
              tone="amber"
            />

            <ResultCell
              label="After-Tax Income"
              value={
                formatters.money(
                  afterTaxIncome,
                  2
                )
              }
              tone="emerald"
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            STATISTICS
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
          <TaxStat
            title="Taxable Income"
            value={
              formatters.money(
                result.taxableIncome,
                0
              )
            }
            subtitle="After applicable baseline deductions"
            tone="blue"
          />

          <TaxStat
            title="Income Tax"
            value={
              formatters.money(
                result.incomeTax,
                0
              )
            }
            subtitle={`${incomeTaxShare.toFixed(
              1
            )}% of gross income`}
            tone="red"
          />

          <TaxStat
            title="Monthly Tax"
            value={
              formatters.money(
                monthlyTax,
                2
              )
            }
            subtitle="Average monthly equivalent"
            tone="amber"
          />

          <TaxStat
            title="Monthly After Tax"
            value={
              formatters.money(
                monthlyAfterTax,
                2
              )
            }
            subtitle={`${takeHomeShare.toFixed(
              1
            )}% retained`}
            tone="emerald"
          />
        </div>

        {/* ══════════════════════════════════════════════
            TAX BREAKDOWN BARS
        ══════════════════════════════════════════════ */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
          "
        >
          <div>
            <h3
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              Income breakdown
            </h3>

            <p
              className="
                mt-1
                text-[11px]
                text-slate-500
              "
            >
              Estimated distribution of
              your annual gross income.
            </p>
          </div>

          <div
            className="
              mt-5
              space-y-4
            "
          >
            <BreakdownBar
              label="After-tax income"
              value={
                formatters.money(
                  afterTaxIncome,
                  0
                )
              }
              percentage={
                takeHomeShare
              }
              color="bg-emerald-500"
            />

            <BreakdownBar
              label="Income tax"
              value={
                formatters.money(
                  result.incomeTax,
                  0
                )
              }
              percentage={
                incomeTaxShare
              }
              color="bg-red-500"
            />

            {result.payrollDeductionsTotal >
              0 && (
              <BreakdownBar
                label="Payroll deductions"
                value={
                  formatters.money(
                    result.payrollDeductionsTotal,
                    0
                  )
                }
                percentage={
                  payrollShare
                }
                color="bg-amber-500"
              />
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            DETAILED BREAKDOWN
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
              font-bold
              text-slate-700
              transition-colors
              hover:bg-slate-100
            "
          >
            <span>
              Detailed{" "}
              {config.name} tax
              calculation
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
              label="Annual gross income"
              value={
                formatters.money(
                  annualIncome,
                  2
                )
              }
            />

            <SummaryRow
              label="Taxable income"
              value={
                formatters.money(
                  result.taxableIncome,
                  2
                )
              }
            />

            {result.deductionDetails.map(
              (deduction) => (
                <SummaryRow
                  key={
                    deduction.label
                  }
                  label={
                    deduction.label
                  }
                  value={
                    formatters.money(
                      deduction.amount,
                      2
                    )
                  }
                  negative
                />
              )
            )}

            <SummaryRow
              label="Total tax & statutory deductions"
              value={
                formatters.money(
                  totalTaxAndPayroll,
                  2
                )
              }
              negative
            />

            <SummaryRow
              label="Estimated after-tax income"
              value={
                formatters.money(
                  afterTaxIncome,
                  2
                )
              }
              positive
              last
            />
          </div>
        </details>

        {/* ══════════════════════════════════════════════
            COUNTRY-SPECIFIC SEO CONTENT
        ══════════════════════════════════════════════ */}

        <CountryTaxContent
          region={
            selectedRegion
          }
          countryName={
            config.name
          }
          taxYear={
            result.meta.taxYear
          }
        />

        {/* ══════════════════════════════════════════════
            LIMITATIONS
        ══════════════════════════════════════════════ */}

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
            Important calculation
            limitations
          </p>

          <ul
            className="
              mt-2
              space-y-1.5
            "
          >
            {result.meta.limitations.map(
              (limitation) => (
                <li
                  key={
                    limitation
                  }
                  className="
                    flex
                    items-start
                    gap-2
                    text-[11px]
                    leading-relaxed
                    text-amber-800
                  "
                >
                  <span>•</span>

                  <span>
                    {limitation}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Notes */}

        {result.notes.length >
          0 && (
          <details
            className="
              group
              mt-3
              rounded-xl
              border
              border-slate-200
              bg-slate-50
            "
          >
            <summary
              className="
                cursor-pointer
                list-none
                px-4
                py-3
                text-xs
                font-bold
                text-slate-700
              "
            >
              Calculation notes
            </summary>

            <div
              className="
                border-t
                border-slate-200
                px-4
                py-3
              "
            >
              <ul className="space-y-1">
                {result.notes.map(
                  (note) => (
                    <li
                      key={note}
                      className="
                        flex
                        gap-2
                        text-[11px]
                        leading-relaxed
                        text-slate-600
                      "
                    >
                      <span>•</span>

                      <span>
                        {note}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </details>
        )}

        {/* Disclaimer */}

        <div
          className="
            mt-5
            border-t
            border-slate-200
            pt-4
          "
        >
          <p
            className="
              text-[10.5px]
              leading-relaxed
              text-slate-500
            "
          >
            This {config.name} tax
            calculator provides an
            estimate based on the
            currently configured tax
            rules. It is not tax,
            accounting, legal, or
            financial advice. Your
            actual tax liability may
            differ because of
            deductions, tax credits,
            residency, filing details,
            benefits, investment
            income, local taxes, and
            other circumstances.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   REGION OPTIONS
══════════════════════════════════════════════════════════ */

function RegionalTaxOptions({
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
      <OptionPanel
        title="United States tax settings"
        description="Choose your federal filing status for the tax calculation."
      >
        <StyledSelect
          label="Federal filing status"
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
      </OptionPanel>
    );
  }

  if (region === "uk") {
    return (
      <OptionPanel
        title="United Kingdom tax region"
        description="Scotland has different income-tax bands from England, Wales and Northern Ireland."
      >
        <StyledSelect
          label="Tax jurisdiction"
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

              label:
                "Scotland",
            },
          ]}
        />
      </OptionPanel>
    );
  }

  if (region === "nepal") {
    return (
      <OptionPanel
        title="Nepal tax settings"
        description="Select this only if you qualify for the applicable SSF or approved pension-fund first-band treatment."
      >
        <Toggle
          checked={
            nepalSSFContributor
          }
          onChange={
            onNepalSSFContributor
          }
          label="Apply qualifying SSF / pension-fund first-band treatment"
        />
      </OptionPanel>
    );
  }

  if (
    region === "australia"
  ) {
    return (
      <OptionPanel
        title="Australia tax settings"
        description="The normal Medicare levy can be included in the estimate."
      >
        <Toggle
          checked={
            australiaIncludeMedicare
          }
          onChange={
            onAustraliaIncludeMedicare
          }
          label="Include standard Medicare levy"
        />
      </OptionPanel>
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
          Canada federal calculation
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-relaxed
            text-amber-800
          "
        >
          This calculation currently
          includes federal income tax
          and configured employee CPP
          and EI calculations.
          Provincial and territorial
          income taxes require a
          province/territory selector
          and should be added
          separately.
        </p>
      </div>
    );
  }

  if (region === "india") {
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
          India new tax regime
        </p>

        <p
          className="
            mt-1
            text-[11px]
            leading-relaxed
            text-indigo-700
          "
        >
          The calculator currently
          uses the configured new tax
          regime, including applicable
          standard deduction, rebate
          logic, and Health &
          Education Cess implemented
          by the shared tax engine.
        </p>
      </div>
    );
  }

  return null;
}

/* ══════════════════════════════════════════════════════════
   COUNTRY SEO CONTENT
══════════════════════════════════════════════════════════ */

function CountryTaxContent({
  region,
  countryName,
  taxYear,
}: {
  region: Region;
  countryName: string;
  taxYear: string;
}) {
  const content =
    getCountryContent(
      region,
      countryName,
      taxYear
    );

  return (
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
        Tax Calculator{" "}
        {countryName}
      </h3>

      <p
        className="
          mt-2
          text-xs
          leading-6
          text-slate-600
        "
      >
        {content.intro}
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
          title="Income Tax"
          text={
            content.tax
          }
        />

        <ExplanationCard
          title="Payroll Deductions"
          text={
            content.payroll
          }
        />

        <ExplanationCard
          title="After-Tax Income"
          text={
            content.afterTax
          }
        />
      </div>

      <div className="mt-6">
        <h3
          className="
            text-sm
            font-bold
            text-slate-900
          "
        >
          {countryName} Tax
          Calculator FAQs
        </h3>

        <div
          className="
            mt-3
            space-y-2
          "
        >
          <FaqItem
            question={`What does the ${countryName} tax calculator calculate?`}
            answer={
              content.faq1
            }
          />

          <FaqItem
            question={`Which tax year does this ${countryName} tax calculator use?`}
            answer={`The calculator currently uses ${taxYear}, according to the active tax-rule dataset configured in the application.`}
          />

          <FaqItem
            question={`Is the ${countryName} tax calculator exact?`}
            answer={
              content.faq2
            }
          />
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════
   COUNTRY CONTENT
══════════════════════════════════════════════════════════ */

function getCountryContent(
  region: Region,
  country: string,
  taxYear: string
) {
  switch (region) {
    case "usa":
      return {
        intro:
          `Use this Tax Calculator ${country} tool to estimate federal income tax, employee Social Security and Medicare deductions, effective tax rate, and after-tax income using ${taxYear}.`,

        tax:
          "Federal income tax is estimated using the selected filing status and the applicable marginal tax bands.",

        payroll:
          "Employee payroll deductions may include Social Security, Medicare, and Additional Medicare Tax where applicable.",

        afterTax:
          "After-tax income is estimated by subtracting calculated federal tax and employee payroll deductions from gross income.",

        faq1:
          "It estimates federal income tax and configured employee payroll taxes. State and local taxes are not included.",

        faq2:
          "No. Actual US tax can differ because of state taxes, tax credits, itemized deductions, benefits, investment income, and other circumstances.",
      };

    case "nepal":
      return {
        intro:
          `Use this Tax Calculator ${country} tool to estimate individual employment income tax and after-tax income using ${taxYear}.`,

        tax:
          "Income is processed through the configured progressive Nepal tax bands in the shared tax engine.",

        payroll:
          "SSF and approved retirement-fund treatment can depend on eligibility and contribution rules, so the calculator only applies the options explicitly selected.",

        afterTax:
          "The result shows estimated annual and monthly after-tax income after the configured statutory tax calculation.",

        faq1:
          "It estimates employment income tax using the configured Nepal tax-year rules and optional qualifying SSF treatment.",

        faq2:
          "No. Approved retirement-fund deductions, SSF contribution bases, exemptions, allowances and other individual circumstances can change the final tax liability.",
      };

    case "india":
      return {
        intro:
          `Use this Tax Calculator ${country} tool to estimate income tax under the configured new tax regime for ${taxYear}, including the implemented standard deduction, rebate and cess rules.`,

        tax:
          "Income tax is calculated through the current configured new-regime marginal tax bands.",

        payroll:
          "The tax engine keeps statutory income-tax calculations separate from employer or voluntary retirement deductions.",

        afterTax:
          "After-tax income shows the estimated amount remaining after the calculated tax and applicable statutory charges.",

        faq1:
          "It estimates tax under the currently configured India new tax regime, including implemented rebate and cess calculations.",

        faq2:
          "No. Surcharge, special-rate income, capital gains, deductions outside the modeled regime, and other individual circumstances can affect actual liability.",
      };

    case "uk":
      return {
        intro:
          `Use this Tax Calculator ${country} tool to estimate Income Tax and employee National Insurance using ${taxYear}. Scotland can be calculated separately from England, Wales and Northern Ireland.`,

        tax:
          "The tax engine applies the relevant personal allowance and income-tax bands for the selected UK jurisdiction.",

        payroll:
          "Employee Class 1 National Insurance is included according to the configured baseline rules.",

        afterTax:
          "After-tax income is estimated after Income Tax and employee National Insurance.",

        faq1:
          "It estimates UK Income Tax and configured employee National Insurance based on annual employment income.",

        faq2:
          "No. Tax codes, pension contributions, student loans, taxable benefits and other payroll circumstances can change the actual amount.",
      };

    case "canada":
      return {
        intro:
          `Use this Tax Calculator ${country} tool to estimate federal income tax, CPP, EI and after-tax income using ${taxYear}.`,

        tax:
          "The current implementation calculates federal income tax using the configured federal brackets and baseline credits.",

        payroll:
          "Configured employee CPP, CPP2 and Employment Insurance deductions are included where applicable.",

        afterTax:
          "After-tax income is a federal estimate because provincial and territorial income tax is not yet included.",

        faq1:
          "It currently estimates Canadian federal income tax plus configured CPP and EI contributions.",

        faq2:
          "No. Provincial or territorial taxes are not yet included, so it should not be treated as a complete Canadian payroll calculation.",
      };

    case "australia":
      return {
        intro:
          `Use this Tax Calculator ${country} tool to estimate resident individual income tax and after-tax income using ${taxYear}.`,

        tax:
          "Resident income-tax bands from the active Australian tax dataset are applied to annual income.",

        payroll:
          "The standard Medicare levy can be included. Employer Super Guarantee is not treated as an employee income-tax deduction.",

        afterTax:
          "After-tax income is estimated after income tax and any Medicare levy included in the calculation.",

        faq1:
          "It estimates resident individual income tax and optionally the standard Medicare levy.",

        faq2:
          "No. Medicare exemptions, low-income reductions, offsets, deductions and the Medicare Levy Surcharge may change the actual result.",
      };

    default:
      return {
        intro:
          "The Global tax calculator provides an illustrative tax estimate and does not represent the tax laws of a specific country.",

        tax:
          "A simplified illustrative tax assumption is used.",

        payroll:
          "Country-specific payroll deductions are not modeled in Global mode.",

        afterTax:
          "After-tax income is illustrative only.",

        faq1:
          "Global mode provides a simple illustrative income-tax estimate.",

        faq2:
          "No. Select a specific supported country for a region-based calculation.",
      };
  }
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
  return (
    <label
      className="
        block
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
        Country / Region
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
          aria-label="Select tax calculator country"
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

            hover:border-blue-400
            hover:bg-blue-50

            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-500/10
          "
        >
          {REGION_OPTIONS.map(
            (option) => {
              const optionConfig =
                getRegionConfig(
                  option.value
                );

              return (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    REGION_FLAGS[
                      option.value
                    ]
                  }{" "}
                  {option.name} —{" "}
                  {
                    optionConfig
                      .currency.code
                  }
                </option>
              );
            }
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
   DATA NOTICE
══════════════════════════════════════════════════════════ */

function TaxDataNotice({
  region,
  description,
  taxYear,
  sources,
}: {
  region: Region;
  description: string;
  taxYear: string;
  sources: string[];
}) {
  const illustrative =
    region === "global";

  return (
    <div
      className={`
        mb-6
        rounded-xl
        border
        p-4

        ${
          illustrative
            ? "border-amber-200 bg-amber-50"
            : "border-blue-200 bg-blue-50"
        }
      `}
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full

            ${
              illustrative
                ? "bg-amber-100"
                : "bg-blue-100"
            }
          `}
        >
          {illustrative
            ? "ℹ"
            : "✓"}
        </div>

        <div>
          <p
            className={`
              text-xs
              font-bold

              ${
                illustrative
                  ? "text-amber-900"
                  : "text-blue-900"
              }
            `}
          >
            {taxYear}
          </p>

          <p
            className={`
              mt-1
              text-[11px]
              leading-relaxed

              ${
                illustrative
                  ? "text-amber-800"
                  : "text-blue-700"
              }
            `}
          >
            {description}
          </p>

          {sources.length >
            0 && (
            <p
              className={`
                mt-1
                text-[10px]

                ${
                  illustrative
                    ? "text-amber-700"
                    : "text-blue-600"
                }
              `}
            >
              Sources:{" "}
              {sources.join(
                " · "
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INPUT
══════════════════════════════════════════════════════════ */

function TaxInput({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step = 1,
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

  min?: number;
  max?: number;
  step?: number;

  hint?: string;
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
          min-h-12
          overflow-hidden
          rounded-xl
          border
          border-slate-300
          bg-white
          shadow-sm
          transition-all

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
            Number.isFinite(
              value
            )
              ? value
              : 0
          }
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const parsed =
              Number(
                event.target.value
              );

            onChange(
              Number.isFinite(
                parsed
              )
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
   OPTION PANEL
══════════════════════════════════════════════════════════ */

function OptionPanel({
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
          leading-relaxed
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

/* ══════════════════════════════════════════════════════════
   SELECT
══════════════════════════════════════════════════════════ */

function StyledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;

  onChange: (
    value: string
  ) => void;

  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <label
      className="
        block
        max-w-lg
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
          text-indigo-700
        "
      >
        {label}
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
          border-indigo-200
          bg-white
          px-3
          py-2.5
          text-sm
          font-semibold
          text-slate-800
          outline-none
          transition-all

          hover:border-indigo-400

          focus:border-indigo-500
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
    </label>
  );
}

/* ══════════════════════════════════════════════════════════
   TOGGLE
══════════════════════════════════════════════════════════ */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;

  onChange: (
    checked: boolean
  ) => void;

  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() =>
        onChange(!checked)
      }
      className="
        flex
        items-center
        gap-3
        text-left
      "
    >
      <span
        className={`
          relative
          block
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors

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
            shadow-sm
            transition-all

            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />
      </span>

      <span
        className="
          text-xs
          font-medium
          text-slate-700
        "
      >
        {label}
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   RESULT CELL
══════════════════════════════════════════════════════════ */

function ResultCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;

  tone:
    | "red"
    | "amber"
    | "emerald";
}) {
  const style = {
    red: "text-red-600",

    amber:
      "text-amber-600",

    emerald:
      "text-emerald-700",
  }[tone];

  return (
    <div
      className="
        border-b
        border-blue-100
        px-5
        py-4
        last:border-b-0

        sm:border-b-0
        sm:border-r
        sm:last:border-r-0
      "
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
          mt-1
          font-mono
          text-sm
          font-bold

          ${style}
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STAT
══════════════════════════════════════════════════════════ */

function TaxStat({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;

  tone:
    | "blue"
    | "red"
    | "amber"
    | "emerald";
}) {
  const style = {
    blue:
      "border-blue-200 bg-blue-50 text-blue-700",

    red:
      "border-red-200 bg-red-50 text-red-700",

    amber:
      "border-amber-200 bg-amber-50 text-amber-700",

    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  }[tone];

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

        ${style}
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
        {title}
      </p>

      <p
        className="
          mt-1.5
          text-xl
          font-bold
          tracking-tight
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[11px]
          text-slate-500
        "
      >
        {subtitle}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BREAKDOWN BAR
══════════════════════════════════════════════════════════ */

function BreakdownBar({
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
      <div
        className="
          mb-1.5
          flex
          items-center
          justify-between
          gap-3
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
            transition-all
            duration-500

            ${color}
          `}
          style={{
            width: `${safePercentage}%`,
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
        {safePercentage.toFixed(
          1
        )}
        %
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
  negative,
  positive,
  last,
}: {
  label: string;
  value: string;

  negative?: boolean;
  positive?: boolean;
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
              : negative
                ? "text-red-600"
                : "text-slate-800"
          }
        `}
      >
        {negative
          ? "- "
          : ""}

        {value}
      </span>
    </div>
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
   EXPLANATION CARD
══════════════════════════════════════════════════════════ */

function ExplanationCard({
  title,
  text,
}: {
  title: string;
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

        hover:-translate-y-0.5
        hover:border-blue-300
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
