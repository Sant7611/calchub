import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { categories } from "@/data/categories";
import { getPosts } from "@/lib/blog";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { BlogCard } from "@/components/blog/BlogCard";
import { RecentlyUsed } from "@/components/RecentlyUsed";

/**
 * Homepage — Server Component. Everything below is data-driven from
 * categories.ts and the MDX blog layer; nothing is hardcoded.
 */
export default function HomePage() {
  const popular = categories
    .flatMap((category) =>
      category.tools
        .filter((tool) => tool.popular)
        .map((tool) => ({ tool, categorySlug: category.slug })),
    )
    .slice(0, 6);

  const latestGuides = getPosts().slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Fast, accurate, and free online calculators.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Calculate your finances, health, math, and more instantly.
          </p>
          <Link
            href="/tools"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
          >
            Browse All Tools
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Recently Used — client island, renders null on first visit */}
        <RecentlyUsed />

        {/* Popular Tools — driven by the `popular` flag in categories.ts */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-slate-900">Popular Tools</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map(({ tool, categorySlug }) => (
              <CalculatorCard
                key={tool.slug}
                title={tool.name}
                description={tool.description}
                icon={tool.icon}
                href={`/tools/${categorySlug}/${tool.slug}`}
              />
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section className="pb-16">
          {categories.map((category) => (
            <div key={category.slug} className="mt-12 first:mt-0">
              <h2 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                  <category.icon className="h-5 w-5" />
                </span>
                {category.name}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
          ))}
        </section>

        {/* Latest Guides — the blog flywheel reaches the homepage */}
        <section className="border-t border-slate-200 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold text-slate-900">Latest Guides</h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              All articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestGuides.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
