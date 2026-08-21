"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Clock3,
  Globe2,
  MapPin,
  RotateCcw,
} from "lucide-react";

import {
  Stat,
  StatGrid,
} from "./shared";

import {
  useRegion,
} from "@/store/useRegionStore";

import type {
  Region,
} from "@/config/regions";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

interface TimeZoneInfo {
  id: string;
  city: string;
  country: string;
  timezone: string;
  region?: Region;
}

/* ──────────────────────────────────────────────────────────
   Time Zones

   IANA identifiers automatically account for DST where
   applicable.
────────────────────────────────────────────────────────── */

const TIMEZONES: TimeZoneInfo[] = [
  {
    id: "kathmandu",
    city: "Kathmandu",
    country: "Nepal",
    timezone: "Asia/Kathmandu",
    region: "nepal",
  },

  {
    id: "delhi",
    city: "Delhi",
    country: "India",
    timezone: "Asia/Kolkata",
    region: "india",
  },

  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    timezone: "Europe/London",
    region: "uk",
  },

  {
    id: "new-york",
    city: "New York",
    country: "United States",
    timezone: "America/New_York",
    region: "usa",
  },

  {
    id: "toronto",
    city: "Toronto",
    country: "Canada",
    timezone: "America/Toronto",
    region: "canada",
  },

  {
    id: "sydney",
    city: "Sydney",
    country: "Australia",
    timezone: "Australia/Sydney",
    region: "australia",
  },

  {
    id: "utc",
    city: "UTC",
    country: "Coordinated Universal Time",
    timezone: "UTC",
  },

  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
  },

  {
    id: "singapore",
    city: "Singapore",
    country: "Singapore",
    timezone: "Asia/Singapore",
  },

  {
    id: "dubai",
    city: "Dubai",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
  },

  {
    id: "paris",
    city: "Paris",
    country: "France",
    timezone: "Europe/Paris",
  },

  {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    timezone: "Europe/Berlin",
  },

  {
    id: "los-angeles",
    city: "Los Angeles",
    country: "United States",
    timezone: "America/Los_Angeles",
  },

  {
    id: "chicago",
    city: "Chicago",
    country: "United States",
    timezone: "America/Chicago",
  },

  {
    id: "vancouver",
    city: "Vancouver",
    country: "Canada",
    timezone: "America/Vancouver",
  },
];

/* ──────────────────────────────────────────────────────────
   FAQ
────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question:
      "What is a world clock?",
    answer:
      "A world clock shows the current local time in multiple cities and time zones around the world, making it easier to compare international times.",
  },

  {
    question:
      "What does UTC offset mean?",
    answer:
      "UTC offset shows how far a local time zone is ahead of or behind Coordinated Universal Time. For example, Nepal Standard Time is UTC+05:45.",
  },

  {
    question:
      "Does the world clock account for daylight saving time?",
    answer:
      "Yes. The calculator uses IANA time zone identifiers, allowing supported browsers to automatically account for daylight saving time where it applies.",
  },

  {
    question:
      "What time zone does Nepal use?",
    answer:
      "Nepal uses Nepal Standard Time with the IANA time zone Asia/Kathmandu. It is UTC+05:45.",
  },

  {
    question:
      "What time zone does India use?",
    answer:
      "India uses India Standard Time with the IANA time zone Asia/Kolkata. It is UTC+05:30.",
  },

  {
    question:
      "Can I compare the current time in different cities?",
    answer:
      "Yes. Select multiple cities in the World Clock to compare their current local time, date, time zone, and UTC offset.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",

  "@type": "FAQPage",

  mainEntity: FAQ_ITEMS.map(
    (item) => ({
      "@type": "Question",

      name: item.question,

      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })
  ),
};

/* ──────────────────────────────────────────────────────────
   Main World Clock
────────────────────────────────────────────────────────── */

export function WorldClock() {
  const {
    region,
    config,
  } = useRegion();

  /*
   * null means:
   *
   * The user has not manually changed the
   * city selection.
   *
   * Therefore we can derive the selection
   * directly from the active region without
   * needing useEffect + setState.
   */
  const [
    selectedTimezones,
    setSelectedTimezones,
  ] = useState<string[] | null>(
    null
  );

  /*
   * Start with null for SSR-safe rendering.
   *
   * The clock begins updating after hydration.
   */
  const [
    currentTime,
    setCurrentTime,
  ] = useState<Date | null>(
    null
  );

  /* ────────────────────────────────────────────────────────
     Locale
  ──────────────────────────────────────────────────────── */

  const locale =
    config.numberFormat ||
    config.currency.locale ||
    "en-US";

  /* ────────────────────────────────────────────────────────
     Home city for selected region
  ──────────────────────────────────────────────────────── */

  const homeTimezone =
    useMemo(
      () =>
        TIMEZONES.find(
          (timezone) =>
            timezone.region ===
            region
        ),
      [region]
    );

  /*
   * Default comparison:
   *
   * UTC + user's regional city.
   */
  const defaultTimezones =
    useMemo(() => {
      const values = [
        "utc",

        homeTimezone?.id ??
          "utc",
      ];

      return [
        ...new Set(values),
      ];
    }, [homeTimezone]);

  /*
   * If the user has not customized the
   * selection, it automatically follows
   * the selected CalcHub region.
   */
  const activeTimezones =
    selectedTimezones ??
    defaultTimezones;

  /* ────────────────────────────────────────────────────────
     Live Clock
  ──────────────────────────────────────────────────────── */

  useEffect(() => {
    /*
     * Use callbacks rather than calling
     * setState synchronously inside the effect.
     */

    const initialTimer =
      window.setTimeout(() => {
        setCurrentTime(
          new Date()
        );
      }, 0);

    const timer =
      window.setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () => {
      window.clearTimeout(
        initialTimer
      );

      window.clearInterval(
        timer
      );
    };
  }, []);

  /* ────────────────────────────────────────────────────────
     Formatters
  ──────────────────────────────────────────────────────── */

  const timeFormatters =
    useMemo(() => {
      const zones = new Set([
        ...TIMEZONES.map(
          (item) =>
            item.timezone
        ),

        config.timezone,
      ]);

      return new Map(
        [...zones].map(
          (timezone) => [
            timezone,

            new Intl.DateTimeFormat(
              locale,
              {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",

                hour12: true,

                timeZone:
                  timezone,
              }
            ),
          ]
        )
      );
    }, [
      locale,
      config.timezone,
    ]);

  const dateFormatters =
    useMemo(() => {
      const zones = new Set([
        ...TIMEZONES.map(
          (item) =>
            item.timezone
        ),

        config.timezone,
      ]);

      return new Map(
        [...zones].map(
          (timezone) => [
            timezone,

            new Intl.DateTimeFormat(
              locale,
              {
                weekday: "short",

                year: "numeric",

                month: "short",

                day: "numeric",

                timeZone:
                  timezone,
              }
            ),
          ]
        )
      );
    }, [
      locale,
      config.timezone,
    ]);

  const offsetFormatters =
    useMemo(() => {
      const zones = new Set([
        ...TIMEZONES.map(
          (item) =>
            item.timezone
        ),

        config.timezone,
      ]);

      return new Map(
        [...zones].map(
          (timezone) => [
            timezone,

            new Intl.DateTimeFormat(
              "en-US",
              {
                hour: "2-digit",

                timeZone:
                  timezone,

                timeZoneName:
                  "longOffset",
              }
            ),
          ]
        )
      );
    }, [
      config.timezone,
    ]);

  /* ────────────────────────────────────────────────────────
     Formatting Helpers
  ──────────────────────────────────────────────────────── */

  function formatTimeInZone(
    date: Date,
    timezone: string
  ): string {
    try {
      return (
        timeFormatters
          .get(timezone)
          ?.format(date) ?? "—"
      );
    } catch {
      return "—";
    }
  }

  function formatDateInZone(
    date: Date,
    timezone: string
  ): string {
    try {
      return (
        dateFormatters
          .get(timezone)
          ?.format(date) ?? "—"
      );
    } catch {
      return "—";
    }
  }

  /*
   * Uses Intl's actual current timezone offset.
   *
   * This is safer than converting locale strings
   * back into Date objects and automatically
   * respects DST.
   */
  function getOffset(
    date: Date,
    timezone: string
  ): string {
    try {
      const formatter =
        offsetFormatters.get(
          timezone
        );

      if (!formatter) {
        return "—";
      }

      const offset =
        formatter
          .formatToParts(date)
          .find(
            (part) =>
              part.type ===
              "timeZoneName"
          )?.value;

      if (!offset) {
        return "—";
      }

      if (
        offset === "GMT" ||
        offset === "UTC"
      ) {
        return "UTC+00:00";
      }

      return offset.replace(
        "GMT",
        "UTC"
      );
    } catch {
      return "—";
    }
  }

  /* ────────────────────────────────────────────────────────
     Selection
  ──────────────────────────────────────────────────────── */

  function toggleTimezone(
    id: string
  ) {
    setSelectedTimezones(
      (current) => {
        const selection =
          current ??
          defaultTimezones;

        if (
          selection.includes(id)
        ) {
          return selection.filter(
            (item) =>
              item !== id
          );
        }

        return [
          ...selection,
          id,
        ];
      }
    );
  }

  function resetToRegion() {
    /*
     * null restores derived
     * region defaults.
     */
    setSelectedTimezones(
      null
    );
  }

  /* ────────────────────────────────────────────────────────
     Regional reference cities
  ──────────────────────────────────────────────────────── */

  const regionalTimezones =
    useMemo(
      () =>
        TIMEZONES.filter(
          (timezone) =>
            timezone.region
        ),
      []
    );

  /* ───────────────────────────────────────────────────── */

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-[900px]
      "
    >
      {/* FAQ JSON-LD */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              FAQ_SCHEMA
            ),
        }}
      />

      {/* ────────────────────────────────────────────────
          SEO Header
      ──────────────────────────────────────────────── */}

      <header
        className="
          mb-6
          text-center
        "
      >
        <p
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-indigo-600
          "
        >
          CalcHub Date &amp; Time Tools
        </p>

        <h2
          className="
            mt-2
            text-2xl
            font-bold
            tracking-tight
            text-slate-950
            sm:text-3xl
          "
        >
          World Clock

          <span
            className="
              block
              text-indigo-600
            "
          >
            Current Time &amp; Time
            Zone Comparison
          </span>
        </h2>

        <p
          className="
            mx-auto
            mt-3
            max-w-2xl
            text-sm
            leading-6
            text-slate-600
          "
        >
          Check the current time
          around the world and
          compare international
          time zones instantly.
          View local time, dates,
          IANA time zones and UTC
          offsets for Kathmandu,
          Delhi, London, New York,
          Toronto, Sydney and other
          major cities.
        </p>
      </header>

      {/* ────────────────────────────────────────────────
          Main Calculator
      ──────────────────────────────────────────────── */}

      <section
        aria-label="World clock and time zone comparison"
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        {/* Current regional time */}

        <div
          className="
            border-b
            border-indigo-200
            bg-gradient-to-br
            from-indigo-50
            via-white
            to-blue-50
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MapPin
                  className="
                    h-4
                    w-4
                    text-indigo-600
                  "
                />

                <p
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-indigo-700
                  "
                >
                  Your Regional Time
                </p>
              </div>

              <h2
                className="
                  mt-2
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Current Time in{" "}
                {homeTimezone?.city ??
                  config.name}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                {config.name} ·{" "}
                {config.timezone}
              </p>
            </div>

            <div
              className="
                rounded-full
                border
                border-indigo-200
                bg-white
                px-3
                py-1.5
                font-mono
                text-[10px]
                font-bold
                text-indigo-600
              "
            >
              {currentTime
                ? getOffset(
                    currentTime,
                    config.timezone
                  )
                : "Loading…"}
            </div>
          </div>

          {/* Main live clock */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-indigo-100
              bg-white
              p-5
              shadow-sm
            "
          >
            {currentTime ? (
              <time
                dateTime={
                  currentTime.toISOString()
                }
                suppressHydrationWarning
              >
                <p
                  className="
                    font-mono
                    text-3xl
                    font-bold
                    tracking-tight
                    text-indigo-700
                    sm:text-4xl
                  "
                >
                  {formatTimeInZone(
                    currentTime,
                    config.timezone
                  )}
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    font-medium
                    text-slate-600
                  "
                >
                  {formatDateInZone(
                    currentTime,
                    config.timezone
                  )}
                </p>
              </time>
            ) : (
              <div
                className="
                  animate-pulse
                "
              >
                <div
                  className="
                    h-10
                    w-48
                    rounded-lg
                    bg-indigo-100
                  "
                />

                <div
                  className="
                    mt-3
                    h-4
                    w-36
                    rounded
                    bg-slate-100
                  "
                />
              </div>
            )}
          </div>
        </div>

        {/* ──────────────────────────────────────────────
            City Selector
        ────────────────────────────────────────────── */}

        <div
          className="
            p-5
            sm:p-6
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-end
              justify-between
              gap-3
            "
          >
            <div>
              <h2
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                <Globe2
                  className="
                    h-4
                    w-4
                    text-indigo-600
                  "
                />

                Compare World Time
                Zones
              </h2>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-slate-500
                "
              >
                Select cities to
                compare their current
                local time and UTC
                offset.
              </p>
            </div>

            {selectedTimezones !==
              null && (
              <button
                type="button"
                onClick={
                  resetToRegion
                }
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-3
                  py-2
                  text-[10px]
                  font-semibold
                  text-slate-600
                  transition
                  hover:border-indigo-300
                  hover:bg-indigo-50
                  hover:text-indigo-700
                "
              >
                <RotateCcw
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                Reset
              </button>
            )}
          </div>

          {/* City buttons */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            {TIMEZONES.map(
              (timezone) => {
                const selected =
                  activeTimezones.includes(
                    timezone.id
                  );

                return (
                  <button
                    key={
                      timezone.id
                    }
                    type="button"
                    aria-pressed={
                      selected
                    }
                    onClick={() =>
                      toggleTimezone(
                        timezone.id
                      )
                    }
                    className={`
                      rounded-lg
                      border
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      transition-all

                      ${
                        selected
                          ? `
                            border-indigo-600
                            bg-indigo-600
                            text-white
                            shadow-sm
                          `
                          : `
                            border-slate-200
                            bg-slate-50
                            text-slate-700
                            hover:border-indigo-300
                            hover:bg-indigo-50
                            hover:text-indigo-700
                          `
                      }
                    `}
                  >
                    {timezone.city}
                  </button>
                );
              }
            )}
          </div>

          {/* ────────────────────────────────────────────
              Selected Clocks
          ──────────────────────────────────────────── */}

          {currentTime &&
            activeTimezones.length >
              0 && (
              <section
                className="
                  mt-6
                "
                aria-labelledby="selected-world-clocks"
              >
                <h3
                  id="selected-world-clocks"
                  className="
                    mb-3
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                >
                  Selected World
                  Clocks
                </h3>

                <StatGrid>
                  {activeTimezones.map(
                    (id) => {
                      const timezone =
                        TIMEZONES.find(
                          (item) =>
                            item.id ===
                            id
                        );

                      if (
                        !timezone
                      ) {
                        return null;
                      }

                      return (
                        <Stat
                          key={id}
                          label={`${timezone.city}, ${timezone.country}`}
                          value={formatTimeInZone(
                            currentTime,
                            timezone.timezone
                          )}
                          sub={`${formatDateInZone(
                            currentTime,
                            timezone.timezone
                          )} · ${getOffset(
                            currentTime,
                            timezone.timezone
                          )}`}
                        />
                      );
                    }
                  )}
                </StatGrid>
              </section>
            )}

          {/* Empty selection */}

          {activeTimezones.length ===
            0 && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-dashed
                border-slate-300
                bg-slate-50
                px-4
                py-8
                text-center
              "
            >
              <Clock3
                className="
                  mx-auto
                  h-6
                  w-6
                  text-slate-400
                "
              />

              <p
                className="
                  mt-2
                  text-sm
                  font-semibold
                  text-slate-700
                "
              >
                Select a city
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-500
                "
              >
                Choose one or more
                cities above to compare
                current times.
              </p>
            </div>
          )}

          {/* ────────────────────────────────────────────
              Regional Time Reference
          ──────────────────────────────────────────── */}

          <section
            className="
              mt-7
            "
            aria-labelledby="regional-time-reference"
          >
            <div>
              <h3
                id="regional-time-reference"
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                Regional Time Zone
                Reference
              </h3>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-5
                  text-slate-500
                "
              >
                Current time and UTC
                offsets for major
                regional cities.
              </p>
            </div>

            <div
              className="
                mt-3
                overflow-x-auto
                rounded-xl
                border
                border-slate-200
              "
            >
              <table
                className="
                  w-full
                  min-w-[680px]
                  text-sm
                "
              >
                <thead
                  className="
                    bg-slate-50
                  "
                >
                  <tr
                    className="
                      border-b
                      border-slate-200
                    "
                  >
                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      City
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        text-left
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      Time Zone
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        text-right
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      UTC Offset
                    </th>

                    <th
                      scope="col"
                      className="
                        px-4
                        py-3
                        text-right
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      Current Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {regionalTimezones.map(
                    (timezone) => (
                      <tr
                        key={
                          timezone.id
                        }
                        className="
                          border-b
                          border-slate-100
                          last:border-0
                          hover:bg-slate-50
                        "
                      >
                        <td
                          className="
                            px-4
                            py-3
                          "
                        >
                          <p
                            className="
                              font-semibold
                              text-slate-800
                            "
                          >
                            {
                              timezone.city
                            }
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[10px]
                              text-slate-400
                            "
                          >
                            {
                              timezone.country
                            }
                          </p>
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            font-mono
                            text-xs
                            text-slate-500
                          "
                        >
                          {
                            timezone.timezone
                          }
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-mono
                            text-xs
                            text-slate-600
                          "
                        >
                          {currentTime
                            ? getOffset(
                                currentTime,
                                timezone.timezone
                              )
                            : "—"}
                        </td>

                        <td
                          className="
                            px-4
                            py-3
                            text-right
                            font-mono
                            font-semibold
                            text-slate-800
                          "
                        >
                          {currentTime
                            ? formatTimeInZone(
                                currentTime,
                                timezone.timezone
                              )
                            : "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Data note */}

          <div
            className="
              mt-5
              rounded-xl
              border
              border-blue-200
              bg-blue-50
              px-4
              py-3
            "
          >
            <p
              className="
                text-[11px]
                leading-5
                text-blue-800
              "
            >
              Times are calculated
              using standard IANA time
              zone identifiers.
              Daylight Saving Time
              (DST) is automatically
              accounted for where
              applicable.
            </p>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          SEO Content
      ──────────────────────────────────────────────── */}

      <article
        className="
          mt-8
          space-y-5
        "
      >
        <SeoSection title="World Clock – Check Current Time Around the World">
          <p>
            CalcHub&apos;s World Clock
            lets you check the current
            local time in major cities
            around the world. Compare
            international time zones
            including Kathmandu, Delhi,
            London, New York, Toronto,
            Sydney, Tokyo, Dubai,
            Singapore, Paris and more.
          </p>

          <p>
            Each world clock displays
            the current local time,
            date, IANA time zone and
            UTC offset, making it
            useful when scheduling
            international meetings,
            calls, travel, remote work
            or online events.
          </p>
        </SeoSection>

        <SeoSection title="How to Compare World Time Zones">
          <Steps
            items={[
              "Your selected CalcHub region is automatically used as your home time zone.",
              "Select one or more cities from the World Clock.",
              "Compare the current time, local date and UTC offset for each selected city.",
              "Use the regional reference table to quickly compare major international time zones.",
            ]}
          />
        </SeoSection>

        <SeoSection title="What is a UTC Offset?">
          <p>
            UTC stands for Coordinated
            Universal Time. A UTC
            offset indicates how many
            hours and minutes a local
            time zone is ahead of or
            behind UTC.
          </p>

          <div
            className="
              grid
              gap-3
              sm:grid-cols-3
            "
          >
            <ReferenceCard
              city="Kathmandu"
              timezone="Asia/Kathmandu"
              offset="UTC+05:45"
            />

            <ReferenceCard
              city="Delhi"
              timezone="Asia/Kolkata"
              offset="UTC+05:30"
            />

            <ReferenceCard
              city="UTC"
              timezone="UTC"
              offset="UTC+00:00"
            />
          </div>

          <p>
            Some time zones change
            their UTC offset during
            the year because of
            Daylight Saving Time.
            CalcHub uses IANA time
            zone information so these
            changes are handled
            automatically where
            applicable.
          </p>
        </SeoSection>

        <SeoSection title="Nepal Time – Kathmandu Current Time">
          <p>
            Nepal uses Nepal Standard
            Time. Kathmandu follows
            the{" "}
            <strong>
              Asia/Kathmandu
            </strong>{" "}
            time zone and is normally{" "}
            <strong>
              UTC+05:45
            </strong>
            . Nepal&apos;s 45-minute
            offset makes it different
            from many time zones that
            use whole-hour or
            half-hour offsets.
          </p>
        </SeoSection>

        <SeoSection title="India Time – Delhi Current Time">
          <p>
            India uses India Standard
            Time. Delhi and other
            Indian cities follow the{" "}
            <strong>
              Asia/Kolkata
            </strong>{" "}
            time zone, which is{" "}
            <strong>
              UTC+05:30
            </strong>
            .
          </p>
        </SeoSection>

        <SeoSection title="Daylight Saving Time and World Clocks">
          <p>
            Some countries move their
            clocks forward or backward
            during certain parts of
            the year. This is commonly
            known as Daylight Saving
            Time or DST.
          </p>

          <p>
            Cities such as London,
            New York, Toronto, Sydney
            and Los Angeles may have
            different UTC offsets
            depending on the date.
            The World Clock uses the
            city&apos;s IANA time zone
            instead of a fixed offset
            so seasonal time changes
            can be reflected
            automatically.
          </p>
        </SeoSection>

        <SeoSection title="Frequently Asked Questions">
          <div
            className="
              divide-y
              divide-slate-200
            "
          >
            {FAQ_ITEMS.map(
              (item) => (
                <details
                  key={
                    item.question
                  }
                  className="
                    group
                    py-4
                    first:pt-0
                    last:pb-0
                  "
                >
                  <summary
                    className="
                      flex
                      cursor-pointer
                      list-none
                      items-center
                      justify-between
                      gap-4
                      text-sm
                      font-bold
                      text-slate-800
                    "
                  >
                    <span>
                      {item.question}
                    </span>

                    <span
                      className="
                        flex
                        h-6
                        w-6
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        text-slate-500
                        transition
                        group-open:rotate-45
                      "
                    >
                      +
                    </span>
                  </summary>

                  <p
                    className="
                      mt-3
                      pr-8
                      text-sm
                      leading-6
                      text-slate-600
                    "
                  >
                    {item.answer}
                  </p>
                </details>
              )
            )}
          </div>
        </SeoSection>
      </article>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SEO Section
────────────────────────────────────────────────────────── */

function SeoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        sm:p-6
      "
    >
      <h2
        className="
          text-lg
          font-bold
          tracking-tight
          text-slate-950
          sm:text-xl
        "
      >
        {title}
      </h2>

      <div
        className="
          mt-3
          space-y-3
          text-sm
          leading-7
          text-slate-600
        "
      >
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Steps
────────────────────────────────────────────────────────── */

function Steps({
  items,
}: {
  items: string[];
}) {
  return (
    <div
      className="
        space-y-3
      "
    >
      {items.map(
        (item, index) => (
          <div
            key={item}
            className="
              flex
              items-start
              gap-3
            "
          >
            <span
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-indigo-100
                text-[11px]
                font-bold
                text-indigo-700
              "
            >
              {index + 1}
            </span>

            <p
              className="
                pt-0.5
              "
            >
              {item}
            </p>
          </div>
        )
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Reference Card
────────────────────────────────────────────────────────── */

function ReferenceCard({
  city,
  timezone,
  offset,
}: {
  city: string;
  timezone: string;
  offset: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
      "
    >
      <p
        className="
          text-xs
          font-bold
          text-slate-900
        "
      >
        {city}
      </p>

      <p
        className="
          mt-1
          font-mono
          text-[10px]
          text-slate-500
        "
      >
        {timezone}
      </p>

      <p
        className="
          mt-2
          text-sm
          font-bold
          text-indigo-700
        "
      >
        {offset}
      </p>
    </div>
  );
}

export default WorldClock;
