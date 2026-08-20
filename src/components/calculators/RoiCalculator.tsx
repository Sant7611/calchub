"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { makeFormatters } from "@/lib/format";

/** Return on investment, with optional annualization. Mirrors `roi-calculator`. */
export function RoiCalculator() {
  const { region, config } = useRegion();
  const formatters = makeFormatters(region);
  
  const [initial, setInitial] = useState(10000);
  const [finalValue, setFinalValue] = useState(13500);
  const [years, setYears] = useState(3);
  
  const gain = finalValue - initial;
  const roi = initial !== 0 ? (gain / initial) * 100 : 0;
  const annualized =
    initial > 0 && finalValue > 0 && years > 0
      ? (Math.pow(finalValue / initial, 1 / years) - 1) * 100
      : 0;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Initial investment (${config.currency.code})`}>
          <NumInput value={initial} onChange={setInitial} prefix={config.currency.symbol} step={500} />
        </Field>
        <Field label={`Final value (${config.currency.code})`}>
          <NumInput value={finalValue} onChange={setFinalValue} prefix={config.currency.symbol} step={500} />
        </Field>
        <Field label="Holding period">
          <NumInput value={years} onChange={setYears} suffix="yrs" step={0.5} />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label="Total ROI" value={`${formatters.fmt(roi, 1)}%`} sub={`${formatters.money(gain)} ${gain >= 0 ? "gain" : "loss"}`} />
        <Stat label="Annualized return" value={`${formatters.fmt(annualized, 1)}%`} sub="CAGR" />
        <Stat label="Final value" value={formatters.money(finalValue)} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        ROI = (final − initial) ÷ initial. Annualized uses the compound annual growth rate.
      </p>
    </div>
  );
}
