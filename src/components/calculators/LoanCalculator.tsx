"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";
import { getRegionConfig, type Region } from "@/config/regions";

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
  const [amount, setAmount] = useState(config.defaultLoanAmount);
  const [rate, setRate] = useState(config.defaultInterestRate);
  const [years, setYears] = useState(5); // Default 5 years for all regions
  
  const r = rate / 100 / 12;
  const n = years * 12;
  
  // EMI calculation formula
  const monthly = r === 0 
    ? amount / n 
    : (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  
  const total = monthly * n;
  const interest = total - amount;

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    // Reset to new region's defaults without useEffect
    const newConfig = getRegionConfig(newRegion);
    setAmount(newConfig.defaultLoanAmount);
    setRate(newConfig.defaultInterestRate);
  };

  return (
    <div>
      {/* Region Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-fog-900 mb-2">
          Region
        </label>
        <div className="flex flex-wrap gap-2">
          {(["global", "nepal", "india", "usa", "uk", "canada", "australia"] as Region[]).map((r) => {
            const regionConfig = getRegionConfig(r);
            return (
              <button
                key={r}
                onClick={() => handleRegionChange(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  region === r
                    ? "bg-brand-600 text-white shadow-md"
                    : "bg-fog-100 text-fog-700 hover:bg-fog-200"
                }`}
              >
                {regionConfig.name} ({regionConfig.currencySymbol})
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Loan amount (${config.currencyCode})`}>
          <NumInput 
            value={amount} 
            onChange={setAmount} 
            prefix={config.currencySymbol} 
            step={region === "nepal" || region === "india" ? 10000 : 500} 
          />
        </Field>
        <Field label="Interest rate (APR)">
          <NumInput value={rate} onChange={setRate} suffix="%" step={0.1} />
        </Field>
        <Field label="Term">
          <NumInput value={years} onChange={setYears} suffix="yrs" min={1} max={30} />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label={config.paymentLabel} value={formatters.money(monthly, 2)} />
        <Stat label="Total interest" value={formatters.money(interest, 0)} />
        <Stat label="Total repayment" value={formatters.money(total, 0)} />
      </StatGrid>

      {/* Amortization Summary */}
      <div className="mt-6 p-4 bg-fog-50 rounded-lg border border-fog-200">
        <h4 className="text-sm font-semibold text-fog-900 mb-2">Loan Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-fog-600">Principal:</span>
            <span className="ml-2 font-medium">{formatters.money(amount, 0)}</span>
          </div>
          <div>
            <span className="text-fog-600">Interest:</span>
            <span className="ml-2 font-medium">{formatters.money(interest, 0)}</span>
          </div>
          <div>
            <span className="text-fog-600">Total Payments:</span>
            <span className="ml-2 font-medium">{n} months</span>
          </div>
          <div>
            <span className="text-fog-600">Interest Ratio:</span>
            <span className="ml-2 font-medium">{((interest / amount) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[11.5px] text-fog-600">
        {config.paymentLabel} calculated using reducing balance method · {n} monthly payments of {formatters.money(monthly, 2)}.
        Rates shown are indicative and may vary by lender in {config.name}.
      </p>
    </div>
  );
}
