import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";
export const metadata: Metadata = { title: "Personal Loan EMI Calculator - Calculate Monthly EMI", description: "Calculate personal loan monthly EMI, total interest, and repayment from the amount, APR, and tenure.", alternates: { canonical: "/emi-calculator/personal-loan" }, openGraph: { title: "Personal Loan EMI Calculator - Calculate Monthly EMI", description: "Estimate personal loan EMI, interest, and repayment." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="personal" />; }
