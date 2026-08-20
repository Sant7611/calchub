import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";
export const metadata: Metadata = { title: "Bike Loan EMI Calculator - Two-Wheeler Loan EMI", description: "Calculate bike, motorcycle, scooter, and two-wheeler loan EMI from your amount, interest rate, and tenure.", alternates: { canonical: "/emi-calculator/bike-loan" }, openGraph: { title: "Bike Loan EMI Calculator - Two-Wheeler Loan EMI", description: "Estimate motorcycle, scooter, and bike loan repayments." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="bike" />; }
