"use client";

import { useState, useMemo } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/** Home price → monthly mortgage. Mirrors `mortgage-calculator`. */
export function MortgageCalculator() {
  const { region, config } = useRegion();
  const formatters = makeFormatters(region);
  
  const [price, setPrice] = useState(420000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.1);
  const [years, setYears] = useState(30);
  
  // Additional mortgage fields (region-aware)
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2); // Annual % of home value
  const [insuranceAnnual, setInsuranceAnnual] = useState(1200);
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [serviceChargeMonthly, setServiceChargeMonthly] = useState(0);

  // Input validation
  const errors = useMemo(() => {
    const errs: string[] = [];
    if (price < 0) errs.push("Home price cannot be negative.");
    if (downPct < 0 || downPct > 100) errs.push("Down payment must be between 0% and 100%.");
    if (rate < 0) errs.push("Interest rate cannot be negative.");
    if (years < 1 || years > 50) errs.push("Loan term must be between 1 and 50 years.");
    if (propertyTaxRate < 0) errs.push(`${config.loan.terminology.propertyTax} cannot be negative.`);
    if (insuranceAnnual < 0) errs.push(`${config.loan.terminology.insurance} cannot be negative.`);
    if (hoaMonthly < 0) errs.push(`${config.loan.terminology.hoaOrServiceCharge} cannot be negative.`);
    if (serviceChargeMonthly < 0) errs.push(`${config.loan.terminology.hoaOrServiceCharge} cannot be negative.`);
    return errs;
  }, [price, downPct, rate, years, propertyTaxRate, insuranceAnnual, hoaMonthly, serviceChargeMonthly, config]);

  const isValid = errors.length === 0;

  const down = isValid ? price * (downPct / 100) : 0;
  const principal = isValid ? price - down : 0;
  const r = rate / 100 / 12;
  const n = years * 12;
  
  // P&I calculation - handle zero-interest safely
  const piMonthly = !isValid || principal <= 0 ? 0 : (r === 0 
    ? principal / n 
    : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  
  // Monthly property tax
  const propertyTaxMonthly = isValid ? (price * (propertyTaxRate / 100)) / 12 : 0;
  
  // Monthly insurance
  const insuranceMonthly = isValid ? insuranceAnnual / 12 : 0;
  
  // Total monthly payment (PITI + HOA + Service Charge)
  const totalMonthly = isValid ? piMonthly + propertyTaxMonthly + insuranceMonthly + hoaMonthly + serviceChargeMonthly : 0;
  
  const interest = isValid ? piMonthly * n - principal : 0;

  return (
    <div>
      {/* Region-Specific Terminology Info */}
      <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg">
        <p className="text-xs text-brand-900">
          <strong>{config.name} mode:</strong> Using {config.currency.code} ({config.currency.symbol}) · 
          {config.loan.terminology.propertyTax} · {config.loan.terminology.insurance} · {config.loan.terminology.hoaOrServiceCharge}
        </p>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((err, i) => (
              <li key={i}>⚠️ {err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={`Home price (${config.currency.code})`}>
          <NumInput 
            value={price} 
            onChange={setPrice} 
            prefix={config.currency.symbol} 
            step={5000}
            min={0}
          />
        </Field>
        <Field label="Down payment">
          <NumInput 
            value={downPct} 
            onChange={setDownPct} 
            suffix="%" 
            step={1}
            min={0}
            max={100}
          />
        </Field>
        <Field label="Rate (APR)">
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

      {/* Additional Mortgage Fields */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={`${config.loan.terminology.propertyTax} (annual %)`}>
          <NumInput 
            value={propertyTaxRate} 
            onChange={setPropertyTaxRate} 
            suffix="%" 
            step={0.1}
            min={0}
          />
        </Field>
        <Field label={`${config.loan.terminology.insurance} (annual)`}>
          <NumInput 
            value={insuranceAnnual} 
            onChange={setInsuranceAnnual} 
            prefix={config.currency.symbol}
            step={100}
            min={0}
          />
        </Field>
        <Field label={config.loan.terminology.hoaOrServiceCharge}>
          <NumInput 
            value={hoaMonthly} 
            onChange={setHoaMonthly} 
            prefix={config.currency.symbol}
            step={50}
            min={0}
          />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label="Total Monthly Payment" value={formatters.money(totalMonthly, 2)} sub="PITI + fees" />
        <Stat label="Principal & Interest" value={formatters.money(piMonthly, 2)} />
        <Stat label={config.loan.terminology.propertyTax} value={formatters.money(propertyTaxMonthly, 2)} sub="monthly" />
        <Stat label={config.loan.terminology.insurance} value={formatters.money(insuranceMonthly, 2)} sub="monthly" />
        {hoaMonthly > 0 && (
          <Stat label={config.loan.terminology.hoaOrServiceCharge} value={formatters.money(hoaMonthly, 2)} sub="monthly" />
        )}
        <Stat label="Loan amount" value={formatters.money(principal)} sub={`after ${formatters.money(down)} down`} />
        <Stat label="Lifetime interest" value={formatters.money(interest)} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        Estimates include principal, interest, {config.loan.terminology.propertyTax.toLowerCase()}, {config.loan.terminology.insurance.toLowerCase()}
        {hoaMonthly > 0 && `, ${config.loan.terminology.hoaOrServiceCharge.toLowerCase()}`}.
        Actual costs may vary by location and provider.
      </p>

      {/* Estimate Disclaimer */}
      {config.isEstimate && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>Estimate:</strong> {config.estimateNote || "These calculations are estimates only."}
          </p>
        </div>
      )}
    </div>
  );
}
