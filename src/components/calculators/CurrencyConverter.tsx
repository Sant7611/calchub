"use client";

import { useEffect, useMemo, useState } from "react";

import { useRegion } from "@/store/useRegionStore";
import { formatCurrency } from "@/lib/format";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

interface RateData {
  rates: Record<string, number>;
  lastUpdate: string;
  isOffline: boolean;
}

interface CurrencyInfo {
  symbol: string;
  name: string;
}

/* ──────────────────────────────────────────────────────────
   Offline fallback rates
   Base currency = USD
────────────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────────────
   Currency information
────────────────────────────────────────────────────────── */

const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: {
    symbol: "$",
    name: "US Dollar",
  },

  EUR: {
    symbol: "€",
    name: "Euro",
  },

  GBP: {
    symbol: "£",
    name: "British Pound",
  },

  INR: {
    symbol: "₹",
    name: "Indian Rupee",
  },

  NPR: {
    symbol: "रु",
    name: "Nepalese Rupee",
  },

  CAD: {
    symbol: "CA$",
    name: "Canadian Dollar",
  },

  AUD: {
    symbol: "A$",
    name: "Australian Dollar",
  },

  JPY: {
    symbol: "¥",
    name: "Japanese Yen",
  },

  CHF: {
    symbol: "CHF",
    name: "Swiss Franc",
  },

  CNY: {
    symbol: "¥",
    name: "Chinese Yuan",
  },
};

const CURRENCIES = Object.keys(CURRENCY_INFO);

const DATA_SOURCE = "ExchangeRate-API";

/* ──────────────────────────────────────────────────────────
   Fetch live rates
────────────────────────────────────────────────────────── */

async function fetchExchangeRates(): Promise<RateData> {
  try {
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Exchange rate service unavailable");
    }

    const data = await response.json();

    if (!data?.rates || typeof data.rates !== "object") {
      throw new Error("Invalid exchange-rate response");
    }

    /*
     * Keep offline rates available even if the API
     * does not return one of our supported currencies.
     */
    const rates: Record<string, number> = {
      ...OFFLINE_RATES,
      ...data.rates,
    };

    /*
     * The API may provide its own update timestamp.
     */
    const lastUpdate =
      typeof data.time_last_updated === "number"
        ? new Date(data.time_last_updated * 1000).toISOString()
        : new Date().toISOString();

    return {
      rates,
      lastUpdate,
      isOffline: false,
    };
  } catch (error) {
    console.warn(
      "Live currency rates unavailable. Using fallback rates.",
      error
    );

    return {
      rates: OFFLINE_RATES,
      lastUpdate: new Date().toISOString(),
      isOffline: true,
    };
  }
}

/* ──────────────────────────────────────────────────────────
   Main Currency Converter
────────────────────────────────────────────────────────── */

export function CurrencyConverter() {
  const { config } = useRegion();

  /* ── Regional values ───────────────────────────────── */

  const regionalCurrency =
    config?.currency?.code &&
    CURRENCIES.includes(config.currency.code)
      ? config.currency.code
      : "USD";

  const locale =
    config?.currency?.locale || "en-US";

  const timezone =
    config?.timezone || undefined;

  /* ── User state ────────────────────────────────────── */

  const [amount, setAmount] = useState(1);

  const [fromCurrency, setFromCurrency] =
    useState("USD");

  /*
   * null means:
   *
   * The user has not manually selected the
   * destination currency.
   *
   * Therefore we can automatically use the
   * user's regional currency.
   */
  const [
    selectedToCurrency,
    setSelectedToCurrency,
  ] = useState<string | null>(null);

  const [rateData, setRateData] =
    useState<RateData | null>(null);

  /* ── Derived state ─────────────────────────────────── */

  /*
   * No useEffect + setState is needed here.
   *
   * If the region changes, React simply derives
   * the new destination currency during rendering.
   */
  const toCurrency =
    selectedToCurrency ?? regionalCurrency;

  /*
   * We don't need another isLoading state.
   *
   * No rate data = still loading.
   */
  const isLoading = rateData === null;

  /* ── Fetch exchange rates ──────────────────────────── */

  useEffect(() => {
    let cancelled = false;

    fetchExchangeRates().then((data) => {
      /*
       * This setState is asynchronous and happens
       * after the external API operation completes.
       *
       * This is valid React effect usage.
       */
      if (!cancelled) {
        setRateData(data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Calculate conversion ──────────────────────────── */

  const result = useMemo(() => {
    if (!rateData) {
      return null;
    }

    const fromRate =
      rateData.rates[fromCurrency];

    const toRate =
      rateData.rates[toCurrency];

    if (
      !Number.isFinite(fromRate) ||
      !Number.isFinite(toRate) ||
      fromRate <= 0 ||
      toRate <= 0
    ) {
      return null;
    }

    /*
     * Rates use USD as the base:
     *
     * FROM
     *  ↓
     * USD
     *  ↓
     * TO
     */

    const converted =
      (amount / fromRate) * toRate;

    const exchangeRate =
      toRate / fromRate;

    const inverseRate =
      fromRate / toRate;

    return {
      converted,
      exchangeRate,
      inverseRate,
    };
  }, [
    amount,
    fromCurrency,
    toCurrency,
    rateData,
  ]);

  /* ── Last updated formatting ───────────────────────── */

  const formattedLastUpdate = useMemo(() => {
    if (!rateData) {
      return "";
    }

    try {
      return new Date(
        rateData.lastUpdate
      ).toLocaleString(locale, {
        dateStyle: "medium",
        timeStyle: "short",
        ...(timezone
          ? {
              timeZone: timezone,
            }
          : {}),
      });
    } catch {
      return new Date(
        rateData.lastUpdate
      ).toLocaleString();
    }
  }, [
    rateData,
    locale,
    timezone,
  ]);

  /* ── Currency formatting ───────────────────────────── */

  function formatAmount(
    value: number,
    currency: string
  ): string {
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
      return formatCurrency(
        value,
        currency,
        locale,
        fractionDigits
      );
    } catch {
      const symbol =
        CURRENCY_INFO[currency]?.symbol ??
        currency;

      return `${symbol} ${value.toFixed(
        fractionDigits
      )}`;
    }
  }

  /* ── Swap currencies ───────────────────────────────── */

  function swapCurrencies() {
    const oldFrom = fromCurrency;
    const oldTo = toCurrency;

    setFromCurrency(oldTo);

    /*
     * selectedToCurrency must be explicitly
     * changed because toCurrency itself is derived.
     */
    setSelectedToCurrency(oldFrom);
  }

  /* ── Currency information ──────────────────────────── */

  const fromInfo =
    CURRENCY_INFO[fromCurrency];

  const toInfo =
    CURRENCY_INFO[toCurrency];

  /* ───────────────────────────────────────────────────── */

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ────────────────────────────────────────────────
          Rate status
      ──────────────────────────────────────────────── */}

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <p className="text-xs font-medium text-slate-500">
              Currency exchange rates
            </p>

            <div className="mt-1 flex items-center gap-2">

              <span
                className={`
                  h-2.5
                  w-2.5
                  rounded-full
                  ${
                    isLoading
                      ? "animate-pulse bg-blue-500"
                      : rateData?.isOffline
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }
                `}
              />

              <span className="text-sm font-semibold text-slate-700">
                {isLoading
                  ? "Fetching rates..."
                  : rateData?.isOffline
                    ? "Offline rates"
                    : "Live rates"}
              </span>

            </div>
          </div>

          {rateData && (
            <div className="text-left sm:text-right">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Last updated
              </p>

              <p className="mt-1 font-mono text-[11px] text-slate-600">
                {formattedLastUpdate}
              </p>

            </div>
          )}

        </div>

        {/* Offline warning */}

        {rateData?.isOffline && (
          <div className="mt-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">

            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm">
              ⚠
            </div>

            <div>
              <p className="text-xs font-bold text-amber-900">
                Live rates unavailable
              </p>

              <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                Cached fallback rates are currently
                being used. Values may differ from
                current market exchange rates.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* ────────────────────────────────────────────────
          Calculator
      ──────────────────────────────────────────────── */}

      <div className="p-5 sm:p-6">

        {isLoading ? (
          <LoadingState />
        ) : (
          <>

            {/* ── Amount ─────────────────────────────── */}

            <div className="mb-6">

              <label
                htmlFor="currency-amount"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Amount
              </label>

              <div
                className="
                  group
                  flex
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-300
                  bg-white
                  shadow-sm
                  transition-all
                  duration-200
                  hover:border-blue-400
                  focus-within:border-blue-500
                  focus-within:ring-4
                  focus-within:ring-blue-500/10
                "
              >

                {/* Symbol */}

                <div className="flex min-w-[64px] items-center justify-center border-r border-slate-200 bg-slate-50 px-3 text-lg font-bold text-slate-700">
                  {fromInfo?.symbol ??
                    fromCurrency}
                </div>

                {/* Input */}

                <input
                  id="currency-amount"
                  type="number"
                  value={
                    Number.isFinite(amount)
                      ? amount
                      : 0
                  }
                  min={0}
                  step={0.01}
                  onChange={(event) => {
                    const value = Number(
                      event.target.value
                    );

                    setAmount(
                      Number.isFinite(value)
                        ? Math.max(0, value)
                        : 0
                    );
                  }}
                  className="
                    min-w-0
                    flex-1
                    bg-transparent
                    px-4
                    py-3.5
                    text-xl
                    font-bold
                    text-slate-900
                    outline-none
                    [appearance:textfield]
                    [&::-webkit-inner-spin-button]:appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                  "
                />

                {/* Currency code */}

                <div className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
                  {fromCurrency}
                </div>

              </div>
            </div>

            {/* ── Currency selection ─────────────────── */}

            <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">

              <CurrencySelect
                label="From"
                value={fromCurrency}
                currencies={CURRENCIES}
                onChange={
                  setFromCurrency
                }
              />

              {/* Swap button */}

              <div className="flex justify-center md:pb-6">

                <button
                  type="button"
                  onClick={swapCurrencies}
                  title="Swap currencies"
                  aria-label="Swap currencies"
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-blue-200
                    bg-blue-50
                    text-xl
                    font-bold
                    text-blue-600
                    shadow-sm
                    transition-all
                    duration-300
                    hover:rotate-180
                    hover:border-blue-600
                    hover:bg-blue-600
                    hover:text-white
                    hover:shadow-lg
                    hover:shadow-blue-500/20
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-500/20
                    active:scale-90
                  "
                >
                  ⇄
                </button>

              </div>

              <CurrencySelect
                label="To"
                value={toCurrency}
                currencies={CURRENCIES}
                onChange={
                  setSelectedToCurrency
                }
              />

            </div>

            {/* ────────────────────────────────────────
                Main result
            ──────────────────────────────────────── */}

            {result && (
              <div className="mt-7 overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-white shadow-sm">

                <div className="px-5 py-6 sm:px-6">

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
                    Converted Amount
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3">

                    <p className="break-all text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                      {formatAmount(
                        result.converted,
                        toCurrency
                      )}
                    </p>

                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {toCurrency}
                    </span>

                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    {formatAmount(
                      amount,
                      fromCurrency
                    )}{" "}
                    converted to{" "}
                    <strong className="text-slate-700">
                      {toInfo?.name}
                    </strong>
                  </p>

                </div>

                {/* Exchange rates */}

                <div className="grid border-t border-blue-200 bg-white/70 sm:grid-cols-2">

                  <div className="border-b border-blue-100 px-5 py-4 sm:border-b-0 sm:border-r">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Exchange Rate
                    </p>

                    <p className="mt-1.5 font-mono text-sm font-semibold text-slate-700">
                      1 {fromCurrency} ={" "}
                      {result.exchangeRate.toFixed(
                        6
                      )}{" "}
                      {toCurrency}
                    </p>

                  </div>

                  <div className="px-5 py-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Inverse Rate
                    </p>

                    <p className="mt-1.5 font-mono text-sm font-semibold text-slate-700">
                      1 {toCurrency} ={" "}
                      {result.inverseRate.toFixed(
                        6
                      )}{" "}
                      {fromCurrency}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* ────────────────────────────────────────
                Currency cards
            ──────────────────────────────────────── */}

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
                  rateData?.isOffline
                    ? "Cached"
                    : "Live"
                }
                sub={
                  rateData?.isOffline
                    ? "Using fallback rates"
                    : DATA_SOURCE
                }
                status={
                  rateData?.isOffline
                    ? "warning"
                    : "success"
                }
              />

            </div>

            {/* ────────────────────────────────────────
                Reversibility check
            ──────────────────────────────────────── */}

            {result && amount > 0 && (
              <details className="group mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-all open:shadow-sm">

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
                    font-semibold
                    text-slate-700
                    transition-colors
                    hover:bg-slate-100
                  "
                >
                  <span className="flex items-center gap-2">
                    <span className="text-blue-500">
                      ⇄
                    </span>

                    Mathematical reversibility
                  </span>

                  <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180">
                    ▼
                  </span>
                </summary>

                <div className="border-t border-slate-200 bg-white px-4 py-4">

                  <p className="text-xs leading-relaxed text-slate-500">
                    Converting the result back
                    using the inverse exchange rate
                    should return approximately the
                    original amount.
                  </p>

                  <div className="mt-3 overflow-x-auto rounded-lg bg-slate-950 px-4 py-3">

                    <code className="whitespace-nowrap font-mono text-xs text-emerald-300">
                      {formatAmount(
                        result.converted,
                        toCurrency
                      )}
                      {" × "}
                      {result.inverseRate.toFixed(
                        6
                      )}
                      {" = "}
                      {formatAmount(
                        result.converted *
                          result.inverseRate,
                        fromCurrency
                      )}
                    </code>

                  </div>

                </div>

              </details>
            )}

            {/* ────────────────────────────────────────
                Disclaimer
            ──────────────────────────────────────── */}

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                ⚠
              </div>

              <div>

                <p className="text-xs font-bold text-amber-900">
                  Indicative rates only
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                  Exchange rates fluctuate
                  continuously. Banks, card
                  providers, and currency exchange
                  services may offer different rates
                  and charge additional fees.
                  Always verify the final rate before
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

/* ──────────────────────────────────────────────────────────
   Currency Selector
────────────────────────────────────────────────────────── */

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
  const info =
    CURRENCY_INFO[value];

  return (
    <label className="block">

      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <div className="group relative">

        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="
            w-full
            cursor-pointer
            appearance-none
            rounded-xl
            border
            border-slate-300
            bg-white
            px-4
            py-3
            pr-10
            text-sm
            font-semibold
            text-slate-700
            shadow-sm
            outline-none
            transition-all
            duration-200
            hover:border-blue-400
            hover:bg-blue-50
            focus:border-blue-500
            focus:bg-white
            focus:ring-4
            focus:ring-blue-500/10
          "
        >
          {currencies.map((code) => {
            const currency =
              CURRENCY_INFO[code];

            return (
              <option
                key={code}
                value={code}
              >
                {currency?.symbol} {code} —{" "}
                {currency?.name ?? code}
              </option>
            );
          })}
        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors group-hover:text-blue-600">
          ▼
        </div>

      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">
        {info?.name}
      </p>

    </label>
  );
}

/* ──────────────────────────────────────────────────────────
   Information Card
────────────────────────────────────────────────────────── */

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
      className={`
        rounded-xl
        border
        p-4
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${cardStyles}
      `}
    >

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-1 flex items-center gap-2">

        {symbol && (
          <span className="text-lg font-semibold text-slate-400">
            {symbol}
          </span>
        )}

        <p
          className={`text-lg font-bold ${valueStyles}`}
        >
          {value}
        </p>

      </div>

      {sub && (
        <p className="mt-1 truncate text-[11px] text-slate-500">
          {sub}
        </p>
      )}

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Loading Skeleton
────────────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="space-y-6">

      {/* Amount */}

      <div>
        <div className="mb-2 h-3 w-16 animate-pulse rounded bg-slate-200" />

        <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
      </div>

      {/* Currency selectors */}

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

      {/* Result */}

      <div className="h-44 animate-pulse rounded-2xl bg-blue-50" />

    </div>
  );
}