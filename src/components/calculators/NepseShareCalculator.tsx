"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  BadgePercent,
  Calculator,
  Landmark,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

type TransactionMode = "buy-sell" | "buy" | "sell";

type InvestorType = "individual" | "institutional";

interface BrokerageSlab {
  max: number;
  rate: number;
  minimumCommission?: number;
}

interface TransactionFees {
  grossAmount: number;
  brokerageRate: number;
  brokerage: number;
  sebonFee: number;
}

interface ShareCalculationResult {
  buy: TransactionFees;

  sell: TransactionFees;

  totalBuyingCost: number;

  effectiveCostPerShare: number;

  dpCharge: number;

  sellingExpensesBeforeTax: number;

  netSellBeforeTax: number;

  capitalGain: number;

  taxableGain: number;

  cgtRate: number;

  capitalGainTax: number;

  netReceivable: number;

  profitLoss: number;

  profitPerShare: number;

  roi: number;
}

/* ──────────────────────────────────────────────────────────
   NEPSE Constants
────────────────────────────────────────────────────────── */

const BROKERAGE_SLABS: BrokerageSlab[] = [
  {
    max: 50_000,
    rate: 0.0036,
    minimumCommission: 10,
  },

  {
    max: 500_000,
    rate: 0.0033,
  },

  {
    max: 2_000_000,
    rate: 0.0031,
  },

  {
    max: 10_000_000,
    rate: 0.0027,
  },

  {
    max: Infinity,
    rate: 0.0024,
  },
];

const SEBON_FEE_RATE = 0.00015;

const DP_CHARGE = 25;

const CGT_RATES = {
  individualShortTerm: 0.1,

  individualLongTerm: 0.075,

  institutional: 0.1,
} as const;

const LONG_TERM_THRESHOLD_DAYS = 365;

/* ──────────────────────────────────────────────────────────
   Tool Tabs
────────────────────────────────────────────────────────── */

const TRANSACTION_OPTIONS: {
  id: TransactionMode;
  label: string;
  description: string;
}[] = [
  {
    id: "buy-sell",

    label: "Buy & Sell",

    description: "Calculate complete investment return",
  },

  {
    id: "buy",

    label: "Buy Only",

    description: "Calculate total purchase cost",
  },

  {
    id: "sell",

    label: "Sell Only",

    description: "Calculate selling proceeds and tax",
  },
];

/* ──────────────────────────────────────────────────────────
   FAQ
────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question: "What is a NEPSE Share Calculator?",

    answer:
      "A NEPSE Share Calculator estimates the buying cost, selling proceeds, broker commission, SEBON transaction fee, DP charge, capital gains tax, net profit or loss, and investment return for equity share transactions in Nepal.",
  },

  {
    question: "What broker commission does this calculator use?",

    answer:
      "The calculator uses tiered equity brokerage rates of 0.36%, 0.33%, 0.31%, 0.27%, and 0.24% depending on the transaction amount. Transactions up to NPR 50,000 use the 0.36% rate subject to a minimum commission of NPR 10.",
  },

  {
    question: "What is the SEBON fee on share transactions?",

    answer:
      "The calculator uses a SEBON transaction fee of 0.015% of the gross transaction amount on both buying and selling.",
  },

  {
    question: "What is the DP charge when selling shares in Nepal?",

    answer:
      "The calculator uses a flat DP charge of NPR 25 on a selling transaction. The DP charge is not added to the buying transaction in this calculator.",
  },

  {
    question: "What is the capital gains tax on NEPSE shares?",

    answer:
      "For individual investors, this calculator applies 10% CGT when shares are held for 365 days or less and 7.5% when held for more than 365 days. Institutional investors use a 10% rate.",
  },

  {
    question: "Is CGT charged when I sell shares at a loss?",

    answer:
      "No. This calculator applies capital gains tax only when the calculated taxable capital gain is greater than zero.",
  },

  {
    question: "What does WACC mean in a share calculator?",

    answer:
      "WACC represents the weighted average acquisition cost per share used as the cost basis. When you select the WACC option, the entered purchase price is treated as an existing cost basis and buying fees are not added again.",
  },

  {
    question: "What is the difference between gross profit and net profit?",

    answer:
      "Gross price movement compares buying and selling values before all charges. Net profit accounts for applicable brokerage, SEBON fees, DP charges, capital gains tax, and the actual acquisition cost.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",

  "@type": "FAQPage",

  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",

    name: item.question,

    acceptedAnswer: {
      "@type": "Answer",

      text: item.answer,
    },
  })),
};

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatNpr(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `NPR ${new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: decimals,

    maximumFractionDigits: decimals,
  }).format(value);
}

function formatPercent(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${formatNumber(value, decimals)}%`;
}

/* ──────────────────────────────────────────────────────────
   Brokerage
────────────────────────────────────────────────────────── */

function getBrokerageSlab(amount: number): BrokerageSlab {
  return (
    BROKERAGE_SLABS.find((slab) => amount <= slab.max) ??
    BROKERAGE_SLABS[BROKERAGE_SLABS.length - 1]
  );
}

function calculateBrokerage(amount: number): {
  rate: number;
  commission: number;
} {
  if (amount <= 0) {
    return {
      rate: 0,

      commission: 0,
    };
  }

  const slab = getBrokerageSlab(amount);

  let commission = amount * slab.rate;

  if (slab.minimumCommission !== undefined) {
    commission = Math.max(commission, slab.minimumCommission);
  }

  return {
    rate: slab.rate,

    commission: roundMoney(commission),
  };
}

/* ──────────────────────────────────────────────────────────
   Transaction Fees
────────────────────────────────────────────────────────── */

function calculateTransactionFees(
  quantity: number,
  price: number,
): TransactionFees {
  const grossAmount = roundMoney(Math.max(0, quantity) * Math.max(0, price));

  const brokerage = calculateBrokerage(grossAmount);

  const sebonFee = roundMoney(grossAmount * SEBON_FEE_RATE);

  return {
    grossAmount,

    brokerageRate: brokerage.rate,

    brokerage: brokerage.commission,

    sebonFee,
  };
}

/* ──────────────────────────────────────────────────────────
   CGT
────────────────────────────────────────────────────────── */

function getCgtRate(investorType: InvestorType, holdingDays: number): number {
  if (investorType === "institutional") {
    return CGT_RATES.institutional;
  }

  return holdingDays <= LONG_TERM_THRESHOLD_DAYS
    ? CGT_RATES.individualShortTerm
    : CGT_RATES.individualLongTerm;
}

/* ──────────────────────────────────────────────────────────
   Main Calculation
────────────────────────────────────────────────────────── */

function calculateShareTransaction({
  quantity,
  purchasePrice,
  sellingPrice,
  isWaccPrice,
  investorType,
  holdingDays,
}: {
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  isWaccPrice: boolean;
  investorType: InvestorType;
  holdingDays: number;
}): ShareCalculationResult {
  const safeQuantity = Math.max(0, quantity);

  const buy = calculateTransactionFees(safeQuantity, purchasePrice);

  const sell = calculateTransactionFees(safeQuantity, sellingPrice);

  /*
   * When WACC is selected:
   *
   * purchasePrice is already treated
   * as acquisition cost per share.
   *
   * Therefore buy brokerage and
   * SEBON fees must not be added again.
   */

  const totalBuyingCost = isWaccPrice
    ? roundMoney(safeQuantity * Math.max(0, purchasePrice))
    : roundMoney(buy.grossAmount + buy.brokerage + buy.sebonFee);

  const effectiveCostPerShare =
    safeQuantity > 0 ? roundMoney(totalBuyingCost / safeQuantity) : 0;

  /*
   * DP charge applies only on
   * the sell transaction.
   */

  const dpCharge = sell.grossAmount > 0 ? DP_CHARGE : 0;

  const sellingExpensesBeforeTax = roundMoney(
    sell.brokerage + sell.sebonFee + dpCharge,
  );

  const netSellBeforeTax = roundMoney(
    sell.grossAmount - sellingExpensesBeforeTax,
  );

  /*
   * Capital gain:
   *
   * Net selling amount before CGT
   * minus total acquisition cost.
   */

  const capitalGain = roundMoney(netSellBeforeTax - totalBuyingCost);

  const taxableGain = Math.max(0, capitalGain);

  const cgtRate = getCgtRate(investorType, Math.max(0, holdingDays));

  const capitalGainTax = roundMoney(taxableGain * cgtRate);

  const netReceivable = roundMoney(netSellBeforeTax - capitalGainTax);

  const profitLoss = roundMoney(netReceivable - totalBuyingCost);

  const profitPerShare =
    safeQuantity > 0 ? roundMoney(profitLoss / safeQuantity) : 0;

  const roi = totalBuyingCost > 0 ? (profitLoss / totalBuyingCost) * 100 : 0;

  return {
    buy,

    sell,

    totalBuyingCost,

    effectiveCostPerShare,

    dpCharge,

    sellingExpensesBeforeTax,

    netSellBeforeTax,

    capitalGain,

    taxableGain,

    cgtRate,

    capitalGainTax,

    netReceivable,

    profitLoss,

    profitPerShare,

    roi,
  };
}

/* ──────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────── */

export function NepseShareCalculator() {
  const [mode, setMode] = useState<TransactionMode>("buy-sell");

  const [quantity, setQuantity] = useState(100);

  const [purchasePrice, setPurchasePrice] = useState(500);

  const [sellingPrice, setSellingPrice] = useState(650);

  const [isWaccPrice, setIsWaccPrice] = useState(false);

  const [investorType, setInvestorType] = useState<InvestorType>("individual");

  const [holdingDays, setHoldingDays] = useState(180);

  const result = useMemo(
    () =>
      calculateShareTransaction({
        quantity,

        purchasePrice,

        sellingPrice,

        isWaccPrice,

        investorType,

        holdingDays,
      }),
    [
      quantity,
      purchasePrice,
      sellingPrice,
      isWaccPrice,
      investorType,
      holdingDays,
    ],
  );

  /* ────────────────────────────────────────────────────────
     Visibility
  ──────────────────────────────────────────────────────── */

  const showBuy = mode === "buy" || mode === "buy-sell";

  const showSell = mode === "sell" || mode === "buy-sell";

  /*
   * Even sell-only mode needs purchase
   * price/WACC to calculate capital gain.
   */

  const showPurchaseInput = true;

  const holdingType =
    holdingDays <= LONG_TERM_THRESHOLD_DAYS ? "Short-Term" : "Long-Term";

  const profitable = result.profitLoss >= 0;

  /* ────────────────────────────────────────────────────────
     Reset
  ──────────────────────────────────────────────────────── */

  function resetCalculator() {
    setMode("buy-sell");

    setQuantity(100);

    setPurchasePrice(500);

    setSellingPrice(650);

    setIsWaccPrice(false);

    setInvestorType("individual");

    setHoldingDays(180);
  }

  /* ───────────────────────────────────────────────────── */

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[920px]
      "
    >
      {/* FAQ JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(FAQ_SCHEMA),
        }}
      />

      {/* ────────────────────────────────────────────────
          SEO Header
      ──────────────────────────────────────────────── */}

      <header
        className="
          mb-6
          text-center
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-indigo-600
          "
        >
          Nepal Stock Market Tools
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-bold
            tracking-tight
            text-slate-950
            sm:text-3xl
          "
        >
          NEPSE Share Calculator
          <span
            className="
              block
              text-indigo-600
            "
          >
            Calculate Share Profit, Brokerage, SEBON Fee &amp; CGT
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-slate-600
          "
        >
          Calculate the estimated cost of buying and selling shares on NEPSE.
          See broker commission, SEBON fees, DP charges, capital gains tax, net
          receivable, profit or loss, and return on investment.
        </p>
      </header>

      {/* ────────────────────────────────────────────────
          Transaction Mode
      ──────────────────────────────────────────────── */}

      <div
        className="
          mb-4
          grid
          grid-cols-1
          gap-2
          rounded-2xl
          border
          border-slate-200
          bg-slate-100
          p-1.5
          sm:grid-cols-3
        "
      >
        {TRANSACTION_OPTIONS.map((option) => {
          const active = mode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setMode(option.id)}
              className={`
                  rounded-xl
                  px-4
                  py-3
                  text-left
                  transition-all

                  ${
                    active
                      ? `
                        bg-white
                        text-indigo-700
                        shadow-sm
                      `
                      : `
                        text-slate-600
                        hover:bg-white/60
                      `
                  }
                `}
            >
              <span
                className="
                    block
                    text-xs
                    font-bold
                  "
              >
                {option.label}
              </span>

              <span
                className="
                    mt-0.5
                    block
                    text-[9px]
                    text-slate-400
                  "
              >
                {option.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────
          Calculator
      ──────────────────────────────────────────────── */}

      <section
        aria-label="NEPSE share calculator"
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        {/* Header */}

        <div
          className="
            border-b
            border-slate-200
            bg-slate-50
            px-5
            py-4
            sm:px-6
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-3
            "
          >
            <div>
              <p
                className="
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                Nepal Stock Exchange
              </p>

              <div
                className="
                  mt-1
                  flex
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-emerald-500
                  "
                />

                <span
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  NEPSE Equity Share Calculation
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={resetCalculator}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2
                text-[10px]
                font-semibold
                text-slate-600
                transition
                hover:border-indigo-300
                hover:bg-indigo-50
                hover:text-indigo-700
              "
            >
              <RotateCcw
                className="
                  h-3.5
                  w-3.5
                "
              />
              Reset
            </button>
          </div>
        </div>

        <div
          className="
            p-5
            sm:p-6
          "
        >
          {/* ────────────────────────────────────────────
              Inputs
          ──────────────────────────────────────────── */}

          <div
            className="
              grid
              gap-5
              sm:grid-cols-2
            "
          >
            <InputSection
              label="Number of Shares"
              description="Total quantity of equity shares"
            >
              <NumberInput
                value={quantity}
                min={1}
                step={1}
                suffix="shares"
                onChange={setQuantity}
              />
            </InputSection>

            {showPurchaseInput && (
              <InputSection
                label={
                  isWaccPrice
                    ? "WACC Price Per Share"
                    : "Purchase Price Per Share"
                }
                description={
                  isWaccPrice
                    ? "Existing weighted average acquisition cost"
                    : "Market price paid when purchasing the shares"
                }
              >
                <MoneyInput value={purchasePrice} onChange={setPurchasePrice} />
              </InputSection>
            )}

            {showSell && (
              <InputSection
                label="Selling Price Per Share"
                description="Expected or actual share selling price"
              >
                <MoneyInput value={sellingPrice} onChange={setSellingPrice} />
              </InputSection>
            )}

            {showSell && (
              <InputSection
                label="Investor Type"
                description="Used to determine the applicable capital gains tax"
              >
                <select
                  value={investorType}
                  onChange={(event) =>
                    setInvestorType(event.target.value as InvestorType)
                  }
                  className="
                    h-[54px]
                    w-full
                    rounded-xl
                    border
                    border-slate-300
                    bg-white
                    px-4
                    text-sm
                    font-semibold
                    text-slate-800
                    outline-none
                    transition
                    hover:border-indigo-400
                    focus:border-indigo-500
                    focus:ring-4
                    focus:ring-indigo-500/10
                  "
                >
                  <option value="individual">Individual Investor</option>

                  <option value="institutional">Institutional Investor</option>
                </select>
              </InputSection>
            )}

            {showSell && investorType === "individual" && (
              <InputSection
                label="Holding Period"
                description="Number of days shares were held before selling"
              >
                <NumberInput
                  value={holdingDays}
                  min={0}
                  step={1}
                  suffix="days"
                  onChange={setHoldingDays}
                />
              </InputSection>
            )}
          </div>

          {/* ────────────────────────────────────────────
              WACC
          ──────────────────────────────────────────── */}

          {mode !== "buy" && (
            <label
              className="
                mt-5
                flex
                cursor-pointer
                items-start
                gap-3
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-4
                transition
                hover:border-indigo-300
                hover:bg-indigo-50/50
              "
            >
              <input
                type="checkbox"
                checked={isWaccPrice}
                onChange={(event) => setIsWaccPrice(event.target.checked)}
                className="
                  mt-0.5
                  h-4
                  w-4
                  accent-indigo-600
                "
              />

              <span>
                <span
                  className="
                    block
                    text-xs
                    font-bold
                    text-slate-800
                  "
                >
                  Purchase price is already WACC
                </span>

                <span
                  className="
                    mt-1
                    block
                    text-[11px]
                    leading-5
                    text-slate-500
                  "
                >
                  Enable this when the entered price already represents your
                  weighted average acquisition cost. Buying fees will not be
                  added again to the cost basis.
                </span>
              </span>
            </label>
          )}

          {/* ────────────────────────────────────────────
              CGT Status
          ──────────────────────────────────────────── */}

          {showSell && (
            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
              "
            >
              <MetricCard
                label="Investor"
                value={
                  investorType === "individual" ? "Individual" : "Institutional"
                }
              />

              <MetricCard
                label="Holding Type"
                value={
                  investorType === "institutional"
                    ? "Institutional"
                    : holdingType
                }
              />

              <MetricCard
                label="CGT Rate"
                value={formatPercent(result.cgtRate * 100, 1)}
              />

              <MetricCard
                label="DP Charge"
                value={formatNpr(result.dpCharge)}
              />
            </div>
          )}

          {/* ────────────────────────────────────────────
              Buy Result
          ──────────────────────────────────────────── */}

          {showBuy && (
            <ResultSection
              icon={
                <ArrowDownRight
                  className="
                    h-4
                    w-4
                  "
                />
              }
              eyebrow="Buy Calculation"
              title={isWaccPrice ? "Acquisition Cost" : "Total Buying Cost"}
              value={formatNpr(result.totalBuyingCost)}
            >
              {isWaccPrice ? (
                <ResultRows
                  rows={[
                    {
                      label: "WACC Cost Basis",

                      value: formatNpr(result.totalBuyingCost),
                    },

                    {
                      label: "WACC Per Share",

                      value: formatNpr(result.effectiveCostPerShare),
                    },

                    {
                      label: "Number of Shares",

                      value: formatNumber(quantity, 0),
                    },
                  ]}
                />
              ) : (
                <ResultRows
                  rows={[
                    {
                      label: "Gross Purchase",

                      value: formatNpr(result.buy.grossAmount),
                    },

                    {
                      label: `Broker Commission (${formatPercent(
                        result.buy.brokerageRate * 100,
                        2,
                      )})`,

                      value: formatNpr(result.buy.brokerage),
                    },

                    {
                      label: "SEBON Fee (0.015%)",

                      value: formatNpr(result.buy.sebonFee),
                    },

                    {
                      label: "DP Charge",

                      value: "NPR 0.00",
                    },

                    {
                      label: "Total Buying Cost",

                      value: formatNpr(result.totalBuyingCost),

                      strong: true,
                    },

                    {
                      label: "Actual Cost / Share",

                      value: formatNpr(result.effectiveCostPerShare),
                    },
                  ]}
                />
              )}
            </ResultSection>
          )}

          {/* ────────────────────────────────────────────
              Sell Result
          ──────────────────────────────────────────── */}

          {showSell && (
            <ResultSection
              icon={
                <ArrowUpRight
                  className="
                    h-4
                    w-4
                  "
                />
              }
              eyebrow="Sell Calculation"
              title="Net Amount Receivable"
              value={formatNpr(result.netReceivable)}
            >
              <ResultRows
                rows={[
                  {
                    label: "Gross Selling Value",

                    value: formatNpr(result.sell.grossAmount),
                  },

                  {
                    label: `Broker Commission (${formatPercent(
                      result.sell.brokerageRate * 100,
                      2,
                    )})`,

                    value: `− ${formatNpr(result.sell.brokerage)}`,
                  },

                  {
                    label: "SEBON Fee (0.015%)",

                    value: `− ${formatNpr(result.sell.sebonFee)}`,
                  },

                  {
                    label: "DP Charge",

                    value: `− ${formatNpr(result.dpCharge)}`,
                  },

                  {
                    label: "Capital Gain Before CGT",

                    value: formatNpr(result.capitalGain),

                    positive: result.capitalGain > 0,

                    negative: result.capitalGain < 0,
                  },

                  {
                    label: `Capital Gains Tax (${formatPercent(
                      result.cgtRate * 100,
                      1,
                    )})`,

                    value: `− ${formatNpr(result.capitalGainTax)}`,
                  },

                  {
                    label: "Net Amount Receivable",

                    value: formatNpr(result.netReceivable),

                    strong: true,
                  },
                ]}
              />
            </ResultSection>
          )}

          {/* ────────────────────────────────────────────
              Final Profit / Loss
          ──────────────────────────────────────────── */}

          {mode !== "buy" && (
            <section
              aria-live="polite"
              className={`
                mt-5
                overflow-hidden
                rounded-2xl
                border

                ${
                  profitable
                    ? `
                      border-emerald-200
                      bg-gradient-to-br
                      from-emerald-50
                      via-white
                      to-green-50
                    `
                    : `
                      border-red-200
                      bg-gradient-to-br
                      from-red-50
                      via-white
                      to-rose-50
                    `
                }
              `}
            >
              <div
                className="
                  p-5
                  sm:p-6
                "
              >
                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <p
                      className={`
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]

                        ${profitable ? "text-emerald-600" : "text-red-600"}
                      `}
                    >
                      Net Investment Result
                    </p>

                    <p
                      className={`
                        mt-2
                        break-words
                        text-3xl
                        font-bold
                        tracking-tight
                        sm:text-4xl

                        ${profitable ? "text-emerald-700" : "text-red-700"}
                      `}
                    >
                      {profitable ? "+" : ""}
                      {formatNpr(result.profitLoss)}
                    </p>

                    <p
                      className="
                        mt-2
                        text-xs
                        text-slate-500
                      "
                    >
                      {profitable
                        ? "Estimated net profit after applicable fees and CGT."
                        : "Estimated net loss after applicable transaction fees."}
                    </p>
                  </div>

                  <div
                    className={`
                      grid
                      h-14
                      w-14
                      place-items-center
                      rounded-full

                      ${
                        profitable
                          ? `
                            bg-emerald-100
                            text-emerald-700
                          `
                          : `
                            bg-red-100
                            text-red-700
                          `
                      }
                    `}
                  >
                    {profitable ? (
                      <TrendingUp
                        className="
                          h-7
                          w-7
                        "
                      />
                    ) : (
                      <TrendingDown
                        className="
                          h-7
                          w-7
                        "
                      />
                    )}
                  </div>
                </div>
              </div>

              <div
                className="
                  grid
                  border-t
                  border-slate-200
                  bg-white/70
                  sm:grid-cols-3
                "
              >
                <ResultStrip
                  label="Return / ROI"
                  value={`${result.roi >= 0 ? "+" : ""}${formatPercent(
                    result.roi,
                    2,
                  )}`}
                  positive={result.roi >= 0}
                  negative={result.roi < 0}
                />

                <ResultStrip
                  label="Profit / Loss Per Share"
                  value={formatNpr(result.profitPerShare)}
                  positive={result.profitPerShare >= 0}
                  negative={result.profitPerShare < 0}
                />

                <ResultStrip
                  label="CGT Paid"
                  value={formatNpr(result.capitalGainTax)}
                />
              </div>
            </section>
          )}

          {/* ────────────────────────────────────────────
              Quick Summary
          ──────────────────────────────────────────── */}

          {mode === "buy-sell" && (
            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-4
              "
            >
              <MetricCard
                label="Total Investment"
                value={formatNpr(result.totalBuyingCost)}
              />

              <MetricCard
                label="Gross Sale"
                value={formatNpr(result.sell.grossAmount)}
              />

              <MetricCard
                label="Taxable Gain"
                value={formatNpr(result.taxableGain)}
              />

              <MetricCard
                label="Net Receivable"
                value={formatNpr(result.netReceivable)}
              />
            </div>
          )}

          {/* Disclaimer */}

          <div
            className="
              mt-5
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-4
              py-3.5
            "
          >
            <p
              className="
                text-xs
                font-bold
                text-amber-900
              "
            >
              NEPSE transaction estimate
            </p>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-amber-800
              "
            >
              This calculator is for estimation and planning. Brokerage rates,
              taxes, fees, settlement rules and regulatory requirements can
              change. Always compare important transactions with your
              broker&apos;s contract note, CDSC records and applicable Nepal tax
              and securities rules.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          SEO Content
      ──────────────────────────────────────────────── */}

      <article
        className="
          mt-8
          space-y-5
        "
      >
        <SeoSection title="NEPSE Share Calculator – Calculate Share Profit and Charges">
          <p>
            The NEPSE Share Calculator helps investors estimate the actual cost
            of buying and selling equity shares listed on the Nepal Stock
            Exchange. It accounts for broker commission, SEBON transaction fees,
            DP charges and applicable capital gains tax before calculating your
            final profit or loss.
          </p>

          <p>
            Enter the number of shares, purchase price and selling price to
            calculate your estimated buying cost, net amount receivable, capital
            gain, tax, profit per share and return on investment.
          </p>
        </SeoSection>

        <SeoSection title="NEPSE Broker Commission Rates">
          <p>
            Equity broker commission depends on the total value of the
            transaction. The rate decreases as the transaction amount increases.
          </p>

          <div
            className="
              overflow-x-auto
            "
          >
            <table
              className="
                w-full
                min-w-[520px]
                text-left
                text-xs
              "
            >
              <thead>
                <tr
                  className="
                    border-b
                    border-slate-200
                  "
                >
                  <th
                    className="
                      px-3
                      py-3
                      font-bold
                      text-slate-900
                    "
                  >
                    Transaction Amount
                  </th>

                  <th
                    className="
                      px-3
                      py-3
                      text-right
                      font-bold
                      text-slate-900
                    "
                  >
                    Brokerage Rate
                  </th>
                </tr>
              </thead>

              <tbody>
                <FeeRow
                  label="Up to NPR 50,000"
                  value="0.36% · Minimum NPR 10"
                />

                <FeeRow label="NPR 50,001 – 500,000" value="0.33%" />

                <FeeRow label="NPR 500,001 – 2,000,000" value="0.31%" />

                <FeeRow label="NPR 2,000,001 – 10,000,000" value="0.27%" />

                <FeeRow label="Above NPR 10,000,000" value="0.24%" />
              </tbody>
            </table>
          </div>

          <FormulaBox
            title="Broker Commission"
            formula="Commission = Transaction Amount × Applicable Brokerage Rate"
          />
        </SeoSection>

        <SeoSection title="SEBON Fee and DP Charge">
          <div
            className="
              grid
              gap-3
              sm:grid-cols-2
            "
          >
            <FeatureCard
              icon={<Landmark className="h-4 w-4" />}
              title="SEBON Fee"
              value="0.015%"
              description="Applied to the gross transaction amount on both buying and selling."
            />

            <FeatureCard
              icon={<Calculator className="h-4 w-4" />}
              title="DP Charge"
              value="NPR 25"
              description="Flat charge applied on the selling transaction in this calculator."
            />
          </div>
        </SeoSection>

        <SeoSection title="NEPSE Capital Gains Tax">
          <p>
            Capital Gains Tax, or CGT, is applied only when the share
            transaction produces a taxable capital gain.
          </p>

          <div
            className="
              overflow-x-auto
            "
          >
            <table
              className="
                w-full
                min-w-[540px]
                text-left
                text-xs
              "
            >
              <thead>
                <tr
                  className="
                    border-b
                    border-slate-200
                  "
                >
                  <th
                    className="
                      px-3
                      py-3
                      font-bold
                      text-slate-900
                    "
                  >
                    Investor / Holding
                  </th>

                  <th
                    className="
                      px-3
                      py-3
                      text-right
                      font-bold
                      text-slate-900
                    "
                  >
                    CGT
                  </th>
                </tr>
              </thead>

              <tbody>
                <FeeRow label="Individual · 365 days or less" value="10%" />

                <FeeRow label="Individual · More than 365 days" value="7.5%" />

                <FeeRow label="Institutional Investor" value="10%" />
              </tbody>
            </table>
          </div>

          <FormulaBox
            title="Capital Gains Tax"
            formula="CGT = Positive Taxable Capital Gain × Applicable CGT Rate"
          />

          <p>
            If the calculated capital gain is zero or negative, this calculator
            does not apply CGT.
          </p>
        </SeoSection>

        <SeoSection title="How Buying Cost Is Calculated">
          <p>
            For a normal purchase price, the estimated total acquisition cost
            is:
          </p>

          <FormulaBox
            title="Total Buying Cost"
            formula="Gross Buy Amount + Broker Commission + SEBON Fee"
          />

          <p>
            The DP charge is not added to the buying cost in this calculator.
          </p>

          <p>
            If the entered purchase price is already your WACC, the calculator
            treats:
          </p>

          <FormulaBox
            title="WACC Cost Basis"
            formula="WACC Per Share × Number of Shares"
          />

          <p>
            This avoids adding buying charges to an acquisition cost that
            already includes them.
          </p>
        </SeoSection>

        <SeoSection title="How Selling Amount Is Calculated">
          <p>
            The gross selling value is the selling price multiplied by the
            number of shares. Selling charges are then deducted.
          </p>

          <FormulaBox
            title="Net Selling Amount Before CGT"
            formula="Gross Sale − Broker Commission − SEBON Fee − DP Charge"
          />

          <p>
            The acquisition cost is then deducted to determine the capital gain.
            CGT is applied only to a positive taxable gain.
          </p>

          <FormulaBox
            title="Net Amount Receivable"
            formula="Gross Sale − Selling Charges − Capital Gains Tax"
          />
        </SeoSection>

        <SeoSection title="How to Use the NEPSE Share Calculator">
          <Steps
            items={[
              "Choose Buy & Sell, Buy Only, or Sell Only.",
              "Enter the number of shares in the transaction.",
              "Enter the purchase price or enable WACC if you already know your weighted average acquisition cost.",
              "Enter the selling price when calculating a sale.",
              "Choose Individual or Institutional investor.",
              "For an individual investor, enter the number of days the shares were held.",
              "Review brokerage, SEBON fee, DP charge, CGT, net receivable, profit or loss and ROI.",
            ]}
          />
        </SeoSection>

        <SeoSection title="Frequently Asked Questions">
          <div
            className="
              divide-y
              divide-slate-200
            "
          >
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="
                    group
                    py-4
                    first:pt-0
                    last:pb-0
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
                      text-sm
                      font-bold
                      text-slate-800
                    "
                >
                  <span>{item.question}</span>

                  <span
                    className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-slate-500
                        transition
                        group-open:rotate-45
                      "
                  >
                    +
                  </span>
                </summary>

                <p
                  className="
                      mt-3
                      pr-8
                      text-sm
                      leading-6
                      text-slate-600
                    "
                >
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </SeoSection>
      </article>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Input Section
────────────────────────────────────────────────────────── */

function InputSection({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p
        className="
          text-xs
          font-bold
          uppercase
          tracking-wider
          text-slate-500
        "
      >
        {label}
      </p>

      <p
        className="
          mb-2
          mt-1
          text-[10px]
          leading-4
          text-slate-400
        "
      >
        {description}
      </p>

      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Money Input
────────────────────────────────────────────────────────── */

function MoneyInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className="
        flex
        overflow-hidden
        rounded-xl
        border
        border-slate-300
        bg-white
        shadow-sm
        transition
        hover:border-indigo-400
        focus-within:border-indigo-500
        focus-within:ring-4
        focus-within:ring-indigo-500/10
      "
    >
      <span
        className="
          flex
          items-center
          border-r
          border-slate-200
          bg-slate-50
          px-3
          text-xs
          font-bold
          text-slate-500
        "
      >
        NPR
      </span>

      <input
        type="number"
        value={value}
        min={0}
        step={0.01}
        onChange={(event) => {
          const number = Number(event.target.value);

          onChange(Number.isFinite(number) ? Math.max(0, number) : 0);
        }}
        className="
          min-w-0
          flex-1
          bg-transparent
          px-4
          py-3.5
          text-lg
          font-bold
          text-slate-900
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Number Input
────────────────────────────────────────────────────────── */

function NumberInput({
  value,
  min,
  step,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div
      className="
        flex
        overflow-hidden
        rounded-xl
        border
        border-slate-300
        bg-white
        shadow-sm
        transition
        hover:border-indigo-400
        focus-within:border-indigo-500
        focus-within:ring-4
        focus-within:ring-indigo-500/10
      "
    >
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(event) => {
          const number = Number(event.target.value);

          onChange(Number.isFinite(number) ? Math.max(min, number) : min);
        }}
        className="
          min-w-0
          flex-1
          bg-transparent
          px-4
          py-3.5
          text-lg
          font-bold
          text-slate-900
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      <span
        className="
          flex
          items-center
          border-l
          border-slate-200
          bg-slate-50
          px-3
          text-[10px]
          font-bold
          text-slate-500
        "
      >
        {suffix}
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Result Section
────────────────────────────────────────────────────────── */

function ResultSection({
  icon,
  eyebrow,
  title,
  value,
  children,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <section
      className="
        mt-5
        overflow-hidden
        rounded-2xl
        border
        border-indigo-200
        bg-gradient-to-br
        from-indigo-50
        via-white
        to-blue-50
      "
    >
      <div
        className="
          px-5
          py-5
          sm:px-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-indigo-600
          "
        >
          {icon}

          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
            "
          >
            {eyebrow}
          </p>
        </div>

        <p
          className="
            mt-3
            text-xs
            font-semibold
            text-slate-500
          "
        >
          {title}
        </p>

        <p
          className="
            mt-1
            break-words
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
            sm:text-3xl
          "
        >
          {value}
        </p>
      </div>

      <div
        className="
          border-t
          border-indigo-100
          bg-white/70
          p-4
          sm:p-5
        "
      >
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Result Rows
────────────────────────────────────────────────────────── */

function ResultRows({
  rows,
}: {
  rows: {
    label: string;

    value: string;

    strong?: boolean;

    positive?: boolean;

    negative?: boolean;
  }[];
}) {
  return (
    <div
      className="
        divide-y
        divide-slate-100
      "
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="
              flex
              items-start
              justify-between
              gap-4
              py-2.5
              first:pt-0
              last:pb-0
            "
        >
          <span
            className="
                text-xs
                text-slate-500
              "
          >
            {row.label}
          </span>

          <span
            className={`
                text-right
                text-xs

                ${
                  row.strong
                    ? `
                      font-bold
                      text-slate-900
                    `
                    : `
                      font-semibold
                      text-slate-700
                    `
                }

                ${row.positive ? "text-emerald-700" : ""}

                ${row.negative ? "text-red-700" : ""}
              `}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Result Strip
────────────────────────────────────────────────────────── */

function ResultStrip({
  label,
  value,
  positive = false,
  negative = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}) {
  return (
    <div
      className="
        border-b
        border-slate-100
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
          text-[9px]
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
          mt-1.5
          break-words
          text-sm
          font-bold

          ${
            positive
              ? "text-emerald-700"
              : negative
                ? "text-red-700"
                : "text-slate-800"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Metric Card
────────────────────────────────────────────────────────── */

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-3
        text-center
      "
    >
      <p
        className="
          break-words
          text-xs
          font-bold
          text-slate-800
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1
          text-[8px]
          font-bold
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SEO Section
────────────────────────────────────────────────────────── */

function SeoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        sm:p-6
      "
    >
      <h2
        className="
          text-lg
          font-bold
          tracking-tight
          text-slate-950
          sm:text-xl
        "
      >
        {title}
      </h2>

      <div
        className="
          mt-3
          space-y-3
          text-sm
          leading-7
          text-slate-600
        "
      >
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Formula
────────────────────────────────────────────────────────── */

function FormulaBox({ title, formula }: { title: string; formula: string }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-indigo-100
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
          mt-2
          overflow-x-auto
          whitespace-nowrap
          font-mono
          text-xs
          font-bold
          text-indigo-700
        "
      >
        {formula}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Feature Card
────────────────────────────────────────────────────────── */

function FeatureCard({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-indigo-600
        "
      >
        {icon}

        <span
          className="
            text-xs
            font-bold
            text-slate-800
          "
        >
          {title}
        </span>
      </div>

      <p
        className="
          mt-3
          text-xl
          font-bold
          text-indigo-700
        "
      >
        {value}
      </p>

      <p
        className="
          mt-1.5
          text-xs
          leading-5
          text-slate-500
        "
      >
        {description}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Fee Table Row
────────────────────────────────────────────────────────── */

function FeeRow({ label, value }: { label: string; value: string }) {
  return (
    <tr
      className="
        border-b
        border-slate-100
        last:border-0
      "
    >
      <td
        className="
          px-3
          py-3
          text-slate-600
        "
      >
        {label}
      </td>

      <td
        className="
          px-3
          py-3
          text-right
          font-bold
          text-slate-800
        "
      >
        {value}
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────────────────────
   Steps
────────────────────────────────────────────────────────── */

function Steps({ items }: { items: string[] }) {
  return (
    <div
      className="
        space-y-3
      "
    >
      {items.map((item, index) => (
        <div
          key={item}
          className="
              flex
              items-start
              gap-3
            "
        >
          <span
            className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-indigo-100
                text-[11px]
                font-bold
                text-indigo-700
              "
          >
            {index + 1}
          </span>

          <p
            className="
                pt-0.5
              "
          >
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NepseShareCalculator;
