"use client";

import Link from "next/link";

import {
  ArrowRight,
  BadgeDollarSign,
  Landmark,
  WalletCards,
} from "lucide-react";

import {
  useRegion,
} from "@/store/useRegionStore";

/* ──────────────────────────────────────────────────────────
   Supported regional calculator routes

   Add another entry here whenever you create
   tax/salary routes for another country.
────────────────────────────────────────────────────────── */

const REGIONAL_ROUTES: Record<
  string,
  string
> = {
  nepal: "nepal",
  india: "india",

  // Examples for future support:
  // usa: "usa",
  // uk: "uk",
  // australia: "australia",
};

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */

function getRegionName(
  region: string
): string {
  if (region === "global") {
    return "Global";
  }

  return region
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* ──────────────────────────────────────────────────────────
   Regional Finance Section
────────────────────────────────────────────────────────── */

export function RegionalFinanceSection() {
  const { region } = useRegion();

  const regionKey =
    String(region).toLowerCase();

  const routeSlug =
    REGIONAL_ROUTES[
      regionKey
    ];

  const hasRegionalCalculators =
    Boolean(routeSlug);

  const regionName =
    getRegionName(regionKey);

  /*
   * When Global or an unsupported region
   * is selected, use generic labels instead
   * of generating URLs that may not exist.
   */

  const displayRegion =
    hasRegionalCalculators
      ? regionName
      : null;

  const taxHref =
    hasRegionalCalculators
      ? `/finance/tax-calc/${routeSlug}`
      : "/finance";

  const salaryHref =
    hasRegionalCalculators
      ? `/finance/salary-calc/${routeSlug}`
      : "/finance";

  /*
   * Your existing EMI URL is not currently
   * region-specific, so we keep the route
   * while changing its visible title.
   */
  const homeLoanHref =
    "/emi-calculator/home-loan";

  return (
    <section
      className="pt-16"
      aria-labelledby="regional-finance-heading"
    >
      <div
        className="
          rounded-2xl
          bg-slate-900
          px-6
          py-8
          text-white
          sm:px-8
          sm:py-10
        "
      >
        {/* Header */}

        <p
          className="
            text-sm
            font-semibold
            uppercase
            tracking-[0.18em]
            text-indigo-200
          "
        >
          {displayRegion
            ? `${displayRegion} finance tools`
            : "Finance tools"}
        </p>

        <div
          className="
            mt-3
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div>
            <h2
              id="regional-finance-heading"
              className="
                text-3xl
                font-bold
                tracking-tight
              "
            >
              {displayRegion
                ? `Calculate tax, salary, and loan EMI for ${displayRegion}`
                : "Calculate tax, salary, and loan EMI"}
            </h2>

            <p
              className="
                mt-2
                max-w-2xl
                text-slate-300
              "
            >
              {displayRegion
                ? `Use ${displayRegion}-specific financial calculators for income tax, salary, take-home pay, and practical loan estimates.`
                : "Use practical financial calculators for income tax, salary, take-home pay, loans, and financial planning."}
            </p>
          </div>

          <Link
            href="/finance"
            className="
              inline-flex
              shrink-0
              items-center
              gap-1
              font-semibold
              text-indigo-200
              transition-colors
              hover:text-white
            "
          >
            Explore finance tools

            <ArrowRight
              className="
                h-4
                w-4
              "
            />
          </Link>
        </div>

        {/* Calculator Cards */}

        <div
          className="
            mt-7
            grid
            gap-4
            md:grid-cols-3
          "
        >
          {/* Income Tax */}

          <Link
            href={taxHref}
            className="
              group
              rounded-xl
              bg-white/10
              p-5
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-white/15
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white
            "
          >
            <BadgeDollarSign
              className="
                h-6
                w-6
                text-indigo-200
              "
            />

            <h3
              className="
                mt-4
                font-bold
              "
            >
              {displayRegion
                ? `${displayRegion} Income Tax Calculator`
                : "Income Tax Calculator"}
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-relaxed
                text-slate-300
              "
            >
              {displayRegion
                ? `Estimate ${displayRegion} income tax, deductions, and take-home pay.`
                : "Estimate income tax, deductions, and take-home pay."}
            </p>

            <span
              className="
                mt-4
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-indigo-200
                transition-colors
                group-hover:text-white
              "
            >
              Calculate tax

              <ArrowRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </Link>

          {/* Salary */}

          <Link
            href={salaryHref}
            className="
              group
              rounded-xl
              bg-white/10
              p-5
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-white/15
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white
            "
          >
            <WalletCards
              className="
                h-6
                w-6
                text-indigo-200
              "
            />

            <h3
              className="
                mt-4
                font-bold
              "
            >
              {displayRegion
                ? `${displayRegion} Salary Calculator`
                : "Salary Calculator"}
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-relaxed
                text-slate-300
              "
            >
              {displayRegion
                ? `Calculate gross salary, deductions, and estimated take-home pay for ${displayRegion}.`
                : "Turn gross salary into a clear take-home pay estimate."}
            </p>

            <span
              className="
                mt-4
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-indigo-200
                transition-colors
                group-hover:text-white
              "
            >
              Calculate salary

              <ArrowRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </Link>

          {/* Home Loan */}

          <Link
            href={homeLoanHref}
            className="
              group
              rounded-xl
              bg-white/10
              p-5
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-white/15
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white
            "
          >
            <Landmark
              className="
                h-6
                w-6
                text-indigo-200
              "
            />

            <h3
              className="
                mt-4
                font-bold
              "
            >
              {displayRegion
                ? `${displayRegion} Home Loan EMI Calculator`
                : "Home Loan EMI Calculator"}
            </h3>

            <p
              className="
                mt-1
                text-sm
                leading-relaxed
                text-slate-300
              "
            >
              {displayRegion
                ? `Estimate home-loan EMI, total interest, and repayment costs for ${displayRegion}.`
                : "Estimate monthly home-loan repayment and total interest."}
            </p>

            <span
              className="
                mt-4
                inline-flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-indigo-200
                transition-colors
                group-hover:text-white
              "
            >
              Calculate EMI

              <ArrowRight
                className="
                  h-3.5
                  w-3.5
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </span>
          </Link>
        </div>

        {/* Unsupported region notice */}

        {!hasRegionalCalculators &&
          regionKey !== "global" && (
            <p
              className="
                mt-5
                rounded-lg
                border
                border-white/10
                bg-white/5
                px-4
                py-3
                text-xs
                leading-5
                text-slate-300
              "
            >
              Country-specific tax and
              salary calculators are not
              available for{" "}
              {regionName} yet. Showing
              general finance tools
              instead.
            </p>
          )}
      </div>
    </section>
  );
}