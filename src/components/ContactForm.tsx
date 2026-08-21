"use client";

import { type FormEvent, useState } from "react";

const RECIPIENT = "webluvsme@gmail.com";

export function ContactForm() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [pageUrl, setPageUrl] = useState("");

  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = [
      name.trim() ? `Name: ${name.trim()}` : "",

      `Email: ${email.trim()}`,

      pageUrl.trim() ? `Related calculator/page: ${pageUrl.trim()}` : "",

      "",

      "Message:",

      message.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const subject = pageUrl.trim()
      ? "OnCalculator - Calculator Feedback"
      : "OnCalculator - Contact Message";

    const params = new URLSearchParams({
      view: "cm",
      fs: "1",
      to: RECIPIENT,
      su: subject,
      body,
    });

    const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;

    window.location.assign(gmailUrl);
  }

  return (
    <section
      aria-labelledby="contact-heading"
      className="
        mx-auto
        w-full
        max-w-2xl
      "
    >
      {/* ──────────────────────────────────────────────
          SEO-friendly intro
      ────────────────────────────────────────────── */}

      <div>
        <p
          className="
          text-xs
          font-semibold
          uppercase
          tracking-[0.16em]
          text-indigo-600
        "
        >
          Contact OnCalculator
        </p>

        <h2
          id="contact-heading"
          className="
            mt-2
            text-2xl
            font-bold
            tracking-tight
            text-slate-900
            sm:text-3xl
          "
        >
          Questions, Feedback or Calculator Suggestions?
        </h2>

        <p
          className="
          mt-3
          max-w-xl
          text-sm
          leading-6
          text-slate-600
        "
        >
          Found an issue with a calculator, noticed incorrect information, have
          a new calculator idea, or simply want to send feedback? Send us a
          message and include the related calculator page when relevant.
        </p>
      </div>

      {/* ──────────────────────────────────────────────
          Contact Form
      ────────────────────────────────────────────── */}

      <form
        onSubmit={handleSubmit}
        className="
          mt-7
          space-y-5
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          sm:p-6
        "
      >
        {/* Name + Email */}

        <div
          className="
          grid
          gap-5
          sm:grid-cols-2
        "
        >
          <FormField label="Your name" optional>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              placeholder="Your name"
              className={inputClass}
            />
          </FormField>

          <FormField label="Your email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              required
              className={inputClass}
            />
          </FormField>
        </div>

        {/* Related page */}

        <FormField
          label="Related calculator or page"
          optional
          hint="Add the page URL if your message is about a specific calculator."
        >
          <input
            type="url"
            value={pageUrl}
            onChange={(event) => setPageUrl(event.target.value)}
            placeholder="https://oncalculator.tech/tools/..."
            className={inputClass}
          />
        </FormField>

        {/* Message */}

        <FormField
          label="Message"
          hint="For calculation issues, include the values you entered and the result you expected."
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            minLength={10}
            maxLength={3000}
            rows={6}
            placeholder="How can we help?"
            className={`
              ${inputClass}
              min-h-35
              resize-y
            `}
          />

          <div
            className="
            mt-1
            flex
            justify-end
          "
          >
            <span
              className="
              text-[10px]
              text-slate-400
            "
            >
              {message.length}/3000
            </span>
          </div>
        </FormField>

        {/* Submit */}

        <div
          className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
        >
          <button
            type="submit"
            className="
    inline-flex
    min-h-11
    items-center
    justify-center
    rounded-xl
    bg-indigo-600
    px-5
    py-2.5
    text-sm
    font-semibold
    text-white
    shadow-sm
    transition
    hover:bg-indigo-700
    focus-visible:outline-none
    focus-visible:ring-4
    focus-visible:ring-indigo-500/20
    active:translate-y-px
  "
          >
            Continue to Gmail
          </button>

          <p
            className="
            text-xs
            leading-5
            text-slate-500
          "
          >
            Or email{" "}
            <a
              href={`mailto:${RECIPIENT}`}
              className="
                font-medium
                text-indigo-600
                hover:text-indigo-700
                hover:underline
              "
            >
              {RECIPIENT}
            </a>
          </p>
        </div>
      </form>

      {/* ──────────────────────────────────────────────
          Lightweight SEO/supporting content
      ────────────────────────────────────────────── */}

      <div
        className="
        mt-6
        grid
        gap-3
        sm:grid-cols-3
      "
      >
        <ContactReason
          title="Report an Issue"
          text="Tell us if a calculator gives an unexpected result or does not work correctly."
        />

        <ContactReason
          title="Suggest a Calculator"
          text="Have an idea for a useful calculator? Send us your suggestion."
        />

        <ContactReason
          title="Correct Content"
          text="Let us know if calculator information, formulas or explanations need correction."
        />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Shared styles
────────────────────────────────────────────────────────── */

const inputClass = `
  w-full
  rounded-xl
  border
  border-slate-300
  bg-white
  px-3.5
  py-2.5
  text-sm
  font-normal
  text-slate-900
  outline-none
  transition
  placeholder:text-slate-400
  hover:border-slate-400
  focus:border-indigo-500
  focus:ring-4
  focus:ring-indigo-500/10
`;

/* ──────────────────────────────────────────────────────────
   Form Field
────────────────────────────────────────────────────────── */

function FormField({
  label,
  hint,
  optional = false,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span
        className="
        flex
        items-center
        gap-1.5
        text-sm
        font-semibold
        text-slate-800
      "
      >
        {label}

        {optional && (
          <span
            className="
            text-[10px]
            font-normal
            text-slate-400
          "
          >
            optional
          </span>
        )}
      </span>

      {hint && (
        <span
          className="
          mt-1
          block
          text-[11px]
          leading-5
          text-slate-500
        "
        >
          {hint}
        </span>
      )}

      <span
        className="
        mt-2
        block
      "
      >
        {children}
      </span>
    </label>
  );
}

/* ──────────────────────────────────────────────────────────
   Contact Reason
────────────────────────────────────────────────────────── */

function ContactReason({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-4
    "
    >
      <h3
        className="
        text-xs
        font-bold
        text-slate-800
      "
      >
        {title}
      </h3>

      <p
        className="
        mt-1.5
        text-[11px]
        leading-5
        text-slate-500
      "
      >
        {text}
      </p>
    </div>
  );
}
