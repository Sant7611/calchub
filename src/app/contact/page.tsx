import type { Metadata } from "next";

import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact OnCalculator",
  description:
    "Contact OnCalculator to report a calculator issue, suggest a tool, or share feedback.",
  alternates: { canonical: "/contact" },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
        Contact OnCalculator
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        Help improve OnCalculator
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        Report a calculation issue, suggest a tool, or share feedback. We will
        open a Gmail draft addressed to our team with your details prefilled.
      </p>

      <ContactForm />
    </main>
  );
}
