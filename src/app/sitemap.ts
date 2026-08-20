import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { getPosts } from "@/lib/blog";

// Supersedes the Phase 4 sitemap — every article now joins automatically.
const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://oncalculator.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    // NEW in Phase 6
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/tools?category=${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const toolRoutes: MetadataRoute.Sitemap = categories.flatMap((category) =>
    category.tools.map((tool) => ({
      url: `${BASE_URL}/tools/${category.slug}/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  );

  // NEW in Phase 6 — one URL per MDX article, dated from its frontmatter.
  const blogRoutes: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...toolRoutes, ...blogRoutes];
}
