import { describe, expect, it } from "vitest";

import {
  hillToSquareFeet,
  normalizeNepaliDigits,
  parseLandNumber,
  rectangleAreaToSquareFeet,
  SQFT_PER_UNIT,
  squareFeetToHill,
  squareFeetToStandard,
  squareFeetToTerai,
  teraiToSquareFeet,
  toDevanagariDigits,
} from "../../src/lib/land-area";

describe("Nepal land area conversions", () => {
  it("keeps the Ropani hierarchy exact", () => {
    expect(SQFT_PER_UNIT.ropani).toBe(5476);
    expect(SQFT_PER_UNIT.aana * 16).toBe(5476);
    expect(SQFT_PER_UNIT.paisa * 64).toBe(5476);
    expect(SQFT_PER_UNIT.daam * 256).toBe(5476);
  });

  it("keeps the Bigha hierarchy exact", () => {
    expect(SQFT_PER_UNIT.bigha).toBe(72900);
    expect(SQFT_PER_UNIT.kattha * 20).toBe(72900);
    expect(SQFT_PER_UNIT.dhur * 400).toBe(72900);
  });

  it("converts compound Ropani input to square feet", () => {
    const squareFeet = hillToSquareFeet({
      ropani: 2,
      aana: 5,
      paisa: 2,
      daam: 1,
    });

    expect(squareFeet).toBeCloseTo(12855.765625, 8);
  });

  it("round-trips Ropani-Aana-Paisa-Daam", () => {
    const input = { ropani: 3, aana: 11, paisa: 2, daam: 1.5 };
    const squareFeet = hillToSquareFeet(input);
    const output = squareFeetToHill(squareFeet);

    expect(output.ropani).toBe(3);
    expect(output.aana).toBe(11);
    expect(output.paisa).toBe(2);
    expect(output.daam).toBeCloseTo(1.5, 10);
  });

  it("round-trips Bigha-Kattha-Dhur", () => {
    const input = { bigha: 1, kattha: 7, dhur: 4.5 };
    const squareFeet = teraiToSquareFeet(input);
    const output = squareFeetToTerai(squareFeet);

    expect(output.bigha).toBe(1);
    expect(output.kattha).toBe(7);
    expect(output.dhur).toBeCloseTo(4.5, 10);
  });

  it("normalizes overflowed compound values", () => {
    const squareFeet = hillToSquareFeet({
      ropani: 1,
      aana: 20,
      paisa: 0,
      daam: 0,
    });

    expect(squareFeetToHill(squareFeet)).toEqual({
      ropani: 2,
      aana: 4,
      paisa: 0,
      daam: 0,
    });
  });

  it("converts square feet to metric without intermediate display rounding", () => {
    const standard = squareFeetToStandard(5476);

    expect(standard.sqft).toBe(5476);
    expect(standard.sqm).toBeCloseTo(508.73704704, 8);
    expect(standard.acre).toBeCloseTo(5476 / 43560, 12);
  });

  it("supports Devanagari numeric input and output", () => {
    expect(normalizeNepaliDigits("१२३.५")).toBe("123.5");
    expect(parseLandNumber("१,२३४.५")).toBe(1234.5);
    expect(toDevanagariDigits("1,234.5")).toBe("१,२३४.५");
  });

  it("calculates rectangular plot area in feet and meters", () => {
    expect(rectangleAreaToSquareFeet(60, 30, "ft")).toBe(1800);
    expect(rectangleAreaToSquareFeet(10, 10, "m")).toBeCloseTo(
      1076.3910416709722,
      10,
    );
  });
});
