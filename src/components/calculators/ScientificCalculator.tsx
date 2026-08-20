"use client";

import {
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { all, create, type Complex } from "mathjs";

const math = create(all, {});

type AngleMode = "DEG" | "RAD";
type DisplayMode = "NORM" | "FIX" | "SCI" | "ENG";
type CalculatorMode =
  | "COMP"
  | "CMPLX"
  | "STAT"
  | "BASE-N"
  | "MATRIX"
  | "VECTOR";
type AdvancedTool = "integral" | "derivative" | "sum" | "solve" | null;
type MemoryKey = "A" | "B" | "C" | "D" | "E" | "F" | "M" | "X" | "Y";
type MemoryAction = "store" | "recall" | null;
type KeyTone = "number" | "operator" | "function" | "danger" | "equal";
type AngleValue = number | Complex;

type CalculatorScope = Record<string, unknown>;

interface HistoryItem {
  expression: string;
  result: string;
} 

const CALCULATOR_KEYS: CalculatorKey[] = [
  {
    label: "CALC",
    alphaLabel: "A",
    alphaValue: "A",
    action: "toggleVariables",
    tone: "function",
  },

  {
    label: "∫dx",
    alphaLabel: "B",
    alphaValue: "B",
    action: "integral",
    tone: "function",
  },

  {
    label: "d/dx",
    alphaLabel: "C",
    alphaValue: "C",
    action: "derivative",
    tone: "function",
  },

  {
    label: "Σ",
    alphaLabel: "D",
    alphaValue: "D",
    action: "sum",
    tone: "function",
  },

  {
    label: "SOLVE",
    alphaLabel: "E",
    alphaValue: "E",
    action: "solve",
    tone: "function",
  },

  {
    label: "S⇔D",
    action: "toggleFraction",
    tone: "function",
  },

  {
    label: "x⁻¹",
    value: "^(-1)",
    shiftLabel: "x!",
    shiftValue: "factorial(",
    tone: "function",
  },

  {
    label: "x²",
    value: "^2",
    shiftLabel: "x³",
    shiftValue: "^3",
    alphaLabel: "F",
    alphaValue: "F",
    tone: "function",
  },

  {
    label: "xʸ",
    value: "^(",
    shiftLabel: "ʸ√x",
    shiftValue: "nthRoot(",
    tone: "function",
  },

  {
    label: "√",
    value: "sqrt(",
    shiftLabel: "∛",
    shiftValue: "cbrt(",
    tone: "function",
  },

  {
    label: "log",
    value: "log10(",
    shiftLabel: "10ˣ",
    shiftValue: "10^(",
    tone: "function",
  },

  {
    label: "ln",
    value: "log(",
    shiftLabel: "eˣ",
    shiftValue: "exp(",
    tone: "function",
  },

  {
    label: "sin",
    value: "sin(",
    shiftLabel: "sin⁻¹",
    shiftValue: "asin(",
    alphaLabel: "X",
    alphaValue: "X",
    tone: "function",
  },

  {
    label: "cos",
    value: "cos(",
    shiftLabel: "cos⁻¹",
    shiftValue: "acos(",
    alphaLabel: "Y",
    alphaValue: "Y",
    tone: "function",
  },

  {
    label: "tan",
    value: "tan(",
    shiftLabel: "tan⁻¹",
    shiftValue: "atan(",
    alphaLabel: "M",
    alphaValue: "M",
    tone: "function",
  },

  {
    label: "(",
    value: "(",
    tone: "function",
  },

  {
    label: ")",
    value: ")",
    tone: "function",
  },

  {
    label: "%",
    value: "/100",
    tone: "function",
  },

  {
    label: "7",
    value: "7",
    tone: "number",
  },

  {
    label: "8",
    value: "8",
    tone: "number",
  },

  {
    label: "9",
    value: "9",
    tone: "number",
  },

  {
    label: "DEL",
    action: "delete",
    tone: "danger",
  },

  {
    label: "AC",
    action: "clear",
    tone: "danger",
  },

  {
    label: "÷",
    value: "/",
    tone: "operator",
  },

  {
    label: "4",
    value: "4",
    tone: "number",
  },

  {
    label: "5",
    value: "5",
    tone: "number",
  },

  {
    label: "6",
    value: "6",
    tone: "number",
  },

  {
    label: "×",
    value: "*",
    tone: "operator",
  },

  {
  label: "nCr",
  value: "nCr(",
  shiftLabel: "nPr",
  shiftValue: "nPr(",
  tone: "function",
},

  {
  label: "π",
  value: "pi",
  shiftLabel: "e",
  shiftValue: "e",
  tone: "function",
},

  {
    label: "1",
    value: "1",
    tone: "number",
  },

  {
    label: "2",
    value: "2",
    tone: "number",
  },

  {
    label: "3",
    value: "3",
    tone: "number",
  },

  {
    label: "+",
    value: "+",
    tone: "operator",
  },

  {
    label: "−",
    value: "-",
    tone: "operator",
  },

  {
    label: "Ans",
    value: "Ans",
    tone: "function",
  },

  {
    label: "0",
    value: "0",
    tone: "number",
  },

  {
    label: ".",
    value: ".",
    tone: "number",
  },

  {
    label: "×10ˣ",
    value: "*10^(",
    tone: "function",
  },

  {
    label: ",",
    value: ",",
    tone: "function",
  },

  {
    label: "i",
    value: "i",
    tone: "function",
  },

  {
    label: "=",
    action: "calculate",
    tone: "equal",
  },
];

type CalculatorAction =
  | "toggleVariables"
  | "integral"
  | "derivative"
  | "sum"
  | "solve"
  | "toggleFraction"
  | "delete"
  | "clear"
  | "calculate";

interface CalculatorKey {
  label: string;

  value?: string;

  shiftLabel?: string;
  shiftValue?: string;

  alphaLabel?: string;
  alphaValue?: string;

  action?: CalculatorAction;

  tone?:
    | "number"
    | "operator"
    | "function"
    | "danger"
    | "equal";
}

const SCIENTIFIC_CONSTANTS = {
  c0: 299_792_458,
  G: 6.6743e-11,
  h: 6.62607015e-34,
  hbar: 1.054571817e-34,
  kB: 1.380649e-23,
  NA: 6.02214076e23,
  Rgas: 8.314462618,
  qe: 1.602176634e-19,
  me: 9.1093837139e-31,
  mp: 1.67262192595e-27,
  g0: 9.80665,
} as const;

const MEMORY_KEYS: MemoryKey[] = ["A", "B", "C", "D", "E", "F", "M", "X", "Y"];

function combinations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new Error("nCr requires integers with 0 ≤ r ≤ n.");
  }

  const k = Math.min(r, n - r);
  let result = 1;

  for (let i = 1; i <= k; i += 1) {
    result = (result * (n - k + i)) / i;
  }

  return result;
}

function permutations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new Error("nPr requires integers with 0 ≤ r ≤ n.");
  }

  let result = 1;
  for (let i = 0; i < r; i += 1) result *= n - i;
  return result;
}

function randomInteger(min: number, max: number): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

function primeFactors(value: number): string {
  let n = Math.floor(Math.abs(value));
  if (n < 2) return String(n);

  const factors: number[] = [];
  let divisor = 2;

  while (divisor * divisor <= n) {
    while (n % divisor === 0) {
      factors.push(divisor);
      n /= divisor;
    }
    divisor += 1;
  }

  if (n > 1) factors.push(n);
  return factors.join(" × ");
}

function approximateFraction(
  value: number,
  maxDenominator = 1_000_000,
): string {
  if (!Number.isFinite(value)) return String(value);
  if (Number.isInteger(value)) return String(value);

  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);
  let h1 = 1;
  let h2 = 0;
  let k1 = 0;
  let k2 = 1;
  let b = x;

  while (true) {
    const a = Math.floor(b);
    const h = a * h1 + h2;
    const k = a * k1 + k2;

    if (k > maxDenominator) break;

    h2 = h1;
    h1 = h;
    k2 = k1;
    k1 = k;

    const fraction = b - a;
    if (fraction < 1e-12) break;
    b = 1 / fraction;
  }

  return `${sign * h1}/${k1}`;
}

function engineeringNotation(value: number, precision: number): string {
  if (!Number.isFinite(value) || value === 0) return String(value);

  const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
  const mantissa = value / 10 ** exponent;
  return `${mantissa.toFixed(precision)} × 10^${exponent}`;
}

function normalizeExpression(expression: string, angleMode: AngleMode): string {
  let normalized = expression
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll("−", "-")
    .replaceAll("π", "pi")
    .replaceAll("√", "sqrt");

  if (angleMode === "DEG") {
    normalized = normalized
      .replace(/\basin\s*\(/g, "asind(")
      .replace(/\bacos\s*\(/g, "acosd(")
      .replace(/\batan\s*\(/g, "atand(")
      .replace(/\bsin\s*\(/g, "sind(")
      .replace(/\bcos\s*\(/g, "cosd(")
      .replace(/\btan\s*\(/g, "tand(");
  }

  return normalized;
}

function equationToExpression(expression: string): string {
  if (!expression.includes("=")) return expression;
  const firstEquals = expression.indexOf("=");
  const left = expression.slice(0, firstEquals);
  const right = expression.slice(firstEquals + 1);
  return `((${left}) - (${right}))`;
}

function isComplexLike(value: unknown): value is { re: number; im: number } {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.re === "number" && typeof record.im === "number";
}

function toRealNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (
    isComplexLike(value) &&
    Math.abs(value.im) < 1e-12 &&
    Number.isFinite(value.re)
  )
    return value.re;
  throw new Error("This operation requires a real numeric result.");
}

function formatFallback(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null) return "null";
  if (value === undefined) return "";

  if (typeof value === "object" && "toString" in value) {
    const stringifier = (value as { toString: () => string }).toString;
    return stringifier.call(value);
  }

  return String(value);
}

export function ScientificCalculator() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [expression, setExpression] = useState("");
  const [rawResult, setRawResult] = useState<unknown>(0);
  const [ans, setAns] = useState<unknown>(0);
  const [error, setError] = useState("");

  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [calculatorMode, setCalculatorMode] = useState<CalculatorMode>("COMP");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("NORM");
  const [precision, setPrecision] = useState(8);
  const [fractionView, setFractionView] = useState(false);

  const [shift, setShift] = useState(false);
  const [alpha, setAlpha] = useState(false);

  const [showModes, setShowModes] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showVariables, setShowVariables] = useState(false);

  const [advancedTool, setAdvancedTool] = useState<AdvancedTool>(null);
  const [toolExpression, setToolExpression] = useState("x^2");
  const [toolA, setToolA] = useState(0);
  const [toolB, setToolB] = useState(1);
  const [toolPoint, setToolPoint] = useState(1);
  const [toolGuess, setToolGuess] = useState(1);
  const [toolResult, setToolResult] = useState("");

  const [memoryAction, setMemoryAction] = useState<MemoryAction>(null);
  const [memory, setMemory] = useState<Record<MemoryKey, number>>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    M: 0,
    X: 0,
    Y: 0,
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);

  type AngleValue = number | Complex;

  function degreesToRadians(value: AngleValue): AngleValue {
    if (typeof value === "number") {
      return (value * Math.PI) / 180;
    }

    return math.multiply(value, Math.PI / 180) as Complex;
  }

  function radiansToDegrees(value: AngleValue): AngleValue {
    if (typeof value === "number") {
      return (value * 180) / Math.PI;
    }

    return math.multiply(value, 180 / Math.PI) as Complex;
  }

  /* ─────────────────────────────────────────────
   DEGREE TRIG
───────────────────────────────────────────── */

  function sinDegrees(value: AngleValue): AngleValue {
    const radians = degreesToRadians(value);

    if (typeof radians === "number") {
      return Math.sin(radians);
    }

    return math.sin(radians) as Complex;
  }

  function cosDegrees(value: AngleValue): AngleValue {
    const radians = degreesToRadians(value);

    if (typeof radians === "number") {
      return Math.cos(radians);
    }

    return math.cos(radians) as Complex;
  }

  function tanDegrees(value: AngleValue): AngleValue {
    const radians = degreesToRadians(value);

    if (typeof radians === "number") {
      return Math.tan(radians);
    }

    return math.tan(radians) as Complex;
  }

  /* ─────────────────────────────────────────────
   INVERSE DEGREE TRIG
───────────────────────────────────────────── */

  function asinDegrees(value: AngleValue): AngleValue {
    let radians: AngleValue;

    if (typeof value === "number") {
      radians = Math.asin(value);
    } else {
      radians = math.asin(value) as Complex;
    }

    return radiansToDegrees(radians);
  }

  function acosDegrees(value: AngleValue): AngleValue {
    let radians: AngleValue;

    if (typeof value === "number") {
      radians = Math.acos(value);
    } else {
      radians = math.acos(value) as Complex;
    }

    return radiansToDegrees(radians);
  }

  function atanDegrees(value: AngleValue): AngleValue {
    let radians: AngleValue;

    if (typeof value === "number") {
      radians = Math.atan(value);
    } else {
      radians = math.atan(value) as Complex;
    }

    return radiansToDegrees(radians);
  }

  function buildScope(extra: CalculatorScope = {}): CalculatorScope {
    return {
      ...memory,
      ...SCIENTIFIC_CONSTANTS,
      Ans: ans,

      sind: sinDegrees,

      cosd: cosDegrees,

      tand: tanDegrees,

      asind: asinDegrees,

      acosd: acosDegrees,

      atand: atanDegrees,
      nCr: combinations,
      nPr: permutations,
      randint: randomInteger,
      primeFactors,

      polar: (radius: number, theta: number) => {
        const angle = angleMode === "DEG" ? (theta * Math.PI) / 180 : theta;
        return math.complex(radius * Math.cos(angle), radius * Math.sin(angle));
      },
      rect: (real: number, imaginary: number) => math.complex(real, imaginary),

      deg2rad: (degrees: number) => (degrees * Math.PI) / 180,
      rad2deg: (radians: number) => (radians * 180) / Math.PI,
      km2mi: (value: number) => value * 0.6213711922,
      mi2km: (value: number) => value * 1.609344,
      kg2lb: (value: number) => value * 2.2046226218,
      lb2kg: (value: number) => value * 0.45359237,
      c2f: (value: number) => value * (9 / 5) + 32,
      f2c: (value: number) => (value - 32) * (5 / 9),

      ...extra,
    };
  }

  function evaluateRaw(value: string, extra: CalculatorScope = {}): unknown {
    return math.evaluate(
      normalizeExpression(value, angleMode),
      buildScope(extra),
    );
  }

  function evaluateReal(value: string, extra: CalculatorScope = {}): number {
    return toRealNumber(evaluateRaw(value, extra));
  }

  function formatResult(value: unknown): string {
    if (typeof value === "number") {
      if (!Number.isFinite(value)) return String(value);
      if (fractionView) return approximateFraction(value);

      if (displayMode === "FIX") return value.toFixed(precision);
      if (displayMode === "SCI") return value.toExponential(precision);
      if (displayMode === "ENG") return engineeringNotation(value, precision);

      return math.format(value, { precision: 14 });
    }

    if (isComplexLike(value)) {
      return math.format(value as Complex, { precision: 14 });
    }

    return formatFallback(value);
  }

  const resultText = useMemo(
    () => (error ? error : formatResult(rawResult)),
    [error, rawResult, displayMode, precision, fractionView],
  );

  function insertToken(token: string): void {
    const input = inputRef.current;

    if (!input) {
      setExpression((previous) => previous + token);
      return;
    }

    const start = input.selectionStart ?? expression.length;
    const end = input.selectionEnd ?? start;
    const next = expression.slice(0, start) + token + expression.slice(end);
    setExpression(next);

    requestAnimationFrame(() => {
      const position = start + token.length;
      input.focus();
      input.setSelectionRange(position, position);
    });
  }

  function deleteCharacter(): void {
    const input = inputRef.current;

    if (!input) {
      setExpression((previous) => previous.slice(0, -1));
      return;
    }

    const start = input.selectionStart ?? expression.length;
    const end = input.selectionEnd ?? start;

    if (start !== end) {
      setExpression(expression.slice(0, start) + expression.slice(end));
      requestAnimationFrame(() => input.setSelectionRange(start, start));
      return;
    }

    if (start === 0) return;

    setExpression(expression.slice(0, start - 1) + expression.slice(start));
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start - 1, start - 1);
    });
  }

  function clearAll(): void {
    setExpression("");
    setRawResult(0);
    setError("");
    setShift(false);
    setAlpha(false);
  }

  function calculate(): void {
    if (!expression.trim()) return;

    try {
      const result = evaluateRaw(expression);
      const formatted = formatResult(result);

      setRawResult(result);
      setAns(result);
      setError("");
      setHistory((previous) =>
        [{ expression, result: formatted }, ...previous].slice(0, 30),
      );
    } catch (calculationError: unknown) {
      setError(
        calculationError instanceof Error
          ? calculationError.message
          : "Math Error",
      );
    }
  }

 function handleMemory(key: MemoryKey): void {
  // ─────────────────────────────────────────────
  // RECALL
  // RCL → A/B/C/etc.
  // Inserts the variable into the expression.
  // ─────────────────────────────────────────────

  if (memoryAction === "recall") {
    insertToken(key);

    setMemoryAction(null);

    return;
  }

  // ─────────────────────────────────────────────
  // STORE
  // Example:
  // 5 → STO → A
  // ─────────────────────────────────────────────

  if (memoryAction === "store") {
    try {
      let valueToStore: number;

      /*
       * If the user currently has an expression,
       * calculate it and store its result.
       *
       * Example:
       * 5 STO A
       *
       * or:
       * 2 + 3 STO A
       */
      if (expression.trim()) {
        const evaluated =
          evaluateRaw(expression);

        valueToStore =
          toRealNumber(evaluated);

        // Keep calculator result updated.
        setRawResult(evaluated);

        setAns(evaluated);

        setError("");
      }

      /*
       * If the expression is empty,
       * store the previous result.
       */
      else {
        valueToStore =
          toRealNumber(rawResult);
      }

      /*
       * Save value into selected memory variable.
       */
      setMemory((previous) => ({
        ...previous,

        [key]: valueToStore,
      }));

      /*
       * Start a fresh expression after STO.
       *
       * This makes:
       *
       * 5 STO A
       * 6 STO B
       *
       * work without becoming "56".
       */
      setExpression("");

      /*
       * Exit STO mode.
       */
      setMemoryAction(null);
    } catch {
      setError(
        "Only a valid real numeric value can be stored in memory."
      );

      setMemoryAction(null);
    }
  }
}

  function memoryAdd(direction: 1 | -1): void {
    try {
      const numericResult = toRealNumber(rawResult);
      setMemory((previous) => ({
        ...previous,
        M: previous.M + direction * numericResult,
      }));
    } catch {
      setError("M+/M− requires a real numeric result.");
    }
  }

  function numericDerivative(formula: string, x: number): number {
    const h = Math.max(1e-7, Math.abs(x) * 1e-6);
    const forward = evaluateReal(formula, { x: x + h });
    const backward = evaluateReal(formula, { x: x - h });
    return (forward - backward) / (2 * h);
  }

  function numericIntegral(
    formula: string,
    start: number,
    end: number,
  ): number {
    const segments = 1000;
    const h = (end - start) / segments;

    let total =
      evaluateReal(formula, { x: start }) + evaluateReal(formula, { x: end });

    for (let index = 1; index < segments; index += 1) {
      const x = start + index * h;
      const value = evaluateReal(formula, { x });
      total += (index % 2 === 0 ? 2 : 4) * value;
    }

    return (h / 3) * total;
  }

  function numericSum(formula: string, start: number, end: number): number {
    const from = Math.ceil(start);
    const to = Math.floor(end);

    if (to < from) return 0;
    if (to - from > 100_000) throw new Error("Summation range is too large.");

    let total = 0;
    for (let x = from; x <= to; x += 1) total += evaluateReal(formula, { x });
    return total;
  }

  function solveEquation(formula: string, initialGuess: number): number {
    const equation = equationToExpression(formula);
    let x = initialGuess;

    for (let iteration = 0; iteration < 100; iteration += 1) {
      const fx = evaluateReal(equation, { x });
      if (Math.abs(fx) < 1e-12) return x;

      const derivative = numericDerivative(equation, x);
      if (Math.abs(derivative) < 1e-12) {
        x += 0.001;
        continue;
      }

      const next = x - fx / derivative;
      if (!Number.isFinite(next)) break;
      if (Math.abs(next - x) < 1e-12) return next;
      x = next;
    }

    throw new Error("No solution converged from this initial guess.");
  }

  function runAdvancedTool(): void {
    if (!advancedTool) return;

    try {
      let result: number;

      switch (advancedTool) {
        case "integral":
          result = numericIntegral(toolExpression, toolA, toolB);
          break;
        case "derivative":
          result = numericDerivative(toolExpression, toolPoint);
          break;
        case "sum":
          result = numericSum(toolExpression, toolA, toolB);
          break;
        case "solve":
          result = solveEquation(toolExpression, toolGuess);
          break;
      }

      setToolResult(formatResult(result));
      setRawResult(result);
      setAns(result);
      setError("");
    } catch (toolError: unknown) {
      setToolResult(
        toolError instanceof Error ? toolError.message : "Calculation error",
      );
    }
  }

  function openAdvancedTool(tool: Exclude<AdvancedTool, null>): void {
    setAdvancedTool(tool);
    setToolExpression(expression.trim() || "x^2");
    setToolResult("");
  }

  function pressKey(
  key: CalculatorKey
): void {
  /*
   * ALPHA has priority.
   */
  if (
    alpha &&
    key.alphaValue
  ) {
    insertToken(
      key.alphaValue
    );

    setAlpha(false);

    return;
  }

  /*
   * SHIFT next.
   */
  if (
    shift &&
    key.shiftValue
  ) {
    insertToken(
      key.shiftValue
    );

    setShift(false);

    return;
  }

  /*
   * Actions are executed ONLY from
   * this event-handler path.
   */
  if (key.action) {
    switch (key.action) {
      case "toggleVariables":
        setShowVariables(
          (value) => !value
        );
        break;

      case "integral":
        openAdvancedTool(
          "integral"
        );
        break;

      case "derivative":
        openAdvancedTool(
          "derivative"
        );
        break;

      case "sum":
        openAdvancedTool(
          "sum"
        );
        break;

      case "solve":
        openAdvancedTool(
          "solve"
        );
        break;

      case "toggleFraction":
        setFractionView(
          (value) => !value
        );
        break;

      case "delete":
        deleteCharacter();
        break;

      case "clear":
        clearAll();
        break;

      case "calculate":
        calculate();
        break;

      default:
        break;
    }

    setShift(false);
    setAlpha(false);

    return;
  }

  /*
   * Normal calculator value.
   */
  if (key.value) {
    insertToken(
      key.value
    );
  }

  setShift(false);
  setAlpha(false);
}



  return (
    <div className="mx-auto w-full max-w-[640px]">
      <section
        aria-label="Scientific calculator"
        className="overflow-hidden rounded-[28px] border border-slate-700 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 p-3 shadow-2xl sm:p-5"
      >
        <div className="mb-3 flex items-start justify-between px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300">
              Scientific Calculator
            </p>
            <p className="mt-0.5 text-[9px] text-slate-400">
              Natural Scientific Display
            </p>
          </div>

          <div
            className="rounded-md bg-slate-950 px-3 py-1.5 shadow-inner"
            aria-hidden="true"
          >
            <div className="flex gap-0.5">
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className="h-3 w-2 border-r border-slate-700 bg-slate-900"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border-4 border-slate-950/70 bg-lime-100 p-3 shadow-inner">
          <div className="mb-2 flex min-h-4 flex-wrap items-center gap-x-2 text-[9px] font-bold text-slate-600">
            {shift && <span>S</span>}
            {alpha && <span>A</span>}
            <span>{angleMode}</span>
            <span>{calculatorMode}</span>
            <span>{displayMode}</span>
            {memory.M !== 0 && <span>M</span>}
            <span className="ml-auto text-[8px] font-medium">Math</span>
          </div>

          <input
            ref={inputRef}
            value={expression}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setExpression(event.target.value)
            }
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Enter") {
                event.preventDefault();
                calculate();
              }
              if (event.key === "Escape") clearAll();
            }}
            spellCheck={false}
            aria-label="Calculator expression"
            placeholder="Enter expression"
            className="block w-full border-none bg-transparent font-mono text-[15px] font-semibold text-slate-800 outline-none placeholder:text-slate-400 sm:text-lg"
          />

          <div
            className={`mt-3 min-h-9 overflow-x-auto text-right font-mono text-xl font-bold tracking-tight sm:text-2xl ${error ? "text-red-700" : "text-slate-900"}`}
          >
            {resultText}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-6 gap-1.5 sm:gap-2">
          <TopKey
            label="SHIFT"
            active={shift}
            tone="shift"
            onClick={() => {
              setShift((v) => !v);
              setAlpha(false);
            }}
          />
          <TopKey
            label="ALPHA"
            active={alpha}
            tone="alpha"
            onClick={() => {
              setAlpha((v) => !v);
              setShift(false);
            }}
          />
          <TopKey
            label="MODE"
            active={showModes}
            onClick={() => setShowModes((v) => !v)}
          />
          <TopKey
            label="SETUP"
            active={showSetup}
            onClick={() => setShowSetup((v) => !v)}
          />
          <TopKey
            label="TOOLS"
            active={showTools}
            onClick={() => setShowTools((v) => !v)}
          />
          <TopKey
            label="HIST"
            active={showHistory}
            onClick={() => setShowHistory((v) => !v)}
          />
        </div>

        <div className="mt-2 grid grid-cols-5 gap-1.5">
          <SmallKey
            label="STO"
            active={memoryAction === "store"}
            onClick={() => setMemoryAction("store")}
          />
          <SmallKey
            label="RCL"
            active={memoryAction === "recall"}
            onClick={() => setMemoryAction("recall")}
          />
          <SmallKey label="M+" onClick={() => memoryAdd(1)} />
          <SmallKey label="M−" onClick={() => memoryAdd(-1)} />
          <SmallKey
            label={angleMode}
            onClick={() =>
              setAngleMode((current) => (current === "DEG" ? "RAD" : "DEG"))
            }
          />
        </div>

        {showModes && (
          <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl border border-slate-600 bg-slate-900/80 p-3 sm:grid-cols-6">
            {(
              [
                "COMP",
                "CMPLX",
                "STAT",
                "BASE-N",
                "MATRIX",
                "VECTOR",
              ] as CalculatorMode[]
            ).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setCalculatorMode(mode);
                  setShowModes(false);
                }}
                className={`rounded-lg border px-2 py-2 text-[10px] font-bold transition ${calculatorMode === mode ? "border-blue-400 bg-blue-600 text-white" : "border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700"}`}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        {showSetup && (
          <div className="mt-3 rounded-xl border border-slate-600 bg-slate-900/80 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Display Format
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(["NORM", "FIX", "SCI", "ENG"] as DisplayMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDisplayMode(mode)}
                  className={`rounded-lg border py-2 text-[10px] font-bold ${displayMode === mode ? "border-blue-400 bg-blue-600 text-white" : "border-slate-600 bg-slate-800 text-slate-300"}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <label className="mt-3 block">
              <span className="text-[10px] text-slate-400">Precision</span>
              <input
                type="number"
                min={2}
                max={12}
                value={precision}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setPrecision(
                    Math.max(2, Math.min(12, Number(event.target.value) || 2)),
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white outline-none"
              />
            </label>
          </div>
        )}

        {memoryAction && (
          <div className="mt-3 rounded-xl border border-amber-500/30 bg-slate-900 p-3">
            <p className="mb-2 text-[10px] font-bold text-amber-300">
              {memoryAction === "store"
                ? "Store result in:"
                : "Recall variable:"}
            </p>
            <div className="grid grid-cols-9 gap-1">
              {MEMORY_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleMemory(key)}
                  className="rounded-md bg-slate-700 py-2 text-xs font-bold text-white hover:bg-slate-600"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-6 gap-1.5 sm:gap-2">
          {CALCULATOR_KEYS.map((key, index) => (
            <CalcKey
              key={`${key.label}-${index}`}
              keyData={key}
              shift={shift}
              alpha={alpha}
              onClick={() => pressKey(key)}
            />
          ))}
        </div>
      </section>

      {showVariables && (
        <Panel title="Variables / CALC">
          <p className="mb-4 text-xs leading-relaxed text-slate-500">
            Assign real numeric values to A–F, M, X and Y, then use those
            symbols directly inside expressions.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {MEMORY_KEYS.map((key) => (
              <label key={key}>
                <span className="mb-1 block text-[10px] font-bold text-slate-500">
                  {key}
                </span>
                <input
                  type="number"
                  value={memory[key]}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setMemory((previous) => ({
                      ...previous,
                      [key]: Number(event.target.value) || 0,
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-2 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </label>
            ))}
          </div>
        </Panel>
      )}

      {advancedTool && (
        <Panel
          title={
            advancedTool === "integral"
              ? "Numerical Integration"
              : advancedTool === "derivative"
                ? "Numerical Derivative"
                : advancedTool === "sum"
                  ? "Summation"
                  : "Equation Solver"
          }
        >
          <label>
            <span className="mb-1 block text-[11px] font-bold text-slate-600">
              {advancedTool === "solve" ? "Equation / f(x)" : "Function f(x)"}
            </span>
            <input
              value={toolExpression}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setToolExpression(event.target.value)
              }
              placeholder={advancedTool === "solve" ? "x^2 - 4 = 0" : "sin(x)"}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          {(advancedTool === "integral" || advancedTool === "sum") && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <ToolNumber label="From" value={toolA} onChange={setToolA} />
              <ToolNumber label="To" value={toolB} onChange={setToolB} />
            </div>
          )}

          {advancedTool === "derivative" && (
            <div className="mt-3">
              <ToolNumber
                label="At x ="
                value={toolPoint}
                onChange={setToolPoint}
              />
            </div>
          )}

          {advancedTool === "solve" && (
            <div className="mt-3">
              <ToolNumber
                label="Initial guess"
                value={toolGuess}
                onChange={setToolGuess}
              />
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={runAdvancedTool}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              Calculate
            </button>
            <button
              type="button"
              onClick={() => setAdvancedTool(null)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          {toolResult && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Result
              </p>
              <p className="mt-1 break-all font-mono text-xl font-bold text-emerald-900">
                {toolResult}
              </p>
            </div>
          )}
        </Panel>
      )}

      {showTools && (
        <Panel title="Scientific Function Library">
          <FunctionSection
            title="Trigonometry"
            buttons={[
              ["sin", "sin("],
              ["cos", "cos("],
              ["tan", "tan("],
              ["sin⁻¹", "asin("],
              ["cos⁻¹", "acos("],
              ["tan⁻¹", "atan("],
              ["sinh", "sinh("],
              ["cosh", "cosh("],
              ["tanh", "tanh("],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Algebra & Number Theory"
            buttons={[
              ["|x|", "abs("],
              ["floor", "floor("],
              ["ceil", "ceil("],
              ["round", "round("],
              ["mod", "mod("],
              ["gcd", "gcd("],
              ["lcm", "lcm("],
              ["x!", "factorial("],
              ["nCr", "nCr("],
              ["nPr", "nPr("],
              ["rand", "random()"],
              ["randInt", "randint("],
              ["prime", "primeFactors("],
              ["root", "nthRoot("],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Statistics"
            buttons={[
              ["mean", "mean(["],
              ["median", "median(["],
              ["std", "std(["],
              ["variance", "variance(["],
              ["sum", "sum(["],
              ["min", "min(["],
              ["max", "max(["],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Complex"
            buttons={[
              ["complex", "complex("],
              ["conj", "conj("],
              ["Re", "re("],
              ["Im", "im("],
              ["arg", "arg("],
              ["|z|", "abs("],
              ["polar", "polar("],
              ["rect", "rect("],
              ["i", "i"],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Matrices"
            buttons={[
              ["det", "det([["],
              ["inverse", "inv([["],
              ["transpose", "transpose([["],
              ["trace", "trace([["],
              ["identity", "identity("],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Vectors"
            buttons={[
              ["dot", "dot(["],
              ["cross", "cross(["],
              ["norm", "norm(["],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Logic / Base-N"
            buttons={[
              ["AND", "bitAnd("],
              ["OR", "bitOr("],
              ["XOR", "bitXor("],
              ["NOT", "bitNot("],
            ]}
            insertToken={insertToken}
          />
          <FunctionSection
            title="Conversions"
            buttons={[
              ["deg→rad", "deg2rad("],
              ["rad→deg", "rad2deg("],
              ["km→mi", "km2mi("],
              ["mi→km", "mi2km("],
              ["kg→lb", "kg2lb("],
              ["lb→kg", "lb2kg("],
              ["°C→°F", "c2f("],
              ["°F→°C", "f2c("],
            ]}
            insertToken={insertToken}
          />

          <div className="mt-5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Scientific Constants
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {[
                ["π", "pi"],
                ["e", "e"],
                ["i", "i"],
                ["c", "c0"],
                ["G", "G"],
                ["h", "h"],
                ["ℏ", "hbar"],
                ["kB", "kB"],
                ["NA", "NA"],
                ["R", "Rgas"],
                ["qe", "qe"],
                ["me", "me"],
                ["mp", "mp"],
                ["g₀", "g0"],
              ].map(([label, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => insertToken(value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      )}

      {calculatorMode === "BASE-N" &&
        typeof rawResult === "number" &&
        Number.isInteger(rawResult) && (
          <Panel title="Base-N Conversion">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <BaseResult label="BIN" value={rawResult.toString(2)} />
              <BaseResult label="OCT" value={rawResult.toString(8)} />
              <BaseResult label="DEC" value={rawResult.toString(10)} />
              <BaseResult
                label="HEX"
                value={rawResult.toString(16).toUpperCase()}
              />
            </div>
          </Panel>
        )}

      {showHistory && (
        <Panel title="Calculation History">
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No calculations yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <button
                  key={`${item.expression}-${index}`}
                  type="button"
                  onClick={() => setExpression(item.expression)}
                  className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-slate-500">
                    {item.expression}
                  </p>
                  <p className="mt-1 text-right font-mono text-sm font-bold text-slate-900">
                    = {item.result}
                  </p>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setHistory([])}
                className="mt-2 text-xs font-bold text-red-600 hover:text-red-700"
              >
                Clear history
              </button>
            </div>
          )}
        </Panel>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Try these expressions
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "sin(30)^2 + cos(30)^2",
            "(2 + 3i) * (4 - i)",
            "det([[1,2],[3,4]])",
            "mean([4,8,15,16,23,42])",
            "nCr(10,3)",
            "sqrt(2) + log10(1000)",
          ].map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setExpression(example)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-[10px] text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalcKey({
  keyData,
  shift,
  alpha,
  onClick,
}: {
  keyData: CalculatorKey;
  shift: boolean;
  alpha: boolean;
  onClick: () => void;
}) {
  const tone = keyData.tone ?? "function";
  const styles: Record<KeyTone, string> = {
    number: "border-slate-500 bg-slate-200 text-slate-950 hover:bg-white",
    operator: "border-slate-500 bg-slate-500 text-white hover:bg-slate-400",
    function: "border-slate-500 bg-slate-700 text-white hover:bg-slate-600",
    danger: "border-red-500 bg-red-600 text-white hover:bg-red-500",
    equal: "border-blue-500 bg-blue-600 text-white hover:bg-blue-500",
  };

  const activeLabel =
    alpha && keyData.alphaLabel
      ? keyData.alphaLabel
      : shift && keyData.shiftLabel
        ? keyData.shiftLabel
        : keyData.label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative min-h-11 rounded-lg border-b-[3px] px-1 py-2 text-[11px] font-bold shadow-sm transition-all duration-100 active:translate-y-[2px] active:border-b sm:min-h-12 sm:text-xs ${styles[tone]}`}
    >
      {keyData.shiftLabel && (
        <span className="absolute top-3 left-1 text-[11px] font-bold text-amber-300">
          {keyData.shiftLabel}
        </span>
      )}
      {keyData.alphaLabel && (
        <span className="absolute top-1 right-1 text-[11px] font-bold text-red-300">
          {keyData.alphaLabel}
        </span>
      )}
      {activeLabel}
    </button>
  );
}

function TopKey({
  label,
  onClick,
  active,
  tone,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  tone?: "shift" | "alpha";
}) {
  const activeStyle =
    tone === "shift"
      ? "border-amber-400 bg-amber-500 text-slate-950"
      : tone === "alpha"
        ? "border-red-400 bg-red-500 text-white"
        : "border-blue-400 bg-blue-600 text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-8 rounded-md border px-1 text-[8px] font-bold tracking-wide transition sm:text-[9px] ${active ? activeStyle : "border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-700"}`}
    >
      {label}
    </button>
  );
}

function SmallKey({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border py-1.5 text-[9px] font-bold transition ${active ? "border-amber-400 bg-amber-500 text-slate-950" : "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
    >
      {label}
    </button>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h3 className="mb-4 text-sm font-bold text-slate-900">{title}</h3>
      {children}
    </section>
  );
}

function FunctionSection({
  title,
  buttons,
  insertToken,
}: {
  title: string;
  buttons: ReadonlyArray<readonly [string, string]>;
  insertToken: (value: string) => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {buttons.map(([label, value]) => (
          <button
            key={`${label}-${value}`}
            type="button"
            onClick={() => insertToken(value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToolNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="mb-1 block text-[10px] font-bold text-slate-500">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(Number(event.target.value) || 0)
        }
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  );
}

function BaseResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[9px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}
