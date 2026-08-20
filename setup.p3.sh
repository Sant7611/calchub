# ── Phase 3 · The Calculator Engine ────────────────────────────────────
# No new packages are required — Fuse.js (client search) arrived in Phase 2,
# and Lucide + shadcn/ui were installed in Phase 1.
#
# The interactive calculators themselves — LoanCalculator, MortgageCalculator,
# RoiCalculator, TaxCalculator, BudgetPlanner — already exist in
# src/components/calculators/ as client components. Phase 3 only wires them
# behind ONE dynamic, statically-generated route.

# (optional) shadcn primitives, if you haven't added them yet
npx shadcn@latest add card input label

# Generate every calculator page statically and verify the JSON-LD is emitted
npm run build
