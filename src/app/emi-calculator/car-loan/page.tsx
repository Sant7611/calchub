import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";
export const metadata: Metadata = { title: "Car Loan EMI Calculator - Vehicle Loan Monthly Payment Calculator", description: "Calculate car and vehicle loan EMI using loan amount, interest rate and tenure. Estimate monthly payment, total interest and repayment.", alternates: { canonical: "/emi-calculator/car-loan" }, openGraph: { title: "Car Loan EMI Calculator - Vehicle Loan Monthly Payment Calculator", description: "Estimate car and vehicle loan monthly payment, interest, and repayment." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="car" />; }
