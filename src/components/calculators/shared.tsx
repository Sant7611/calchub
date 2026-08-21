import { Children, type ReactNode } from "react";

/* ── form field ─────────────────────────────────────────── */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1 block text-[11px] text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function NumInput({
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex min-h-11 min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-card transition-all duration-200 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/20 lg:min-h-10">
      {prefix ? (
        <span className="flex items-center border-r border-border bg-muted px-2.5 py-2.5 font-mono text-[12px] text-muted-foreground select-none lg:py-2">
          {prefix}
        </span>
      ) : null}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[14px] font-medium text-foreground outline-none [appearance:textfield] lg:py-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix ? (
        <span className="flex items-center border-l border-border bg-muted px-2.5 py-2.5 font-mono text-[12px] text-muted-foreground select-none lg:py-2">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/* ── result stats ───────────────────────────────────────── */
export function Stat({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-xl border p-4 transition-all duration-300 lg:p-3 ${
        accent
          ? "border-primary/35 bg-primary/10"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <p className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={`mt-1.5 break-words font-display text-xl font-bold tracking-tight sm:text-2xl ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">{sub}</p>
      ) : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  const hasOddCount = Children.count(children) % 2 === 1;

  return (
    <div
      className={`mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${
        hasOddCount
          ? "sm:[&>*:last-child]:col-span-2 lg:[&>*:last-child]:col-span-1"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

/* ── allocation bar (budget) ────────────────────────────── */
export function Bar({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
          {label}
        </span>
        <span className="min-w-0 break-words text-right font-mono text-[13px] font-semibold text-foreground">
          {value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}
