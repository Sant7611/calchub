export type StandardAreaUnit = "sqft" | "sqm" | "acre" | "hectare";
export type PlotLengthUnit = "ft" | "m";

export interface HillAreaInput {
  ropani: number;
  aana: number;
  paisa: number;
  daam: number;
}

export interface TeraiAreaInput {
  bigha: number;
  kattha: number;
  dhur: number;
}

export interface StandardAreaValues {
  sqft: number;
  sqm: number;
  acre: number;
  hectare: number;
}

export const SQM_PER_SQFT = 0.09290304;

/**
 * Nepal customary land relationships expressed in square feet.
 *
 * Hill system:
 * 1 Ropani = 16 Aana = 64 Paisa = 256 Daam = 5,476 sq ft
 *
 * Terai system:
 * 1 Bigha = 20 Kattha = 400 Dhur = 72,900 sq ft
 *
 * The customary subdivisions below are derived from those base identities so
 * the calculator never chains through rounded display values.
 */
export const SQFT_PER_UNIT = {
  ropani: 5476,
  aana: 5476 / 16,
  paisa: 5476 / 64,
  daam: 5476 / 256,
  bigha: 72900,
  kattha: 72900 / 20,
  dhur: 72900 / 400,
  sqft: 1,
  sqm: 1 / SQM_PER_SQFT,
  acre: 43560,
  hectare: 10000 / SQM_PER_SQFT,
} as const;

const NEPALI_TO_LATIN: Record<string, string> = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};

const LATIN_TO_NEPALI: Record<string, string> = {
  "0": "०",
  "1": "१",
  "2": "२",
  "3": "३",
  "4": "४",
  "5": "५",
  "6": "६",
  "7": "७",
  "8": "८",
  "9": "९",
};

const EPSILON = 1e-10;

function safeNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function normalizeNepaliDigits(value: string): string {
  return value.replace(/[०-९]/g, (digit) => NEPALI_TO_LATIN[digit] ?? digit);
}

export function toDevanagariDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => LATIN_TO_NEPALI[digit] ?? digit);
}

/**
 * Parses either Latin or Devanagari numerals. Thousands separators and spaces
 * are ignored. Invalid or negative values become zero because land area inputs
 * cannot be negative.
 */
export function parseLandNumber(value: string): number {
  const normalized = normalizeNepaliDigits(value)
    .replace(/,/g, "")
    .replace(/\s+/g, "")
    .trim();

  if (!normalized) return 0;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function hillToSquareFeet(input: HillAreaInput): number {
  return (
    safeNonNegative(input.ropani) * SQFT_PER_UNIT.ropani +
    safeNonNegative(input.aana) * SQFT_PER_UNIT.aana +
    safeNonNegative(input.paisa) * SQFT_PER_UNIT.paisa +
    safeNonNegative(input.daam) * SQFT_PER_UNIT.daam
  );
}

export function teraiToSquareFeet(input: TeraiAreaInput): number {
  return (
    safeNonNegative(input.bigha) * SQFT_PER_UNIT.bigha +
    safeNonNegative(input.kattha) * SQFT_PER_UNIT.kattha +
    safeNonNegative(input.dhur) * SQFT_PER_UNIT.dhur
  );
}

export function standardToSquareFeet(
  value: number,
  unit: StandardAreaUnit,
): number {
  return safeNonNegative(value) * SQFT_PER_UNIT[unit];
}

export function squareFeetToStandard(squareFeet: number): StandardAreaValues {
  const sqft = safeNonNegative(squareFeet);
  const sqm = sqft * SQM_PER_SQFT;

  return {
    sqft,
    sqm,
    acre: sqft / SQFT_PER_UNIT.acre,
    hectare: sqm / 10000,
  };
}

/** Normalizes any area into Ropani-Aana-Paisa-Daam. */
export function squareFeetToHill(squareFeet: number): HillAreaInput {
  const totalDaam = safeNonNegative(squareFeet) / SQFT_PER_UNIT.daam;

  const ropani = Math.floor(totalDaam / 256 + EPSILON);
  let remainingDaam = totalDaam - ropani * 256;

  const aana = Math.floor(remainingDaam / 16 + EPSILON);
  remainingDaam -= aana * 16;

  const paisa = Math.floor(remainingDaam / 4 + EPSILON);
  let daam = remainingDaam - paisa * 4;

  if (Math.abs(daam) < EPSILON) daam = 0;

  return { ropani, aana, paisa, daam };
}

/** Normalizes any area into Bigha-Kattha-Dhur. */
export function squareFeetToTerai(squareFeet: number): TeraiAreaInput {
  const totalDhur = safeNonNegative(squareFeet) / SQFT_PER_UNIT.dhur;

  const bigha = Math.floor(totalDhur / 400 + EPSILON);
  let remainingDhur = totalDhur - bigha * 400;

  const kattha = Math.floor(remainingDhur / 20 + EPSILON);
  let dhur = remainingDhur - kattha * 20;

  if (Math.abs(dhur) < EPSILON) dhur = 0;

  return { bigha, kattha, dhur };
}

/** Rectangle-only plot estimate. Legal/cadastral area must come from survey records. */
export function rectangleAreaToSquareFeet(
  length: number,
  width: number,
  unit: PlotLengthUnit,
): number {
  const area = safeNonNegative(length) * safeNonNegative(width);
  return unit === "m" ? area * SQFT_PER_UNIT.sqm : area;
}
