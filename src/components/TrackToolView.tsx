"use client";

import { useEffect } from "react";
import { addRecentTool } from "@/lib/recently-used";

interface TrackToolViewProps {
  slug: string;
}

/**
 * Tracks when a tool is viewed by adding it to the recently used list.
 * This is a client component that runs on mount.
 */
export function TrackToolView({ slug }: TrackToolViewProps) {
  useEffect(() => {
    addRecentTool(slug);
  }, [slug]);

  return null;
}
