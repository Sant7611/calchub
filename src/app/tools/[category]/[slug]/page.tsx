import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { categories } from "@/data/categories";
import {
  getCalculatorContent,
  getCalculatorMetadata,
} from "@/data/calculator-content";
import { nepalLandAreaCalculatorContent } from "@/data/nepal-land-area-content";
import { calculatorRegistry } from "@/components/calculators/registry";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { FaqSection } from "@/components/seo/FaqSection";
import { TrackToolView } from "@/components/TrackToolView";
import { AdBanner } from "@/components/AdBanner";
import styles from "./CalculatorWorkspace.module.css";

interface ToolPageProps {
  params: Promise<{ category: string; slug: string }>;
}

const PREFERRED_TOOL_ROUTES: Record<string, string> = {
  "finance/tax-calculator": "/finance/tax-calc",
  "finance/salary-calculator": "/finance/salary-calc",
  "finance/emi-calculator": "/emi-calculator",
};

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

function getPreferredToolRoute(categorySlug: string, toolSlug: string) {
  return PREFERRED_TOOL_ROUTES[`${categorySlug}/${toolSlug}`] ?? null;
}

function getToolContent(toolSlug: string, toolName: string) {
  if (toolSlug === nepalLandAreaCalculatorContent.slug) {
    return nepalLandAreaCalculatorContent;
  }

  return getCalculatorContent(toolSlug, toolName);
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

  const content = getToolContent(found.tool.slug, found.tool.name);
  const preferredRoute = getPreferredToolRoute(categorySlug, toolSlug);

  const metadata = getCalculatorMetadata(
    content,
    preferredRoute ?? `/tools/${categorySlug}/${toolSlug}`,
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

  const preferredRoute = getPreferredToolRoute(categorySlug, toolSlug);
  if (preferredRoute) permanentRedirect(preferredRoute);

  const { category, tool } = found;
  const content = getToolContent(tool.slug, tool.name);
  const CalculatorComponent = calculatorRegistry[tool.slug];
  const related = category.tools.filter((t) => t.slug !== tool.slug);

  return (
    <article className="mx-auto max-w-6xl px-3 pb-12 pt-5 sm:px-5 sm:pt-7 lg:px-6">
      {/* "Recently Used" history — client island, renders null */}
      <TrackToolView slug={tool.slug} />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category.name, href: `/categories/${category.slug}` },
          { label: tool.name },
        ]}
      />

      {/* Wide calculator workspace. Add a light shell only when the calculator does not already own one. */}
      <div className={`${styles.workspace} mt-4`}>
        {CalculatorComponent ? (
          <CalculatorComponent />
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card py-10 text-center shadow-sm">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-muted">
              <CalendarClock className="h-7 w-7 text-muted-foreground" />
            </span>
            <h2 className="mt-4 text-lg font-semibold text-foreground">
              Coming soon
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              The {tool.name} is on the roadmap. In the meantime, explore the
              related calculators below.
            </p>
          </div>
        )}
      </div>

      <header className="mt-8 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {tool.name}
        </h1>

        <div className="mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
          {content.intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      {/* ── AD SLOT 1 of 2 ──────────────────────────────────────────
          Between the calculator content and "How to Use". */}
      <AdBanner slot={AD_SLOT_AFTER_CALCULATOR} className="my-10" />

      <section className="mt-12 max-w-4xl">
        <h2 className="text-2xl font-bold text-foreground">
          How to Use the {tool.name}
        </h2>
        <ol className="mt-5 space-y-4">
          {content.howToUse.map((step, index) => (
            <li key={step} className="flex gap-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed text-muted-foreground">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 max-w-4xl">
        <h2 className="text-2xl font-bold text-foreground">
          {content.formula.title}
        </h2>
        <div className="mt-4 rounded-xl border border-border bg-muted/50 p-5">
          <p className="leading-relaxed text-muted-foreground">
            {content.formula.explanation}
          </p>
        </div>
      </section>

      <div className="max-w-4xl">
        <FaqSection faqs={content.faqs} />
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">
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
