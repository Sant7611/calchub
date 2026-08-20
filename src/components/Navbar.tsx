"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Calculator,
  ChevronDown,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import { categories } from "@/data/categories";
import { RegionSelector } from "@/components/RegionSelector";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex cursor-pointer items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 text-white">
            <Calculator className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Calcu<span className="text-indigo-600">Tools</span>
          </span>
        </Link>

        <div
          ref={dropdownRef}
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            Categories
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-100"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
                    <category.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-slate-900">
                      {category.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {category.tools.length} tools
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <RegionSelector />

          <Link
            href="/blog"
            className="hidden cursor-pointer items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
          >
            <BookOpenText className="h-4 w-4" />
            Blog
          </Link>

          <Link
            href="/tools"
            className="hidden cursor-pointer items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 md:inline-flex"
          >
            <LayoutGrid className="h-4 w-4" />
            All Tools
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-md text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-200 bg-white shadow-lg md:hidden">
            <div className="space-y-6 px-4 py-6 sm:px-6">
              <div className="mb-4">
                <RegionSelector />
              </div>

              {categories.map((category) => (
                <div key={category.slug}>
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex cursor-pointer items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </Link>
                  <div className="mt-2 grid grid-cols-1 gap-1 border-l border-slate-200 pl-5">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${category.slug}/${tool.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="cursor-pointer rounded-md px-2 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
              >
                <BookOpenText className="h-4 w-4 text-indigo-600" />
                Blog &amp; Guides
              </Link>

              <Link
                href="/tools"
                onClick={() => setMobileOpen(false)}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <LayoutGrid className="h-4 w-4" />
                Browse all tools
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}