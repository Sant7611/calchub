"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import Fuse from "fuse.js";

import { categories, type Tool } from "@/data/categories";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { Input } from "@/components/ui/input";

interface IndexedTool extends Tool {
  categorySlug: string;
  categoryName: string;
}

// Flatten once — Fuse searches a single array; the grouped view regroups it.
const allTools: IndexedTool[] = categories.flatMap((category) =>
  category.tools.map((tool) => ({
    ...tool,
    categorySlug: category.slug,
    categoryName: category.name,
  })),
);

const fuse = new Fuse(allTools, {
  keys: ["name", "description"],
  threshold: 0.3,
});

export function ToolsSearchGrid() {
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => (query.trim() === "" ? [] : fuse.search(query).map((r) => r.item)),
    [query],
  );

  const searching = query.trim() !== "";

  return (
    <div className="mt-8">
      {/* Search input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder="Search calculators…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
          aria-label="Search calculators"
        />
      </div>

      {!searching ? (
        // Empty query → grouped by category, with headings
        <div className="mt-10 space-y-12">
          {categories.map((category) => (
            <section key={category.slug}>
              <h2 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <category.icon className="h-5 w-5" />
                </span>
                {category.name}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.tools.map((tool) => (
                  <CalculatorCard
                    key={tool.slug}
                    title={tool.name}
                    description={tool.description}
                    icon={tool.icon}
                    href={`/tools/${category.slug}/${tool.slug}`}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : results.length > 0 ? (
        // Searching → flat grid of matches, headings hidden
        <div>
          <p className="mt-6 text-sm text-slate-500">
            {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((tool) => (
              <CalculatorCard
                key={tool.slug}
                title={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={`/tools/${tool.categorySlug}/${tool.slug}`}
              />
            ))}
          </div>
        </div>
      ) : (
        // Zero matches → friendly empty state
        <div className="flex flex-col items-center py-24 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100">
            <SearchX className="h-7 w-7 text-slate-400" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No tools found matching your search
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-600">
            Try a broader term like “loan”, “bmi” or “percent”.
          </p>
        </div>
      )}
    </div>
  );
}
