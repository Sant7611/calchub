import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface CalculatorCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

/**
 * Server Component — pure markup, no client JavaScript.
 * Used by the Homepage, /tools grid, Related Calculators and Recently Used.
 */
export function CalculatorCard({
  title,
  description,
  icon: Icon,
  href,
}: CalculatorCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
    >
      <span className="grid h-11 w-11 place-items-center rounded-full bg-indigo-500 text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
        <Icon className="h-5 w-5" />
      </span>

      <h3 className="mt-4 font-bold text-slate-900 transition-colors duration-200 group-hover:text-indigo-600">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </Link>
  );
}
