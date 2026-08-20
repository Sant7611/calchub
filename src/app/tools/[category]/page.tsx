import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/data/categories";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Metadata {
  const { category: categorySlug } = await params;
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return { title: "Category not found" };

  return {
    title: `${category.name} Calculators`,
    description: `Free online ${category.name.toLowerCase()} calculators — instant, mobile-friendly and SEO-optimized.`,
  };
}

export default async function ToolsCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "All Tools", href: "/tools" },
          { label: category.name },
        ]}
      />

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            <category.icon className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {category.name} Calculators
          </h1>
        </div>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          Browse all {category.name.toLowerCase()} tools below. Click any card to start calculating.
        </p>
      </header>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}
