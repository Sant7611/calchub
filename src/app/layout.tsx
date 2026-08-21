import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeSelector } from "@/components/ThemeSelector";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const googleVerification =
  process.env.GOOGLE_SITE_VERIFICATION;

const GOOGLE_ANALYTICS_ID = "G-7Y8SKKD9EW";

const SITE_DESCRIPTION =
  "Free online calculators for finance, health, math, date and time, conversions and everyday calculations.";

export const metadata: Metadata = {
  metadataBase: new URL("https://oncalculator.tech"),

  title: {
    default: "OnCalculator - Free Online Calculators",
    template: "%s | OnCalculator",
  },

  description: SITE_DESCRIPTION,

  openGraph: {
    type: "website",
    siteName: "OnCalculator",
    url: "/",
    title: "OnCalculator - Free Online Calculators",
    description: SITE_DESCRIPTION,
  },

  twitter: {
    card: "summary_large_image",
    title: "OnCalculator - Free Online Calculators",
    description: SITE_DESCRIPTION,
  },

  verification: googleVerification
    ? {
        google: googleVerification,
      }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <body
        className={`
          flex
          min-h-screen
          flex-col
          bg-background
          text-foreground
          antialiased
          ${inter.className}
        `}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var savedTheme = localStorage.getItem('oncalculator-theme');
              var preference = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'system';
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var useDark = preference === 'dark' || (preference === 'system' && systemDark);
              document.documentElement.classList.toggle('dark', useDark);
              document.documentElement.dataset.theme = preference;
              document.documentElement.style.colorScheme = useDark ? 'dark' : 'light';
            } catch (error) {
              var fallbackDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              document.documentElement.classList.toggle('dark', fallbackDark);
              document.documentElement.style.colorScheme = fallbackDark ? 'dark' : 'light';
            }
          `}
        </Script>

        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>

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

        <main
          className="
            mx-auto
            w-full
            max-w-7xl
            flex-1
            px-4
            py-10
            sm:px-6
            lg:px-8
          "
        >
          {children}
        </main>

        <Footer />
        <ThemeSelector />
      </body>
    </html>
  );
}
