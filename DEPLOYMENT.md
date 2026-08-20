# Deployment Guide — oncalculator.app

A beginner-friendly, copy-and-run path from your laptop to a live,
monetization-ready site. No step assumes prior Vercel or DNS experience.

---

## 1 · Pre-deployment QA checklist

Run these **before** you push. If any box fails, fix it first — deploying a
broken build wastes a review cycle later.

- [ ] `npm run build` completes with **zero type errors and zero warnings**.
- [ ] Region switcher works for all three regions — verify currency symbol
      (`Rs.` / `₹` / `$`), number grouping (`1,00,000` vs `100,000`), default
      interest rate (11 / 8.5 / 6.5) and tax slabs.
- [ ] Search on `/tools`: empty query → grouped by category; typed query →
      flat results; nonsense query → friendly empty state.
- [ ] "Recently Used": open a calculator, go home — the rail appears;
      reload the page — it survives (localStorage); cap of 6 respected.
- [ ] Mobile pass at 390 px: navbar hamburger, region selector, every
      calculator, both ad-slot positions (render nothing without the env).
- [ ] `NEXT_PUBLIC_ADSENSE_CLIENT` **unset** → view page source and confirm
      the string `adsbygoogle` appears nowhere in the DOM.
- [ ] Legal pages load: `/about`, `/privacy`, `/terms`, `/contact`.

## 2 · Push to GitHub

```bash
git init
git add .
git commit -m "feat: oncalculator.app — launch build"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/oncalculator.git
git push -u origin main
```

The `.gitignore` already excludes `node_modules/`, `.next/`, `out/` and
`.env*.local` — **verify with `git status` before committing** that no
`.env.local` appears.

## 3 · Import into Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
2. Import the `oncalculator` GitHub repo.
3. Framework preset auto-detects **Next.js**. Leave `npm run build` and the
   `src` directory defaults as-is.
4. Open **Environment Variables** and add:

   | Key | Value | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_ADSENSE_CLIENT` | *(leave empty for now)* | set after AdSense approval |
   | `NEXT_PUBLIC_AD_SLOT_AFTER_CALCULATOR` | *(empty for now)* | from your AdSense unit |
   | `NEXT_PUBLIC_AD_SLOT_PAGE_BOTTOM` | *(empty for now)* | from your AdSense unit |
   | `NEXT_PUBLIC_BASE_URL` | `https://oncalculator.app` | used by sitemap + JSON-LD |
   | `GOOGLE_SITE_VERIFICATION` | token from Search Console | server-only, no `NEXT_PUBLIC_` |

   > `NEXT_PUBLIC_*` values are baked in at **build time**. Changing one
   > always requires a redeploy.

5. Click **Deploy**. In ~2 minutes you have `https://oncalculator.vercel.app`.

## 4 · Connect oncalculator.app

In Vercel: **Project → Settings → Domains → Add** `oncalculator.app`.

Then, at your domain registrar's DNS console, create exactly two records:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| `A` | `@` | `76.76.21.21` | Auto |
| `CNAME` | `www` | `cname.vercel-dns.com` | Auto |

- Vercel provisions the **HTTPS/SSL certificate automatically** — usually
  within a few minutes of DNS propagating. Do not buy a separate cert.
- DNS can take up to 24–48 h globally, though it is usually under an hour.
- Vercel auto-redirects `www` → apex (or configure your preference under
  Domains).

## 5 · Post-deployment checks

- [ ] Visit `https://oncalculator.app` — home renders, no console errors
      (DevTools → Console, filter: Errors).
- [ ] `https://oncalculator.app/sitemap.xml` lists home, `/tools`, every
      category and every calculator URL.
- [ ] `https://oncalculator.app/robots.txt` contains `Allow: /` and the
      sitemap line.
- [ ] Open one calculator with `?region=india` — the title reads
      "… for India (INR) – oncalculator.app".
- [ ] Submit the sitemap in **Google Search Console**
      (property → Sitemaps → `/sitemap.xml`) and verify ownership via the
      `GOOGLE_SITE_VERIFICATION` token already in your metadata.

## 6 · Google AdSense — application checklist

### Already satisfied by this build
- [x] Original, substantive content on 20+ pages (10 calculators × authored
      intro, how-to, formula and FAQ sections).
- [x] Required policy pages: `/privacy` (mentions on-device localStorage
      history, no server-stored personal data, future third-party ads and
      cookies), `/about`, `/terms`, `/contact`.
- [x] Working navigation, no placeholder copy, clean mobile experience.

### When to apply
**Only after** the site is live at `https://oncalculator.app` with a valid
certificate. AdSense rejects `*.vercel.app` preview hosts and localhost.

### How to apply
1. Go to [adsense.google.com](https://adsense.google.com) → sign in →
   **Sites → Add site** → enter `oncalculator.app`.
2. AdSense gives you a verification snippet — paste it into
   `src/app/layout.tsx` inside `<head>` (or keep using the conditional
   loader once you have a client ID), redeploy.
3. Submit for review.

### What to expect
- Review takes **a few days to ~2 weeks**.
- Until approval, ad slots render blank — **this is exactly how this build
  is designed to behave**. With the env variable empty there is no ad
  markup at all, so nothing breaks and nothing shifts layout.

### After approval
1. Copy your publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
2. In AdSense, create **two responsive display units** and copy their slot
   IDs.
3. In Vercel → Settings → Environment Variables, set:
   - `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX`
   - `NEXT_PUBLIC_AD_SLOT_AFTER_CALCULATOR=<slot 1>`
   - `NEXT_PUBLIC_AD_SLOT_PAGE_BOTTOM=<slot 2>`
4. **Redeploy** (`git push` or Vercel → Deployments → Redeploy).
5. Ads appear in the two slots on every calculator page — never above the
   H1, never inside calculator inputs.

---

*Last verified against Next.js 14 App Router, Vercel DNS and AdSense
policies. Sample tax brackets and rates in `src/config/regions.ts` are
illustrative — verify and update yearly.*
