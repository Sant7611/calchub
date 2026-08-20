import type { Metadata } from "next";
import { FinanceCalculatorPage } from "@/components/finance/FinanceCalculatorPage";
export const metadata: Metadata = { title: "Nepal Salary & Take-Home Pay Calculator", description: "Estimate Nepal salary tax, payroll deductions, and take-home pay using FY 2083/84 settings.", alternates: { canonical: "/finance/salary-calc" }, openGraph: { title: "Nepal Salary & Take-Home Pay Calculator", description: "Estimate Nepal salary tax and take-home pay." }, robots: { index: true, follow: true } };
export default function Page() { return <FinanceCalculatorPage kind="salary" region="nepal" />; }
