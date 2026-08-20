# ── Phase 6 · Blog / content engine ────────────────────────────────────
# next-mdx-remote — use the RSC build: import from "next-mdx-remote/rsc".
#                   MDX is compiled ON THE SERVER; articles ship as pure HTML.
# gray-matter     — frontmatter parsing for the data layer (src/lib/blog.ts)
npm install next-mdx-remote gray-matter

# Content lives in the repo — content-as-code, no CMS, no backend.
# Adding an article = adding one .mdx file + rebuilding.
mkdir -p src/content/blog
