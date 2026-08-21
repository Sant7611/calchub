"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import NepaliDateConverter from "@remotemerge/nepali-date-converter";

type MainTool = "converter" | "difference";
type ConversionMode = "AD_TO_BS" | "BS_TO_AD";
type CalendarType = "AD" | "BS";

interface ConvertedDate {
  year: number;
  month: number;
  date: number;
  day: string;
}

interface BsInput {
  year: number;
  month: number;
  date: number;
}

interface DifferenceResult {
  totalDays: number;
  totalWeeks: number;
  remainingWeekDays: number;
  years: number;
  months: number;
  days: number;
  direction: "future" | "past" | "same";
  startAd: ConvertedDate;
  endAd: ConvertedDate;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const BS_MONTHS = [
  { en: "Baisakh", np: "बैशाख" },
  { en: "Jestha", np: "जेठ" },
  { en: "Asar", np: "असार" },
  { en: "Shrawan", np: "साउन" },
  { en: "Bhadra", np: "भदौ" },
  { en: "Ashwin", np: "असोज" },
  { en: "Kartik", np: "कार्तिक" },
  { en: "Mangsir", np: "मंसिर" },
  { en: "Poush", np: "पुष" },
  { en: "Magh", np: "माघ" },
  { en: "Falgun", np: "फागुन" },
  { en: "Chaitra", np: "चैत" },
] as const;

const AD_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const NEPALI_DAYS: Record<string, string> = {
  Sunday: "आइतबार",
  Monday: "सोमबार",
  Tuesday: "मंगलबार",
  Wednesday: "बुधबार",
  Thursday: "बिहीबार",
  Friday: "शुक्रबार",
  Saturday: "शनिबार",
};

const FAQ_ITEMS = [
  {
    question: "What is a Nepali Date Converter?",
    answer:
      "A Nepali Date Converter converts dates between the Gregorian calendar, commonly called AD or English date, and Nepal's Bikram Sambat calendar, commonly called BS.",
  },
  {
    question: "How do I convert AD to BS?",
    answer:
      "Choose the Date Converter tool, keep AD to BS selected, enter a Gregorian date and click Convert AD to BS. The corresponding Nepali Bikram Sambat date will appear instantly.",
  },
  {
    question: "Can I convert BS to AD?",
    answer:
      "Yes. Switch the conversion direction to BS to AD, enter the Bikram Sambat year, month and day, and CalcHub will calculate the corresponding Gregorian date.",
  },
  {
    question: "Can I calculate the difference between two Nepali dates?",
    answer:
      "Yes. Use the Date Difference tool, select BS as the calendar, enter two Bikram Sambat dates and calculate the number of days, weeks, months and years between them.",
  },
  {
    question: "Can I calculate the difference between two AD dates?",
    answer:
      "Yes. The Date Difference calculator also supports Gregorian or AD dates and displays the total number of days along with a readable years, months and days duration.",
  },
  {
    question: "What does BS mean?",
    answer:
      "BS stands for Bikram Sambat, the calendar system widely used in Nepal for official records, festivals, birthdays, academic records and everyday dates.",
  },
  {
    question: "Is Bikram Sambat the same as the Gregorian calendar?",
    answer:
      "No. Bikram Sambat has different year numbering, month lengths and New Year timing, which means accurate conversion requires calendar-specific date data.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toDateString(
  year: number,
  month: number,
  date: number,
): string {
  return `${year}-${pad(month)}-${pad(date)}`;
}

function getToday(): string {
  const now = new Date();

  return toDateString(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
}

function toUtcDate(
  year: number,
  month: number,
  date: number,
): Date {
  return new Date(Date.UTC(year, month - 1, date));
}

function convertedToUtcDate(value: ConvertedDate): Date {
  return toUtcDate(
    value.year,
    value.month,
    value.date,
  );
}

function nativeDateToConverted(date: Date): ConvertedDate {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const dayOfMonth = date.getUTCDate();

  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });

  return {
    year,
    month,
    date: dayOfMonth,
    day: weekday,
  };
}

function parseAdDate(value: string): ConvertedDate {
  const [year, month, date] = value
    .split("-")
    .map(Number);

  if (!year || !month || !date) {
    throw new Error("Please enter a valid AD date.");
  }

  const native = toUtcDate(year, month, date);

  if (
    native.getUTCFullYear() !== year ||
    native.getUTCMonth() + 1 !== month ||
    native.getUTCDate() !== date
  ) {
    throw new Error("Please enter a valid AD date.");
  }

  return nativeDateToConverted(native);
}

function bsToAd(value: BsInput): ConvertedDate {
  const source = toDateString(
    value.year,
    value.month,
    value.date,
  );

  return new NepaliDateConverter(
    source,
  ).toAd() as ConvertedDate;
}

function adToBs(value: string): ConvertedDate {
  return new NepaliDateConverter(
    value,
  ).toBs() as ConvertedDate;
}

function getDefaultBsDate(): BsInput {
  try {
    const result = adToBs(getToday());

    return {
      year: result.year,
      month: result.month,
      date: result.date,
    };
  } catch {
    return {
      year: 2083,
      month: 1,
      date: 1,
    };
  }
}

function toNepaliNumber(
  value: number | string,
): string {
  const digits = [
    "०",
    "१",
    "२",
    "३",
    "४",
    "५",
    "६",
    "७",
    "८",
    "९",
  ];

  return String(value).replace(
    /\d/g,
    (digit) => digits[Number(digit)],
  );
}

function formatAdDate(
  result: ConvertedDate,
): string {
  const month =
    AD_MONTHS[result.month - 1] ?? "";

  return `${month} ${result.date}, ${result.year}`;
}

function formatBsDate(
  result: ConvertedDate,
): string {
  const month =
    BS_MONTHS[result.month - 1]?.en ?? "";

  return `${result.date} ${month} ${result.year}`;
}

function formatBsDateNepali(
  result: ConvertedDate,
): string {
  const month =
    BS_MONTHS[result.month - 1]?.np ?? "";

  return `${toNepaliNumber(
    result.date,
  )} ${month} ${toNepaliNumber(result.year)}`;
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return "Unable to process this date. Please check the entered date and try again.";
}

function daysInMonth(
  year: number,
  monthIndex: number,
): number {
  return new Date(
    Date.UTC(year, monthIndex + 1, 0),
  ).getUTCDate();
}

function addYearsSafe(
  source: Date,
  years: number,
): Date {
  const year =
    source.getUTCFullYear() + years;

  const month = source.getUTCMonth();

  const date = Math.min(
    source.getUTCDate(),
    daysInMonth(year, month),
  );

  return new Date(
    Date.UTC(year, month, date),
  );
}

function addMonthsSafe(
  source: Date,
  months: number,
): Date {
  const currentYear =
    source.getUTCFullYear();

  const currentMonth =
    source.getUTCMonth();

  const targetTotal =
    currentYear * 12 +
    currentMonth +
    months;

  const targetYear = Math.floor(
    targetTotal / 12,
  );

  const targetMonth =
    ((targetTotal % 12) + 12) % 12;

  const targetDate = Math.min(
    source.getUTCDate(),
    daysInMonth(
      targetYear,
      targetMonth,
    ),
  );

  return new Date(
    Date.UTC(
      targetYear,
      targetMonth,
      targetDate,
    ),
  );
}

function calculateReadableDifference(
  first: Date,
  second: Date,
) {
  const start =
    first.getTime() <= second.getTime()
      ? first
      : second;

  const end =
    first.getTime() <= second.getTime()
      ? second
      : first;

  let years =
    end.getUTCFullYear() -
    start.getUTCFullYear();

  let yearCursor = addYearsSafe(
    start,
    years,
  );

  if (yearCursor > end) {
    years -= 1;

    yearCursor = addYearsSafe(
      start,
      years,
    );
  }

  let months =
    (end.getUTCFullYear() -
      yearCursor.getUTCFullYear()) *
      12 +
    end.getUTCMonth() -
    yearCursor.getUTCMonth();

  let monthCursor = addMonthsSafe(
    yearCursor,
    months,
  );

  if (monthCursor > end) {
    months -= 1;

    monthCursor = addMonthsSafe(
      yearCursor,
      months,
    );
  }

  const days = Math.round(
    (end.getTime() -
      monthCursor.getTime()) /
      DAY_MS,
  );

  return {
    years,
    months,
    days,
  };
}

export function DateConverterCalculator() {
  const [tool, setTool] =
    useState<MainTool>("converter");

  const [mode, setMode] =
    useState<ConversionMode>("AD_TO_BS");

  const [adDate, setAdDate] =
    useState(getToday());

  const [bsDate, setBsDate] =
    useState<BsInput>(() =>
      getDefaultBsDate(),
    );

  const [result, setResult] =
    useState<ConvertedDate | null>(null);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [
    differenceCalendar,
    setDifferenceCalendar,
  ] = useState<CalendarType>("AD");

  const [differenceStartAd, setDifferenceStartAd] =
    useState(getToday());

  const [differenceEndAd, setDifferenceEndAd] =
    useState(getToday());

  const [
    differenceStartBs,
    setDifferenceStartBs,
  ] = useState<BsInput>(() =>
    getDefaultBsDate(),
  );

  const [
    differenceEndBs,
    setDifferenceEndBs,
  ] = useState<BsInput>(() =>
    getDefaultBsDate(),
  );

  const [
    differenceResult,
    setDifferenceResult,
  ] = useState<DifferenceResult | null>(
    null,
  );

  const [
    differenceError,
    setDifferenceError,
  ] = useState("");

  const sourceCalendar =
    mode === "AD_TO_BS"
      ? "Gregorian Date (AD)"
      : "Nepali Date (BS)";

  const targetCalendar =
    mode === "AD_TO_BS"
      ? "Nepali Date (BS)"
      : "Gregorian Date (AD)";

  const resultCode = useMemo(() => {
    if (!result) return "";

    return toDateString(
      result.year,
      result.month,
      result.date,
    );
  }, [result]);

  function clearConverterMessages() {
    setResult(null);
    setError("");
    setCopied(false);
  }

  function clearDifferenceMessages() {
    setDifferenceResult(null);
    setDifferenceError("");
  }

  function convertAdToBs() {
    if (!adDate) {
      setError(
        "Please select an AD date.",
      );

      setResult(null);

      return;
    }

    try {
      const converted =
        adToBs(adDate);

      setResult(converted);
      setError("");
      setCopied(false);
    } catch (conversionError) {
      setResult(null);

      setError(
        getErrorMessage(
          conversionError,
        ),
      );
    }
  }

  function convertBsToAd() {
    if (
      !bsDate.year ||
      !bsDate.month ||
      !bsDate.date
    ) {
      setError(
        "Please enter a complete BS date.",
      );

      return;
    }

    try {
      const converted =
        bsToAd(bsDate);

      setResult(converted);
      setError("");
      setCopied(false);
    } catch (conversionError) {
      setResult(null);

      setError(
        getErrorMessage(
          conversionError,
        ),
      );
    }
  }

  function handleConvert() {
    if (mode === "AD_TO_BS") {
      convertAdToBs();
      return;
    }

    convertBsToAd();
  }

  function handleSwap() {
    setCopied(false);
    setError("");
    setResult(null);

    try {
      if (mode === "AD_TO_BS") {
        const converted =
          adToBs(adDate);

        setBsDate({
          year: converted.year,
          month: converted.month,
          date: converted.date,
        });

        setMode("BS_TO_AD");
      } else {
        const converted =
          bsToAd(bsDate);

        setAdDate(
          toDateString(
            converted.year,
            converted.month,
            converted.date,
          ),
        );

        setMode("AD_TO_BS");
      }
    } catch (conversionError) {
      setError(
        getErrorMessage(
          conversionError,
        ),
      );
    }
  }

  function handleToday() {
    setCopied(false);
    setResult(null);
    setError("");

    const today = getToday();

    if (mode === "AD_TO_BS") {
      setAdDate(today);

      return;
    }

    try {
      const converted =
        adToBs(today);

      setBsDate({
        year: converted.year,
        month: converted.month,
        date: converted.date,
      });
    } catch (conversionError) {
      setError(
        getErrorMessage(
          conversionError,
        ),
      );
    }
  }

  async function copyResult() {
    if (!result) return;

    const text =
      mode === "AD_TO_BS"
        ? `${formatBsDate(
            result,
          )} BS — ${formatBsDateNepali(
            result,
          )}`
        : `${formatAdDate(
            result,
          )} AD`;

    try {
      await navigator.clipboard.writeText(
        text,
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1600,
      );
    } catch {
      setCopied(false);
    }
  }

  function calculateDateDifference() {
    setDifferenceError("");
    setDifferenceResult(null);

    try {
      let startAd: ConvertedDate;
      let endAd: ConvertedDate;

      if (
        differenceCalendar === "AD"
      ) {
        if (
          !differenceStartAd ||
          !differenceEndAd
        ) {
          throw new Error(
            "Please select both dates.",
          );
        }

        startAd = parseAdDate(
          differenceStartAd,
        );

        endAd = parseAdDate(
          differenceEndAd,
        );
      } else {
        startAd = bsToAd(
          differenceStartBs,
        );

        endAd = bsToAd(
          differenceEndBs,
        );
      }

      const startDate =
        convertedToUtcDate(startAd);

      const endDate =
        convertedToUtcDate(endAd);

      const rawDifference =
        endDate.getTime() -
        startDate.getTime();

      const totalDays = Math.abs(
        Math.round(
          rawDifference / DAY_MS,
        ),
      );

      const readable =
        calculateReadableDifference(
          startDate,
          endDate,
        );

      let direction: DifferenceResult["direction"] =
        "same";

      if (rawDifference > 0) {
        direction = "future";
      }

      if (rawDifference < 0) {
        direction = "past";
      }

      setDifferenceResult({
        totalDays,
        totalWeeks: Math.floor(
          totalDays / 7,
        ),
        remainingWeekDays:
          totalDays % 7,
        years: readable.years,
        months: readable.months,
        days: readable.days,
        direction,
        startAd,
        endAd,
      });
    } catch (differenceCalculationError) {
      setDifferenceError(
        getErrorMessage(
          differenceCalculationError,
        ),
      );
    }
  }

  function setDifferenceToday() {
    const today = getToday();

    clearDifferenceMessages();

    if (
      differenceCalendar === "AD"
    ) {
      setDifferenceStartAd(today);
      setDifferenceEndAd(today);

      return;
    }

    try {
      const todayBs = adToBs(today);

      const value = {
        year: todayBs.year,
        month: todayBs.month,
        date: todayBs.date,
      };

      setDifferenceStartBs(value);
      setDifferenceEndBs(value);
    } catch {
      // Keep existing values.
    }
  }

  return (
    <div className="mx-auto w-full max-w-[800px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              FAQ_SCHEMA,
            ),
        }}
      />

      {/* SEO heading */}
      <header className="mb-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
          CalcHub Date Tools
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Nepali Date Converter
          <span className="block text-blue-600">
            Instant AD to BS & BS to AD
            Conversion
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Convert English dates to Nepali
          Bikram Sambat dates instantly or
          calculate the exact difference
          between two AD or BS dates using
          CalcHub&apos;s free Nepali Date
          Converter and Date Difference
          Calculator.
        </p>
      </header>

      {/* Main tool selector */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
        <button
          type="button"
          onClick={() =>
            setTool("converter")
          }
          className={`rounded-xl px-3 py-3 text-xs font-bold transition sm:text-sm ${
            tool === "converter"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="block">
            Date Converter
          </span>

          <span className="mt-0.5 hidden text-[9px] font-medium text-slate-400 sm:block">
            AD ↔ BS
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            setTool("difference")
          }
          className={`rounded-xl px-3 py-3 text-xs font-bold transition sm:text-sm ${
            tool === "difference"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span className="block">
            Date Difference
          </span>

          <span className="mt-0.5 hidden text-[9px] font-medium text-slate-400 sm:block">
            Days Between Dates
          </span>
        </button>
      </div>

      {tool === "converter" ? (
        <section
          aria-label="Nepali date converter"
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
        >
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
                  Instant Conversion
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">
                  AD to BS & BS to AD
                  Converter
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Convert Gregorian dates
                  and Nepali Bikram Sambat
                  dates instantly.
                </p>
              </div>

              <button
                type="button"
                onClick={handleToday}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                Today
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
              <CalendarCard
                label="From"
                name={sourceCalendar}
                description={
                  mode === "AD_TO_BS"
                    ? "English / Gregorian"
                    : "Bikram Sambat"
                }
                active
              />

              <button
                type="button"
                onClick={handleSwap}
                aria-label="Swap conversion direction"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
              >
                ⇄
              </button>

              <CalendarCard
                label="To"
                name={targetCalendar}
                description={
                  mode === "AD_TO_BS"
                    ? "Bikram Sambat"
                    : "English / Gregorian"
                }
                result
              />
            </div>

            <div className="mt-6">
              {mode === "AD_TO_BS" ? (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-700">
                    Select AD Date
                  </span>

                  <input
                    type="date"
                    value={adDate}
                    onChange={(event) => {
                      setAdDate(
                        event.target.value,
                      );

                      clearConverterMessages();
                    }}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              ) : (
                <BsDateFields
                  value={bsDate}
                  onChange={(value) => {
                    setBsDate(value);
                    clearConverterMessages();
                  }}
                />
              )}
            </div>

            {error && (
              <ErrorBox text={error} />
            )}

            <button
              type="button"
              onClick={handleConvert}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:translate-y-px"
            >
              {mode === "AD_TO_BS"
                ? "Convert AD to BS"
                : "Convert BS to AD"}
            </button>

            {result && (
              <section
                aria-live="polite"
                className="mt-5 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
              >
                <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                      Converted Date
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {mode === "AD_TO_BS"
                        ? "Bikram Sambat"
                        : "Gregorian Calendar"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={copyResult}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
                  >
                    {copied
                      ? "Copied ✓"
                      : "Copy"}
                  </button>
                </div>

                <div className="p-4 sm:p-5">
                  {mode ===
                  "AD_TO_BS" ? (
                    <>
                      <p className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                        {formatBsDate(
                          result,
                        )}
                      </p>

                      <p className="mt-2 text-xl font-semibold text-emerald-800">
                        {formatBsDateNepali(
                          result,
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                      {formatAdDate(
                        result,
                      )}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ResultTag
                      label={
                        mode ===
                        "AD_TO_BS"
                          ? "BS"
                          : "AD"
                      }
                      value={resultCode}
                    />

                    <ResultTag
                      label="Day"
                      value={result.day}
                    />

                    {mode ===
                      "AD_TO_BS" &&
                      NEPALI_DAYS[
                        result.day
                      ] && (
                        <ResultTag
                          label="नेपाली"
                          value={
                            NEPALI_DAYS[
                              result.day
                            ]
                          }
                        />
                      )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </section>
      ) : (
        <section
          aria-label="Date difference calculator"
          className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50"
        >
          <div className="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-violet-50 px-4 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-600">
                  Days Between Dates
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">
                  Nepali Date Difference
                  Calculator
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Calculate years, months,
                  weeks and days between
                  two AD or BS dates.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  setDifferenceToday
                }
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 shadow-sm hover:border-violet-300 hover:bg-violet-50"
              >
                Today
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div>
              <p className="mb-2 text-xs font-bold text-slate-700">
                Date Calendar
              </p>

              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setDifferenceCalendar(
                      "AD",
                    );

                    clearDifferenceMessages();
                  }}
                  className={`rounded-lg py-2.5 text-xs font-bold transition ${
                    differenceCalendar ===
                    "AD"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  AD Dates
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDifferenceCalendar(
                      "BS",
                    );

                    clearDifferenceMessages();
                  }}
                  className={`rounded-lg py-2.5 text-xs font-bold transition ${
                    differenceCalendar ===
                    "BS"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  BS Dates
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <DateInputPanel
                title="Start Date"
              >
                {differenceCalendar ===
                "AD" ? (
                  <input
                    type="date"
                    value={
                      differenceStartAd
                    }
                    onChange={(event) => {
                      setDifferenceStartAd(
                        event.target.value,
                      );

                      clearDifferenceMessages();
                    }}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                ) : (
                  <BsDateFields
                    value={
                      differenceStartBs
                    }
                    compact
                    onChange={(value) => {
                      setDifferenceStartBs(
                        value,
                      );

                      clearDifferenceMessages();
                    }}
                  />
                )}
              </DateInputPanel>

              <DateInputPanel
                title="End Date"
              >
                {differenceCalendar ===
                "AD" ? (
                  <input
                    type="date"
                    value={
                      differenceEndAd
                    }
                    onChange={(event) => {
                      setDifferenceEndAd(
                        event.target.value,
                      );

                      clearDifferenceMessages();
                    }}
                    className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                  />
                ) : (
                  <BsDateFields
                    value={
                      differenceEndBs
                    }
                    compact
                    onChange={(value) => {
                      setDifferenceEndBs(
                        value,
                      );

                      clearDifferenceMessages();
                    }}
                  />
                )}
              </DateInputPanel>
            </div>

            {differenceError && (
              <ErrorBox
                text={differenceError}
              />
            )}

            <button
              type="button"
              onClick={
                calculateDateDifference
              }
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700"
            >
              Calculate Date Difference
            </button>

            {differenceResult && (
              <DifferenceResults
                result={
                  differenceResult
                }
                sourceCalendar={
                  differenceCalendar
                }
              />
            )}
          </div>
        </section>
      )}

      {/* SEO CONTENT */}
      <article className="mt-8 space-y-5">
        <SeoSection title="Nepali Date Converter – Instant AD to BS & BS to AD Conversion">
          <p>
            CalcHub&apos;s Nepali Date
            Converter provides instant
            conversion between the
            Gregorian calendar (AD) and
            Nepal&apos;s Bikram Sambat
            calendar (BS). Use the AD to BS
            converter to convert an English
            date into a Nepali date, or use
            the BS to AD converter to find
            the corresponding Gregorian
            date for any supported Nepali
            Bikram Sambat date.
          </p>

          <p>
            The calculator is useful for
            Nepali birthdays, government
            forms, academic records,
            notices, appointments,
            historical dates, festivals,
            official documents and other
            situations where dates are
            written in different calendar
            systems.
          </p>
        </SeoSection>

        <SeoSection title="Nepali Date Difference Calculator">
          <p>
            The Date Difference Calculator
            helps you find the exact time
            between two dates. You can
            calculate the difference
            between two Gregorian AD dates
            or two Nepali Bikram Sambat BS
            dates.
          </p>

          <p>
            Results include the total
            number of days, complete weeks,
            remaining days and a readable
            duration in years, months and
            days. BS dates are converted to
            their corresponding Gregorian
            dates internally before the
            exact day difference is
            calculated.
          </p>
        </SeoSection>

        <SeoSection title="How to Convert AD to BS">
          <Steps
            items={[
              "Choose Date Converter at the top of the calculator.",
              "Select AD to BS as the conversion direction.",
              "Enter or select the English or Gregorian date.",
              "Click Convert AD to BS to instantly view the corresponding Nepali date.",
            ]}
          />
        </SeoSection>

        <SeoSection title="How to Convert BS to AD">
          <Steps
            items={[
              "Open the Date Converter tool.",
              "Use the swap button to select BS to AD.",
              "Enter the Bikram Sambat year, month and day.",
              "Click Convert BS to AD to view the corresponding Gregorian date.",
            ]}
          />
        </SeoSection>

        <SeoSection title="How to Calculate the Difference Between Nepali Dates">
          <Steps
            items={[
              "Choose Date Difference from the top of the calculator.",
              "Select AD Dates or BS Dates.",
              "Enter the start date and end date.",
              "Click Calculate Date Difference to view years, months, weeks and total days between the dates.",
            ]}
          />
        </SeoSection>

        <SeoSection title="What is Bikram Sambat (BS)?">
          <p>
            Bikram Sambat, commonly
            abbreviated as BS, is the
            calendar system widely used in
            Nepal. Nepali dates are used
            throughout everyday life,
            government records, education,
            festivals, personal documents
            and many official activities.
          </p>

          <p>
            The Gregorian calendar is
            commonly referred to as AD or
            the English calendar. Because
            Bikram Sambat months and years
            do not align directly with the
            Gregorian calendar, accurate
            AD to BS and BS to AD
            conversion cannot be performed
            by simply adding or subtracting
            a fixed number of years.
          </p>
        </SeoSection>

        <SeoSection title="Months of the Nepali Bikram Sambat Calendar">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {BS_MONTHS.map(
              (month, index) => (
                <div
                  key={month.en}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Month {index + 1}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {month.en}
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-blue-700">
                    {month.np}
                  </p>
                </div>
              ),
            )}
          </div>
        </SeoSection>

        <SeoSection title="Frequently Asked Questions">
          <div className="divide-y divide-slate-200">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group py-4 first:pt-0 last:pb-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-slate-800">
                  {item.question}

                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </SeoSection>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[11px] leading-6 text-amber-800">
            <strong>
              Accuracy notice:
            </strong>{" "}
            CalcHub provides date conversion
            and date difference tools for
            general informational use. For
            legal, immigration, financial,
            government or other official
            purposes, verify important
            dates against the original
            official record.
          </p>
        </div>
      </article>
    </div>
  );
}

function CalendarCard({
  label,
  name,
  description,
  active,
  result,
}: {
  label: string;
  name: string;
  description: string;
  active?: boolean;
  result?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 ${
        active
          ? "border-blue-200 bg-blue-50"
          : result
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">
        {name}
      </p>

      <p className="mt-0.5 hidden text-[10px] text-slate-500 sm:block">
        {description}
      </p>
    </div>
  );
}

function BsDateFields({
  value,
  onChange,
  compact = false,
}: {
  value: BsInput;
  onChange: (value: BsInput) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "grid gap-2"
          : "grid gap-3 sm:grid-cols-3"
      }
    >
      <label>
        <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
          BS Year
        </span>

        <input
          type="number"
          inputMode="numeric"
          value={value.year || ""}
          onChange={(
            event: ChangeEvent<HTMLInputElement>,
          ) =>
            onChange({
              ...value,
              year: Number(
                event.target.value,
              ),
            })
          }
          className="h-11 w-full rounded-xl border border-slate-300 px-3 font-mono text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </label>

      <label>
        <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
          BS Month
        </span>

        <select
          value={value.month}
          onChange={(
            event: ChangeEvent<HTMLSelectElement>,
          ) =>
            onChange({
              ...value,
              month: Number(
                event.target.value,
              ),
            })
          }
          className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        >
          {BS_MONTHS.map(
            (month, index) => (
              <option
                value={index + 1}
                key={month.en}
              >
                {index + 1}. {month.en}
              </option>
            ),
          )}
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-[10px] font-bold text-slate-600">
          BS Day
        </span>

        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={32}
          value={value.date || ""}
          onChange={(
            event: ChangeEvent<HTMLInputElement>,
          ) =>
            onChange({
              ...value,
              date: Number(
                event.target.value,
              ),
            })
          }
          className="h-11 w-full rounded-xl border border-slate-300 px-3 font-mono text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
        />
      </label>
    </div>
  );
}

function DateInputPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      {children}
    </div>
  );
}

function DifferenceResults({
  result,
  sourceCalendar,
}: {
  result: DifferenceResult;
  sourceCalendar: CalendarType;
}) {
  return (
    <section
      aria-live="polite"
      className="mt-5 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white"
    >
      <div className="border-b border-violet-100 px-4 py-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-violet-600">
          Date Difference
        </p>

        <p className="mt-0.5 text-xs font-semibold text-slate-700">
          {result.direction === "same"
            ? "Both dates are the same"
            : result.direction ===
                "future"
              ? "Start → End"
              : "End date is before start date"}
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="rounded-2xl bg-violet-600 p-5 text-center text-white">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-200">
            Total Difference
          </p>

          <p className="mt-1 text-4xl font-bold tracking-tight">
            {result.totalDays.toLocaleString()}
          </p>

          <p className="mt-1 text-sm font-semibold text-violet-100">
            {result.totalDays === 1
              ? "day"
              : "days"}
          </p>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <DifferenceStat
            label="Years"
            value={result.years}
          />

          <DifferenceStat
            label="Months"
            value={result.months}
          />

          <DifferenceStat
            label="Days"
            value={result.days}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <DifferenceStat
            label="Complete Weeks"
            value={result.totalWeeks}
          />

          <DifferenceStat
            label="Remaining Days"
            value={
              result.remainingWeekDays
            }
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Duration
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {result.years}{" "}
            {result.years === 1
              ? "year"
              : "years"}
            , {result.months}{" "}
            {result.months === 1
              ? "month"
              : "months"}{" "}
            and {result.days}{" "}
            {result.days === 1
              ? "day"
              : "days"}
          </p>
        </div>

        {sourceCalendar === "BS" && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500">
              Gregorian equivalents
            </p>

            <div className="mt-2 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <p>
                <strong>Start:</strong>{" "}
                {formatAdDate(
                  result.startAd,
                )}
              </p>

              <p>
                <strong>End:</strong>{" "}
                {formatAdDate(
                  result.endAd,
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DifferenceStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
      <p className="text-lg font-bold text-violet-700">
        {value.toLocaleString()}
      </p>

      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
    </div>
  );
}

function ResultTag({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2">
      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 font-mono text-[11px] font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function ErrorBox({
  text,
}: {
  text: string;
}) {
  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
    >
      <p className="text-xs font-semibold leading-5 text-red-700">
        {text}
      </p>
    </div>
  );
}

function SeoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
        {title}
      </h2>

      <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
        {children}
      </div>
    </section>
  );
}

function Steps({
  items,
}: {
  items: string[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item}
          className="flex items-start gap-3"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
            {index + 1}
          </span>

          <p className="pt-0.5">
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}

export default DateConverterCalculator;