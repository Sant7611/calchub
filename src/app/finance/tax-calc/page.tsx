import type { Metadata } from "next";
import { FinanceCalculatorPage } from "@/components/finance/FinanceCalculatorPage";
export const metadata: Metadata = { title: "Nepal Income Tax Calculator", description: "Estimate Nepal income tax, supported payroll deductions, and take-home income using FY 2083/84 settings.", alternates: { canonical: "/finance/tax-calc" }, openGraph: { title: "Nepal Income Tax Calculator", description: "Estimate Nepal income tax and take-home income." }, robots: { index: true, follow: true } };
export default function Page() { return <FinanceCalculatorPage kind="tax" region="nepal" />; }
