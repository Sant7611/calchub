"use client";

import { useState, useMemo } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";
import { getRegionConfig, type Region } from "@/config/regions";

// Flag emojis for each region
const REGION_FLAGS: Record<Region, string> = {
  global: "🌍",
  usa: "🇺🇸",
  nepal: "🇳🇵",
  india: "🇮🇳",
  uk: "🇬🇧",
  canada: "🇨🇦",
  australia: "🇦🇺",
};

// Default loan amounts and interest rates by region
const DEFAULT_LOAN_AMOUNTS: Record<Region, number> = {
  global: 10_000,
  usa: 25_000,
  nepal: 1_000_000,
  india: 1_000_000,
  uk: 20_000,
  canada: 30_000,
  australia: 40_000,
};

const DEFAULT_INTEREST_RATES: Record<Region, number> = {
  global: 5,
  usa: 6.5,
  nepal: 11,
  india: 8.5,
  uk: 5.25,
  canada: 5.5,
  australia: 6,
};

/**
 * EMI Calculator with multi-region support.
 * Default region: Nepal (NPR)
 *
 * EMI = [P x R x (1+R)^N] / [(1+R)^N-1]
 * Where:
 * - P = Principal loan amount
 * - R = Monthly interest rate (annual rate / 12 / 100)
 * - N = Loan tenure in months
 */

export function LoanCalculator() {
  const { region, setRegion, config } = useRegion();
  const formatters = makeFormatters(region);

  // Use region as part of key to reset state when region changes
  // This avoids calling setState in useEffect which causes cascading renders
  const [amount, setAmount] = useState(DEFAULT_LOAN_AMOUNTS[region]);
  const [rate, setRate] = useState(DEFAULT_INTEREST_RATES[region]);
  const [years, setYears] = useState(5); // Default 5 years for all regions

  // Input validation
  const errors = useMemo(() => {
    const errs: string[] = [];
    if (amount < 0) errs.push("Principal amount cannot be negative.");
    if (rate < 0) errs.push("Interest rate cannot be negative.");
    if (years < 1 || years > 50) errs.push("Loan term must be between 1 and 50 years.");
    return errs;
  }, [amount, rate, years]);

  const isValid = errors.length === 0;

  const r = rate / 100 / 12;
  const n = years * 12;

  // EMI calculation formula - handle zero-interest loans safely
  const monthly = !isValid ? 0 : (r === 0
    ? amount / n
    : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

  const total = isValid ? monthly * n : 0;
  const interest = isValid ? total - amount : 0;

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    // Reset to new region's defaults without useEffect
    setAmount(DEFAULT_LOAN_AMOUNTS[newRegion]);
    setRate(DEFAULT_INTEREST_RATES[newRegion]);
  };

  return (
    <div className="min-w-0">
      {/* Region Selector */}
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Region
        </label>
        <div className="flex flex-wrap gap-2">
          {(["global", "nepal", "india", "usa", "uk", "canada", "australia"] as Region[]).map((r) => {
            const regionConfig = getRegionConfig(r);
            return (
              <button
                key={r}
                onClick={() => handleRegionChange(r)}
                className={`min-h-11 rounded-lg px-3 py-2 text-sm font-medium transition-all sm:px-4 lg:min-h-10 ${
                  region === r
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {REGION_FLAGS[r]} {regionConfig.name} ({regionConfig.currency.code})
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
          <ul className="space-y-1 text-sm text-red-700">
            {errors.map((err, i) => (
              <li key={i}>⚠️ {err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Field label={`Loan amount (${config.currency.code})`}>
          <NumInput
            value={amount}
            onChange={setAmount}
            prefix={config.currency.symbol}
            step={region === "nepal" || region === "india" ? 10000 : 500}
            min={0}
          />
        </Field>
        <Field label="Interest rate (APR)">
          <NumInput
            value={rate}
            onChange={setRate}
            suffix="%"
            step={0.1}
            min={0}
          />
        </Field>
        <Field label="Term">
          <NumInput
            value={years}
            onChange={setYears}
            suffix="yrs"
            min={1}
            max={50}
          />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label="Monthly Payment" value={formatters.money(monthly, 2)} />
        <Stat label="Total interest" value={formatters.money(interest, 0)} />
        <Stat label="Total repayment" value={formatters.money(total, 0)} />
      </StatGrid>

      {/* Amortization Summary */}
      <div className="mt-6 rounded-lg border border-border bg-card p-4 lg:p-3">
        <h4 className="mb-2 text-sm font-semibold text-foreground">Loan Summary</h4>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:gap-4">
          <div className="min-w-0">
            <span className="text-muted-foreground">Principal:</span>
            <span className="ml-2 break-words font-medium text-foreground">{formatters.money(amount, 0)}</span>
          </div>
          <div className="min-w-0">
            <span className="text-muted-foreground">Interest:</span>
            <span className="ml-2 break-words font-medium text-foreground">{formatters.money(interest, 0)}</span>
          </div>
          <div className="min-w-0">
            <span className="text-muted-foreground">Total Payments:</span>
            <span className="ml-2 font-medium text-foreground">{n} months</span>
          </div>
          <div className="min-w-0">
            <span className="text-muted-foreground">Interest Ratio:</span>
            <span className="ml-2 font-medium text-foreground">{amount > 0 ? ((interest / amount) * 100).toFixed(1) : 0}%</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11.5px] text-muted-foreground">
        Monthly Payment calculated using reducing balance method · {n} monthly payments of {formatters.money(monthly, 2)}.
        Rates shown are indicative and may vary by lender in {config.name}.
      </p>

      {/* Estimate Disclaimer */}
      {config.isEstimate && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>Estimate:</strong> {config.estimateNote || "These calculations are estimates only."}
          </p>
        </div>
      )}
    </div>
  );
}
