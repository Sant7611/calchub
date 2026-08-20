"use client";

import { ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRegion } from "@/store/useRegionStore";
import { getAllRegions, getRegionConfig, type Region } from "@/config/regions";

// Flag emojis for each region
const REGION_FLAGS: Record<Region, string> = {
  global: "🌍",
  usa: "🇺🇸",
  nepal: "🇳🇵",
  india: "🇮🇳",
  uk: "🇬🇧",
  canada: "🇨🇦",
  australia: "🇦🇺",
};

export function RegionSelector() {
  const { region, setRegion, config } = useRegion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const regions = getAllRegions();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const handleSelect = (regionValue: Region) => {
    setRegion(regionValue);
    setIsOpen(false);
  };

  const flag = REGION_FLAGS[region];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
      >
        <span className="text-lg">{flag}</span>
        <span className="hidden sm:inline">{config.name}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {regions.map(({ value, name }) => {
            const regionFlag = REGION_FLAGS[value];
            const regionConfig = getRegionConfig(value);
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-100 ${
                  region === value ? "bg-indigo-50 text-indigo-700" : "text-slate-700"
                }`}
              >
                <span className="text-lg">{regionFlag}</span>
                <span className="flex-1 text-sm font-medium">{name}</span>
                {region === value && (
                  <Check className="h-4 w-4 text-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
