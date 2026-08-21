import { notFound, permanentRedirect } from "next/navigation";

import { categories } from "@/data/categories";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

export default async function ToolsCategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = categories.find((item) => item.slug === categorySlug);

  if (!category) {
    notFound();
  }

  permanentRedirect(`/categories/${category.slug}`);
}
