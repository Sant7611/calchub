import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";

interface CalloutProps {
  title?: string;
  children: ReactNode;
}

/**
 * Custom MDX component. Authors write:
 *
 *   <Callout title="Worth knowing">
 *     Anything goes here — plain markdown is fine.
 *   </Callout>
 */
export function Callout({ title = "Worth knowing", children }: CalloutProps) {
  return (
    <div className="my-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
        <Lightbulb className="h-4 w-4" />
        {title}
      </p>
      <div className="mt-2 text-sm leading-relaxed text-amber-900/90">
        {children}
      </div>
    </div>
  );
}
