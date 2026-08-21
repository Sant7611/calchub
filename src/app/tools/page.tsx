import { Suspense } from "react";
import type { Metadata } from "next";
import { ToolsSearchGrid } from "@/components/ToolsSearchGrid";

export const metadata: Metadata = {
  title: "All Calculators & Tools",
  description:
    "Browse every free calculator — finance, health, math, converters and business — with instant search.",
  alternates: {
    canonical: "/tools",
  },
};

/** Server Component — renders the heading; filtering happens client-side. */
export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        All Calculators &amp; Tools
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Search across every calculator, or browse by category.
      </p>

      <Suspense fallback={null}>
        <ToolsSearchGrid />
      </Suspense>
    </div>
  );
}
