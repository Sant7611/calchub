"use client";

import type { LucideIcon } from "lucide-react";
import { useRecentlyUsed } from "@/lib/recently-used";
import { categories } from "@/data/categories";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Recently used tools — client component that reads/writes localStorage.
 * Shows up to 4 most recently viewed calculator tools.
 */
export function RecentlyUsed() {
  const { items } = useRecentlyUsed();

  if (items.length === 0) {
    return null;
  }

  // Resolve tool metadata from the registry
  const tools = items
    .map((key) => {
      for (const category of categories) {
        const tool = category.tools.find((t) => t.slug === key);
        if (tool) {
          return { ...tool, categorySlug: category.slug, categoryName: category.name };
        }
      }
      return null;
    })
    .filter(Boolean) as Array<{
    slug: string;
    name: string;
    description: string;
    icon: LucideIcon;
    categorySlug: string;
    categoryName: string;
  }>;

  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recently Used</h2>
          <Link
            href="/tools"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all tools <ArrowRight className="ml-1 inline h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <CalculatorCard
                key={tool.slug}
                title={tool.name}
                description={tool.description}
                icon={Icon}
                href={`/tools/${tool.categorySlug}/${tool.slug}`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
