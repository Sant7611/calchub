import { notFound, permanentRedirect } from "next/navigation";

import { categories } from "@/data/categories";

interface LegacyToolPageProps {
  params: Promise<{ slug: string }>;
}

function findTool(slug: string) {
  for (const category of categories) {
    const tool = category.tools.find((item) => item.slug === slug);

    if (tool) {
      return { category, tool };
    }
  }

  return null;
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.tools.map((tool) => ({ slug: tool.slug })),
  );
}

export default async function LegacyToolPage({ params }: LegacyToolPageProps) {
  const { slug } = await params;
  const found = findTool(slug);

  if (!found) {
    notFound();
  }

  permanentRedirect(`/tools/${found.category.slug}/${found.tool.slug}`);
}
