# 🧮 OnCalculator — [oncalculator.tech](https://oncalculator.tech)

**Fast, accurate, and free online calculators** for finance, health, math, converters, and business — with multi-region support (🇳🇵 Nepal default, 🇮🇳 India, 🇺 USA).

Built with **Next.js (App Router)**, fully frontend-first, SEO-optimized, and ready for monetization.

---

## ✨ Features

- **50+ scalable calculator slots** organized into 5 categories (Finance, Health, Math, Converters, Business)
- **Multi-region engine** — currency symbols, lakh-style number formatting, default interest rates, and country-specific tax brackets (Nepal / India / USA), persisted per user
- **Instant fuzzy search** across all tools (Fuse.js)
- **SEO-first architecture** — Server Components, static generation, dynamic metadata, `sitemap.ts`, `robots.ts`
- **Rich results ready** — `FAQPage`, `BreadcrumbList`, and `BlogPosting` JSON-LD schemas
- **Recently Used** history via `localStorage` (no backend required)
- **MDX blog engine** — content-as-code with automatic reading time and calculator CTAs
- **AdSense-ready** — conditional, env-driven ad integration (renders nothing until approved)
- **Legal pages included** — About, Privacy, Terms, Contact (AdSense approval ready)

---

## 🛠️ Tech Stack

| Layer        | Technology |
| ------------ | ---------- |
| Framework    | Next.js 14+ (App Router) |
| Language     | TypeScript (strict) |
| Styling      | Tailwind CSS + shadcn/ui |
| Icons        | Lucide React |
| Search       | Fuse.js |
| State        | Zustand (persisted region store) |
| Blog         | next-mdx-remote (RSC) + gray-matter |
| Deployment   | Vercel + custom domain (`oncalculator.tech`) |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, global metadata, AdSense script
│   ├── page.tsx                # Homepage (hero, popular tools, categories)
│   ├── sitemap.ts              # Auto-generated sitemap (tools + blog)
│   ├── robots.ts               # Crawler rules
│   ├── not-found.tsx           # Custom 404
│   ├── about|privacy|terms|contact/
│   ├── tools/
│   │   ├── page.tsx            # All Tools directory + Fuse.js search
│   │   └── [category]/[slug]/
│   │       ├── page.tsx        # Dynamic calculator page (SEO wrapper + tool)
│   │       └── loading.tsx     # Skeleton loader
│   └── blog/
│       ├── page.tsx            # Blog listing
│       └── [slug]/page.tsx     # MDX article page
├── components/
│   ├── Navbar.tsx              # Sticky nav + categories dropdown + region selector
│   ├── Footer.tsx
│   ├── CalculatorCard.tsx
│   ├── ToolsSearchGrid.tsx     # Client-side Fuse.js filtering
│   ├── RegionSelector.tsx      # 🇳 / 🇮🇳 / 🇺🇸 switcher
│   ├── RecentlyUsed.tsx
│   ├── TrackToolView.tsx
│   ├── AdBanner.tsx            # Conditional AdSense unit
│   ├── seo/                    # Breadcrumbs + FaqSection (JSON-LD)
│   ├── blog/                   # BlogCard + CtaBox
│   └── calculators/
│       ├── registry.ts         # slug → component mapping
│       ├── finance.tsx         # Loan, Mortgage, ROI, Tax, Budget
│       └── ui.tsx              # CalcGrid, NumInput, ResultPanel, StackBar...
├── config/regions.ts           # Region definitions (currency, rates, tax brackets)
├── data/
│   ├── categories.ts           # Single source of truth for all tools
│   └── calculator-content.ts   # Per-tool SEO content (intro, steps, formula, FAQs)
├── lib/
│   ├── utils.ts                # num / fmt / money helpers
│   ├── format.ts               # Region-aware formatters
│   ├── recent.ts               # localStorage history helpers
│   └── blog.ts                 # MDX data layer
├── store/useRegionStore.ts     # Zustand persisted region (default: nepal)
└── content/blog/*.mdx          # Blog articles (content-as-code)
```

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18.17+

```bash
# 1. Clone & install
git clone <your-repo-url>
cd oncalculator
npm install

# 2. Run locally
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build && npm start
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_BASE_URL=https://oncalculator.tech
NEXT_PUBLIC_ADSENSE_CLIENT=          # e.g. ca-pub-XXXX (leave empty until approved)
NEXT_PUBLIC_ADSENSE_SLOT=            # optional ad slot ID
```

> If `NEXT_PUBLIC_ADSENSE_CLIENT` is empty, no ad code is rendered at all.

---

## ➕ Adding a New Calculator (4 steps)

1. **Build the component** in `src/components/calculators/` (mark it `"use client"`).
2. **Register it** in `src/components/calculators/registry.ts`:
   ```ts
   "compound-interest-calculator": CompoundInterestCalculator,
   ```
3. **Add the tool** to `src/data/categories.ts` (name, slug, description, icon, `popular?`).
4. **Add SEO content** to `src/data/calculator-content.ts` (intro, how-to steps, formula, FAQs).

✅ Done. The page, breadcrumbs, FAQs, sitemap, search index, and related-tools grid all update automatically.

---

## 🌍 Adding a New Country (1 step)

Add one entry to `src/config/regions.ts`:

```ts
australia: {
  label: "Australia", flag: "🇦🇺",
  currency: "AUD", symbol: "$", locale: "en-AU",
  defaultInterestRate: 7.2,
  taxYear: "2025-26", taxBrackets: [ ... ],
}
```

✅ The selector dropdown, formatters, default rates, and tax logic update automatically.

---

## ✍️ Adding a Blog Post (1 step)

Drop an `.mdx` file into `src/content/blog/` with frontmatter:

```mdx
---
title: "How to Calculate EMI for a Car Loan in Nepal"
date: "2026-08-20"
excerpt: "A simple guide with worked examples."
category: "Finance"
tags: ["emi", "loan", "nepal"]
relatedToolSlug: "loan-calculator"
---
Your markdown content here...
```

✅ Appears in `/blog`, the homepage "Latest Guides", and the sitemap — with a CTA box linking to the related calculator.

---

## 🔍 SEO Architecture

- **Static generation** for every tool & blog page (`generateStaticParams`)
- **Dynamic metadata** per page, including region-aware titles (`?region=india`)
- **JSON-LD schemas:** `FAQPage`, `BreadcrumbList`, `BlogPosting`
- **Auto sitemap & robots** from the data layer
- **Server Components** for all content; `"use client"` only for interactivity

---

## 🚢 Deployment (Vercel)

1. Push to GitHub → import in [vercel.com](https://vercel.com) (auto-detects Next.js).
2. Add env variables in Vercel project settings.
3. Connect domain `oncalculator.tech` and set DNS at your registrar:

| Type  | Name | Value |
| ----- | ---- | ----- |
| A     | `@`  | `76.76.21.21` |
| CNAME | `www`| `cname.vercel-dns.com` |

4. HTTPS is provisioned automatically. See `DEPLOYMENT.md` for the full checklist.

---

## 💰 Monetization

- **Google AdSense** — integration is already wired; apply once the site is live with content, then set `NEXT_PUBLIC_ADSENSE_CLIENT` and redeploy.
- Ad slots are placed policy-safe (below the tool, after FAQs).

---

## 🗺️ Roadmap (Post-Launch)

- [ ] User accounts & synced history (Supabase)
- [ ] More countries in `regions.ts`
- [ ] Dark mode
- [ ] PWA install prompt
- [ ] Analytics dashboard

---

## ⚠️ Disclaimer

All calculators provide **estimates only** and are not financial, medical, or legal advice. Tax brackets and default rates are sample values — verify yearly.

---

## 📄 License

MIT — free to use and modify.