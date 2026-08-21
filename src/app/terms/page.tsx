import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for OnCalculator.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Acceptance of Terms</h2>
          <p className="mt-2">
            By accessing and using OnCalculator, you accept and agree to be bound by the terms and 
            provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">No Professional Advice</h2>
          <p className="mt-2">
            The calculators on this website are provided for informational and educational purposes only. 
            They do not constitute professional advice. Always consult with a qualified professional 
            before making important decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Accuracy</h2>
          <p className="mt-2">
            While we strive to ensure all calculators are accurate, we make no warranties about the 
            completeness or accuracy of the results. Use at your own discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Limitation of Liability</h2>
          <p className="mt-2">
            OnCalculator shall not be liable for any damages arising from the use or inability to use 
            this website or its calculators.
          </p>
        </section>
      </div>
    </div>
  );
}
