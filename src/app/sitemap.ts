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
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/tools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/finance`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/finance/tax-calc`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/finance/salary-calc`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/categories/${category.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const toolRoutes: MetadataRoute.Sitemap = categories.flatMap((category) =>
    category.tools
      .filter((tool) => !LEGACY_REDIRECT_TOOL_SLUGS.has(tool.slug))
      .map((tool) => ({
        url: `${BASE_URL}/tools/${category.slug}/${tool.slug}`,
        changeFrequency: "monthly",
        priority: 0.8,
      })),
  );

  const regionalFinanceRoutes: MetadataRoute.Sitemap = FINANCE_REGIONS.flatMap(
    (region) => [
      {
        url: `${BASE_URL}/finance/tax-calc/${region}`,
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/finance/salary-calc/${region}`,
        changeFrequency: "monthly",
        priority: 0.8,
      },
    ],
  );

  const emiRoutes: MetadataRoute.Sitemap = EMI_ROUTES.map((path) => ({
    url: `${BASE_URL}/emi-calculator${path}`,
    changeFrequency: "monthly",
    priority: path ? 0.8 : 0.9,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
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
