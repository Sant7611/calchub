import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";
export const metadata: Metadata = { title: "Education Loan EMI Calculator - Student Loan Repayment", description: "Estimate education and student loan EMI, total interest, and monthly repayment using amount, APR, and tenure.", alternates: { canonical: "/emi-calculator/education-loan" }, openGraph: { title: "Education Loan EMI Calculator - Student Loan Repayment", description: "Estimate education loan monthly repayment and total interest." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="education" />; }
