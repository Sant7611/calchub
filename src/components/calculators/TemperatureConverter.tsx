"use client";

import { useMemo, useState } from "react";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

type TemperatureUnit = "celsius" | "fahrenheit" | "kelvin";

interface TemperatureInfo {
  label: string;
  short: string;
  symbol: string;
  description: string;
}

/* ──────────────────────────────────────────────────────────
   Unit information
────────────────────────────────────────────────────────── */

const TEMPERATURE_INFO: Record<TemperatureUnit, TemperatureInfo> = {
  celsius: {
    label: "Celsius",
    short: "°C",
    symbol: "°C",
    description: "Common metric temperature scale",
  },

  fahrenheit: {
    label: "Fahrenheit",
    short: "°F",
    symbol: "°F",
    description: "Commonly used in the United States",
  },

  kelvin: {
    label: "Kelvin",
    short: "K",
    symbol: "K",
    description: "Absolute thermodynamic temperature scale",
  },
};

const TEMPERATURE_UNITS = Object.keys(
  TEMPERATURE_INFO
) as TemperatureUnit[];

/* ──────────────────────────────────────────────────────────
   Conversion helpers
────────────────────────────────────────────────────────── */

function toCelsius(
  value: number,
  unit: TemperatureUnit
): number {
  switch (unit) {
    case "celsius":
      return value;

    case "fahrenheit":
      return (value - 32) * (5 / 9);

    case "kelvin":
      return value - 273.15;

    default:
      return value;
  }
}

function fromCelsius(
  celsius: number,
  unit: TemperatureUnit
): number {
  switch (unit) {
    case "celsius":
      return celsius;

    case "fahrenheit":
      return celsius * (9 / 5) + 32;

    case "kelvin":
      return celsius + 273.15;

    default:
      return celsius;
  }
}

function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  const celsius = toCelsius(value, from);

  return fromCelsius(celsius, to);
}

/* ──────────────────────────────────────────────────────────
   Formatting
────────────────────────────────────────────────────────── */

function formatTemperature(
  value: number,
  digits = 2
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  }).format(value);
}

/* ──────────────────────────────────────────────────────────
   Temperature status
────────────────────────────────────────────────────────── */

function getTemperatureStatus(celsius: number) {
  if (celsius < 0) {
    return {
      label: "Freezing",
      description: "Below the freezing point of water",
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-700",
      dot: "bg-sky-500",
    };
  }

  if (celsius < 10) {
    return {
      label: "Cold",
      description: "Cool or cold conditions",
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      dot: "bg-blue-500",
    };
  }

  if (celsius < 20) {
    return {
      label: "Cool",
      description: "Mild and cool temperature",
      bg: "bg-cyan-50",
      border: "border-cyan-200",
      text: "text-cyan-700",
      dot: "bg-cyan-500",
    };
  }

  if (celsius < 30) {
    return {
      label: "Comfortable",
      description: "Moderate temperature range",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (celsius < 40) {
    return {
      label: "Hot",
      description: "High temperature",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "Very Hot",
    description: "Extremely high temperature",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  };
}

/* ──────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────── */

export function TemperatureConverter() {
  const [temperature, setTemperature] =
    useState(25);

  const [fromUnit, setFromUnit] =
    useState<TemperatureUnit>("celsius");

  const [toUnit, setToUnit] =
    useState<TemperatureUnit>("fahrenheit");

  /* ── Derived values ─────────────────────────────────── */

  const result = useMemo(() => {
    return convertTemperature(
      temperature,
      fromUnit,
      toUnit
    );
  }, [temperature, fromUnit, toUnit]);

  const celsiusValue = useMemo(() => {
    return toCelsius(
      temperature,
      fromUnit
    );
  }, [temperature, fromUnit]);

  const fahrenheitValue =
    fromCelsius(
      celsiusValue,
      "fahrenheit"
    );

  const kelvinValue =
    fromCelsius(
      celsiusValue,
      "kelvin"
    );

  const status =
    getTemperatureStatus(celsiusValue);

  const fromInfo =
    TEMPERATURE_INFO[fromUnit];

  const toInfo =
    TEMPERATURE_INFO[toUnit];

  /* ── Absolute zero validation ────────────────────────── */

  const minimumTemperature =
    fromUnit === "celsius"
      ? -273.15
      : fromUnit === "fahrenheit"
        ? -459.67
        : 0;

  const isBelowAbsoluteZero =
    temperature < minimumTemperature;

  /* ── Swap units ─────────────────────────────────────── */

  function swapUnits() {
    const oldFrom = fromUnit;
    const oldTo = toUnit;

    /*
     * Keep the physical temperature the same
     * after swapping.
     *
     * Example:
     *
     * 0°C → 32°F
     *
     * After swap:
     *
     * 32°F → 0°C
     */

    if (!isBelowAbsoluteZero) {
      setTemperature(result);
    }

    setFromUnit(oldTo);
    setToUnit(oldFrom);
  }

  /* ───────────────────────────────────────────────────── */

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ────────────────────────────────────────────────
          Header
      ──────────────────────────────────────────────── */}

      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div>
            <p className="text-xs font-medium text-slate-500">
              Temperature conversion
            </p>

            <div className="mt-1 flex items-center gap-2">

              <span
                className={`
                  h-2.5
                  w-2.5
                  rounded-full
                  ${status.dot}
                `}
              />

              <span
                className={`
                  text-sm
                  font-semibold
                  ${status.text}
                `}
              >
                {status.label}
              </span>

            </div>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
            °C · °F · K
          </div>

        </div>

      </div>

      {/* ────────────────────────────────────────────────
          Main calculator
      ──────────────────────────────────────────────── */}

      <div className="p-5 sm:p-6">

        {/* ── Input ───────────────────────────────────── */}

        <div className="mb-6">

          <label
            htmlFor="temperature-value"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            Temperature
          </label>

          <div
            className={`
              flex
              overflow-hidden
              rounded-xl
              border
              bg-white
              shadow-sm
              transition-all
              duration-200

              ${
                isBelowAbsoluteZero
                  ? "border-red-400 ring-4 ring-red-500/10"
                  : "border-slate-300 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10"
              }
            `}
          >

            {/* Unit symbol */}

            <div className="flex min-w-[70px] items-center justify-center border-r border-slate-200 bg-slate-50 px-3 text-lg font-bold text-slate-700">
              {fromInfo.symbol}
            </div>

            {/* Input */}

            <input
              id="temperature-value"
              type="number"
              value={
                Number.isFinite(temperature)
                  ? temperature
                  : 0
              }
              step={0.1}
              onChange={(event) => {
                const value = Number(
                  event.target.value
                );

                setTemperature(
                  Number.isFinite(value)
                    ? value
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

            {/* Unit name */}

            <div className="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-500">
              {fromInfo.label}
            </div>

          </div>

          {/* Validation */}

          {isBelowAbsoluteZero && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              <span>⚠</span>

              <span>
                Temperature cannot be below
                absolute zero (
                {formatTemperature(
                  minimumTemperature
                )}{" "}
                {fromInfo.symbol}).
              </span>
            </div>
          )}

        </div>

        {/* ─────────────────────────────────────────────
            Unit selectors
        ───────────────────────────────────────────── */}

        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr]">

          <TemperatureSelect
            label="From"
            value={fromUnit}
            onChange={setFromUnit}
          />

          {/* Swap */}

          <div className="flex justify-center md:pb-6">

            <button
              type="button"
              onClick={swapUnits}
              disabled={isBelowAbsoluteZero}
              aria-label="Swap temperature units"
              title="Swap units"
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
                disabled:cursor-not-allowed
                disabled:opacity-40
                disabled:hover:rotate-0
                disabled:hover:bg-blue-50
                disabled:hover:text-blue-600
              "
            >
              ⇄
            </button>

          </div>

          <TemperatureSelect
            label="To"
            value={toUnit}
            onChange={setToUnit}
          />

        </div>

        {/* ─────────────────────────────────────────────
            Main result
        ───────────────────────────────────────────── */}

        {!isBelowAbsoluteZero && (
          <div
            className={`
              mt-7
              overflow-hidden
              rounded-2xl
              border
              shadow-sm
              ${status.bg}
              ${status.border}
            `}
          >

            <div className="px-5 py-6 sm:px-6">

              <p
                className={`
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  ${status.text}
                `}
              >
                Converted Temperature
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">

                <p className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {formatTemperature(
                    result
                  )}
                  {toInfo.symbol}
                </p>

                <span
                  className={`
                    rounded-full
                    border
                    px-3
                    py-1
                    text-xs
                    font-bold
                    ${status.border}
                    ${status.bg}
                    ${status.text}
                  `}
                >
                  {toInfo.label}
                </span>

              </div>

              <p className="mt-3 text-sm text-slate-500">
                {formatTemperature(
                  temperature
                )}
                {fromInfo.symbol} equals{" "}

                <strong className="text-slate-700">
                  {formatTemperature(result)}
                  {toInfo.symbol}
                </strong>
              </p>

            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────
            All temperature units
        ───────────────────────────────────────────── */}

        {!isBelowAbsoluteZero && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">

            <TemperatureCard
              label="Celsius"
              value={`${formatTemperature(
                celsiusValue
              )}°C`}
              description="Metric scale"
              color="blue"
              selected={
                fromUnit === "celsius" ||
                toUnit === "celsius"
              }
            />

            <TemperatureCard
              label="Fahrenheit"
              value={`${formatTemperature(
                fahrenheitValue
              )}°F`}
              description="Imperial scale"
              color="amber"
              selected={
                fromUnit === "fahrenheit" ||
                toUnit === "fahrenheit"
              }
            />

            <TemperatureCard
              label="Kelvin"
              value={`${formatTemperature(
                kelvinValue
              )} K`}
              description="Absolute scale"
              color="violet"
              selected={
                fromUnit === "kelvin" ||
                toUnit === "kelvin"
              }
            />

          </div>
        )}

        {/* ─────────────────────────────────────────────
            Status
        ───────────────────────────────────────────── */}

        {!isBelowAbsoluteZero && (
          <div
            className={`
              mt-5
              rounded-xl
              border
              p-4
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              ${status.bg}
              ${status.border}
            `}
          >

            <div className="flex items-start gap-3">

              <span
                className={`
                  mt-1
                  h-3
                  w-3
                  shrink-0
                  rounded-full
                  ${status.dot}
                `}
              />

              <div>
                <p
                  className={`
                    text-sm
                    font-bold
                    ${status.text}
                  `}
                >
                  {status.label}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {status.description}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ─────────────────────────────────────────────
            Reference points
        ───────────────────────────────────────────── */}

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

            <span>
              Common temperature reference points
            </span>

            <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180">
              ▼
            </span>

          </summary>

          <div className="border-t border-slate-200 bg-white">

            <ReferenceRow
              label="Absolute zero"
              celsius="-273.15°C"
              fahrenheit="-459.67°F"
              kelvin="0 K"
            />

            <ReferenceRow
              label="Water freezes"
              celsius="0°C"
              fahrenheit="32°F"
              kelvin="273.15 K"
            />

            <ReferenceRow
              label="Room temperature"
              celsius="20°C"
              fahrenheit="68°F"
              kelvin="293.15 K"
            />

            <ReferenceRow
              label="Human body"
              celsius="37°C"
              fahrenheit="98.6°F"
              kelvin="310.15 K"
            />

            <ReferenceRow
              label="Water boils"
              celsius="100°C"
              fahrenheit="212°F"
              kelvin="373.15 K"
              last
            />

          </div>

        </details>

        {/* ─────────────────────────────────────────────
            Formula information
        ───────────────────────────────────────────── */}

        <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4">

          <p className="text-xs font-bold text-indigo-900">
            Conversion method
          </p>

          <p className="mt-1 text-[11px] leading-relaxed text-indigo-700">
            Temperature is first converted to
            Celsius as a common intermediate value,
            then converted from Celsius into the
            selected destination unit. This keeps the
            conversion logic consistent and
            reversible.
          </p>

        </div>

      </div>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Unit Selector
────────────────────────────────────────────────────────── */

function TemperatureSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: TemperatureUnit;
  onChange: (
    value: TemperatureUnit
  ) => void;
}) {
  const info =
    TEMPERATURE_INFO[value];

  return (
    <label className="block">

      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <div className="group relative">

        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target
                .value as TemperatureUnit
            )
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

          {TEMPERATURE_UNITS.map(
            (unit) => {
              const unitInfo =
                TEMPERATURE_INFO[unit];

              return (
                <option
                  key={unit}
                  value={unit}
                >
                  {unitInfo.symbol}{" "}
                  {unitInfo.label}
                </option>
              );
            }
          )}

        </select>

        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors group-hover:text-blue-600">
          ▼
        </div>

      </div>

      <p className="mt-1.5 text-[11px] text-slate-400">
        {info.description}
      </p>

    </label>
  );
}

/* ──────────────────────────────────────────────────────────
   Temperature Card
────────────────────────────────────────────────────────── */

function TemperatureCard({
  label,
  value,
  description,
  color,
  selected,
}: {
  label: string;
  value: string;
  description: string;
  color:
    | "blue"
    | "amber"
    | "violet";
  selected?: boolean;
}) {
  const styles = {
    blue: {
      base: "border-blue-200 bg-blue-50",
      hover:
        "hover:border-blue-400 hover:bg-blue-100",
      value: "text-blue-700",
    },

    amber: {
      base: "border-amber-200 bg-amber-50",
      hover:
        "hover:border-amber-400 hover:bg-amber-100",
      value: "text-amber-700",
    },

    violet: {
      base: "border-violet-200 bg-violet-50",
      hover:
        "hover:border-violet-400 hover:bg-violet-100",
      value: "text-violet-700",
    },
  };

  const style = styles[color];

  return (
    <div
      className={`
        relative
        rounded-xl
        border
        p-4
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${style.base}
        ${style.hover}

        ${
          selected
            ? "ring-2 ring-blue-500/20"
            : ""
        }
      `}
    >

      {selected && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500" />
      )}

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-xl
          font-bold
          ${style.value}
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Reference Row
────────────────────────────────────────────────────────── */

function ReferenceRow({
  label,
  celsius,
  fahrenheit,
  kelvin,
  last = false,
}: {
  label: string;
  celsius: string;
  fahrenheit: string;
  kelvin: string;
  last?: boolean;
}) {
  return (
    <div
      className={`
        grid
        gap-2
        px-4
        py-3
        text-xs
        transition-colors
        hover:bg-slate-50
        sm:grid-cols-[1.5fr_1fr_1fr_1fr]

        ${
          last
            ? ""
            : "border-b border-slate-100"
        }
      `}
    >

      <span className="font-semibold text-slate-700">
        {label}
      </span>

      <span className="font-mono text-blue-600">
        {celsius}
      </span>

      <span className="font-mono text-amber-600">
        {fahrenheit}
      </span>

      <span className="font-mono text-violet-600">
        {kelvin}
      </span>

    </div>
  );
}