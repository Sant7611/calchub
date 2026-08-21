import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { getPosts } from "@/lib/blog";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://oncalculator.app";

const FINANCE_REGIONS = [
  "nepal",
  "india",
  "usa",
  "uk",
  "canada",
  "australia",
];

const EMI_ROUTES = [
  "",
  "/home-loan",
  "/car-loan",
  "/personal-loan",
  "/education-loan",
  "/business-loan",
  "/bike-loan",
];

const LEGACY_REDIRECT_TOOL_SLUGS = new Set([
  "tax-calculator",
  "salary-calculator",
  "emi-calculator",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/finance`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/finance/tax-calc`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/finance/salary-calc`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const toolRoutes: MetadataRoute.Sitemap = categories.flatMap((category) =>
    category.tools
      .filter((tool) => !LEGACY_REDIRECT_TOOL_SLUGS.has(tool.slug))
      .map((tool) => ({
      url: `${BASE_URL}/tools/${category.slug}/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
      })),
  );

  const regionalFinanceRoutes: MetadataRoute.Sitemap = FINANCE_REGIONS.flatMap(
    (region) => [
      {
        url: `${BASE_URL}/finance/tax-calc/${region}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/finance/salary-calc/${region}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ],
  );

  const emiRoutes: MetadataRoute.Sitemap = EMI_ROUTES.map((path) => ({
    url: `${BASE_URL}/emi-calculator${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path ? 0.8 : 0.9,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...toolRoutes,
    ...regionalFinanceRoutes,
    ...emiRoutes,
    ...blogRoutes,
  ];
}
