import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

// Self-hosted Inter via next/font — zero CLS, no external font request.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Inlined at BUILD time. Missing/empty ⇒ no AdSense script, no ad slots —
// the pre-approval site ships byte-identical to the ad-free version.
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export const metadata: Metadata = {
  metadataBase: new URL("https://oncalculator.app"),
  title: {
    default:
      "OnCalculator — Free Online Calculators for Nepal, India & the US",
    template: "%s – oncalculator.app",
  },
  description:
    "Region-aware calculators for loans, mortgages, tax, BMI and more. Switch between Nepal (NPR), India (INR) and the USA (USD) — every result formatted for your region.",
  keywords: [
    "online calculator",
    "nepal loan calculator",
    "india tax calculator",
    "emi calculator",
    "bmi calculator",
  ],
  openGraph: {
    type: "website",
    siteName: "OnCalculator",
    url: "https://oncalculator.app",
  },
  robots: { index: true, follow: true },
  // Search Console ownership token — server-only env, placeholder until set.
  verification: {
    google:
      process.env.GOOGLE_SITE_VERIFICATION || "YOUR_GOOGLE_VERIFICATION_TOKEN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`flex min-h-screen flex-col bg-background text-foreground antialiased ${inter.className}`}
      >
        {/* AdSense loader — injected ONLY when the publisher ID exists.
            afterInteractive: never competes with the calculators for the
            main thread during first paint. */}
        {adsenseClient && (
          <Script
            id="adsense-loader"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}

        <header className="sticky top-0 z-50">
          <Navbar />
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
