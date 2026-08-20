"use client";

import { useEffect, useRef } from "react";

// Augment Window once, strictly — no `any` leaks.
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  /** Ad unit slot ID from AdSense. Omit to let Google pick an auto unit. */
  slot?: string;
  className?: string;
}

/**
 * Responsive AdSense unit.
 *
 * Renders NOTHING unless NEXT_PUBLIC_ADSENSE_CLIENT is set at build time.
 * Before approval the site is pixel-identical to the ad-free version:
 * zero layout shift, zero failed requests, zero console errors.
 */
export function AdBanner({ slot, className = "" }: AdBannerProps) {
  // Inlined at build time — changing it requires a redeploy (documented).
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pushed = useRef(false);

  useEffect(() => {
    // The loader script is injected once in layout.tsx (afterInteractive),
    // so it may land a tick after this effect — guard both directions.
    if (!client || pushed.current) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushed.current = true;
    } catch (error) {
      // An ad must never break a calculator.
      console.warn("AdSense request skipped:", error);
    }
  }, [client]);

  // Env missing or empty → the component simply does not exist.
  if (!client) return null;

  return (
    <ins
      className={`adsbygoogle block min-h-[90px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${className}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-format="auto"
      data-full-width-responsive="true"
      {...(slot ? { "data-ad-slot": slot } : {})}
    />
  );
}
