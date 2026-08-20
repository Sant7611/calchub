"use client";

import { useState, useMemo, useEffect } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";
import { calculateRegionalTax } from "@/lib/taxEngine";

/** Region-aware salary calculator with hourly-to-annual conversion, pay frequencies, and tax/deduction breakdown. */
export function SalaryCalculator() {
  const { region, config } = useRegion();
  const formatters = makeFormatters(region);

  // Input states
  const [hourlyRate, setHourlyRate] = useState(25);
  const [hoursPerWeek, setHoursPerWeek] = useState(config.work.hoursPerWeek);
  const [weeksPerYear, setWeeksPerYear] = useState(52);
  const [payFrequency, setPayFrequency] = useState(config.work.defaultPayFrequency);
  
  // Optional deductions (user-toggleable)
  const [socialSecurityRate, setSocialSecurityRate] = useState<number | null>(null);
  const [pensionRate, setPensionRate] = useState<number | null>(null);
  const [healthInsuranceRate, setHealthInsuranceRate] = useState<number | null>(null);
  const [retirementRate, setRetirementRate] = useState<number | null>(null);

  // Get selected pay frequency config
  const payFrequencyLabels: Record<string, number> = {
    weekly: 52,
    biweekly: 26,
    semimonthly: 24,
    monthly: 12,
    quarterly: 4,
    annually: 1,
  };
  const periodsPerYear = payFrequencyLabels[payFrequency] ?? 12;
  const frequencyLabel = payFrequency.charAt(0).toUpperCase() + payFrequency.slice(1);

  // Calculate gross annual salary
  const grossAnnual = useMemo(() => {
    return hourlyRate * hoursPerWeek * weeksPerYear;
  }, [hourlyRate, hoursPerWeek, weeksPerYear]);

  // Calculate tax using regional tax engine
  const taxResult = useMemo(() => {
    return calculateRegionalTax(grossAnnual, region);
  }, [grossAnnual, region]);

  // Calculate optional deductions based on region
  const optionalDeductions = useMemo(() => {
    let total = 0;
    const details: { label: string; amount: number; rate: number }[] = [];

    if (socialSecurityRate !== null && socialSecurityRate > 0) {
      const amount = grossAnnual * socialSecurityRate;
      total += amount;
      details.push({ label: "Social Security / National Insurance", amount, rate: socialSecurityRate });
    }
    if (pensionRate !== null && pensionRate > 0) {
      const amount = grossAnnual * pensionRate;
      total += amount;
      details.push({ label: config.name.includes("Nepal") ? "Provident Fund" : "Pension / 401(k)", amount, rate: pensionRate });
    }
    if (healthInsuranceRate !== null && healthInsuranceRate > 0) {
      const amount = grossAnnual * healthInsuranceRate;
      total += amount;
      details.push({ label: "Health Insurance", amount, rate: healthInsuranceRate });
    }
    if (retirementRate !== null && retirementRate > 0) {
      const amount = grossAnnual * retirementRate;
      total += amount;
      details.push({ label: "Retirement / Superannuation", amount, rate: retirementRate });
    }

    return { total, details };
  }, [grossAnnual, socialSecurityRate, pensionRate, healthInsuranceRate, retirementRate, config.name]);

  // Calculate taxable income (gross - mandatory payroll deductions - optional deductions)
  const mandatoryDeductions = taxResult.payrollDeductionsTotal;
  const totalDeductions = mandatoryDeductions + optionalDeductions.total;
  const taxableIncome = Math.max(0, grossAnnual - mandatoryDeductions);
  const netPay = Math.max(0, grossAnnual - taxResult.tax - totalDeductions);

  // Calculate per-period amounts
  const grossPerPeriod = grossAnnual / periodsPerYear;
  const taxPerPeriod = taxResult.tax / periodsPerYear;
  const netPerPeriod = netPay / periodsPerYear;

  // Auto-set default rates based on region's payroll deductions when region changes
  useEffect(() => {
    if (config.tax.payrollDeductions && config.tax.payrollDeductions.length > 0) {
      const firstDed = config.tax.payrollDeductions[0];
      if (firstDed.name.toLowerCase().includes("social") || firstDed.name.toLowerCase().includes("security")) {
        if (socialSecurityRate === null) setSocialSecurityRate(firstDed.rate);
      } else if (firstDed.name.toLowerCase().includes("pf") || firstDed.name.toLowerCase().includes("provident") || firstDed.name.toLowerCase().includes("ssf")) {
        if (pensionRate === null) setPensionRate(firstDed.rate);
      }
    }
  }, [config.tax.payrollDeductions]);

  return (
    <div className="space-y-6">
      {/* Income Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={`Hourly Rate (${config.currency.code})`}>
          <NumInput 
            value={hourlyRate} 
            onChange={setHourlyRate} 
            prefix={config.currency.symbol} 
            step={0.5} 
          />
        </Field>
        <Field label="Hours per Week">
          <NumInput 
            value={hoursPerWeek} 
            onChange={setHoursPerWeek} 
            suffix="hrs" 
            step={1} 
            min={1}
            max={80}
          />
        </Field>
        <Field label="Weeks per Year">
          <NumInput 
            value={weeksPerYear} 
            onChange={setWeeksPerYear} 
            suffix="wks" 
            step={1} 
            min={1}
            max={52}
          />
        </Field>
        <Field label="Pay Frequency">
          <select
            value={payFrequency}
            onChange={(e) => setPayFrequency(e.target.value)}
            className="h-[42px] w-full rounded-lg border border-ink-600 bg-ink-850 px-3 font-mono text-[13px] text-fog-300 outline-none focus:border-mint-500/60 focus:ring-2 focus:ring-mint-500/20"
          >
            {config.work.payFrequencies.map((freq) => (
              <option key={freq} value={freq}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Gross Annual Summary */}
      <div className="rounded-xl border border-mint-500/30 bg-mint-500/5 p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10px] font-semibold tracking-widest text-fog-500 uppercase">
            Gross Annual Salary
          </span>
          <span className="font-display text-2xl font-bold text-mint-300">
            {formatters.money(grossAnnual)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-fog-600">
          {hoursPerWeek} hrs/week × {weeksPerYear} weeks/year × {formatters.money(hourlyRate)}/hr
        </p>
      </div>

      {/* Optional Deductions Section */}
      <div className="rounded-xl border border-ink-600/70 bg-ink-850/80 p-4">
        <p className="mb-3 font-mono text-[10px] font-semibold tracking-widest text-fog-500 uppercase">
          Optional Deductions (Estimate)
        </p>
        
        {config.isEstimate && region !== "global" && (
          <p className="mb-3 text-[11px] text-amber-400">
            ⚠️ Deduction rates are estimates. Actual rates vary by employer and individual circumstances.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {(region === "global" || (config.tax.payrollDeductions && config.tax.payrollDeductions.some(d => d.name.toLowerCase().includes("social") || d.name.toLowerCase().includes("security")))) && (
            <Field label="Social Security / National Insurance">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={socialSecurityRate !== null}
                  onChange={(e) => setSocialSecurityRate(e.target.checked ? 0.062 : null)}
                  className="h-4 w-4 rounded border-ink-600 bg-ink-800 text-mint-500 focus:ring-mint-500/20"
                />
                {socialSecurityRate !== null && (
                  <NumInput
                    value={socialSecurityRate * 100}
                    onChange={(v) => setSocialSecurityRate(v / 100)}
                    suffix="%"
                    step={0.5}
                    min={0}
                    max={20}
                  />
                )}
              </div>
            </Field>
          )}
          
          {(region === "global" || (config.tax.payrollDeductions && config.tax.payrollDeductions.some(d => d.name.toLowerCase().includes("pf") || d.name.toLowerCase().includes("provident") || d.name.toLowerCase().includes("ssf")))) && (
            <Field label={config.name.includes("Nepal") ? "Provident Fund (SSF)" : "Pension / Provident Fund"}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pensionRate !== null}
                  onChange={(e) => setPensionRate(e.target.checked ? (config.name.includes("Nepal") ? 0.11 : 0.12) : null)}
                  className="h-4 w-4 rounded border-ink-600 bg-ink-800 text-mint-500 focus:ring-mint-500/20"
                />
                {pensionRate !== null && (
                  <NumInput
                    value={pensionRate * 100}
                    onChange={(v) => setPensionRate(v / 100)}
                    suffix="%"
                    step={0.5}
                    min={0}
                    max={20}
                  />
                )}
              </div>
            </Field>
          )}
          
          {(region === "global" || (config.tax.payrollDeductions && config.tax.payrollDeductions.some(d => d.name.toLowerCase().includes("health") || d.name.toLowerCase().includes("medicare")))) && (
            <Field label="Health Insurance / Medicare">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={healthInsuranceRate !== null}
                  onChange={(e) => setHealthInsuranceRate(e.target.checked ? 0.05 : null)}
                  className="h-4 w-4 rounded border-ink-600 bg-ink-800 text-mint-500 focus:ring-mint-500/20"
                />
                {healthInsuranceRate !== null && (
                  <NumInput
                    value={healthInsuranceRate * 100}
                    onChange={(v) => setHealthInsuranceRate(v / 100)}
                    suffix="%"
                    step={0.5}
                    min={0}
                    max={20}
                  />
                )}
              </div>
            </Field>
          )}
          
          {(region === "global" || (config.tax.payrollDeductions && config.tax.payrollDeductions.some(d => d.name.toLowerCase().includes("super") || d.name.toLowerCase().includes("retirement") || d.name.toLowerCase().includes("cpp")))) && (
            <Field label={config.name.includes("Australia") ? "Superannuation" : "Retirement / CPP"}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={retirementRate !== null}
                  onChange={(e) => setRetirementRate(e.target.checked ? (config.name.includes("Australia") ? 0.115 : 0.05) : null)}
                  className="h-4 w-4 rounded border-ink-600 bg-ink-800 text-mint-500 focus:ring-mint-500/20"
                />
                {retirementRate !== null && (
                  <NumInput
                    value={retirementRate * 100}
                    onChange={(v) => setRetirementRate(v / 100)}
                    suffix="%"
                    step={0.5}
                    min={0}
                    max={20}
                  />
                )}
              </div>
            </Field>
          )}
        </div>

        {optionalDeductions.details.length > 0 && (
          <div className="mt-4 space-y-1 border-t border-ink-700 pt-3">
            {optionalDeductions.details.map((d) => (
              <div key={d.label} className="flex justify-between text-[13px] text-fog-300">
                <span>{d.label} ({(d.rate * 100).toFixed(1)}%)</span>
                <span className="font-mono">{formatters.money(d.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <StatGrid>
        <Stat 
          accent 
          label="Net Pay (Annual)" 
          value={formatters.money(netPay)} 
          sub={`${formatters.money(netPerPeriod)} / ${frequencyLabel.toLowerCase()}`} 
        />
        <Stat 
          label={config.consumptionTax.label === "VAT" ? "Income Tax" : "Tax"} 
          value={formatters.money(taxResult.tax)}
          sub={`${formatters.money(taxPerPeriod)} / period`}
        />
        <Stat 
          label="Total Deductions" 
          value={formatters.money(totalDeductions)}
          sub={`Mandatory: ${formatters.money(mandatoryDeductions)} · Optional: ${formatters.money(optionalDeductions.total)}`}
        />
      </StatGrid>

      {/* Breakdown Details */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-600/70 bg-ink-850/80 p-4">
          <p className="font-mono text-[10px] font-semibold tracking-widest text-fog-500 uppercase mb-3">
            Pay Breakdown
          </p>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between text-fog-300">
              <span>Gross Annual</span>
              <span className="font-mono">{formatters.money(grossAnnual)}</span>
            </div>
            <div className="flex justify-between text-fog-300">
              <span>Taxable Income</span>
              <span className="font-mono">{formatters.money(taxableIncome)}</span>
            </div>
            <div className="flex justify-between text-fog-300">
              <span>Mandatory Deductions</span>
              <span className="font-mono">{formatters.money(mandatoryDeductions)}</span>
            </div>
            {taxResult.deductionDetails.length > 0 && (
              <div className="border-t border-ink-700 pt-2">
                {taxResult.deductionDetails.map((d) => (
                  <div key={d.label} className="flex justify-between text-[12px] text-fog-400">
                    <span>  • {d.label}</span>
                    <span className="font-mono">{formatters.money(d.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-ink-600/70 bg-ink-850/80 p-4">
          <p className="font-mono text-[10px] font-semibold tracking-widest text-fog-500 uppercase mb-3">
            Per {frequencyLabel} Pay
          </p>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between text-fog-300">
              <span>Gross Pay</span>
              <span className="font-mono">{formatters.money(grossPerPeriod)}</span>
            </div>
            <div className="flex justify-between text-fog-300">
              <span>Tax</span>
              <span className="font-mono text-rose-400">-{formatters.money(taxPerPeriod)}</span>
            </div>
            <div className="flex justify-between text-fog-300">
              <span>Optional Deductions</span>
              <span className="font-mono text-amber-400">-{formatters.money(optionalDeductions.total / periodsPerYear)}</span>
            </div>
            <div className="border-t border-ink-700 pt-2">
              <div className="flex justify-between font-semibold text-fog-100">
                <span>Net Pay</span>
                <span className="font-mono text-mint-300">{formatters.money(netPerPeriod)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info & Disclaimers */}
      <div className="space-y-2">
        <p className="text-[11px] text-fog-500">
          <strong>Tax Year:</strong> {config.tax.taxYear} · {" "}
          <strong>Status:</strong> {config.isEstimate ? "Estimate" : "Verified"}
        </p>
        
        {config.isEstimate && config.estimateNote && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-[11.5px] text-amber-400">
              ⚠️ <strong>Estimate:</strong> {config.estimateNote}
            </p>
          </div>
        )}
        
        {region === "global" && (
          <div className="rounded-lg border border-ink-600/50 bg-ink-800/50 p-3">
            <p className="text-[11.5px] text-fog-500">
              ℹ️ <strong>Global Mode:</strong> This provides a rough estimate only. For accurate calculations, select your specific country/region above.
              Global mode uses simplified assumptions and does not reflect any real country&apos;s tax laws or deduction requirements.
            </p>
          </div>
        )}
        
        <p className="text-[11px] text-fog-600">
          This calculator provides estimates only. Actual take-home pay depends on your specific situation, 
          including filing status, allowances, credits, state/provincial taxes, and other factors. 
          Consult a tax professional or payroll specialist for accurate figures.
        </p>
      </div>
    </div>
  );
}
