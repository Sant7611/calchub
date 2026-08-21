const PREFERRED_TOOL_PATHS: Record<string, string> = {
  "/tools/finance/tax-calculator": "/finance/tax-calc",
  "/tools/finance/salary-calculator": "/finance/salary-calc",
  "/tools/finance/emi-calculator": "/emi-calculator",
};

/**
 * Resolve internal calculator links to the preferred indexable URL.
 * Other calculator paths pass through unchanged.
 */
export function resolveToolHref(href: string): string {
  return PREFERRED_TOOL_PATHS[href] ?? href;
}
