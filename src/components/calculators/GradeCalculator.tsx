"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */

type GradeTool =
  | "average"
  | "weighted"
  | "final"
  | "gpa";

interface GradeRow {
  id: number;
  name: string;
  score: number;
}

interface WeightedGradeRow {
  id: number;
  name: string;
  score: number;
  weight: number;
}

interface GpaCourse {
  id: number;
  name: string;
  grade: LetterGrade;
  credits: number;
}

type LetterGrade =
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "D-"
  | "F";

interface GradeScale {
  grade: LetterGrade;
  min: number;
  max: number;
  gpa: number;
}

/* ──────────────────────────────────────────────────────────
   Grade Scale
────────────────────────────────────────────────────────── */

const GRADE_SCALE: GradeScale[] = [
  {
    grade: "A",
    min: 93,
    max: 100,
    gpa: 4,
  },
  {
    grade: "A-",
    min: 90,
    max: 92.99,
    gpa: 3.7,
  },
  {
    grade: "B+",
    min: 87,
    max: 89.99,
    gpa: 3.3,
  },
  {
    grade: "B",
    min: 83,
    max: 86.99,
    gpa: 3,
  },
  {
    grade: "B-",
    min: 80,
    max: 82.99,
    gpa: 2.7,
  },
  {
    grade: "C+",
    min: 77,
    max: 79.99,
    gpa: 2.3,
  },
  {
    grade: "C",
    min: 73,
    max: 76.99,
    gpa: 2,
  },
  {
    grade: "C-",
    min: 70,
    max: 72.99,
    gpa: 1.7,
  },
  {
    grade: "D+",
    min: 67,
    max: 69.99,
    gpa: 1.3,
  },
  {
    grade: "D",
    min: 63,
    max: 66.99,
    gpa: 1,
  },
  {
    grade: "D-",
    min: 60,
    max: 62.99,
    gpa: 0.7,
  },
  {
    grade: "F",
    min: 0,
    max: 59.99,
    gpa: 0,
  },
];

const GRADE_POINTS = Object.fromEntries(
  GRADE_SCALE.map((item) => [
    item.grade,
    item.gpa,
  ])
) as Record<LetterGrade, number>;

/* ──────────────────────────────────────────────────────────
   Tool Information
────────────────────────────────────────────────────────── */

const TOOLS: {
  id: GradeTool;
  title: string;
  short: string;
}[] = [
  {
    id: "average",
    title: "Grade Average",
    short: "Average scores",
  },
  {
    id: "weighted",
    title: "Weighted Grade",
    short: "Different weights",
  },
  {
    id: "final",
    title: "Final Grade",
    short: "Required exam score",
  },
  {
    id: "gpa",
    title: "GPA",
    short: "4.0 scale",
  },
];

/* ──────────────────────────────────────────────────────────
   SEO / FAQ
────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    question: "What is a Grade Calculator?",
    answer:
      "A Grade Calculator helps students calculate their average grade, weighted course grade, GPA, or the score needed on a final exam to reach a target course grade.",
  },
  {
    question:
      "How do I calculate my average grade?",
    answer:
      "Add your assignment, quiz, test, or exam percentages. The Grade Average Calculator adds all scores and divides the total by the number of scores entered.",
  },
  {
    question:
      "How does a weighted grade calculator work?",
    answer:
      "A weighted grade calculator multiplies each category score by its percentage weight. For example, a final exam worth 40% affects the course grade more than homework worth 10%.",
  },
  {
    question:
      "How do I calculate what grade I need on my final exam?",
    answer:
      "Enter your current grade, the percentage weight of the final exam, and your target course grade. CalcHub calculates the minimum final exam score required to reach that target.",
  },
  {
    question: "How is GPA calculated?",
    answer:
      "GPA is calculated by multiplying each course grade point by its credit hours, adding the resulting quality points, and dividing them by the total number of credits.",
  },
  {
    question:
      "Does this calculator use a 4.0 GPA scale?",
    answer:
      "Yes. The built-in GPA calculator uses a common 4.0 letter-grade scale ranging from A = 4.0 to F = 0.0.",
  },
  {
    question:
      "Can grading scales differ between schools?",
    answer:
      "Yes. Percentage ranges, letter grades, GPA points, weighting methods, and passing requirements may differ by school, college, university, or country. Always compare results with your institution's grading policy.",
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

/* ──────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────── */

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function percentage(
  value: number
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

function formatNumber(
  value: number,
  digits = 2
): string {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(digits);
}

function getLetterGrade(
  percentageGrade: number
): LetterGrade {
  const grade =
    GRADE_SCALE.find(
      (item) =>
        percentageGrade >= item.min
    );

  return grade?.grade ?? "F";
}

function getGradePoint(
  grade: LetterGrade
): number {
  return GRADE_POINTS[grade] ?? 0;
}

/* ──────────────────────────────────────────────────────────
   Main Grade Calculator
────────────────────────────────────────────────────────── */

export function GradeCalculator() {
  const [tool, setTool] =
    useState<GradeTool>("average");

  /* ────────────────────────────────────────────────────────
     Grade Average
  ──────────────────────────────────────────────────────── */

  const [gradeRows, setGradeRows] =
    useState<GradeRow[]>([
      {
        id: 1,
        name: "Assignment 1",
        score: 85,
      },
      {
        id: 2,
        name: "Assignment 2",
        score: 90,
      },
      {
        id: 3,
        name: "Exam",
        score: 88,
      },
    ]);

  const nextGradeId =
    useRef(4);

  const averageResult =
    useMemo(() => {
      if (
        gradeRows.length === 0
      ) {
        return {
          average: 0,
          highest: 0,
          lowest: 0,
          letterGrade:
            "F" as LetterGrade,
        };
      }

      const scores =
        gradeRows.map(
          (row) => row.score
        );

      const total =
        scores.reduce(
          (sum, score) =>
            sum + score,
          0
        );

      const average =
        total /
        scores.length;

      return {
        average,

        highest:
          Math.max(...scores),

        lowest:
          Math.min(...scores),

        letterGrade:
          getLetterGrade(
            average
          ),
      };
    }, [gradeRows]);

  /* ────────────────────────────────────────────────────────
     Weighted Grade
  ──────────────────────────────────────────────────────── */

  const [
    weightedRows,
    setWeightedRows,
  ] =
    useState<WeightedGradeRow[]>([
      {
        id: 1,
        name: "Assignments",
        score: 90,
        weight: 30,
      },
      {
        id: 2,
        name: "Midterm",
        score: 85,
        weight: 30,
      },
      {
        id: 3,
        name: "Final Exam",
        score: 88,
        weight: 40,
      },
    ]);

  const nextWeightedId =
    useRef(4);

  const weightedResult =
    useMemo(() => {
      const totalWeight =
        weightedRows.reduce(
          (sum, row) =>
            sum + row.weight,
          0
        );

      const weightedPoints =
        weightedRows.reduce(
          (sum, row) =>
            sum +
            row.score *
              (row.weight / 100),
          0
        );

      const normalizedGrade =
        totalWeight > 0
          ? weightedPoints /
            (totalWeight / 100)
          : 0;

      return {
        totalWeight,

        remainingWeight:
          Math.max(
            0,
            100 - totalWeight
          ),

        weightedPoints,

        normalizedGrade,

        letterGrade:
          getLetterGrade(
            normalizedGrade
          ),
      };
    }, [weightedRows]);

  /* ────────────────────────────────────────────────────────
     Final Exam Calculator
  ──────────────────────────────────────────────────────── */

  const [
    currentGrade,
    setCurrentGrade,
  ] = useState(82);

  const [
    finalWeight,
    setFinalWeight,
  ] = useState(30);

  const [
    targetGrade,
    setTargetGrade,
  ] = useState(85);

  const [
    expectedFinalScore,
    setExpectedFinalScore,
  ] = useState(85);

  const finalResult =
    useMemo(() => {
      const weight =
        clamp(
          finalWeight,
          0,
          100
        ) / 100;

      if (weight <= 0) {
        return {
          required: Infinity,

          projected:
            currentGrade,

          status:
            "invalid" as const,
        };
      }

      const courseworkWeight =
        1 - weight;

      const required =
        (
          targetGrade -
          currentGrade *
            courseworkWeight
        ) / weight;

      const projected =
        currentGrade *
          courseworkWeight +
        expectedFinalScore *
          weight;

      let status:
        | "possible"
        | "impossible"
        | "secured"
        | "invalid" =
        "possible";

      if (required > 100) {
        status = "impossible";
      } else if (
        required <= 0
      ) {
        status = "secured";
      }

      return {
        required,
        projected,
        status,
      };
    }, [
      currentGrade,
      finalWeight,
      targetGrade,
      expectedFinalScore,
    ]);

  /* ────────────────────────────────────────────────────────
     GPA
  ──────────────────────────────────────────────────────── */

  const [gpaCourses, setGpaCourses] =
    useState<GpaCourse[]>([
      {
        id: 1,
        name: "Course 1",
        grade: "A",
        credits: 3,
      },
      {
        id: 2,
        name: "Course 2",
        grade: "B+",
        credits: 3,
      },
      {
        id: 3,
        name: "Course 3",
        grade: "A-",
        credits: 4,
      },
    ]);

  const nextGpaId =
    useRef(4);

  const gpaResult =
    useMemo(() => {
      const totalCredits =
        gpaCourses.reduce(
          (sum, course) =>
            sum + course.credits,
          0
        );

      const qualityPoints =
        gpaCourses.reduce(
          (sum, course) =>
            sum +
            getGradePoint(
              course.grade
            ) *
              course.credits,
          0
        );

      return {
        totalCredits,

        qualityPoints,

        gpa:
          totalCredits > 0
            ? qualityPoints /
              totalCredits
            : 0,
      };
    }, [gpaCourses]);

  /* ────────────────────────────────────────────────────────
     Row Actions
  ──────────────────────────────────────────────────────── */

  function addGradeRow() {
    const id =
      nextGradeId.current++;

    setGradeRows(
      (current) => [
        ...current,
        {
          id,
          name: `Grade ${
            current.length + 1
          }`,
          score: 80,
        },
      ]
    );
  }

  function removeGradeRow(
    id: number
  ) {
    setGradeRows(
      (current) =>
        current.filter(
          (row) => row.id !== id
        )
    );
  }

  function addWeightedRow() {
    const id =
      nextWeightedId.current++;

    setWeightedRows(
      (current) => [
        ...current,
        {
          id,
          name: `Category ${
            current.length + 1
          }`,
          score: 80,
          weight: 10,
        },
      ]
    );
  }

  function removeWeightedRow(
    id: number
  ) {
    setWeightedRows(
      (current) =>
        current.filter(
          (row) => row.id !== id
        )
    );
  }

  function addGpaCourse() {
    const id =
      nextGpaId.current++;

    setGpaCourses(
      (current) => [
        ...current,
        {
          id,
          name: `Course ${
            current.length + 1
          }`,
          grade: "B",
          credits: 3,
        },
      ]
    );
  }

  function removeGpaCourse(
    id: number
  ) {
    setGpaCourses(
      (current) =>
        current.filter(
          (course) =>
            course.id !== id
        )
    );
  }

  /* ───────────────────────────────────────────────────── */

  return (
    <div className="
      mx-auto
      w-full
      max-w-[860px]
    ">
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
          SEO Heading
      ──────────────────────────────────────────────── */}

      <header className="
        mb-6
        text-center
      ">
        <p className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.2em]
          text-blue-600
        ">
          CalcHub Education Tools
        </p>

        <h1 className="
          mt-2
          text-2xl
          font-bold
          tracking-tight
          text-slate-950
          sm:text-3xl
        ">
          Grade Calculator

          <span className="
            block
            text-blue-600
          ">
            Calculate Average,
            Weighted Grade, GPA &
            Final Exam Score
          </span>
        </h1>

        <p className="
          mx-auto
          mt-3
          max-w-2xl
          text-sm
          leading-6
          text-slate-600
        ">
          Use CalcHub&apos;s free
          Grade Calculator to
          calculate your grade
          average, weighted course
          grade, GPA, and the score
          you need on a final exam
          to reach your target
          grade.
        </p>
      </header>

      {/* ────────────────────────────────────────────────
          Tool Selector
      ──────────────────────────────────────────────── */}

      <div className="
        mb-4
        grid
        grid-cols-2
        gap-2
        rounded-2xl
        border
        border-slate-200
        bg-slate-100
        p-1.5
        sm:grid-cols-4
      ">
        {TOOLS.map((item) => {
          const active =
            tool === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                setTool(item.id)
              }
              className={`
                rounded-xl
                px-3
                py-3
                text-left
                transition-all
                ${
                  active
                    ? `
                      bg-white
                      text-blue-700
                      shadow-sm
                    `
                    : `
                      text-slate-500
                      hover:bg-white/60
                      hover:text-slate-800
                    `
                }
              `}
            >
              <span className="
                block
                text-xs
                font-bold
              ">
                {item.title}
              </span>

              <span className="
                mt-0.5
                block
                text-[9px]
                font-medium
                text-slate-400
              ">
                {item.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* ────────────────────────────────────────────────
          Calculator
      ──────────────────────────────────────────────── */}

      <section
        aria-label="Grade calculator"
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
        {/* Header */}

        <CalculatorHeader
          tool={tool}
        />

        <div className="
          p-5
          sm:p-6
        ">
          {/* ── Average ───────────────────────────────── */}

          {tool === "average" && (
            <>
              <div className="
                space-y-3
              ">
                {gradeRows.map(
                  (row) => (
                    <GradeAverageRow
                      key={row.id}
                      row={row}
                      removable={
                        gradeRows.length >
                        1
                      }
                      onChange={(
                        updated
                      ) =>
                        setGradeRows(
                          (current) =>
                            current.map(
                              (item) =>
                                item.id ===
                                row.id
                                  ? updated
                                  : item
                            )
                        )
                      }
                      onRemove={() =>
                        removeGradeRow(
                          row.id
                        )
                      }
                    />
                  )
                )}
              </div>

              <AddButton
                onClick={
                  addGradeRow
                }
              >
                + Add Grade
              </AddButton>

              <ResultPanel
                eyebrow="Average Grade"
                value={percentage(
                  averageResult.average
                )}
                letter={
                  averageResult.letterGrade
                }
              >
                <div className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                ">
                  <MetricCard
                    label="Entries"
                    value={String(
                      gradeRows.length
                    )}
                  />

                  <MetricCard
                    label="Highest"
                    value={percentage(
                      averageResult.highest
                    )}
                  />

                  <MetricCard
                    label="Lowest"
                    value={percentage(
                      averageResult.lowest
                    )}
                  />
                </div>
              </ResultPanel>
            </>
          )}

          {/* ── Weighted ──────────────────────────────── */}

          {tool === "weighted" && (
            <>
              <div className="
                hidden
                grid-cols-[1.3fr_1fr_1fr_40px]
                gap-3
                pb-2
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
                sm:grid
              ">
                <span>
                  Category
                </span>

                <span>
                  Grade
                </span>

                <span>
                  Weight
                </span>

                <span />
              </div>

              <div className="
                space-y-3
              ">
                {weightedRows.map(
                  (row) => (
                    <WeightedRow
                      key={row.id}
                      row={row}
                      removable={
                        weightedRows.length >
                        1
                      }
                      onChange={(
                        updated
                      ) =>
                        setWeightedRows(
                          (current) =>
                            current.map(
                              (item) =>
                                item.id ===
                                row.id
                                  ? updated
                                  : item
                            )
                        )
                      }
                      onRemove={() =>
                        removeWeightedRow(
                          row.id
                        )
                      }
                    />
                  )
                )}
              </div>

              <AddButton
                onClick={
                  addWeightedRow
                }
              >
                + Add Category
              </AddButton>

              {weightedResult.totalWeight >
                100 && (
                <WarningBox>
                  Your category
                  weights total{" "}
                  {formatNumber(
                    weightedResult.totalWeight,
                    1
                  )}
                  %. Normally course
                  weights should total
                  100%.
                </WarningBox>
              )}

              <ResultPanel
                eyebrow="Weighted Grade"
                value={percentage(
                  weightedResult.normalizedGrade
                )}
                letter={
                  weightedResult.letterGrade
                }
              >
                <div className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-4
                ">
                  <MetricCard
                    label="Weight Entered"
                    value={`${formatNumber(
                      weightedResult.totalWeight,
                      1
                    )}%`}
                  />

                  <MetricCard
                    label="Remaining"
                    value={`${formatNumber(
                      weightedResult.remainingWeight,
                      1
                    )}%`}
                  />

                  <MetricCard
                    label="Weighted Points"
                    value={formatNumber(
                      weightedResult.weightedPoints,
                      2
                    )}
                  />

                  <MetricCard
                    label="Letter Grade"
                    value={
                      weightedResult.letterGrade
                    }
                  />
                </div>
              </ResultPanel>
            </>
          )}

          {/* ── Final Exam ────────────────────────────── */}

          {tool === "final" && (
            <>
              <div className="
                grid
                gap-5
                sm:grid-cols-2
              ">
                <InputSection
                  label="Current Grade"
                  description="Your grade before the final exam"
                >
                  <PercentageInput
                    value={
                      currentGrade
                    }
                    onChange={
                      setCurrentGrade
                    }
                  />
                </InputSection>

                <InputSection
                  label="Final Exam Weight"
                  description="How much the final counts toward your course grade"
                >
                  <PercentageInput
                    value={
                      finalWeight
                    }
                    onChange={
                      setFinalWeight
                    }
                  />
                </InputSection>

                <InputSection
                  label="Target Course Grade"
                  description="The final course grade you want"
                >
                  <PercentageInput
                    value={
                      targetGrade
                    }
                    onChange={
                      setTargetGrade
                    }
                  />
                </InputSection>

                <InputSection
                  label="Expected Final Score"
                  description="Optional score for projecting your final course grade"
                >
                  <PercentageInput
                    value={
                      expectedFinalScore
                    }
                    onChange={
                      setExpectedFinalScore
                    }
                  />
                </InputSection>
              </div>

              {/* Required score */}

              <div className={`
                mt-6
                overflow-hidden
                rounded-2xl
                border
                ${
                  finalResult.status ===
                  "impossible"
                    ? `
                      border-red-200
                      bg-gradient-to-br
                      from-red-50
                      to-white
                    `
                    : finalResult.status ===
                        "secured"
                      ? `
                        border-emerald-200
                        bg-gradient-to-br
                        from-emerald-50
                        to-white
                      `
                      : `
                        border-blue-200
                        bg-gradient-to-br
                        from-blue-50
                        to-white
                      `
                }
              `}>
                <div className="
                  p-5
                  sm:p-6
                ">
                  <p className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-slate-500
                  ">
                    Required Final
                    Exam Grade
                  </p>

                  <p className={`
                    mt-2
                    text-4xl
                    font-bold
                    tracking-tight
                    ${
                      finalResult.status ===
                      "impossible"
                        ? "text-red-700"
                        : finalResult.status ===
                            "secured"
                          ? "text-emerald-700"
                          : "text-blue-700"
                    }
                  `}>
                    {Number.isFinite(
                      finalResult.required
                    )
                      ? percentage(
                          Math.max(
                            0,
                            finalResult.required
                          )
                        )
                      : "—"}
                  </p>

                  <p className="
                    mt-3
                    text-sm
                    leading-6
                    text-slate-600
                  ">
                    {finalResult.status ===
                      "impossible" &&
                      "The required score is above 100%, so the selected target cannot be reached with this final-exam weight."}

                    {finalResult.status ===
                      "secured" &&
                      "You have already secured the selected target grade even with a very low final-exam score."}

                    {finalResult.status ===
                      "possible" &&
                      `You need approximately ${percentage(
                        finalResult.required
                      )} on the final exam to finish with a ${percentage(
                        targetGrade
                      )} course grade.`}

                    {finalResult.status ===
                      "invalid" &&
                      "Enter a final-exam weight greater than 0%."}
                  </p>
                </div>

                <div className="
                  grid
                  border-t
                  border-slate-200
                  bg-white/70
                  sm:grid-cols-2
                ">
                  <ResultStrip
                    label="Projected Course Grade"
                    value={percentage(
                      finalResult.projected
                    )}
                  />

                  <ResultStrip
                    label="Projected Letter Grade"
                    value={getLetterGrade(
                      finalResult.projected
                    )}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── GPA ───────────────────────────────────── */}

          {tool === "gpa" && (
            <>
              <div className="
                hidden
                grid-cols-[1.4fr_1fr_1fr_40px]
                gap-3
                pb-2
                text-[9px]
                font-bold
                uppercase
                tracking-wider
                text-slate-400
                sm:grid
              ">
                <span>
                  Course
                </span>

                <span>
                  Grade
                </span>

                <span>
                  Credits
                </span>

                <span />
              </div>

              <div className="
                space-y-3
              ">
                {gpaCourses.map(
                  (course) => (
                    <GpaCourseRow
                      key={
                        course.id
                      }
                      course={
                        course
                      }
                      removable={
                        gpaCourses.length >
                        1
                      }
                      onChange={(
                        updated
                      ) =>
                        setGpaCourses(
                          (current) =>
                            current.map(
                              (item) =>
                                item.id ===
                                course.id
                                  ? updated
                                  : item
                            )
                        )
                      }
                      onRemove={() =>
                        removeGpaCourse(
                          course.id
                        )
                      }
                    />
                  )
                )}
              </div>

              <AddButton
                onClick={
                  addGpaCourse
                }
              >
                + Add Course
              </AddButton>

              <div className="
                mt-6
                overflow-hidden
                rounded-2xl
                border
                border-blue-200
                bg-gradient-to-br
                from-blue-50
                via-indigo-50
                to-white
              ">
                <div className="
                  p-5
                  sm:p-6
                ">
                  <p className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-blue-500
                  ">
                    Calculated GPA
                  </p>

                  <p className="
                    mt-1
                    text-4xl
                    font-bold
                    tracking-tight
                    text-slate-900
                  ">
                    {formatNumber(
                      gpaResult.gpa,
                      2
                    )}

                    <span className="
                      ml-1
                      text-base
                      font-semibold
                      text-slate-400
                    ">
                      / 4.00
                    </span>
                  </p>
                </div>

                <div className="
                  grid
                  border-t
                  border-blue-200
                  bg-white/70
                  sm:grid-cols-3
                ">
                  <ResultStrip
                    label="Courses"
                    value={String(
                      gpaCourses.length
                    )}
                  />

                  <ResultStrip
                    label="Total Credits"
                    value={formatNumber(
                      gpaResult.totalCredits,
                      1
                    )}
                  />

                  <ResultStrip
                    label="Quality Points"
                    value={formatNumber(
                      gpaResult.qualityPoints,
                      2
                    )}
                  />
                </div>
              </div>
            </>
          )}

          {/* Disclaimer */}

          <div className="
            mt-5
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-amber-200
            bg-amber-50
            px-4
            py-3.5
          ">
            <div className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-amber-100
            ">
              ⚠
            </div>

            <div>
              <p className="
                text-xs
                font-bold
                text-amber-900
              ">
                Check your
                institution&apos;s grading
                policy
              </p>

              <p className="
                mt-1
                text-[11px]
                leading-relaxed
                text-amber-800
              ">
                Schools, colleges and
                universities may use
                different percentage
                ranges, GPA scales,
                rounding rules and
                weighting systems. Use
                your institution&apos;s
                official grading policy
                for academic decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────
          SEO Content
      ──────────────────────────────────────────────── */}

      <article className="
        mt-8
        space-y-5
      ">
        <SeoSection title="Grade Calculator – Calculate Grades Instantly">
          <p>
            CalcHub&apos;s Grade
            Calculator helps students
            calculate grades quickly and
            accurately. You can find the
            average of assignments,
            quizzes and exams, calculate a
            weighted course grade,
            calculate GPA, or determine
            what score you need on a final
            exam.
          </p>

          <p>
            The calculator can be useful
            for school, college and
            university students who want
            to track academic performance
            and understand how future
            assessments may affect their
            final grade.
          </p>
        </SeoSection>

        <SeoSection title="Grade Average Calculator">
          <p>
            The Grade Average Calculator
            calculates the arithmetic mean
            of multiple percentage scores.
            Add your assignments, quizzes,
            tests, projects or exam grades
            and CalcHub instantly displays
            your average percentage,
            highest score, lowest score
            and estimated letter grade.
          </p>

          <FormulaBox
            title="Average Grade Formula"
            formula="Average = Sum of Grades ÷ Number of Grades"
          />
        </SeoSection>

        <SeoSection title="Weighted Grade Calculator">
          <p>
            Not every assignment or exam
            has the same importance.
            Weighted grading gives
            different percentages of the
            final course grade to
            different categories.
          </p>

          <p>
            For example, homework might
            represent 20% of the course,
            the midterm 30%, and the final
            exam 50%. A weighted grade
            calculator accounts for these
            differences when calculating
            the overall grade.
          </p>

          <FormulaBox
            title="Weighted Grade Formula"
            formula="Weighted Grade = Σ (Grade × Weight)"
          />
        </SeoSection>

        <SeoSection title="Final Exam Grade Calculator">
          <p>
            The Final Exam Grade
            Calculator determines the
            minimum score required on your
            final exam to reach a desired
            course grade.
          </p>

          <Steps
            items={[
              "Enter your current course grade before the final exam.",
              "Enter how much the final exam is worth as a percentage of the overall course.",
              "Enter the final course grade you want to achieve.",
              "CalcHub calculates the final-exam score you need.",
            ]}
          />

          <FormulaBox
            title="Required Final Exam Formula"
            formula="Required Final = (Target − Current × (1 − Final Weight)) ÷ Final Weight"
          />
        </SeoSection>

        <SeoSection title="GPA Calculator">
          <p>
            GPA stands for Grade Point
            Average. GPA combines course
            grades and credit hours to
            provide a numerical summary of
            academic performance.
          </p>

          <p>
            This calculator uses a common
            4.0 GPA scale. Courses with
            more credit hours have a
            greater effect on the final
            GPA than courses with fewer
            credits.
          </p>

          <FormulaBox
            title="GPA Formula"
            formula="GPA = Total Quality Points ÷ Total Credit Hours"
          />
        </SeoSection>

        <SeoSection title="4.0 GPA and Letter Grade Scale">
          <div className="
            overflow-x-auto
          ">
            <table className="
              w-full
              min-w-[500px]
              border-collapse
              text-left
              text-xs
            ">
              <thead>
                <tr className="
                  border-b
                  border-slate-200
                ">
                  <th className="
                    px-3
                    py-3
                    font-bold
                    text-slate-900
                  ">
                    Letter
                  </th>

                  <th className="
                    px-3
                    py-3
                    font-bold
                    text-slate-900
                  ">
                    Percentage
                  </th>

                  <th className="
                    px-3
                    py-3
                    font-bold
                    text-slate-900
                  ">
                    GPA
                  </th>
                </tr>
              </thead>

              <tbody className="
                text-slate-600
              ">
                {GRADE_SCALE.map(
                  (item) => (
                    <tr
                      key={
                        item.grade
                      }
                      className="
                        border-b
                        border-slate-100
                        last:border-0
                      "
                    >
                      <td className="
                        px-3
                        py-3
                        font-bold
                        text-slate-800
                      ">
                        {item.grade}
                      </td>

                      <td className="
                        px-3
                        py-3
                      ">
                        {item.min}
                        {item.grade !==
                          "A" &&
                          ` – ${Math.floor(
                            item.max
                          )}`}
                        {item.grade ===
                          "A" &&
                          " – 100"}
                        %
                      </td>

                      <td className="
                        px-3
                        py-3
                      ">
                        {item.gpa.toFixed(
                          1
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <p className="
            text-xs
            text-slate-500
          ">
            This is a common example
            scale. Your institution may
            use different grade
            boundaries or GPA points.
          </p>
        </SeoSection>

        <SeoSection title="How to Use the Grade Calculator">
          <Steps
            items={[
              "Choose Grade Average, Weighted Grade, Final Grade, or GPA from the calculator tabs.",
              "Enter your grades, percentages, weights, credits, or final-exam information.",
              "Add or remove assignments, categories, or courses as needed.",
              "Review your calculated result instantly.",
              "Compare the result with your school's official grading scale.",
            ]}
          />
        </SeoSection>

        <SeoSection title="Frequently Asked Questions">
          <div className="
            divide-y
            divide-slate-200
          ">
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
                  <summary className="
                    flex
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-4
                    text-sm
                    font-bold
                    text-slate-800
                  ">
                    <span>
                      {item.question}
                    </span>

                    <span className="
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
                    ">
                      +
                    </span>
                  </summary>

                  <p className="
                    mt-3
                    pr-8
                    text-sm
                    leading-6
                    text-slate-600
                  ">
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
   Calculator Header
────────────────────────────────────────────────────────── */

function CalculatorHeader({
  tool,
}: {
  tool: GradeTool;
}) {
  const content: Record<
    GradeTool,
    {
      title: string;
      description: string;
    }
  > = {
    average: {
      title:
        "Grade Average Calculator",
      description:
        "Calculate the average of multiple assignment, quiz, test or exam grades.",
    },

    weighted: {
      title:
        "Weighted Grade Calculator",
      description:
        "Calculate your course grade when categories have different percentage weights.",
    },

    final: {
      title:
        "Final Exam Grade Calculator",
      description:
        "Find the score you need on your final exam to reach a target course grade.",
    },

    gpa: {
      title:
        "GPA Calculator",
      description:
        "Calculate your credit-weighted Grade Point Average using a 4.0 scale.",
    },
  };

  const active = content[tool];

  return (
    <div className="
      border-b
      border-slate-200
      bg-slate-50
      px-5
      py-4
      sm:px-6
    ">
      <p className="
        text-xs
        font-medium
        text-slate-500
      ">
        Academic Grade Tools
      </p>

      <div className="
        mt-1
        flex
        items-center
        gap-2
      ">
        <span className="
          h-2.5
          w-2.5
          rounded-full
          bg-emerald-500
        " />

        <h2 className="
          text-sm
          font-bold
          text-slate-800
        ">
          {active.title}
        </h2>
      </div>

      <p className="
        mt-2
        max-w-xl
        text-[11px]
        leading-5
        text-slate-500
      ">
        {active.description}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Grade Average Row
────────────────────────────────────────────────────────── */

function GradeAverageRow({
  row,
  onChange,
  onRemove,
  removable,
}: {
  row: GradeRow;
  onChange: (
    row: GradeRow
  ) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="
      grid
      grid-cols-[1fr_110px_40px]
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-2
    ">
      <input
        value={row.name}
        aria-label="Grade name"
        onChange={(event) =>
          onChange({
            ...row,
            name:
              event.target.value,
          })
        }
        className="
          min-w-0
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-2.5
          text-xs
          font-semibold
          text-slate-700
          outline-none
          focus:border-blue-500
        "
      />

      <PercentField
        value={row.score}
        onChange={(score) =>
          onChange({
            ...row,
            score,
          })
        }
      />

      <RemoveButton
        disabled={!removable}
        onClick={onRemove}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Weighted Row
────────────────────────────────────────────────────────── */

function WeightedRow({
  row,
  onChange,
  onRemove,
  removable,
}: {
  row: WeightedGradeRow;
  onChange: (
    row: WeightedGradeRow
  ) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="
      grid
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-2
      sm:grid-cols-[1.3fr_1fr_1fr_40px]
    ">
      <input
        value={row.name}
        aria-label="Category name"
        onChange={(event) =>
          onChange({
            ...row,
            name:
              event.target.value,
          })
        }
        className="
          min-w-0
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-2.5
          text-xs
          font-semibold
          outline-none
          focus:border-blue-500
        "
      />

      <PercentField
        value={row.score}
        onChange={(score) =>
          onChange({
            ...row,
            score,
          })
        }
      />

      <PercentField
        value={row.weight}
        onChange={(weight) =>
          onChange({
            ...row,
            weight,
          })
        }
      />

      <RemoveButton
        disabled={!removable}
        onClick={onRemove}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   GPA Course Row
────────────────────────────────────────────────────────── */

function GpaCourseRow({
  course,
  onChange,
  onRemove,
  removable,
}: {
  course: GpaCourse;
  onChange: (
    course: GpaCourse
  ) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <div className="
      grid
      gap-2
      rounded-xl
      border
      border-slate-200
      bg-slate-50
      p-2
      sm:grid-cols-[1.4fr_1fr_1fr_40px]
    ">
      <input
        value={course.name}
        aria-label="Course name"
        onChange={(event) =>
          onChange({
            ...course,
            name:
              event.target.value,
          })
        }
        className="
          min-w-0
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-2.5
          text-xs
          font-semibold
          outline-none
          focus:border-blue-500
        "
      />

      <select
        value={course.grade}
        aria-label="Letter grade"
        onChange={(event) =>
          onChange({
            ...course,
            grade:
              event.target
                .value as LetterGrade,
          })
        }
        className="
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-2.5
          text-xs
          font-bold
          text-slate-700
          outline-none
          focus:border-blue-500
        "
      >
        {GRADE_SCALE.map(
          (item) => (
            <option
              key={item.grade}
              value={item.grade}
            >
              {item.grade} —{" "}
              {item.gpa.toFixed(
                1
              )}
            </option>
          )
        )}
      </select>

      <input
        type="number"
        value={course.credits}
        min={0}
        step={0.5}
        aria-label="Course credits"
        onChange={(event) =>
          onChange({
            ...course,

            credits:
              Math.max(
                0,
                Number(
                  event.target
                    .value
                ) || 0
              ),
          })
        }
        className="
          rounded-lg
          border
          border-slate-200
          bg-white
          px-3
          py-2.5
          font-mono
          text-xs
          font-bold
          outline-none
          focus:border-blue-500
        "
      />

      <RemoveButton
        disabled={!removable}
        onClick={onRemove}
      />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Percentage Field
────────────────────────────────────────────────────────── */

function PercentField({
  value,
  onChange,
}: {
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div className="
      flex
      overflow-hidden
      rounded-lg
      border
      border-slate-200
      bg-white
      focus-within:border-blue-500
    ">
      <input
        type="number"
        min={0}
        max={100}
        step={0.1}
        value={value}
        onChange={(
          event: ChangeEvent<HTMLInputElement>
        ) =>
          onChange(
            clamp(
              Number(
                event.target.value
              ) || 0,
              0,
              100
            )
          )
        }
        className="
          min-w-0
          flex-1
          bg-transparent
          px-3
          py-2.5
          font-mono
          text-xs
          font-bold
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      <span className="
        flex
        items-center
        border-l
        border-slate-200
        px-2
        text-[10px]
        font-bold
        text-slate-400
      ">
        %
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Percentage Input
────────────────────────────────────────────────────────── */

function PercentageInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (
    value: number
  ) => void;
}) {
  return (
    <div className="
      flex
      overflow-hidden
      rounded-xl
      border
      border-slate-300
      bg-white
      shadow-sm
      transition
      hover:border-blue-400
      focus-within:border-blue-500
      focus-within:ring-4
      focus-within:ring-blue-500/10
    ">
      <input
        type="number"
        value={value}
        min={0}
        max={100}
        step={0.1}
        onChange={(
          event: ChangeEvent<HTMLInputElement>
        ) =>
          onChange(
            clamp(
              Number(
                event.target.value
              ) || 0,
              0,
              100
            )
          )
        }
        className="
          min-w-0
          flex-1
          bg-transparent
          px-4
          py-3.5
          text-lg
          font-bold
          text-slate-900
          outline-none
          [appearance:textfield]
          [&::-webkit-inner-spin-button]:appearance-none
          [&::-webkit-outer-spin-button]:appearance-none
        "
      />

      <span className="
        flex
        items-center
        border-l
        border-slate-200
        bg-slate-50
        px-4
        text-sm
        font-bold
        text-slate-500
      ">
        %
      </span>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Input Section
────────────────────────────────────────────────────────── */

function InputSection({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="
        text-xs
        font-bold
        uppercase
        tracking-wider
        text-slate-500
      ">
        {label}
      </p>

      <p className="
        mb-2
        mt-1
        text-[10px]
        text-slate-400
      ">
        {description}
      </p>

      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Result Panel
────────────────────────────────────────────────────────── */

function ResultPanel({
  eyebrow,
  value,
  letter,
  children,
}: {
  eyebrow: string;
  value: string;
  letter: LetterGrade;
  children: ReactNode;
}) {
  return (
    <section className="
      mt-6
      overflow-hidden
      rounded-2xl
      border
      border-blue-200
      bg-gradient-to-br
      from-blue-50
      via-indigo-50
      to-white
    ">
      <div className="
        p-5
        sm:p-6
      ">
        <p className="
          text-[10px]
          font-bold
          uppercase
          tracking-[0.18em]
          text-blue-500
        ">
          {eyebrow}
        </p>

        <div className="
          mt-2
          flex
          flex-wrap
          items-center
          gap-3
        ">
          <p className="
            text-4xl
            font-bold
            tracking-tight
            text-slate-900
          ">
            {value}
          </p>

          <span className="
            rounded-full
            bg-blue-600
            px-3
            py-1
            text-sm
            font-bold
            text-white
          ">
            {letter}
          </span>
        </div>
      </div>

      <div className="
        border-t
        border-blue-100
        bg-white/60
        p-4
      ">
        {children}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────
   Result Strip
────────────────────────────────────────────────────────── */

function ResultStrip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="
      border-b
      border-slate-100
      px-5
      py-4
      last:border-0
      sm:border-b-0
      sm:border-r
      sm:last:border-r-0
    ">
      <p className="
        text-[9px]
        font-bold
        uppercase
        tracking-wider
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        text-sm
        font-bold
        text-slate-800
      ">
        {value}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Metric Card
────────────────────────────────────────────────────────── */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-white
      p-3
      text-center
    ">
      <p className="
        text-sm
        font-bold
        text-slate-800
      ">
        {value}
      </p>

      <p className="
        mt-1
        text-[8px]
        font-bold
        uppercase
        tracking-wider
        text-slate-400
      ">
        {label}
      </p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Buttons
────────────────────────────────────────────────────────── */

function AddButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        mt-4
        rounded-xl
        border
        border-blue-200
        bg-blue-50
        px-4
        py-2.5
        text-xs
        font-bold
        text-blue-700
        transition
        hover:border-blue-400
        hover:bg-blue-100
      "
    >
      {children}
    </button>
  );
}

function RemoveButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Remove row"
      className="
        flex
        h-full
        min-h-[40px]
        items-center
        justify-center
        rounded-lg
        border
        border-slate-200
        bg-white
        text-sm
        font-bold
        text-slate-400
        transition
        enabled:hover:border-red-200
        enabled:hover:bg-red-50
        enabled:hover:text-red-600
        disabled:cursor-not-allowed
        disabled:opacity-30
      "
    >
      ×
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   Warning
────────────────────────────────────────────────────────── */

function WarningBox({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="
      mt-4
      rounded-xl
      border
      border-amber-200
      bg-amber-50
      px-4
      py-3
      text-xs
      font-semibold
      leading-5
      text-amber-800
    ">
      ⚠ {children}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Formula Box
────────────────────────────────────────────────────────── */

function FormulaBox({
  title,
  formula,
}: {
  title: string;
  formula: string;
}) {
  return (
    <div className="
      rounded-xl
      border
      border-blue-100
      bg-blue-50
      p-4
    ">
      <p className="
        text-xs
        font-bold
        text-blue-900
      ">
        {title}
      </p>

      <p className="
        mt-2
        overflow-x-auto
        whitespace-nowrap
        font-mono
        text-xs
        font-bold
        text-blue-700
      ">
        {formula}
      </p>
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
    <section className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      sm:p-6
    ">
      <h2 className="
        text-lg
        font-bold
        tracking-tight
        text-slate-950
        sm:text-xl
      ">
        {title}
      </h2>

      <div className="
        mt-3
        space-y-3
        text-sm
        leading-7
        text-slate-600
      ">
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
    <div className="
      space-y-3
    ">
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
            <span className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-100
              text-[11px]
              font-bold
              text-blue-700
            ">
              {index + 1}
            </span>

            <p className="
              pt-0.5
            ">
              {item}
            </p>
          </div>
        )
      )}
    </div>
  );
}

export default GradeCalculator;