"use client";

import { useMemo, useState } from "react";

import { Search, SearchX } from "lucide-react";

import Fuse from "fuse.js";

import { useSearchParams } from "next/navigation";

import { categories, type Tool } from "@/data/categories";

import { CalculatorCard } from "@/components/ui/CalculatorCard";

import { Input } from "@/components/ui/input";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

interface IndexedTool extends Tool {
  categorySlug: string;
  categoryName: string;

  /*
   * Optional SEO/search terms.
   *
   * Add these to tools inside categories.ts
   * when you want deeper search coverage.
   */
  keywords?: string[];

  /*
   * Searchable body text / SEO text.
   *
   * This lets search match words that are
   * not present in the title or description.
   */
  searchText?: string;
}

/* ──────────────────────────────────────────────────────────
   Search Configuration
────────────────────────────────────────────────────────── */

const MIN_SEARCH_LENGTH = 3;

/*
 * Flatten categories once.
 *
 * Fuse searches one single collection.
 */
const allTools: IndexedTool[] = categories.flatMap((category) =>
  category.tools.map((tool) => {
    /*
     * These properties may exist on your
     * Tool later without breaking current data.
     */
    const searchableTool = tool as Tool & {
      keywords?: string[];
      searchText?: string;
    };

    return {
      ...tool,

      categorySlug: category.slug,

      categoryName: category.name,

      keywords: searchableTool.keywords ?? [],

      searchText: searchableTool.searchText ?? "",
    };
  }),
);

/*
 * Fuse index.
 *
 * Title is intentionally weighted highest.
 * Body / searchText has lower priority.
 */
const fuse = new Fuse(allTools, {
  keys: [
    {
      name: "name",
      weight: 0.4,
    },

    {
      name: "description",
      weight: 0.25,
    },

    {
      name: "keywords",
      weight: 0.15,
    },

    {
      name: "searchText",
      weight: 0.15,
    },

    {
      name: "categoryName",
      weight: 0.05,
    },
  ],

  /*
   * Lower = stricter matching.
   *
   * 0.35 gives useful fuzzy search
   * without returning too many
   * unrelated calculators.
   */
  threshold: 0.35,

  /*
   * Users may search words from anywhere
   * in longer descriptions/body content.
   */
  ignoreLocation: true,

  /*
   * Ignore very weak fuzzy matches.
   */
  minMatchCharLength: 2,

  /*
   * Improves performance because Fuse
   * builds its index once.
   */
  useExtendedSearch: false,
});

/* ──────────────────────────────────────────────────────────
   Search Helpers
────────────────────────────────────────────────────────── */

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/* ──────────────────────────────────────────────────────────
   Main Component
────────────────────────────────────────────────────────── */

export function ToolsSearchGrid() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  const normalizedQuery = useMemo(() => normalizeQuery(query), [query]);

  const hasQuery = normalizedQuery.length > 0;

  const canSearch = normalizedQuery.length >= MIN_SEARCH_LENGTH;

  /* ────────────────────────────────────────────────────────
     Search Results
  ──────────────────────────────────────────────────────── */

  const results = useMemo(() => {
    if (!canSearch) {
      return [];
    }

    return fuse.search(normalizedQuery).map((result) => result.item);
  }, [normalizedQuery, canSearch]);

  /* ───────────────────────────────────────────────────── */

  return (
    <div className="mt-8">
      {/* ────────────────────────────────────────────────
          Search
      ──────────────────────────────────────────────── */}

      <div className="max-w-xl">
        <div className="relative">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-slate-400
            "
          />

          <Input
            type="search"
            placeholder="Search calculators, formulas, topics…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="
              h-11
              pl-10
              pr-4
            "
            aria-label="Search calculators"
          />
        </div>

        {/* Search hint */}

        {!hasQuery && (
          <p
            className="
            mt-2
            text-xs
            text-slate-400
          "
          >
            Search by calculator name, topic, formula or keyword.
          </p>
        )}

        {/* Minimum character hint */}

        {hasQuery && !canSearch && (
          <p
            className="
              mt-2
              text-xs
              text-slate-400
            "
          >
            Enter at least {MIN_SEARCH_LENGTH} characters to search.
          </p>
        )}
      </div>

      {/* ────────────────────────────────────────────────
          Default Category View
      ──────────────────────────────────────────────── */}

      {!canSearch ? (
        <div
          className="
          mt-10
          space-y-12
        "
        >
          {categories.map((category) => (
            <section key={category.slug}>
              <h2
                className="
                  flex
                  items-center
                  gap-2.5
                  text-2xl
                  font-bold
                  text-slate-900
                "
              >
                <span
                  className="
                    grid
                    h-9
                    w-9
                    place-items-center
                    rounded-lg
                    bg-indigo-50
                    text-indigo-600
                  "
                >
                  <category.icon
                    className="
                      h-5
                      w-5
                    "
                  />
                </span>

                {category.name}
              </h2>

              <div
                className="
                  mt-6
                  grid
                  grid-cols-1
                  gap-6
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
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
        /* ──────────────────────────────────────────────
           Search Results
        ────────────────────────────────────────────── */

        <div>
          <div
            className="
            mt-6
            flex
            items-center
            justify-between
            gap-4
          "
          >
            <p
              className="
              text-sm
              text-slate-500
            "
            >
              <strong
                className="
                font-semibold
                text-slate-700
              "
              >
                {results.length}
              </strong>{" "}
              result
              {results.length === 1 ? "" : "s"} for{" "}
              <span
                className="
                font-medium
                text-slate-700
              "
              >
                “{normalizedQuery}”
              </span>
            </p>
          </div>

          <div
            className="
            mt-4
            grid
            grid-cols-1
            gap-6
            sm:grid-cols-2
            lg:grid-cols-3
          "
          >
            {results.map((tool) => (
              <CalculatorCard
                key={`${tool.categorySlug}-${tool.slug}`}
                title={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={`/tools/${tool.categorySlug}/${tool.slug}`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────
           Empty Results
        ────────────────────────────────────────────── */

        <div
          className="
          flex
          flex-col
          items-center
          py-24
          text-center
        "
        >
          <span
            className="
            grid
            h-14
            w-14
            place-items-center
            rounded-full
            bg-slate-100
          "
          >
            <SearchX
              className="
              h-7
              w-7
              text-slate-400
            "
            />
          </span>

          <h2
            className="
            mt-4
            text-lg
            font-semibold
            text-slate-900
          "
          >
            No calculators found
          </h2>

          <p
            className="
            mt-1
            max-w-sm
            text-sm
            leading-6
            text-slate-600
          "
          >
            No calculator matches “{normalizedQuery}”. Try another word such as
            loan, grade, SIP, BMI, tax or percentage.
          </p>

          <button
            type="button"
            onClick={() => setQuery("")}
            className="
              mt-5
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-xs
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:border-blue-300
              hover:bg-blue-50
              hover:text-blue-700
            "
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
