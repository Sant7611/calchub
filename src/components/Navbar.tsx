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

// Phase 6 update — a "Blog" link joins the desktop bar and the mobile menu.
// Still the only client component on the shell: it needs useState, a ref and
// DOM listeners, so it alone crosses the "use client" fence.
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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — left */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Calcu<span className="text-primary">Tools</span>
          </span>
        </Link>

        {/* Categories dropdown — center (desktop) */}
        <div
          ref={dropdownRef}
          className="absolute left-1/2 hidden -translate-x-1/2 md:block"
        >
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Categories
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-2 w-80 -translate-x-1/2 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground">
                    <category.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      {category.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {category.tools.length} tools
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right — Blog + All Tools (desktop) · hamburger (mobile) */}
        <div className="flex items-center gap-1.5">
          {/* NEW in Phase 6 */}
          <Link
            href="/blog"
            className="hidden items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
          >
            <BookOpenText className="h-4 w-4" />
            Blog
          </Link>

          <Link
            href="/tools"
            className="hidden items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
          >
            <LayoutGrid className="h-4 w-4" />
            All Tools
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="grid h-10 w-10 place-items-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile menu — absolute-positioned directly under the bar */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-full max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-border bg-background shadow-lg md:hidden">
            <div className="space-y-6 px-4 py-6 sm:px-6">
              {categories.map((category) => (
                <div key={category.slug}>
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </Link>
                  <div className="mt-2 grid grid-cols-1 gap-1 border-l border-border pl-5">
                    {category.tools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-2 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {/* NEW in Phase 6 — Blog entry in the mobile menu */}
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
              >
                <BookOpenText className="h-4 w-4 text-primary" />
                Blog &amp; Guides
              </Link>

              <Link
                href="/tools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
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
