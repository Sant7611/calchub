"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid, currency, number } from "./shared";

/** Return on investment, with optional annualization. Mirrors `roi-calculator`. */
export function RoiCalculator() {
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
        <Field label="Initial investment">
          <NumInput value={initial} onChange={setInitial} prefix="$" step={500} />
        </Field>
        <Field label="Final value">
          <NumInput value={finalValue} onChange={setFinalValue} prefix="$" step={500} />
        </Field>
        <Field label="Holding period">
          <NumInput value={years} onChange={setYears} suffix="yrs" step={0.5} />
        </Field>
      </div>

      <StatGrid>
        <Stat accent label="Total ROI" value={`${number(roi, 1)}%`} sub={`${currency(gain)} ${gain >= 0 ? "gain" : "loss"}`} />
        <Stat label="Annualized return" value={`${number(annualized, 1)}%`} sub="CAGR" />
        <Stat label="Final value" value={currency(finalValue)} />
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-fog-600">
        ROI = (final − initial) ÷ initial. Annualized uses the compound annual growth rate.
      </p>
    </div>
  );
}
