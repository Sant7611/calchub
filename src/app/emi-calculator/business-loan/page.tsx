import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";
export const metadata: Metadata = { title: "Business Loan EMI Calculator - Calculate Monthly Repayment", description: "Calculate business loan EMI, monthly repayment, total interest, and total repayment from the loan amount, APR, and tenure.", alternates: { canonical: "/emi-calculator/business-loan" }, openGraph: { title: "Business Loan EMI Calculator - Calculate Monthly Repayment", description: "Estimate business financing monthly repayment and total interest." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="business" />; }
