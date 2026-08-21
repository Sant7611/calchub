"use client";

import { useState } from "react";
import { Field, NumInput, Stat, StatGrid } from "./shared";

/* ── unit definitions ───────────────────────────────────── */
type UnitKey = "mm" | "cm" | "m" | "km" | "in" | "ft" | "yd" | "mi";

interface UnitDef {
  label: string;
  symbol: string;
  /** Multiply a value in this unit by this factor to get meters. */
  toMeters: number;
}

const UNITS: Record<UnitKey, UnitDef> = {
  mm: { label: "Millimeter", symbol: "mm", toMeters: 0.001 },
  cm: { label: "Centimeter", symbol: "cm", toMeters: 0.01 },
  m: { label: "Meter", symbol: "m", toMeters: 1 },
  km: { label: "Kilometer", symbol: "km", toMeters: 1000 },
  in: { label: "Inch", symbol: "in", toMeters: 0.0254 },
  ft: { label: "Foot", symbol: "ft", toMeters: 0.3048 },
  yd: { label: "Yard", symbol: "yd", toMeters: 0.9144 },
  mi: { label: "Mile", symbol: "mi", toMeters: 1609.344 },
};

const UNIT_ORDER: UnitKey[] = ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"];

/** Locale-aware length formatter — more precision for very small/large values. */
function formatLength(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const abs = Math.abs(value);
  const digits = abs !== 0 && abs < 0.01 ? 6 : abs < 1 ? 4 : abs < 1000 ? 3 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Standalone length/distance unit converter — mm, cm, m, km, in, ft, yd, mi. */
export function LengthConverter() {
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState<UnitKey>("m");

  // Convert the input to meters once, then derive every other unit from that.
  const meters = value * UNITS[fromUnit].toMeters;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Value">
          <NumInput value={value} onChange={setValue} suffix={UNITS[fromUnit].symbol} step={1} />
        </Field>
        <Field label="From Unit">
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as UnitKey)}
            className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-[14px] font-medium text-foreground outline-none transition-all duration-200 focus:border-primary/60 focus:ring-2 focus:ring-ring/20"
          >
            {UNIT_ORDER.map((key) => (
              <option key={key} value={key} className="bg-card text-foreground">
                {UNITS[key].label} ({UNITS[key].symbol})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <StatGrid>
        {UNIT_ORDER.map((key) => {
          const converted = meters / UNITS[key].toMeters;
          return (
            <Stat
              key={key}
              accent={key === fromUnit}
              label={UNITS[key].label}
              value={`${formatLength(converted)} ${UNITS[key].symbol}`}
              sub={key === fromUnit ? "Input unit" : undefined}
            />
          );
        })}
      </StatGrid>

      <p className="mt-4 text-[11.5px] text-muted-foreground">
        Conversions use standard definitions (1 in = 0.0254 m, 1 mi = 1609.344 m, etc.). Values are
        rounded for display only — full precision is used internally.
      </p>
    </div>
  );
}