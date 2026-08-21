import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { categories } from "@/data/categories";
import {
  getCalculatorContent,
  getCalculatorMetadata,
} from "@/data/calculator-content";
import { calculatorRegistry } from "@/components/calculators/registry";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection } from "@/components/seo/FaqSection";
import { TrackToolView } from "@/components/TrackToolView";
import { AdBanner } from "@/components/AdBanner";

interface ToolPageProps {
  params: Promise<{ category: string; slug: string }>;
}

// Ad-slot IDs come from the environment — nothing is hardcoded.
// Create two responsive units in AdSense and set them in Vercel.
const AD_SLOT_AFTER_CALCULATOR =
  process.env.NEXT_PUBLIC_AD_SLOT_AFTER_CALCULATOR;
const AD_SLOT_PAGE_BOTTOM = process.env.NEXT_PUBLIC_AD_SLOT_PAGE_BOTTOM;

function findTool(categorySlug: string, toolSlug: string) {
  const category = categories.find((c) => c.slug === categorySlug);
  const tool = category?.tools.find((t) => t.slug === toolSlug);
  return category && tool ? { category, tool } : null;
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.tools.map((tool) => ({
      category: category.slug,
      slug: tool.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { category: categorySlug, slug: toolSlug } = await params;

  const found = findTool(categorySlug, toolSlug);

  if (!found) {
    return {
      title: "Calculator not found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const content = getCalculatorContent(found.tool.slug, found.tool.name);

  const metadata = getCalculatorMetadata(
    content,
    `/tools/${categorySlug}/${toolSlug}`,
  );

  const hasCalculator = Boolean(calculatorRegistry[found.tool.slug]);

  if (!hasCalculator) {
    return {
      ...metadata,

      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return metadata;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { category: categorySlug, slug: toolSlug } = await params;
  const found = findTool(categorySlug, toolSlug);
  if (!found) notFound();

  const { category, tool } = found;
  const content = getCalculatorContent(tool.slug, tool.name);
  const CalculatorComponent = calculatorRegistry[tool.slug];
  const related = category.tools.filter((t) => t.slug !== tool.slug);

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* "Recently Used" history — client island, renders null */}
      <TrackToolView slug={tool.slug} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category.name, href: `/categories/${category.slug}` },
          { label: tool.name },
        ]}
      />

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {tool.name}
        </h1>

        <div className="mt-4 space-y-4 text-lg leading-relaxed text-slate-600">
          {content.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      {/* The interactive calculator (client island) — or Coming Soon */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {CalculatorComponent ? (
          <CalculatorComponent />
        ) : (
          <div className="flex flex-col items-center py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-100">
              <CalendarClock className="h-7 w-7 text-slate-400" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Coming soon
            </h2>
            <p className="mt-1 max-w-sm text-sm text-slate-600">
              The {tool.name} is on the roadmap. In the meantime, explore the
              related calculators below.
            </p>
          </div>
        )}
      </div>

      {/* ── AD SLOT 1 of 2 ──────────────────────────────────────────
          Between the calculator card and "How to Use".
          Never above the H1 · never inside the calculator inputs. */}
      <AdBanner slot={AD_SLOT_AFTER_CALCULATOR} className="my-10" />

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900">
          How to Use the {tool.name}
        </h2>
        <ol className="mt-5 space-y-4">
          {content.howToUse.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed text-slate-600">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900">
          {content.formula.title}
        </h2>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="leading-relaxed text-slate-600">
            {content.formula.explanation}
          </p>
        </div>
      </section>

      <FaqSection faqs={content.faqs} />

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">
            Related Calculators
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <CalculatorCard
                key={t.slug}
                title={t.name}
                description={t.description}
                icon={t.icon}
                href={`/tools/${category.slug}/${t.slug}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── AD SLOT 2 of 2 ──────────────────────────────────────────
          Very bottom of the page, after the FAQs. */}
      <AdBanner slot={AD_SLOT_PAGE_BOTTOM} className="mt-12" />
    </article>
  );
}
