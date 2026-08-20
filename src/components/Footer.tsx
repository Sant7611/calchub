import Link from "next/link";
import { Calculator } from "lucide-react";

// Server Component — no "use client" needed. Renders static markup
// on the server and ships zero JavaScript to the browser.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calculator className="h-4 w-4 text-primary" />
          <span>© {year} CalcuTools — every answer, no sign-up.</span>
        </p>

        <nav aria-label="Legal" className="flex items-center gap-6 text-sm">
          <Link
            href="/privacy"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Terms
          </Link>
          <Link
            href="/sitemap.xml"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sitemap
          </Link>
        </nav>
      </div>
    </footer>
  );
}
