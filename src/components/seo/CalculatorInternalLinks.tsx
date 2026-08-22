import Link from "next/link";
import { ArrowUpRight, BookOpen, ExternalLink } from "lucide-react";

import { categories, type Tool } from "@/data/categories";
import { getCalculatorInternalLinks } from "@/data/internal-links";
import { resolveToolHref } from "@/lib/tool-routes";
import { CalculatorCard } from "@/components/ui/CalculatorCard";

function findTool(toolSlug: string): { tool: Tool; categorySlug: string } | null {
  for (const category of categories) {
    const tool = category.tools.find((item) => item.slug === toolSlug);
    if (tool) return { tool, categorySlug: category.slug };
  }

  return null;
}

export function RelatedGuides({ toolSlug }: { toolSlug: string }) {
  const guides = getCalculatorInternalLinks(toolSlug).guides ?? [];
  if (guides.length === 0) return null;

  return (
    <section className="mt-8 max-w-4xl" aria-labelledby={`${toolSlug}-guides`}>
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 id={`${toolSlug}-guides`} className="text-lg font-bold text-foreground">
              Learn More
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Read the supporting guide for formulas, examples, terminology and practical context.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-xl border border-border bg-muted/30 p-4 transition hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-foreground group-hover:text-primary">
                  {guide.title}
                </span>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                {guide.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SourceReferences({ toolSlug }: { toolSlug: string }) {
  const sources = getCalculatorInternalLinks(toolSlug).sources ?? [];
  if (sources.length === 0) return null;

  return (
    <section className="mt-12 max-w-4xl" aria-labelledby={`${toolSlug}-sources`}>
      <h2 id={`${toolSlug}-sources`} className="text-2xl font-bold text-foreground">
        Sources &amp; References
      </h2>
      <p className="mt-3 leading-relaxed text-muted-foreground">
        The conversion relationships and official-record guidance on this page are supported by Nepal government sources.
      </p>

      <div className="mt-5 space-y-3">
        {sources.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <span>
              <span className="font-semibold text-foreground group-hover:text-primary">
                {source.name}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {source.description}
              </span>
            </span>
            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
          </a>
        ))}
      </div>

      {toolSlug === "nepal-land-area-converter" ? (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          This calculator is intended for unit conversion and estimation. For legal parcel area, boundaries, registration or disputes, verify the official Lalpurja/cadastral record and the relevant Survey Office.
        </p>
      ) : null}
    </section>
  );
}

export function RelatedCalculators({
  toolSlug,
  fallbackToolSlugs = [],
}: {
  toolSlug: string;
  fallbackToolSlugs?: string[];
}) {
  const configured = getCalculatorInternalLinks(toolSlug).relatedTools ?? [];
  const slugs = configured.length > 0 ? configured : fallbackToolSlugs;

  const related = slugs
    .filter((slug, index) => slug !== toolSlug && slugs.indexOf(slug) === index)
    .map(findTool)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-foreground">Related Calculators</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map(({ tool, categorySlug }) => (
          <CalculatorCard
            key={tool.slug}
            title={tool.name}
            description={tool.description}
            icon={tool.icon}
            href={resolveToolHref(`/tools/${categorySlug}/${tool.slug}`)}
          />
        ))}
      </div>
    </section>
  );
}
