import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

/**
 * Global 404 — rendered by notFound() in the dynamic tool page and by any
 * unmatched route. Server Component, static markup only.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
        <Compass className="h-8 w-8 text-slate-400" />
      </span>

      <p className="mt-6 font-mono text-xs font-semibold tracking-[0.3em] text-slate-400 uppercase">
        Error 404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        This calculator doesn&rsquo;t exist
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-slate-600">
        The page you&rsquo;re looking for was moved, renamed, or never built.
        The full library is one click away.
      </p>

      <Link
        href="/tools"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
      >
        Browse all tools
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
