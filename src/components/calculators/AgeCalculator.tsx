"use client";

import { useMemo, useState } from "react";

interface ExactAge {
  years: number;
  months: number;
  days: number;
}

interface AgeResult {
  age: ExactAge;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  nextBirthday: Date;
  daysUntilBirthday: number;
  nextBirthdayAge: number;
  bornOn: string;
  nextBirthdayOn: string;
}

/* =========================================================
   DATE HELPERS
========================================================= */

/**
 * Parse YYYY-MM-DD manually.
 *
 * Using new Date("YYYY-MM-DD") directly can introduce
 * timezone-related problems because browsers may interpret
 * the value as UTC.
 */
function parseDateInput(
  value: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
    );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    year,
    month - 1,
    day
  );

  /*
   * Reject impossible dates such as:
   * 2026-02-31
   */
  if (
    date.getFullYear() !== year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Convert a Date to YYYY-MM-DD
 * using local calendar values.
 */
function toInputDate(
  date: Date
): string {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Return the final valid day
 * for a particular month.
 */
function getDaysInMonth(
  year: number,
  month: number
): number {
  return new Date(
    year,
    month + 1,
    0
  ).getDate();
}

/**
 * Adds years while safely handling
 * Feb 29.
 *
 * Example:
 * Feb 29, 2004 + 1 year
 * becomes Feb 28, 2005.
 */
function addYearsClamped(
  date: Date,
  years: number
): Date {
  const targetYear =
    date.getFullYear() +
    years;

  const month =
    date.getMonth();

  const day = Math.min(
    date.getDate(),
    getDaysInMonth(
      targetYear,
      month
    )
  );

  return new Date(
    targetYear,
    month,
    day
  );
}

/**
 * Adds months while preventing
 * dates such as January 31 + 1 month
 * from unexpectedly becoming March.
 */
function addMonthsClamped(
  date: Date,
  months: number
): Date {
  const totalMonths =
    date.getFullYear() *
      12 +
    date.getMonth() +
    months;

  const targetYear =
    Math.floor(
      totalMonths / 12
    );

  const targetMonth =
    ((totalMonths % 12) +
      12) %
    12;

  const day = Math.min(
    date.getDate(),
    getDaysInMonth(
      targetYear,
      targetMonth
    )
  );

  return new Date(
    targetYear,
    targetMonth,
    day
  );
}

/**
 * Compare calendar dates without
 * caring about the time of day.
 */
function compareDates(
  first: Date,
  second: Date
): number {
  const firstValue =
    Date.UTC(
      first.getFullYear(),
      first.getMonth(),
      first.getDate()
    );

  const secondValue =
    Date.UTC(
      second.getFullYear(),
      second.getMonth(),
      second.getDate()
    );

  return (
    firstValue -
    secondValue
  );
}

/**
 * Calendar-day difference.
 *
 * UTC is deliberately used here
 * so daylight-saving transitions
 * do not create 23/25-hour-day bugs.
 */
function differenceInDays(
  start: Date,
  end: Date
): number {
  const startUtc =
    Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

  const endUtc =
    Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate()
    );

  return Math.floor(
    (endUtc - startUtc) /
      86_400_000
  );
}

/* =========================================================
   EXACT AGE
========================================================= */

function calculateExactAge(
  birthDate: Date,
  targetDate: Date
): ExactAge {
  /*
   * First calculate complete years.
   */
  let years =
    targetDate.getFullYear() -
    birthDate.getFullYear();

  let yearPoint =
    addYearsClamped(
      birthDate,
      years
    );

  if (
    compareDates(
      yearPoint,
      targetDate
    ) > 0
  ) {
    years -= 1;

    yearPoint =
      addYearsClamped(
        birthDate,
        years
      );
  }

  /*
   * Then calculate complete months
   * after the completed years.
   */
  let months =
    (targetDate.getFullYear() -
      yearPoint.getFullYear()) *
      12 +
    targetDate.getMonth() -
    yearPoint.getMonth();

  let monthPoint =
    addMonthsClamped(
      yearPoint,
      months
    );

  if (
    compareDates(
      monthPoint,
      targetDate
    ) > 0
  ) {
    months -= 1;

    monthPoint =
      addMonthsClamped(
        yearPoint,
        months
      );
  }

  /*
   * Everything remaining is the
   * exact number of calendar days.
   */
  const days =
    differenceInDays(
      monthPoint,
      targetDate
    );

  return {
    years,
    months,
    days,
  };
}

/* =========================================================
   NEXT BIRTHDAY
========================================================= */

function calculateNextBirthday(
  birthDate: Date,
  targetDate: Date
) {
  let nextBirthday =
    birthdayInYear(
      birthDate,
      targetDate.getFullYear()
    );

  /*
   * If birthday is today, consider
   * today to be the next birthday
   * with zero days remaining.
   */
  if (
    compareDates(
      nextBirthday,
      targetDate
    ) < 0
  ) {
    nextBirthday =
      birthdayInYear(
        birthDate,
        targetDate.getFullYear() +
          1
      );
  }

  const daysUntilBirthday =
    differenceInDays(
      targetDate,
      nextBirthday
    );

  const nextBirthdayAge =
    calculateExactAge(
      birthDate,
      nextBirthday
    ).years;

  return {
    nextBirthday,
    daysUntilBirthday,
    nextBirthdayAge,
  };
}

function birthdayInYear(
  birthDate: Date,
  year: number
): Date {
  const month =
    birthDate.getMonth();

  const day = Math.min(
    birthDate.getDate(),
    getDaysInMonth(
      year,
      month
    )
  );

  return new Date(
    year,
    month,
    day
  );
}

/* =========================================================
   FORMATTING
========================================================= */

function formatLongDate(
  date: Date
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}

function plural(
  value: number,
  singular: string
): string {
  return `${value.toLocaleString()} ${
    value === 1
      ? singular
      : `${singular}s`
  }`;
}

/* =========================================================
   COMPONENT
========================================================= */

export function AgeCalculator() {
  /*
   * Example default birthday.
   *
   * You can change this to an empty
   * string if you prefer the page to
   * initially show no result.
   */
  const [birthDate, setBirthDate] =
    useState("2000-01-01");

  /*
   * Calculate age as of today by
   * default.
   */
  const [targetDate, setTargetDate] =
    useState(() =>
      toInputDate(new Date())
    );

  const result =
    useMemo<{
      data: AgeResult | null;
      error: string | null;
    }>(() => {
      const birth =
        parseDateInput(
          birthDate
        );

      const target =
        parseDateInput(
          targetDate
        );

      if (!birth || !target) {
        return {
          data: null,
          error:
            "Please enter valid dates.",
        };
      }

      if (
        compareDates(
          birth,
          target
        ) > 0
      ) {
        return {
          data: null,
          error:
            "Date of birth cannot be after the age calculation date.",
        };
      }

      const age =
        calculateExactAge(
          birth,
          target
        );

      const totalDays =
        differenceInDays(
          birth,
          target
        );

      const {
        nextBirthday,
        daysUntilBirthday,
        nextBirthdayAge,
      } =
        calculateNextBirthday(
          birth,
          target
        );

      return {
        error: null,

        data: {
          age,

          totalMonths:
            age.years * 12 +
            age.months,

          totalWeeks:
            Math.floor(
              totalDays / 7
            ),

          totalDays,

          nextBirthday,

          daysUntilBirthday,

          nextBirthdayAge,

          bornOn:
            formatLongDate(
              birth
            ),

          nextBirthdayOn:
            formatLongDate(
              nextBirthday
            ),
        },
      };
    }, [
      birthDate,
      targetDate,
    ]);

  const data =
    result.data;

  return (
    <div className="w-full">
      {/* =========================================
          INPUTS
      ========================================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        <DateField
          label="Date of birth"
          hint="Enter the person's birth date."
          value={birthDate}
          onChange={
            setBirthDate
          }
        />

        <DateField
          label="Age on"
          hint="Calculate age on today or any other date."
          value={targetDate}
          onChange={
            setTargetDate
          }
        />
      </div>

      {/* TODAY SHORTCUT */}

      <div className="mt-3">
        <button
          type="button"
          onClick={() =>
            setTargetDate(
              toInputDate(
                new Date()
              )
            )
          }
          className="
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            py-2
            text-xs
            font-semibold
            text-slate-600
            transition

            hover:border-blue-300
            hover:bg-blue-50
            hover:text-blue-700
          "
        >
          Calculate age today
        </button>
      </div>

      {/* =========================================
          ERROR
      ========================================= */}

      {result.error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {result.error}
          </p>
        </div>
      )}

      {/* =========================================
          RESULTS
      ========================================= */}

      {data && (
        <>
          {/* MAIN AGE */}

          <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Exact age
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
              <MainAgeValue
                value={
                  data.age.years
                }
                label="Years"
              />

              <MainAgeValue
                value={
                  data.age.months
                }
                label="Months"
              />

              <MainAgeValue
                value={
                  data.age.days
                }
                label="Days"
              />
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-700">
              On{" "}
              <strong className="text-slate-950">
                {formatLongDate(
                  parseDateInput(
                    targetDate
                  )!
                )}
              </strong>
              , your exact age is{" "}
              <strong className="text-blue-800">
                {plural(
                  data.age.years,
                  "year"
                )}
                ,{" "}
                {plural(
                  data.age.months,
                  "month"
                )}{" "}
                and{" "}
                {plural(
                  data.age.days,
                  "day"
                )}
              </strong>
              .
            </p>
          </div>

          {/* =====================================
              TOTAL AGE
          ===================================== */}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ResultCard
              label="Total months"
              value={data.totalMonths.toLocaleString()}
              description="Completed calendar months"
            />

            <ResultCard
              label="Total weeks"
              value={data.totalWeeks.toLocaleString()}
              description="Completed weeks since birth"
            />

            <ResultCard
              label="Total days"
              value={data.totalDays.toLocaleString()}
              description="Calendar days since birth"
            />
          </div>

          {/* =====================================
              WHAT THE RESULT MEANS
          ===================================== */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold text-slate-900">
              What does your result
              mean?
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              A person born on{" "}
              <strong className="font-semibold text-slate-900">
                {data.bornOn}
              </strong>{" "}
              has completed{" "}
              <strong className="font-semibold text-slate-900">
                {plural(
                  data.age.years,
                  "year"
                )}
              </strong>
              , plus{" "}
              <strong className="font-semibold text-slate-900">
                {plural(
                  data.age.months,
                  "additional month"
                )}
              </strong>{" "}
              and{" "}
              <strong className="font-semibold text-slate-900">
                {plural(
                  data.age.days,
                  "additional day"
                )}
              </strong>{" "}
              as of the selected
              calculation date.
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              That is approximately{" "}
              <strong className="text-slate-700">
                {data.totalWeeks.toLocaleString()}{" "}
                completed weeks
              </strong>{" "}
              or{" "}
              <strong className="text-slate-700">
                {data.totalDays.toLocaleString()}{" "}
                calendar days
              </strong>{" "}
              since birth.
            </p>
          </div>

          {/* =====================================
              NEXT BIRTHDAY
          ===================================== */}

          <div className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700">
              Next birthday
            </p>

            {data.daysUntilBirthday ===
            0 ? (
              <>
                <p className="mt-2 text-2xl font-bold text-violet-950">
                  Today 🎉
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  The selected date is
                  your birthday. You
                  are turning{" "}
                  <strong>
                    {
                      data.nextBirthdayAge
                    }
                  </strong>{" "}
                  today.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-bold text-violet-950">
                  {plural(
                    data.daysUntilBirthday,
                    "day"
                  )}
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Your next birthday
                  is{" "}
                  <strong className="text-slate-950">
                    {
                      data.nextBirthdayOn
                    }
                  </strong>
                  . You will turn{" "}
                  <strong className="text-violet-800">
                    {
                      data.nextBirthdayAge
                    }
                  </strong>
                  .
                </p>
              </>
            )}
          </div>

          {/* =====================================
              SUMMARY
          ===================================== */}

          <div className="mt-6 rounded-2xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900">
              Age summary
            </h3>

            <div className="mt-4 space-y-3">
              <SummaryRow
                label="Date of birth"
                value={
                  data.bornOn
                }
              />

              <SummaryRow
                label="Exact age"
                value={`${data.age.years} years, ${data.age.months} months, ${data.age.days} days`}
              />

              <SummaryRow
                label="Completed months"
                value={data.totalMonths.toLocaleString()}
              />

              <SummaryRow
                label="Completed weeks"
                value={data.totalWeeks.toLocaleString()}
              />

              <SummaryRow
                label="Total calendar days"
                value={data.totalDays.toLocaleString()}
              />

              <SummaryRow
                label="Next birthday"
                value={
                  data.nextBirthdayOn
                }
              />

              <SummaryRow
                label="Days until birthday"
                value={data.daysUntilBirthday.toLocaleString()}
              />
            </div>
          </div>
        </>
      )}

      {/* =========================================
          BASIC INFORMATION
      ========================================= */}

      <div className="mt-7 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          What is an age calculator?
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          An age calculator finds the
          time between a date of birth
          and another date. Instead of
          simply subtracting the two
          years, it accounts for
          whether the birthday has
          already occurred and for the
          different lengths of calendar
          months.
        </p>

        <p className="mt-3 text-xs leading-6 text-slate-600">
          The result is shown as
          completed years, remaining
          months and remaining days.
          You can calculate your age
          today or choose another date
          to find your age at a past or
          future point in time.
        </p>
      </div>

      {/* =========================================
          HOW IT WORKS
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          How is age calculated?
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          The calculator first counts
          the number of complete years
          between the birth date and
          selected date. It then counts
          the remaining complete
          calendar months and finally
          the remaining calendar days.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-mono text-xs leading-6 text-slate-700">
            Age = Completed Years +
            Remaining Months +
            Remaining Days
          </p>
        </div>
      </div>

      {/* =========================================
          LEAP-YEAR NOTE
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-bold text-amber-800">
          Leap-year birthdays
        </p>

        <p className="mt-2 text-xs leading-5 text-amber-900/80">
          For calculations involving a
          February 29 birthday, this
          calculator uses February 28
          in non-leap years when a
          matching calendar day does
          not exist.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   DATE FIELD
========================================================= */

function DateField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-700">
        {label}
      </span>

      {hint && (
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          {hint}
        </p>
      )}

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          mt-2
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          px-3
          py-3
          text-sm
          font-semibold
          text-slate-900
          outline-none
          transition

          focus:border-blue-500
          focus:ring-4
          focus:ring-blue-500/10
        "
      />
    </label>
  );
}

/* =========================================================
   MAIN AGE VALUE
========================================================= */

function MainAgeValue({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-white/70 p-3 text-center sm:p-4">
      <p className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   RESULT CARD
========================================================= */

function ResultCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY ROW
========================================================= */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-5">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span className="text-xs font-semibold text-slate-800 sm:text-right">
        {value}
      </span>
    </div>
  );
}