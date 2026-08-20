"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid, currency } from "./shared";

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

type Region = "nepal" | "india" | "us" | "uk";

interface RegionConfig {
  name: string;
  currency: string;
  currencySymbol: string;
  typicalRate: number;
  typicalTerm: number;
}

const regionConfigs: Record<Region, RegionConfig> = {
  nepal: {
    name: "Nepal",
    currency: "NPR",
    currencySymbol: "Rs.",
    typicalRate: 10.5,
    typicalTerm: 5,
  },
  india: {
    name: "India",
    currency: "INR",
    currencySymbol: "₹",
    typicalRate: 8.5,
    typicalTerm: 5,
  },
  us: {
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    typicalRate: 6.5,
    typicalTerm: 5,
  },
  uk: {
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    typicalRate: 5.5,
    typicalTerm: 5,
  },
};

export function LoanCalculator() {
  const [region, setRegion] = useState<Region>("nepal");
  const config = regionConfigs[region];
  
  // Initialize with region-appropriate defaults
  const [amount, setAmount] = useState(1000000); // 10 lakh NPR default
  const [rate, setRate] = useState(config.typicalRate);
  const [years, setYears] = useState(config.typicalTerm);
  
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
  };

  return (
    <div>
      {/* Region Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-fog-900 mb-2">
          Region
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(regionConfigs) as Region[]).map((r) => (
            <button
              key={r}
              onClick={() => handleRegionChange(r)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                region === r
                  ? "bg-brand-600 text-white shadow-md"
                  : "bg-fog-100 text-fog-700 hover:bg-fog-200"
              }`}
            >
              {regionConfigs[r].name} ({regionConfigs[r].currencySymbol})
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Loan amount (${config.currency})`}>
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
        <Stat accent label="Monthly EMI" value={currency(monthly, 2, config.currencySymbol)} />
        <Stat label="Total interest" value={currency(interest, 0, config.currencySymbol)} />
        <Stat label="Total repayment" value={currency(total, 0, config.currencySymbol)} />
      </StatGrid>

      {/* Amortization Summary */}
      <div className="mt-6 p-4 bg-fog-50 rounded-lg border border-fog-200">
        <h4 className="text-sm font-semibold text-fog-900 mb-2">Loan Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-fog-600">Principal:</span>
            <span className="ml-2 font-medium">{currency(amount, 0, config.currencySymbol)}</span>
          </div>
          <div>
            <span className="text-fog-600">Interest:</span>
            <span className="ml-2 font-medium">{currency(interest, 0, config.currencySymbol)}</span>
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
        EMI calculated using reducing balance method · {n} monthly payments of {currency(monthly, 2, config.currencySymbol)}.
        Rates shown are indicative and may vary by lender in {config.name}.
      </p>
    </div>
  );
}
