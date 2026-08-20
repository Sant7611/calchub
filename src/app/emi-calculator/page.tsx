import type { Metadata } from "next";
import { EmiSeoPage } from "@/components/emi/EmiSeoPage";

export const metadata: Metadata = { title: "EMI Calculator - Home, Car, Personal & Vehicle Loan EMI", description: "Calculate EMI for home, car, vehicle, bike, personal, education, and business loans. Estimate monthly payment, interest, and total repayment.", alternates: { canonical: "/emi-calculator" }, openGraph: { title: "EMI Calculator - Home, Car, Personal & Vehicle Loan EMI", description: "Estimate EMI, total interest, and repayment for common loan types." }, robots: { index: true, follow: true } };
export default function Page() { return <EmiSeoPage loanType="general" />; }
