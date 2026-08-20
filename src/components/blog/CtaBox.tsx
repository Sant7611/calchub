import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { categories, type Tool } from "@/data/categories";

interface CtaBoxProps {
  toolSlug: string;
}

/** The traffic flywheel — resolves relatedToolSlug against categories.ts. */
function findTool(toolSlug: string): { tool: Tool; categorySlug: string } | null {
  for (const category of categories) {
    const tool = category.tools.find((t) => t.slug === toolSlug);
    if (tool) return { tool, categorySlug: category.slug };
  }
  return null;
}

export function CtaBox({ toolSlug }: CtaBoxProps) {
  const found = findTool(toolSlug);
  if (!found) return null;

  const { tool, categorySlug } = found;

  return (
    <aside className="mt-12 overflow-hidden rounded-2xl bg-indigo-600 text-white shadow-lg">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
            <tool.icon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-indigo-200 uppercase">
              Try it yourself
            </p>
            <h3 className="mt-1 text-lg font-bold">{tool.name}</h3>
            <p className="mt-1 text-sm leading-relaxed text-indigo-100">
              {tool.description}
            </p>
          </div>
        </div>

        <Link
          href={`/tools/${categorySlug}/${tool.slug}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          Open calculator
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
