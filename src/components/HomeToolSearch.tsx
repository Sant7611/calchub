"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";

export interface HomeSearchTool {
  name: string;
  category: string;
  href: string;
}

interface HomeToolSearchProps {
  tools: HomeSearchTool[];
}

export function HomeToolSearch({ tools }: HomeToolSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const normalizedQuery = query.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (normalizedQuery.length < 3) return [];

    return tools
      .filter((tool) => {
        const searchableText = `${tool.name} ${tool.category}`.toLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [normalizedQuery, tools]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    router.push(value ? `/tools?q=${encodeURIComponent(value)}` : "/tools");
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto mt-8 max-w-xl">
      <label htmlFor="homepage-tool-search" className="sr-only">
        Search calculators
      </label>

      <div className="flex rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 transition-shadow focus-within:ring-2 focus-within:ring-indigo-500">
        <Search
          className="ml-3 h-5 w-5 shrink-0 self-center text-slate-400"
          aria-hidden="true"
        />
        <input
          id="homepage-tool-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tax, salary, EMI, BMI and more"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="homepage-tool-search-results"
          aria-expanded={suggestions.length > 0}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-slate-900 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Search
        </button>
      </div>

      {suggestions.length > 0 && (
        <div
          id="homepage-tool-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl"
        >
          {suggestions.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              role="option"
              aria-selected="false"
              className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 transition-colors last:border-b-0 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">
                  {tool.name}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {tool.category}
                </span>
              </span>
              <span className="shrink-0 text-xs font-semibold text-indigo-600">
                Open
              </span>
            </Link>
          ))}
        </div>
      )}
    </form>
  );
}
