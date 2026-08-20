"use client";

import { useState, useMemo, useEffect } from "react";
import { Field, Stat, StatGrid } from "./shared";
import { useRegion } from "@/store/useRegionStore";
import { getRegionConfig, type Region } from "@/config/regions";

/**
 * World Clock / Time Zone Converter with multi-region support.
 * Features:
 * - Kathmandu, Delhi, London, New York, Toronto, Sydney and other regional cities
 * - Uses selected region as default timezone
 * - Regional date formatting
 * - Live clock updates
 */

interface TimeZoneInfo {
  id: string;
  city: string;
  timezone: string;
  region?: Region;
}

const TIMEZONES: TimeZoneInfo[] = [
  // Regional cities from requirements
  { id: "kathmandu", city: "Kathmandu", timezone: "Asia/Kathmandu", region: "nepal" },
  { id: "delhi", city: "Delhi", timezone: "Asia/Kolkata", region: "india" },
  { id: "london", city: "London", timezone: "Europe/London", region: "uk" },
  { id: "new-york", city: "New York", timezone: "America/New_York", region: "usa" },
  { id: "toronto", city: "Toronto", timezone: "America/Toronto", region: "canada" },
  { id: "sydney", city: "Sydney", timezone: "Australia/Sydney", region: "australia" },
  // Additional major cities
  { id: "utc", city: "UTC", timezone: "UTC" },
  { id: "tokyo", city: "Tokyo", timezone: "Asia/Tokyo" },
  { id: "singapore", city: "Singapore", timezone: "Asia/Singapore" },
  { id: "dubai", city: "Dubai", timezone: "Asia/Dubai" },
  { id: "paris", city: "Paris", timezone: "Europe/Paris" },
  { id: "berlin", city: "Berlin", timezone: "Europe/Berlin" },
  { id: "los-angeles", city: "Los Angeles", timezone: "America/Los_Angeles" },
  { id: "chicago", city: "Chicago", timezone: "America/Chicago" },
  { id: "vancouver", city: "Vancouver", timezone: "America/Vancouver" },
];

export function WorldClock() {
  const { region, config } = useRegion();
  
  const [selectedTimezones, setSelectedTimezones] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [baseTimezone, setBaseTimezone] = useState<string>("UTC");

  // Set default timezone based on region when it changes
  useEffect(() => {
    setBaseTimezone(config.timezone);
    
    // Auto-select home timezone + a few others
    const homeId = TIMEZONES.find(tz => tz.region === region)?.id || "utc";
    const defaults = ["utc", homeId].filter((v, i, a) => a.indexOf(v) === i);
    setSelectedTimezones(defaults);
  }, [region, config.timezone]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time for a specific timezone
  const formatTimeInZone = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat(config.currency.locale, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: timezone,
    }).format(date);
  };

  // Format date for a specific timezone (regional formatting)
  const formatDateInZone = (date: Date, timezone: string) => {
    return new Intl.DateTimeFormat(config.currency.locale, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: timezone,
    }).format(date);
  };

  // Get offset from UTC
  const getOffset = (timezone: string) => {
    try {
      const now = new Date();
      const utcString = now.toLocaleString("en-US", { timeZone: "UTC" });
      const tzString = now.toLocaleString("en-US", { timeZone: timezone });
      const utcDate = new Date(utcString);
      const tzDate = new Date(tzString);
      const diffMs = tzDate.getTime() - utcDate.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      const sign = diffHours >= 0 ? "+" : "-";
      const absHours = Math.abs(diffHours);
      const hours = Math.floor(absHours);
      const minutes = (absHours % 1) * 60;
      return `UTC${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    } catch {
      return "Unknown";
    }
  };

  const toggleTimezone = (id: string) => {
    setSelectedTimezones(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const baseTimezoneInfo = TIMEZONES.find(tz => tz.timezone === baseTimezone);

  return (
    <div>
      {/* Current local time display */}
      <div className="mb-6 p-4 rounded-xl border border-indigo-200 bg-indigo-50">
        <h3 className="text-sm font-semibold text-indigo-900 mb-2">
          Your Local Time ({config.name})
        </h3>
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <p className="text-3xl font-bold text-indigo-700 font-mono">
              {formatTimeInZone(currentTime, config.timezone)}
            </p>
            <p className="text-sm text-indigo-600 mt-1">
              {formatDateInZone(currentTime, config.timezone)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-500">
              {config.timezone}
            </p>
            <p className="text-xs text-indigo-400 font-mono">
              {getOffset(config.timezone)}
            </p>
          </div>
        </div>
      </div>

      {/* Timezone selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Select Cities to Compare
        </label>
        <div className="flex flex-wrap gap-2">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.id}
              onClick={() => toggleTimezone(tz.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTimezones.includes(tz.id)
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tz.city}
            </button>
          ))}
        </div>
      </div>

      {/* Selected timezone clocks */}
      {selectedTimezones.length > 0 && (
        <StatGrid>
          {selectedTimezones.map((id) => {
            const tz = TIMEZONES.find(t => t.id === id);
            if (!tz) return null;
            
            return (
              <Stat
                key={id}
                label={`${tz.city} (${tz.timezone})`}
                value={formatTimeInZone(currentTime, tz.timezone)}
                sub={`${formatDateInZone(currentTime, tz.timezone)} · ${getOffset(tz.timezone)}`}
              />
            );
          })}
        </StatGrid>
      )}

      {/* Quick reference table */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Regional Time Reference</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 font-medium text-slate-600">City</th>
                <th className="text-left py-2 px-3 font-medium text-slate-600">Timezone</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Offset</th>
                <th className="text-right py-2 px-3 font-medium text-slate-600">Current Time</th>
              </tr>
            </thead>
            <tbody>
              {TIMEZONES.filter(tz => tz.region).map((tz) => (
                <tr key={tz.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-800">{tz.city}</td>
                  <td className="py-2 px-3 text-slate-600 font-mono text-xs">{tz.timezone}</td>
                  <td className="py-2 px-3 text-right text-slate-600 font-mono text-xs">
                    {getOffset(tz.timezone)}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-800 font-mono">
                    {formatTimeInZone(currentTime, tz.timezone)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 rounded-lg border border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-600">
          ℹ️ Times are calculated using IANA timezone database. Daylight Saving Time (DST) is automatically accounted for where applicable.
        </p>
      </div>
    </div>
  );
}
