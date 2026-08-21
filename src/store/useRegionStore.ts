"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getRegionConfig,
  type Region,
  type RegionConfig,
} from "@/config/regions";

interface RegionStore {
  region: Region;
  setRegion: (region: Region) => void;
}

/**
 * SSR-safe by construction:
 *  - The initial value is always `nepal`, so the server render and the first
 *    client render match — zero hydration mismatches.
 *  - Zustand `persist` rehydrates the saved choice inside useEffect, AFTER
 *    hydration, so a returning user keeps their previously selected region.
 *  - All localStorage access lives inside zustand/persist (wrapped internally).
 */
export const useRegionStore = create<RegionStore>()(
  persist(
    (set) => ({
      region: "nepal",
      setRegion: (region) => set({ region }),
    }),
    { name: "selected-region" },
  ),
);

/** Convenience hook — returns the active region plus its resolved config. */
export function useRegion(): {
  region: Region;
  setRegion: (region: Region) => void;
  config: RegionConfig;
} {
  const region = useRegionStore((state) => state.region);
  const setRegion = useRegionStore((state) => state.setRegion);
  return { region, setRegion, config: getRegionConfig(region) };
}
