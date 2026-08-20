import type { ReactNode } from "react";

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
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10.5px] font-semibold tracking-widest text-fog-500 uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-fog-600">{hint}</span> : null}
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
    <div className="flex items-center overflow-hidden rounded-lg border border-ink-600 bg-ink-850 transition-all duration-200 focus-within:border-mint-500/60 focus-within:ring-2 focus-within:ring-mint-500/20">
      {prefix ? (
        <span className="border-r border-ink-600 bg-ink-800 px-2.5 py-2 font-mono text-[12px] text-fog-500 select-none">
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
        className="w-full bg-transparent px-3 py-2 font-mono text-[14px] font-medium text-fog-100 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {suffix ? (
        <span className="border-l border-ink-600 bg-ink-800 px-2.5 py-2 font-mono text-[12px] text-fog-500 select-none">
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
      className={`rounded-xl border p-4 transition-all duration-300 ${
        accent
          ? "border-mint-500/40 bg-mint-500/10"
          : "border-ink-600/70 bg-ink-850/80 hover:border-ink-500"
      }`}
    >
      <p className="font-mono text-[10px] font-semibold tracking-widest text-fog-500 uppercase">
        {label}
      </p>
      <p
        className={`mt-1.5 font-display text-2xl font-bold tracking-tight ${
          accent ? "text-mint-300" : "text-fog-100"
        }`}
      >
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11.5px] text-fog-600">{sub}</p> : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="mt-5 grid gap-3 sm:grid-cols-3">{children}</div>;
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
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[10.5px] font-semibold tracking-widest text-fog-500 uppercase">
          {label}
        </span>
        <span className="font-mono text-[13px] font-semibold text-fog-100">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-700">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  );
}
