"use client";

import { useState, useMemo, useEffect } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { formatCurrency } from "@/lib/format";

/**
 * Currency Converter with multi-region support.
 * Features:
 * - Includes NPR (Nepalese Rupee) and other regional currencies
 * - Shows rate timestamp
 * - Shows data source
 * - Shows indicative-rate warning
 * - Preserves offline fallback rates
 * - Mathematically reversible within rounding tolerance
 */

// Offline fallback rates (relative to USD as base)
const OFFLINE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  NPR: 133.5, // NPR pegged to INR approximately
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149.0,
  CHF: 0.88,
  CNY: 7.19,
};

const CURRENCY_INFO: Record<string, { symbol: string; name: string }> = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  NPR: { symbol: "Rs.", name: "Nepalese Rupee" },
  CAD: { symbol: "CA$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
};

const DATA_SOURCE = "Indicative rates based on recent market data";
const LAST_UPDATE_FALLBACK = new Date().toISOString();

interface RateData {
  rates: Record<string, number>;
  lastUpdate: string;
  isOffline: boolean;
}

async function fetchExchangeRates(): Promise<RateData> {
  try {
    // Try to fetch live rates from a free API
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("API unavailable");
    const data = await response.json();
    return {
      rates: data.rates as Record<string, number>,
      lastUpdate: new Date().toISOString(),
      isOffline: false,
    };
  } catch {
    // Fallback to offline rates
    return {
      rates: OFFLINE_RATES,
      lastUpdate: LAST_UPDATE_FALLBACK,
      isOffline: true,
    };
  }
}

export function CurrencyConverter() {
  const { region, config } = useRegion();
  
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>(() => {
    // Get initial currency from config
    return "currency" in config ? config.currency.code : "USD";
  });
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rates on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    fetchExchangeRates().then((data) => {
      if (mounted) {
        setRateData(data);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Calculate conversion
  const result = useMemo(() => {
    if (!rateData || !fromCurrency || !toCurrency) return null;
    
    const fromRate = rateData.rates[fromCurrency] ?? 1;
    const toRate = rateData.rates[toCurrency] ?? 1;
    
    // Convert: amount in fromCurrency -> USD -> toCurrency
    // This ensures mathematical reversibility
    const converted = (amount / fromRate) * toRate;
    const exchangeRate = toRate / fromRate;
    
    return {
      converted,
      exchangeRate,
      inverseRate: 1 / exchangeRate,
    };
  }, [amount, fromCurrency, toCurrency, rateData]);

  const currencies = Object.keys(OFFLINE_RATES);
  const formattedLastUpdate = rateData 
    ? new Date(rateData.lastUpdate).toLocaleString(config.currency.locale, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: config.timezone,
      })
    : "";

  const formatAmount = (value: number, currency: string) => {
    const fractionDigits = value < 1 ? 4 : value < 100 ? 2 : 0;
    return formatCurrency(value, currency, config.currency.locale, fractionDigits);
  };

  return (
    <div>
      {/* Data Source & Timestamp */}
      <div className="mb-4 p-3 rounded-lg border bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-600">
            📊 {DATA_SOURCE}
          </span>
          {rateData && (
            <span className={`font-mono ${rateData.isOffline ? "text-amber-600" : "text-slate-500"}`}>
              Updated: {formattedLastUpdate}
            </span>
          )}
        </div>
        {rateData?.isOffline && (
          <div className="mt-2 flex items-start gap-2 text-xs text-amber-700">
            <span>⚠️</span>
            <span>
              <strong>Offline mode:</strong> Using cached indicative rates. Live rates unavailable.
            </span>
          </div>
        )}
        <div className="mt-1 text-xs text-slate-500">
          ℹ️ Rates are indicative only and may differ from actual trading rates. For informational purposes.
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading rates...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Amount">
              <NumInput 
                value={amount} 
                onChange={setAmount} 
                step={0.01}
                min={0}
              />
            </Field>
            
            <Field label="From">
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {currencies.map((code) => (
                  <option key={code} value={code}>
                    {code} - {CURRENCY_INFO[code]?.name || code}
                  </option>
                ))}
              </select>
            </Field>
            
            <Field label="To">
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {currencies.map((code) => (
                  <option key={code} value={code}>
                    {code} - {CURRENCY_INFO[code]?.name || code}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {result && (
            <StatGrid>
              <Stat 
                accent 
                label="Converted Amount" 
                value={formatAmount(result.converted, toCurrency)} 
              />
              <Stat 
                label="Exchange Rate" 
                value={`1 ${fromCurrency} = ${result.exchangeRate.toFixed(6)} ${toCurrency}`}
                sub={`1 ${toCurrency} = ${result.inverseRate.toFixed(6)} ${fromCurrency}`}
              />
              <Stat 
                label="Rate Info" 
                value={rateData?.isOffline ? "Offline (Cached)" : "Live"}
                sub={rateData?.isOffline ? "Using fallback rates" : "Market rates"}
              />
            </StatGrid>
          )}

          {/* Reversibility check */}
          {result && amount > 0 && (
            <div className="mt-4 p-3 rounded-lg border border-slate-200 bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Reversibility Check</h4>
              <p className="text-xs text-slate-600">
                Converting back should return to original amount (within rounding):
              </p>
              <p className="mt-1 text-sm font-mono text-slate-800">
                {formatAmount(result.converted, toCurrency)} × {result.inverseRate.toFixed(6)} = {formatAmount(result.converted * result.inverseRate, fromCurrency)}
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-4 p-3 rounded-lg border border-amber-200 bg-amber-50">
            <p className="text-xs text-amber-800">
              ⚠️ <strong>Indicative Rates Only:</strong> These rates are for informational purposes only and should not be used for actual currency transactions. Exchange rates fluctuate constantly and actual rates offered by banks or exchange services may differ significantly. Always verify rates with your financial institution before making transactions.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
