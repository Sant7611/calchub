"use client";

import { useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import { useRegion } from "@/store/useRegionStore";

type RateSource = "live" | "cache" | "fallback";

interface StoredRateData {
  rates: Record<string, number>;
  lastFetchedAt: string;
}

interface RateData {
  rates: Record<string, number>;
  lastFetchedAt: string | null;
  source: RateSource;
}

interface CurrencyInfo {
  symbol: string;
  name: string;
}

const CURRENCY_CACHE_KEY = "oncalculator.currency-rates.v1";

/*
 * Bundled fallback values are only used when:
 * 1. the live service is unavailable, and
 * 2. this browser has never stored a successful live response.
 *
 * They intentionally have no lastFetchedAt timestamp because they
 * were not fetched live in the current browser.
 */
const OFFLINE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
  NPR: 133.5,
  CAD: 1.36,
  AUD: 1.53,
  JPY: 149,
  CHF: 0.88,
  CNY: 7.19,
};

const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: { symbol: "$", name: "US Dollar" },
  EUR: { symbol: "€", name: "Euro" },
  GBP: { symbol: "£", name: "British Pound" },
  INR: { symbol: "₹", name: "Indian Rupee" },
  NPR: { symbol: "रु", name: "Nepalese Rupee" },
  CAD: { symbol: "CA$", name: "Canadian Dollar" },
  AUD: { symbol: "A$", name: "Australian Dollar" },
  JPY: { symbol: "¥", name: "Japanese Yen" },
  CHF: { symbol: "CHF", name: "Swiss Franc" },
  CNY: { symbol: "¥", name: "Chinese Yuan" },
};

const CURRENCIES = Object.keys(CURRENCY_INFO);
const DATA_SOURCE = "ExchangeRate-API";

function hasValidRates(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const rates = value as Record<string, unknown>;

  return (
    typeof rates.USD === "number" &&
    Number.isFinite(rates.USD) &&
    rates.USD > 0
  );
}

function readStoredRates(): StoredRateData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CURRENCY_CACHE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredRateData>;

    if (
      !hasValidRates(parsed.rates) ||
      typeof parsed.lastFetchedAt !== "string" ||
      Number.isNaN(Date.parse(parsed.lastFetchedAt))
    ) {
      return null;
    }

    return {
      rates: parsed.rates,
      lastFetchedAt: parsed.lastFetchedAt,
    };
  } catch {
    return null;
  }
}

function storeSuccessfulRates(data: StoredRateData) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      CURRENCY_CACHE_KEY,
      JSON.stringify(data),
    );
  } catch {
    // Storage can be disabled or full. The live result can still be used.
  }
}

async function fetchExchangeRates(): Promise<RateData> {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Exchange rate service unavailable");
    }

    const data = await response.json();

    if (!hasValidRates(data?.rates)) {
      throw new Error("Invalid exchange-rate response");
    }

    const rates: Record<string, number> = {
      ...OFFLINE_RATES,
      ...data.rates,
    };

    /*
     * This is the exact time this browser successfully fetched the
     * rate set. It is persisted together with the rates and is only
     * replaced by another successful live fetch.
     */
    const lastFetchedAt = new Date().toISOString();

    storeSuccessfulRates({
      rates,
      lastFetchedAt,
    });

    return {
      rates,
      lastFetchedAt,
      source: "live",
    };
  } catch (error) {
    const stored = readStoredRates();

    if (stored) {
      console.warn(
        "Live currency rates unavailable. Using the last successfully fetched rates.",
        error,
      );

      return {
        rates: stored.rates,
        lastFetchedAt: stored.lastFetchedAt,
        source: "cache",
      };
    }

    console.warn(
      "Live currency rates unavailable and no saved rates exist. Using bundled fallback rates.",
      error,
    );

    return {
      rates: OFFLINE_RATES,
      lastFetchedAt: null,
      source: "fallback",
    };
  }
}

export function CurrencyConverter() {
  const { config } = useRegion();

  const regionalCurrency =
    config?.currency?.code && CURRENCIES.includes(config.currency.code)
      ? config.currency.code
      : "USD";

  const locale = config?.currency?.locale || "en-US";
  const timezone = config?.timezone || undefined;

  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [selectedToCurrency, setSelectedToCurrency] = useState<string | null>(
    null,
  );
  const [rateData, setRateData] = useState<RateData | null>(null);

  const toCurrency = selectedToCurrency ?? regionalCurrency;
  const isLoading = rateData === null;

  useEffect(() => {
    let cancelled = false;

    fetchExchangeRates().then((data) => {
      if (!cancelled) {
        setRateData(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const result = useMemo(() => {
    if (!rateData) {
      return null;
    }

    const fromRate = rateData.rates[fromCurrency];
    const toRate = rateData.rates[toCurrency];

    if (
      !Number.isFinite(fromRate) ||
      !Number.isFinite(toRate) ||
      fromRate <= 0 ||
      toRate <= 0
    ) {
      return null;
    }

    const converted = (amount / fromRate) * toRate;
    const exchangeRate = toRate / fromRate;
    const inverseRate = fromRate / toRate;

    return {
      converted,
      exchangeRate,
      inverseRate,
    };
  }, [amount, fromCurrency, toCurrency, rateData]);

  const formattedLastFetched = useMemo(() => {
    if (!rateData?.lastFetchedAt) {
      return "No previous live fetch";
    }

    try {
      return new Date(rateData.lastFetchedAt).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        ...(timezone ? { timeZone: timezone } : {}),
      });
    } catch {
      return new Date(rateData.lastFetchedAt).toLocaleString();
    }
  }, [rateData, locale, timezone]);

  function formatAmount(value: number, currency: string): string {
    if (!Number.isFinite(value)) {
      return "—";
    }

    const absoluteValue = Math.abs(value);
    let fractionDigits = 2;

    if (absoluteValue < 1) {
      fractionDigits = 4;
    } else if (absoluteValue >= 100) {
      fractionDigits = 0;
    }

    try {
      return formatCurrency(value, currency, locale, fractionDigits);
    } catch {
      const symbol = CURRENCY_INFO[currency]?.symbol ?? currency;
      return `${symbol} ${value.toFixed(fractionDigits)}`;
    }
  }

  function swapCurrencies() {
    const oldFrom = fromCurrency;
    const oldTo = toCurrency;

    setFromCurrency(oldTo);
    setSelectedToCurrency(oldFrom);
  }

  const fromInfo = CURRENCY_INFO[fromCurrency];
  const toInfo = CURRENCY_INFO[toCurrency];

  const rateStatus =
    rateData?.source === "live"
      ? "Live rates"
      : rateData?.source === "cache"
        ? "Saved rates"
        : rateData?.source === "fallback"
          ? "Fallback rates"
          : "Fetching rates...";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Currency exchange rates
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isLoading
                    ? "animate-pulse bg-blue-500"
                    : rateData?.source === "live"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                }`}
              />

              <span className="text-sm font-semibold text-slate-700">
                {rateStatus}
              </span>
            </div>
          </div>

          {rateData && (
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Last fetched
              </p>

              <p className="mt-1 font-mono text-[11px] text-slate-600">
                {formattedLastFetched}
              </p>
            </div>
          )}
        </div>

        {rateData?.source === "cache" && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
              ⚠
            </div>

            <div>
              <p className="text-xs font-bold text-amber-900">
                Live rates unavailable
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                Using the last successfully fetched exchange rates saved in
                this browser. The rates and last-fetched time stay unchanged
                until another live fetch succeeds.
              </p>
            </div>
          </div>
        )}

        {rateData?.source === "fallback" && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
              ⚠
            </div>

            <div>
              <p className="text-xs font-bold text-amber-900">
                No saved live rates available
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                The live service is unavailable and this browser has no
                previous successful fetch, so bundled fallback rates are being
                used. No fake last-fetched timestamp is shown.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <div className="mb-6">
              <label
                htmlFor="currency-amount"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Amount
              </label>

              <div className="group flex overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm transition-all duration-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                <div className="flex min-w-[64px] items-center justify-center border-r border-slate-200 bg-slate-50 px-3 text-lg font-bold text-slate-700">
                  {fromInfo?.symbol ?? fromCurrency}
                </div>

                <input
                  id="currency-amount"
                  type="number"
                  value={Number.isFinite(amount) ? amount : 0}
                  min={0}
                  step={0.01}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    setAmount(Number.isFinite(value) ? Math.max(0, value) : 0);
                  }}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-xl font-bold text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />

                <div className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
                  {fromCurrency}
                </div>
              </div>
            </div>

            <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">
              <CurrencySelect
                label="From"
                value={fromCurrency}
                currencies={CURRENCIES}
                onChange={setFromCurrency}
              />

              <div className="flex justify-center md:pb-6">
                <button
                  type="button"
                  onClick={swapCurrencies}
                  title="Swap currencies"
                  aria-label="Swap currencies"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xl font-bold text-blue-600 shadow-sm transition-all duration-300 hover:rotate-180 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-90"
                >
                  ⇄
                </button>
              </div>

              <CurrencySelect
                label="To"
                value={toCurrency}
                currencies={CURRENCIES}
                onChange={setSelectedToCurrency}
              />
            </div>

            {result && (
              <div className="mt-7 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white shadow-sm">
                <div className="px-5 py-6 sm:px-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                    Converted Amount
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="break-all text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      {formatAmount(result.converted, toCurrency)}
                    </p>

                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {toCurrency}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    {formatAmount(amount, fromCurrency)} converted to{" "}
                    <strong className="text-slate-700">{toInfo?.name}</strong>
                  </p>
                </div>

                <div className="grid border-t border-blue-200 bg-white/70 sm:grid-cols-2">
                  <div className="border-b border-blue-100 px-5 py-4 sm:border-b-0 sm:border-r">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Exchange Rate
                    </p>
                    <p className="mt-1.5 font-mono text-sm font-semibold text-slate-700">
                      1 {fromCurrency} = {result.exchangeRate.toFixed(6)}{" "}
                      {toCurrency}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Inverse Rate
                    </p>
                    <p className="mt-1.5 font-mono text-sm font-semibold text-slate-700">
                      1 {toCurrency} = {result.inverseRate.toFixed(6)}{" "}
                      {fromCurrency}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <InfoCard
                label="From Currency"
                value={fromCurrency}
                sub={fromInfo?.name}
                symbol={fromInfo?.symbol}
              />

              <InfoCard
                label="To Currency"
                value={toCurrency}
                sub={toInfo?.name}
                symbol={toInfo?.symbol}
              />

              <InfoCard
                label="Rate Status"
                value={
                  rateData?.source === "live"
                    ? "Live"
                    : rateData?.source === "cache"
                      ? "Saved"
                      : "Fallback"
                }
                sub={
                  rateData?.source === "live"
                    ? DATA_SOURCE
                    : rateData?.source === "cache"
                      ? "Last successful fetch"
                      : "Bundled offline rates"
                }
                status={rateData?.source === "live" ? "success" : "warning"}
              />
            </div>

            {result && amount > 0 && (
              <details className="group mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">⇄</span>
                    Mathematical reversibility
                  </span>
                  <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>

                <div className="border-t border-slate-200 bg-white px-4 py-4">
                  <p className="text-xs leading-relaxed text-slate-500">
                    Converting the result back using the inverse exchange rate
                    should return approximately the original amount.
                  </p>

                  <div className="mt-3 overflow-x-auto rounded-lg bg-slate-950 px-4 py-3">
                    <code className="whitespace-nowrap font-mono text-xs text-emerald-300">
                      {formatAmount(result.converted, toCurrency)} ×{" "}
                      {result.inverseRate.toFixed(6)} ={" "}
                      {formatAmount(
                        result.converted * result.inverseRate,
                        fromCurrency,
                      )}
                    </code>
                  </div>
                </div>
              </details>
            )}

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                ⚠
              </div>

              <div>
                <p className="text-xs font-bold text-amber-900">
                  Indicative rates only
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                  Exchange rates fluctuate continuously. Banks, card providers,
                  and currency exchange services may offer different rates and
                  charge additional fees. Always verify the final rate before
                  making a financial transaction.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CurrencySelect({
  label,
  value,
  currencies,
  onChange,
}: {
  label: string;
  value: string;
  currencies: string[];
  onChange: (value: string) => void;
}) {
  const info = CURRENCY_INFO[value];

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <div className="group relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        >
          {currencies.map((code) => {
            const currency = CURRENCY_INFO[code];

            return (
              <option key={code} value={code}>
                {currency?.symbol} {code} — {currency?.name ?? code}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors group-hover:text-blue-600">
          ▼
        </div>
      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">{info?.name}</p>
    </label>
  );
}

function InfoCard({
  label,
  value,
  sub,
  symbol,
  status,
}: {
  label: string;
  value: string;
  sub?: string;
  symbol?: string;
  status?: "success" | "warning";
}) {
  const cardStyles =
    status === "success"
      ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
      : status === "warning"
        ? "border-amber-200 bg-amber-50 hover:border-amber-300"
        : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50";

  const valueStyles =
    status === "success"
      ? "text-emerald-700"
      : status === "warning"
        ? "text-amber-700"
        : "text-slate-800";

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${cardStyles}`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2">
        {symbol && (
          <span className="text-lg font-semibold text-slate-400">{symbol}</span>
        )}

        <p className={`text-lg font-bold ${valueStyles}`}>{value}</p>
      </div>

      {sub && <p className="mt-1 truncate text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="space-y-2">
          <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />
          <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
        </div>
      </div>

      <div className="h-44 animate-pulse rounded-2xl bg-blue-50" />
    </div>
  );
}
