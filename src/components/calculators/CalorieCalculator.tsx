"use client";

import { useMemo, useState } from "react";

type UnitSystem = "metric" | "imperial";

type FormulaSex =
  | "male"
  | "female";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "very"
  | "extreme";

type CalorieGoal =
  | "maintain"
  | "lose-mild"
  | "lose-moderate"
  | "gain-mild"
  | "gain-moderate";

interface ActivityOption {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
}

interface GoalOption {
  value: CalorieGoal;
  label: string;
  description: string;
  adjustment: number;
}

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    description:
      "Little or no structured exercise.",
    multiplier: 1.2,
  },
  {
    value: "light",
    label: "Lightly active",
    description:
      "Light exercise around 1–3 days per week.",
    multiplier: 1.375,
  },
  {
    value: "moderate",
    label: "Moderately active",
    description:
      "Moderate exercise around 3–5 days per week.",
    multiplier: 1.55,
  },
  {
    value: "very",
    label: "Very active",
    description:
      "Hard exercise around 6–7 days per week.",
    multiplier: 1.725,
  },
  {
    value: "extreme",
    label: "Extremely active",
    description:
      "Very intense training or a highly physical lifestyle.",
    multiplier: 1.9,
  },
];

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: "maintain",
    label: "Maintain weight",
    description:
      "Eat approximately your estimated daily energy expenditure.",
    adjustment: 0,
  },
  {
    value: "lose-mild",
    label: "Mild weight loss",
    description:
      "Approximately 10% below estimated maintenance calories.",
    adjustment: -0.1,
  },
  {
    value: "lose-moderate",
    label: "Moderate weight loss",
    description:
      "Approximately 15% below estimated maintenance calories.",
    adjustment: -0.15,
  },
  {
    value: "gain-mild",
    label: "Mild weight gain",
    description:
      "Approximately 5% above estimated maintenance calories.",
    adjustment: 0.05,
  },
  {
    value: "gain-moderate",
    label: "Moderate weight gain",
    description:
      "Approximately 10% above estimated maintenance calories.",
    adjustment: 0.1,
  },
];

export function CalorieCalculator() {
  const [unitSystem, setUnitSystem] =
    useState<UnitSystem>("metric");

  const [formulaSex, setFormulaSex] =
    useState<FormulaSex>("male");

  const [age, setAge] =
    useState(25);

  /* Metric */
  const [weightKg, setWeightKg] =
    useState(70);

  const [heightCm, setHeightCm] =
    useState(175);

  /* Imperial */
  const [weightLb, setWeightLb] =
    useState(154);

  const [heightFt, setHeightFt] =
    useState(5);

  const [heightIn, setHeightIn] =
    useState(9);

  const [activity, setActivity] =
    useState<ActivityLevel>(
      "moderate"
    );

  const [goal, setGoal] =
    useState<CalorieGoal>(
      "maintain"
    );

  const result = useMemo(() => {
    const safeAge =
      Math.max(1, age);

    let weight: number;
    let height: number;

    if (
      unitSystem === "metric"
    ) {
      weight =
        Math.max(
          0,
          weightKg
        );

      height =
        Math.max(
          0,
          heightCm
        );
    } else {
      weight =
        Math.max(
          0,
          weightLb
        ) * 0.45359237;

      const totalInches =
        Math.max(
          0,
          heightFt
        ) *
          12 +
        Math.max(
          0,
          heightIn
        );

      height =
        totalInches *
        2.54;
    }

    /*
     * Mifflin-St Jeor equation
     *
     * Male:
     * 10W + 6.25H - 5A + 5
     *
     * Female:
     * 10W + 6.25H - 5A - 161
     */

    const baseBmr =
      10 * weight +
      6.25 * height -
      5 * safeAge;

    const bmr =
      formulaSex === "male"
        ? baseBmr + 5
        : baseBmr - 161;

    const activityOption =
      ACTIVITY_OPTIONS.find(
        (item) =>
          item.value ===
          activity
      ) ??
      ACTIVITY_OPTIONS[0];

    /*
     * TDEE =
     * BMR × Activity Multiplier
     */
    const tdee =
      bmr *
      activityOption.multiplier;

    const selectedGoal =
      GOAL_OPTIONS.find(
        (item) =>
          item.value ===
          goal
      ) ??
      GOAL_OPTIONS[0];

    const targetCalories =
      tdee *
      (1 +
        selectedGoal.adjustment);

    const calorieDifference =
      targetCalories -
      tdee;

    return {
      weightKg: weight,
      heightCm: height,

      bmr:
        Math.max(0, bmr),

      tdee:
        Math.max(0, tdee),

      targetCalories:
        Math.max(
          0,
          targetCalories
        ),

      calorieDifference,

      activityOption,
      selectedGoal,
    };
  }, [
    unitSystem,
    formulaSex,
    age,
    weightKg,
    heightCm,
    weightLb,
    heightFt,
    heightIn,
    activity,
    goal,
  ]);

  return (
    <div className="w-full">
      {/* =========================================
          UNIT SYSTEM
      ========================================= */}

      <div>
        <p className="text-xs font-semibold text-slate-700">
          Unit system
        </p>

        <div className="mt-2 grid max-w-sm grid-cols-2 gap-2">
          <ToggleButton
            active={
              unitSystem ===
              "metric"
            }
            label="Metric"
            description="kg · cm"
            onClick={() =>
              setUnitSystem(
                "metric"
              )
            }
          />

          <ToggleButton
            active={
              unitSystem ===
              "imperial"
            }
            label="US / Imperial"
            description="lb · ft · in"
            onClick={() =>
              setUnitSystem(
                "imperial"
              )
            }
          />
        </div>
      </div>

      {/* =========================================
          BASIC DETAILS
      ========================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <NumberField
          label="Age"
          hint="Enter your age in years."
          value={age}
          onChange={setAge}
          suffix="years"
          min={1}
          step={1}
        />

        <div>
          <p className="text-xs font-semibold text-slate-700">
            Sex used for BMR formula
          </p>

          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            Mifflin–St Jeor uses
            different constants for
            male and female calculations.
          </p>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <ToggleButton
              active={
                formulaSex ===
                "male"
              }
              label="Male"
              onClick={() =>
                setFormulaSex(
                  "male"
                )
              }
            />

            <ToggleButton
              active={
                formulaSex ===
                "female"
              }
              label="Female"
              onClick={() =>
                setFormulaSex(
                  "female"
                )
              }
            />
          </div>
        </div>

        {/* Metric */}

        {unitSystem ===
          "metric" && (
          <>
            <NumberField
              label="Weight"
              hint="Your current body weight."
              value={weightKg}
              onChange={
                setWeightKg
              }
              suffix="kg"
              min={1}
              step={0.5}
            />

            <NumberField
              label="Height"
              hint="Your current height."
              value={heightCm}
              onChange={
                setHeightCm
              }
              suffix="cm"
              min={1}
              step={1}
            />
          </>
        )}

        {/* Imperial */}

        {unitSystem ===
          "imperial" && (
          <>
            <NumberField
              label="Weight"
              hint="Your current body weight."
              value={weightLb}
              onChange={
                setWeightLb
              }
              suffix="lb"
              min={1}
              step={1}
            />

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Height
              </p>

              <p className="mt-1 text-[11px] leading-4 text-slate-500">
                Enter your height in
                feet and inches.
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <NumberField
                  label="Feet"
                  value={heightFt}
                  onChange={
                    setHeightFt
                  }
                  suffix="ft"
                  min={0}
                  step={1}
                  compact
                />

                <NumberField
                  label="Inches"
                  value={heightIn}
                  onChange={
                    setHeightIn
                  }
                  suffix="in"
                  min={0}
                  step={1}
                  compact
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* =========================================
          ACTIVITY LEVEL
      ========================================= */}

      <div className="mt-7">
        <h3 className="text-sm font-bold text-slate-900">
          Activity level
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Choose the option that most
          closely matches your normal
          weekly activity.
        </p>

        <div className="mt-3 grid gap-2">
          {ACTIVITY_OPTIONS.map(
            (option) => (
              <button
                key={
                  option.value
                }
                type="button"
                onClick={() =>
                  setActivity(
                    option.value
                  )
                }
                className={`
                  flex
                  items-center
                  justify-between
                  gap-4
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition

                  ${
                    activity ===
                    option.value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                <div>
                  <p
                    className={`
                      text-xs
                      font-semibold

                      ${
                        activity ===
                        option.value
                          ? "text-blue-800"
                          : "text-slate-800"
                      }
                    `}
                  >
                    {
                      option.label
                    }
                  </p>

                  <p className="mt-1 text-[11px] leading-4 text-slate-500">
                    {
                      option.description
                    }
                  </p>
                </div>

                <span className="shrink-0 text-[10px] font-semibold text-slate-400">
                  ×{" "}
                  {
                    option.multiplier
                  }
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* =========================================
          GOAL
      ========================================= */}

      <div className="mt-7">
        <h3 className="text-sm font-bold text-slate-900">
          Your goal
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          This adjusts your estimated
          maintenance calories by a
          moderate percentage.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {GOAL_OPTIONS.map(
            (option) => (
              <button
                key={
                  option.value
                }
                type="button"
                onClick={() =>
                  setGoal(
                    option.value
                  )
                }
                className={`
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition

                  ${
                    goal ===
                    option.value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                <p
                  className={`
                    text-xs
                    font-semibold

                    ${
                      goal ===
                      option.value
                        ? "text-blue-800"
                        : "text-slate-800"
                    }
                  `}
                >
                  {option.label}
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  {
                    option.description
                  }
                </p>
              </button>
            )
          )}
        </div>
      </div>

      {/* =========================================
          MAIN RESULT
      ========================================= */}

      <div className="mt-7 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          Estimated daily calorie target
        </p>

        <div className="mt-2 flex flex-wrap items-end gap-2">
          <p className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {formatCalories(
              result.targetCalories
            )}
          </p>

          <span className="pb-1 text-sm font-medium text-slate-600">
            kcal/day
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700">
          Based on your details,
          activity level and selected
          goal, your estimated daily
          calorie target is around{" "}
          <strong className="text-slate-950">
            {formatCalories(
              result.targetCalories
            )}{" "}
            calories per day
          </strong>
          .
        </p>
      </div>

      {/* =========================================
          BMR / TDEE / TARGET
      ========================================= */}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ResultCard
          label="BMR"
          value={`${formatCalories(
            result.bmr
          )} kcal`}
          description="Estimated calories your body uses at rest"
        />

        <ResultCard
          label="Maintenance calories"
          value={`${formatCalories(
            result.tdee
          )} kcal`}
          description="Estimated calories to maintain your current weight"
        />

        <ResultCard
          label="Your target"
          value={`${formatCalories(
            result.targetCalories
          )} kcal`}
          description={
            result.selectedGoal
              .label
          }
          highlight
        />
      </div>

      {/* =========================================
          EXACT EXPLANATION
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-900">
          What does your result mean?
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your estimated basal
          metabolic rate is{" "}
          <strong className="font-semibold text-slate-900">
            {formatCalories(
              result.bmr
            )}{" "}
            calories per day
          </strong>
          . This is approximately how
          much energy your body uses
          for basic functions while at
          rest.
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          After accounting for your{" "}
          <strong className="font-semibold text-slate-900">
            {
              result.activityOption
                .label
            }
          </strong>{" "}
          activity level, your
          estimated total daily energy
          expenditure is approximately{" "}
          <strong className="font-semibold text-slate-900">
            {formatCalories(
              result.tdee
            )}{" "}
            calories per day
          </strong>
          .
        </p>

        {goal ===
          "maintain" ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Because your selected goal
            is to maintain your current
            weight, your target remains
            approximately{" "}
            <strong className="font-semibold text-blue-700">
              {formatCalories(
                result.targetCalories
              )}{" "}
              calories per day
            </strong>
            .
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-600">
            For your selected goal of{" "}
            <strong className="font-semibold text-slate-900">
              {
                result.selectedGoal
                  .label
              }
            </strong>
            , the calculator adjusts
            your maintenance estimate
            by approximately{" "}
            <strong className="font-semibold text-slate-900">
              {Math.abs(
                result.selectedGoal
                  .adjustment *
                  100
              ).toFixed(0)}
              %
            </strong>
            , giving an estimated
            target of{" "}
            <strong className="font-semibold text-blue-700">
              {formatCalories(
                result.targetCalories
              )}{" "}
              kcal/day
            </strong>
            .
          </p>
        )}
      </div>

      {/* =========================================
          CALORIE DIFFERENCE
      ========================================= */}

      {goal !== "maintain" && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Daily adjustment
          </p>

          <p
            className={`
              mt-1
              text-xl
              font-bold

              ${
                result.calorieDifference <
                0
                  ? "text-amber-700"
                  : "text-emerald-700"
              }
            `}
          >
            {result.calorieDifference >
            0
              ? "+"
              : ""}
            {formatCalories(
              result.calorieDifference
            )}{" "}
            kcal/day
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            This is the difference
            between your estimated
            maintenance calories and
            the calorie target selected
            for your goal.
          </p>
        </div>
      )}

      {/* =========================================
          BASIC DETAILS
      ========================================= */}

      <div className="mt-7 rounded-2xl border border-slate-200 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          Understanding your calorie
          estimate
        </h3>

        <div className="mt-4 space-y-4">
          <DetailItem
            title="BMR — Basal Metabolic Rate"
            description="BMR estimates the energy your body needs for essential functions such as breathing, circulation, temperature regulation and basic organ activity while at rest."
          />

          <DetailItem
            title="TDEE — Total Daily Energy Expenditure"
            description="TDEE estimates your total daily energy use by multiplying your BMR by an activity factor. It is commonly used as an estimate of maintenance calories."
          />

          <DetailItem
            title="Calorie target"
            description="Your target is calculated from estimated maintenance calories and your selected goal. It should be treated as a starting estimate rather than an exact requirement."
          />

          <DetailItem
            title="Activity level"
            description="Activity has a large effect on the result. Choose the level that best represents your usual lifestyle rather than your most active day."
          />
        </div>
      </div>

      {/* =========================================
          FORMULA
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-sm font-bold text-slate-900">
          How is this calculated?
        </h3>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          This calculator uses the
          Mifflin–St Jeor equation to
          estimate BMR. The BMR is then
          multiplied by the selected
          activity factor to estimate
          total daily energy
          expenditure.
        </p>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-mono text-xs text-slate-700">
            TDEE = BMR × Activity
            Multiplier
          </p>
        </div>
      </div>

      {/* =========================================
          IMPORTANT NOTE
      ========================================= */}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-xs font-bold text-amber-800">
          Important
        </p>

        <p className="mt-2 text-xs leading-5 text-amber-900/80">
          Calorie equations provide
          estimates and cannot measure
          your exact energy needs.
          Actual requirements can vary
          based on body composition,
          metabolism, health,
          medications, training,
          pregnancy and other factors.
        </p>
      </div>

      <p className="mt-5 text-[11px] leading-5 text-slate-500">
        This calculator is intended for
        general educational use and is
        not a substitute for
        individualized medical or
        nutritional advice. It is not
        designed for children,
        pregnancy, or people who need
        medically supervised nutrition
        planning.
      </p>
    </div>
  );
}

/* =============================================
   NUMBER FIELD
============================================= */

function NumberField({
  label,
  hint,
  value,
  onChange,
  suffix,
  min = 0,
  step = 1,
  compact = false,
}: {
  label: string;
  hint?: string;
  value: number;

  onChange: (
    value: number
  ) => void;

  suffix?: string;
  min?: number;
  step?: number;
  compact?: boolean;
}) {
  return (
    <label className="block">
      <span
        className={
          compact
            ? "text-[10px] font-semibold text-slate-600"
            : "text-xs font-semibold text-slate-700"
        }
      >
        {label}
      </span>

      {hint && (
        <p className="mt-1 text-[11px] leading-4 text-slate-500">
          {hint}
        </p>
      )}

      <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => {
            const next =
              Number(
                event.target.value
              );

            onChange(
              Number.isFinite(next)
                ? next
                : 0
            );
          }}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm font-semibold text-slate-900 outline-none"
        />

        {suffix && (
          <span className="pr-3 text-xs font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

/* =============================================
   TOGGLE BUTTON
============================================= */

function ToggleButton({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        border
        px-3
        py-2.5
        text-left
        transition

        ${
          active
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <p
        className={`
          text-xs
          font-semibold

          ${
            active
              ? "text-blue-800"
              : "text-slate-800"
          }
        `}
      >
        {label}
      </p>

      {description && (
        <p className="mt-0.5 text-[10px] text-slate-500">
          {description}
        </p>
      )}
    </button>
  );
}

/* =============================================
   RESULT CARD
============================================= */

function ResultCard({
  label,
  value,
  description,
  highlight = false,
}: {
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4

        ${
          highlight
            ? "border-blue-200 bg-blue-50"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <p
        className={`
          text-[10px]
          font-bold
          uppercase
          tracking-wide

          ${
            highlight
              ? "text-blue-700"
              : "text-slate-500"
          }
        `}
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-lg
          font-bold

          ${
            highlight
              ? "text-blue-950"
              : "text-slate-900"
          }
        `}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =============================================
   DETAIL ITEM
============================================= */

function DetailItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-800">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =============================================
   FORMAT
============================================= */

function formatCalories(
  value: number
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Math.round(
    value
  ).toLocaleString();
}