import type { Faq } from "@/data/calculator-content";

interface FaqSectionProps {
  faqs: Faq[];
}

/**
 * Server Component. Renders accessible, no-JS <details>/<summary> FAQs and
 * injects FAQPage JSON-LD so Google can surface the answers directly.
 */
export function FaqSection({ faqs }: FaqSectionProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h2 className="text-2xl font-bold text-slate-900">
        Frequently Asked Questions
      </h2>

      <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {faqs.map((faq) => (
          <details key={faq.question} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-900 transition-colors hover:text-indigo-600 [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span
                aria-hidden="true"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
