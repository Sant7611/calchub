import { permanentRedirect } from "next/navigation";

/** Legacy EMI tool URL. Keep bookmarks and search results on the canonical hub. */
export default function LegacyEmiCalculatorPage() {
  permanentRedirect("/emi-calculator");
}
