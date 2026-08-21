import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { categories } from "@/data/categories";
import { CalculatorCard } from "@/components/ui/CalculatorCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

interface CategoryContent {
  title: string;
  description: string;
  intro: string[];
}

const categoryContent: Record<string, CategoryContent> = {
  finance: {
    title: "Finance Calculators – Loans, Tax, EMI & Investing",
    description:
      "Free finance calculators for loans, mortgages, EMI, salary, tax, budgeting, SIP investing and NEPSE share transactions with clear result breakdowns.",
    intro: [
      "Explore finance calculators for borrowing, income, budgeting and investing. Compare loan and mortgage payments, estimate EMI, review salary and tax results, plan a monthly budget and project investment growth.",
      "You can also calculate SIP returns and estimate NEPSE share transaction profit or loss. Choose a tool below, enter your own values and compare different financial scenarios.",
    ],
  },

  others: {
    title: "Other Calculators & Utilities – Grades & World Time",
    description:
      "Explore practical calculators and utilities including grade and GPA tools plus a world clock for comparing current times across major cities.",
    intro: [
      "This collection brings together useful tools that do not fit into the main finance, health, math or conversion categories. Use the Grade Calculator for averages, weighted grades, final-exam targets and GPA calculations.",
      "The World Clock helps you compare current local times and dates across cities and time zones, making it useful for study, travel, remote work and international communication.",
    ],
  },

  health: {
    title: "Health Calculators – BMI & Daily Calorie Needs",
    description:
      "Use free health calculators to estimate BMI, healthy weight range, BMR, daily calorie needs and goal-based energy intake using common formulas.",
    intro: [
      "Use these health calculators to understand common body-weight and energy estimates from the information you enter. The BMI Calculator works with metric or imperial units and shows BMI, category and an estimated healthy weight range.",
      "The Calorie Calculator estimates BMR and daily energy needs from age, body measurements, activity level and your selected weight goal. These tools provide estimates and are not a substitute for medical advice.",
    ],
  },

  math: {
    title: "Math Calculators – Scientific, Interest & Age Tools",
    description:
      "Use free math calculators for scientific functions, compound interest projections and exact age calculations in years, months and days.",
    intro: [
      "Explore math tools for advanced calculations, growth projections and date-based arithmetic. The Scientific Calculator supports common arithmetic, trigonometric, logarithmic, exponential and other advanced functions.",
      "You can also project compound-interest growth with recurring contributions or calculate an exact age in years, months and days together with additional birthday information.",
    ],
  },

  converters: {
    title: "Online Converters – Length, Temperature, Currency & Dates",
    description:
      "Convert length, temperature, currencies and dates between Gregorian AD and Nepali Bikram Sambat BS with fast online conversion tools.",
    intro: [
      "Use these online converters to move between common measurement, temperature, currency and calendar formats. Convert length across metric and imperial units or switch between Celsius, Fahrenheit and Kelvin.",
      "The collection also includes currency conversion and a Nepali Date Converter for AD-to-BS, BS-to-AD and date-difference calculations.",
    ],
  },

  business: {
    title: "Business Calculators – ROI & Investment Returns",
    description:
      "Use business calculators to measure return on investment, net profit or loss, investment multiple and annualized ROI from your costs and returns.",
    intro: [
      "Use business calculators to evaluate the financial outcome of an investment or project using your own costs and returns. The ROI Calculator combines the initial investment, additional costs, final value and extra income received.",
      "Review net profit or loss, ROI percentage, investment multiple and annualized return to compare outcomes across different investment scenarios.",
    ],
  },
};

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find(
    (item) => item.slug === slug,
  );

  if (!category) {
    return {
      title: "Category not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const content = categoryContent[category.slug];
  const title =
    content?.title ?? `${category.name} Calculators`;
  const description =
    content?.description ??
    `Browse free online ${category.name.toLowerCase()} calculators and tools.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find(
    (item) => item.slug === slug,
  );

  if (!category) {
    notFound();
  }

  const content = categoryContent[category.slug];

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

        <div className="mt-4 max-w-3xl space-y-4 text-lg leading-relaxed text-slate-600">
          {(content?.intro ?? [
            `Browse all ${category.name.toLowerCase()} tools below. Choose a calculator to get started.`,
          ]).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
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
