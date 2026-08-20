import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";
export const metadata: Metadata = { title: "Home Loan EMI Calculator - Calculate Monthly Home Loan EMI", description: "Calculate home loan EMI using loan amount, interest rate and tenure. Estimate monthly EMI, total interest, total repayment and amortization.", alternates: { canonical: "/emi-calculator/home-loan" }, openGraph: { title: "Home Loan EMI Calculator - Calculate Monthly Home Loan EMI", description: "Estimate monthly home loan EMI, interest, and repayment." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="home" />; }
