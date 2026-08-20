"use client";

import { useState } from "react";
import { Field, NumInput, Bar } from "./shared";

/* ── unit systems ────────────────────────────────────────── */
type UnitSystem = "metric" | "imperial";

interface BmiCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

const CATEGORIES: BmiCategory[] = [
  {
    label: "Underweight",
    min: 0,
    max: 18.5,
    color: "bg-sky-500",
    textColor: "text-sky-700",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-200",
  },
  {
    label: "Normal",
    min: 18.5,
    max: 25,
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    label: "Overweight",
    min: 25,
    max: 30,
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    label: "Obese",
    min: 30,
    max: Infinity,
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
];

function getCategory(bmi: number): BmiCategory {
  return (
    CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}

function formatNum(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "0";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

/** Standalone BMI calculator — metric (kg/cm) and imperial (lb/in). */
export function BmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);

  /* ── Convert active units to kg / meters ──────────────── */

  const weightKg =
    unitSystem === "metric"
      ? weight
      : weight * LB_TO_KG;

  const heightM =
    unitSystem === "metric"
      ? height / 100
      : (height * IN_TO_CM) / 100;

  /* ── Calculate BMI ────────────────────────────────────── */

  const bmi =
    heightM > 0
      ? weightKg / (heightM * heightM)
      : 0;

  const category = getCategory(bmi);

  /* ── Healthy weight range ─────────────────────────────── */

  const healthyMinKg =
    18.5 * heightM * heightM;

  const healthyMaxKg =
    24.9 * heightM * heightM;

  const toDisplayWeight = (kg: number) =>
    unitSystem === "metric"
      ? kg
      : kg / LB_TO_KG;

  const weightUnit =
    unitSystem === "metric"
      ? "kg"
      : "lb";

  const heightUnit =
    unitSystem === "metric"
      ? "cm"
      : "in";

  /* ── BMI bar position ─────────────────────────────────── */

  const scalePct = Math.max(
    0,
    Math.min(
      100,
      ((bmi - 10) / (40 - 10)) * 100
    )
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      {/* ── Unit Selector ───────────────────────────── */}

      <div className="mb-6 rounded-xl bg-slate-100 p-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          {(["metric", "imperial"] as UnitSystem[]).map((sys) => {
            const isSelected = unitSystem === sys;

            return (
              <button
                key={sys}
                type="button"
                onClick={() => setUnitSystem(sys)}
                aria-pressed={isSelected}
                className={`
                  rounded-lg
                  px-4
                  py-3
                  font-mono
                  text-[12px]
                  font-bold
                  tracking-wider
                  uppercase
                  transition-all
                  duration-200
                  ease-out
                  focus:outline-none
                  focus:ring-2
                  focus:ring-emerald-400
                  focus:ring-offset-1

                  ${
                    isSelected
                      ? `
                        bg-emerald-600
                        text-white
                        shadow-md
                        shadow-emerald-600/20
                        ring-1
                        ring-emerald-700
                      `
                      : `
                        bg-white
                        text-slate-600
                        shadow-sm
                        hover:bg-emerald-50
                        hover:text-emerald-700
                        hover:shadow-md
                        active:scale-[0.98]
                      `
                  }
                `}
              >
                {sys === "metric"
                  ? "Metric (kg/cm)"
                  : "Imperial (lb/in)"}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Inputs ─────────────────────────────────── */}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm">
          <Field label={`Weight (${weightUnit})`}>
            <NumInput
              value={weight}
              onChange={setWeight}
              suffix={weightUnit}
              step={unitSystem === "metric" ? 0.5 : 1}
              min={0}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm">
          <Field label={`Height (${heightUnit})`}>
            <NumInput
              value={height}
              onChange={setHeight}
              suffix={heightUnit}
              step={unitSystem === "metric" ? 1 : 0.5}
              min={0}
            />
          </Field>
        </div>
      </div>

      {/* ── Result Cards ───────────────────────────── */}

      <div className="mt-6 grid gap-4 md:grid-cols-3">

        {/* BMI */}

        <div
          className={`
            rounded-xl
            border
            p-4
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
            ${category.bgColor}
            ${category.borderColor}
          `}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            BMI
          </p>

          <p
            className={`
              mt-2
              text-3xl
              font-bold
              ${category.textColor}
            `}
          >
            {formatNum(bmi, 1)}
          </p>

          <p
            className={`
              mt-1
              text-sm
              font-semibold
              ${category.textColor}
            `}
          >
            {category.label}
          </p>
        </div>

        {/* Healthy Weight */}

        <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Healthy Weight Range
          </p>

          <p className="mt-2 text-xl font-bold text-slate-800">
            {formatNum(toDisplayWeight(healthyMinKg))}
            {" – "}
            {formatNum(toDisplayWeight(healthyMaxKg))}
            {" "}
            {weightUnit}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            BMI 18.5 – 24.9
          </p>
        </div>

        {/* Category */}

        <div
          className={`
            rounded-xl
            border
            p-4
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:shadow-md
            ${category.bgColor}
            ${category.borderColor}
          `}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Category
          </p>

          <p
            className={`
              mt-2
              text-xl
              font-bold
              ${category.textColor}
            `}
          >
            {category.label}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {category.max === Infinity
              ? `BMI ≥ ${category.min}`
              : `BMI ${category.min} – ${category.max}`}
          </p>
        </div>
      </div>

      {/* ── BMI Scale ──────────────────────────────── */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Bar
          label="BMI Scale (10–40)"
          value={formatNum(bmi, 1)}
          pct={scalePct}
          color={category.color}
        />

        <div className="mt-2 flex justify-between font-mono text-[10px] font-medium text-slate-500">
          <span>10</span>
          <span className="text-sky-600">
            18.5
          </span>
          <span className="text-emerald-600">
            25
          </span>
          <span className="text-amber-600">
            30
          </span>
          <span className="text-red-600">
            40
          </span>
        </div>

        {/* Category legend */}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">

          <div className="flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-xs font-medium text-sky-700">
              Underweight
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium text-emerald-700">
              Normal
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-medium text-amber-700">
              Overweight
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-700">
              Obese
            </span>
          </div>

        </div>
      </div>

      {/* ── Disclaimer ─────────────────────────────── */}

      <p className="mt-5 rounded-lg bg-slate-50 px-4 py-3 text-[11.5px] leading-relaxed text-slate-500">
        BMI is a general screening tool and does not account for muscle mass,
        bone density, age, or sex. It is not a diagnosis — consult a healthcare
        professional for a full assessment.
      </p>
    </div>
  );
}