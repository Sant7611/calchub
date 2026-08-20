const KEY = "calcu-recent-tools";
const CAP = 6;

/** Front-insert, dedupe, cap at 6. Never throws — storage can be unavailable. */
export function addRecentTool(slug: string): void {
  try {
    const current = getRecentTools();
    const next = [slug, ...current.filter((s) => s !== slug)].slice(0, CAP);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota — history is a nicety, not a requirement */
  }
}

export function getRecentTools(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function clearRecentTools(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
