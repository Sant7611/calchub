import Link from "next/link";
import { Calculator } from "lucide-react";

// Server Component — static footer with useful internal links.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-foreground"
              aria-label="OnCalculator home"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
                <Calculator
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              </span>

              <span className="text-lg">OnCalculator</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Free online calculators for finance, health, education,
              conversions, dates, taxes, and everyday calculations.
              Get quick answers without signing up.
            </p>
          </div>

          {/* Calculators */}
          <nav aria-labelledby="footer-calculators">
            <h2
              id="footer-calculators"
              className="text-sm font-semibold text-foreground"
            >
              Popular Calculators
            </h2>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/tools/finance/loan-calculator"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Loan Calculator
                </Link>
              </li>

              <li>
                <Link
                  href="/tools/finance/emi-calculator"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  EMI Calculator
                </Link>
              </li>

              <li>
                <Link
                  href="/tools/health/bmi-calculator"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  BMI Calculator
                </Link>
              </li>

              <li>
                <Link
                  href="/tools/finance/sip-calculator"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  SIP Calculator
                </Link>
              </li>
            </ul>
          </nav>

          {/* Site */}
          <nav aria-labelledby="footer-site">
            <h2
              id="footer-site"
              className="text-sm font-semibold text-foreground"
            >
              OnCalculator
            </h2>

            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Terms of Use
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/sitemap.xml"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Sitemap
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} OnCalculator. All rights reserved.</p>

          <p className="text-xs">
            Every answer, no sign-up.
          </p>
        </div>
      </div>
    </footer>
  );
}