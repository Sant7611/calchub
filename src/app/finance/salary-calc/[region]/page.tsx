import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FinanceCalculatorPage, FINANCE_REGIONS, financePageTitle } from "@/components/finance/FinanceCalculatorPage";
import type { Region } from "@/config/regions";

type Props = { params: Promise<{ region: string }> };
const resolveRegion = (value: string) => FINANCE_REGIONS.includes(value as Exclude<Region, "global">) ? value as Exclude<Region, "global"> : null;
export function generateStaticParams() { return FINANCE_REGIONS.map((region) => ({ region })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const value = resolveRegion((await params).region); if (!value) return { title: "Salary calculator not found", robots: { index: false, follow: false } }; const title = financePageTitle("salary", value); const description = `Estimate ${title.toLowerCase()}, payroll deductions, and take-home pay using regional settings.`; return { title, description, alternates: { canonical: `/finance/salary-calc/${value}` }, openGraph: { title, description }, robots: { index: true, follow: true } }; }
export default async function Page({ params }: Props) { const region = resolveRegion((await params).region); if (!region) notFound(); return <FinanceCalculatorPage kind="salary" region={region} />; }
