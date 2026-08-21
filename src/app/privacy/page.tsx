import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for OnCalculator — we don't collect or store any personal data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="mt-8 space-y-6 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">No Data Collection</h2>
          <p className="mt-2">
            OnCalculator does not collect, store, or process any personal data. All calculations are performed 
            locally in your browser. We do not use cookies for tracking purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Third-Party Services</h2>
          <p className="mt-2">
            This site may display advertisements served by third-party ad networks. These networks may use 
            cookies to serve relevant ads. We do not have access to or control over these cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
          <p className="mt-2">
            If you have any questions about this privacy policy, please contact us at the email address 
            listed on the website.
          </p>
        </section>
      </div>
    </div>
  );
}
