"use client";

import { useMemo, useState } from "react";

import {
  hillToSquareFeet,
  parseLandNumber,
  rectangleAreaToSquareFeet,
  SQFT_PER_UNIT,
  squareFeetToHill,
  squareFeetToStandard,
  squareFeetToTerai,
  standardToSquareFeet,
  teraiToSquareFeet,
  toDevanagariDigits,
  type PlotLengthUnit,
  type StandardAreaUnit,
} from "@/lib/land-area";
import { Stat, StatGrid } from "./shared";

type Mode = "hill" | "terai" | "standard" | "plot";
type Language = "en" | "ne";
type NumeralSystem = "latin" | "devanagari";
type Precision = 2 | 4 | 8;

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
}

function TextInput({ label, value, onChange, suffix }: TextInputProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
        {label}
      </span>
      <div className="flex min-h-11 min-w-0 items-stretch overflow-hidden rounded-lg border border-input bg-card transition-all duration-200 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/20 lg:min-h-10">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[14px] font-medium text-foreground outline-none lg:py-2"
          aria-label={label}
        />
        {suffix ? (
          <span className="flex items-center border-l border-border bg-muted px-2.5 py-2.5 font-mono text-[12px] text-muted-foreground select-none lg:py-2">
            {suffix}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function formatNumber(
  value: number,
  precision: number,
  numeralSystem: NumeralSystem,
): string {
  if (!Number.isFinite(value)) return numeralSystem === "devanagari" ? "०" : "0";

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  }).format(value);

  return numeralSystem === "devanagari"
    ? toDevanagariDigits(formatted)
    : formatted;
}

export function NepalLandAreaConverter() {
  const [mode, setMode] = useState<Mode>("hill");
  const [language, setLanguage] = useState<Language>("en");
  const [numeralSystem, setNumeralSystem] = useState<NumeralSystem>("latin");
  const [precision, setPrecision] = useState<Precision>(4);

  const [hill, setHill] = useState({
    ropani: "1",
    aana: "0",
    paisa: "0",
    daam: "0",
  });
  const [terai, setTerai] = useState({
    bigha: "1",
    kattha: "0",
    dhur: "0",
  });
  const [standardValue, setStandardValue] = useState("5476");
  const [standardUnit, setStandardUnit] = useState<StandardAreaUnit>("sqft");
  const [plot, setPlot] = useState({ length: "60", width: "30" });
  const [plotUnit, setPlotUnit] = useState<PlotLengthUnit>("ft");

  const bilingual = (english: string, nepali: string) =>
    language === "ne" ? `${nepali} (${english})` : `${english} (${nepali})`;

  const squareFeet = useMemo(() => {
    if (mode === "hill") {
      return hillToSquareFeet({
        ropani: parseLandNumber(hill.ropani),
        aana: parseLandNumber(hill.aana),
        paisa: parseLandNumber(hill.paisa),
        daam: parseLandNumber(hill.daam),
      });
    }

    if (mode === "terai") {
      return teraiToSquareFeet({
        bigha: parseLandNumber(terai.bigha),
        kattha: parseLandNumber(terai.kattha),
        dhur: parseLandNumber(terai.dhur),
      });
    }

    if (mode === "plot") {
      return rectangleAreaToSquareFeet(
        parseLandNumber(plot.length),
        parseLandNumber(plot.width),
        plotUnit,
      );
    }

    return standardToSquareFeet(
      parseLandNumber(standardValue),
      standardUnit,
    );
  }, [hill, mode, plot, plotUnit, standardUnit, standardValue, terai]);

  const hillResult = squareFeetToHill(squareFeet);
  const teraiResult = squareFeetToTerai(squareFeet);
  const standardResult = squareFeetToStandard(squareFeet);

  const hillText = [
    `${formatNumber(hillResult.ropani, 0, numeralSystem)} ${language === "ne" ? "रोपनी" : "Ropani"}`,
    `${formatNumber(hillResult.aana, 0, numeralSystem)} ${language === "ne" ? "आना" : "Aana"}`,
    `${formatNumber(hillResult.paisa, 0, numeralSystem)} ${language === "ne" ? "पैसा" : "Paisa"}`,
    `${formatNumber(hillResult.daam, precision, numeralSystem)} ${language === "ne" ? "दाम" : "Daam"}`,
  ].join(" ");

  const teraiText = [
    `${formatNumber(teraiResult.bigha, 0, numeralSystem)} ${language === "ne" ? "बिघा" : "Bigha"}`,
    `${formatNumber(teraiResult.kattha, 0, numeralSystem)} ${language === "ne" ? "कठ्ठा" : "Kattha"}`,
    `${formatNumber(teraiResult.dhur, precision, numeralSystem)} ${language === "ne" ? "धुर" : "Dhur"}`,
  ].join(" ");

  const hillNotation = [
    formatNumber(hillResult.ropani, 0, numeralSystem),
    formatNumber(hillResult.aana, 0, numeralSystem),
    formatNumber(hillResult.paisa, 0, numeralSystem),
    formatNumber(hillResult.daam, precision, numeralSystem),
  ].join("-");

  const teraiNotation = [
    formatNumber(teraiResult.bigha, 0, numeralSystem),
    formatNumber(teraiResult.kattha, 0, numeralSystem),
    formatNumber(teraiResult.dhur, precision, numeralSystem),
  ].join("-");

  const modeButton = (key: Mode, english: string, nepali: string) => (
    <button
      type="button"
      onClick={() => setMode(key)}
      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
        mode === key
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
      }`}
      aria-pressed={mode === key}
    >
      <span>{language === "ne" ? nepali : english}</span>
      <span className="ml-1 text-[11px] font-normal opacity-75">
        {language === "ne" ? english : nepali}
      </span>
    </button>
  );

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            {language === "ne" ? "नेपाल जग्गा क्यालकुलेटर" : "Nepal land calculator"}
          </p>
          <p lang="ne" className="mt-1 text-sm text-muted-foreground">
            नेपाल जग्गा क्षेत्रफल रूपान्तरण — रोपनी, आना, पैसा, दाम, बिघा, कठ्ठा र धुर
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            {(["en", "ne"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setLanguage(item)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  language === item
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "en" ? "English" : "नेपाली"}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            {(["latin", "devanagari"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setNumeralSystem(item)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  numeralSystem === item
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "latin" ? "123" : "१२३"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {modeButton("hill", "Ropani system", "रोपनी प्रणाली")}
        {modeButton("terai", "Bigha system", "बिघा प्रणाली")}
        {modeButton("standard", "Standard units", "मानक एकाइ")}
        {modeButton("plot", "Plot area", "जग्गा क्षेत्रफल")}
      </div>

      {mode === "hill" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["ropani", "aana", "paisa", "daam"] as const).map((key) => {
            const names = {
              ropani: ["Ropani", "रोपनी"],
              aana: ["Aana", "आना"],
              paisa: ["Paisa", "पैसा"],
              daam: ["Daam", "दाम"],
            } as const;
            return (
              <TextInput
                key={key}
                label={bilingual(names[key][0], names[key][1])}
                value={hill[key]}
                onChange={(value) =>
                  setHill((current) => ({ ...current, [key]: value }))
                }
              />
            );
          })}
        </div>
      ) : null}

      {mode === "terai" ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {(["bigha", "kattha", "dhur"] as const).map((key) => {
            const names = {
              bigha: ["Bigha", "बिघा"],
              kattha: ["Kattha", "कठ्ठा"],
              dhur: ["Dhur", "धुर"],
            } as const;
            return (
              <TextInput
                key={key}
                label={bilingual(names[key][0], names[key][1])}
                value={terai[key]}
                onChange={(value) =>
                  setTerai((current) => ({ ...current, [key]: value }))
                }
              />
            );
          })}
        </div>
      ) : null}

      {mode === "standard" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label={bilingual("Area", "क्षेत्रफल")}
            value={standardValue}
            onChange={setStandardValue}
          />
          <label className="block min-w-0">
            <span className="mb-1.5 block font-mono text-[10.5px] font-semibold tracking-widest text-muted-foreground uppercase">
              {bilingual("Unit", "एकाइ")}
            </span>
            <select
              value={standardUnit}
              onChange={(event) =>
                setStandardUnit(event.target.value as StandardAreaUnit)
              }
              className="min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-[14px] font-medium text-foreground outline-none transition-all focus:border-primary/60 focus:ring-2 focus:ring-ring/20 lg:min-h-10"
            >
              <option value="sqft">Square Feet (वर्ग फिट)</option>
              <option value="sqm">Square Meter (वर्ग मिटर)</option>
              <option value="acre">Acre (एकड)</option>
              <option value="hectare">Hectare (हेक्टर)</option>
            </select>
          </label>
        </div>
      ) : null}

      {mode === "plot" ? (
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {language === "ne" ? "आयताकार जग्गा क्षेत्रफल अनुमान" : "Rectangular plot area estimate"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {language === "ne"
                  ? "लम्बाइ × चौडाइबाट क्षेत्रफल अनुमान गर्नुहोस्।"
                  : "Estimate area from length × width."}
              </p>
            </div>
            <select
              value={plotUnit}
              onChange={(event) => setPlotUnit(event.target.value as PlotLengthUnit)}
              className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary/60 focus:ring-2 focus:ring-ring/20"
            >
              <option value="ft">Feet (फिट)</option>
              <option value="m">Meter (मिटर)</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label={bilingual("Length", "लम्बाइ")}
              value={plot.length}
              onChange={(value) =>
                setPlot((current) => ({ ...current, length: value }))
              }
              suffix={plotUnit}
            />
            <TextInput
              label={bilingual("Width", "चौडाइ")}
              value={plot.width}
              onChange={(value) =>
                setPlot((current) => ({ ...current, width: value }))
              }
              suffix={plotUnit}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {language === "ne" ? "देखाउने शुद्धता:" : "Display precision:"}
        </span>
        {([2, 4, 8] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPrecision(item)}
            className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${
              precision === item
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
          <p className="font-mono text-[10px] font-semibold tracking-widest text-primary uppercase">
            {bilingual("Ropani result", "रोपनी नतिजा")}
          </p>
          <p className="mt-2 break-words text-lg font-bold leading-relaxed text-foreground">
            {hillText}
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            R-A-P-D: {hillNotation}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            {bilingual("Bigha result", "बिघा नतिजा")}
          </p>
          <p className="mt-2 break-words text-lg font-bold leading-relaxed text-foreground">
            {teraiText}
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            B-K-D: {teraiNotation}
          </p>
        </div>
      </div>

      <StatGrid>
        <Stat
          label={bilingual("Square Feet", "वर्ग फिट")}
          value={`${formatNumber(standardResult.sqft, precision, numeralSystem)} ft²`}
          accent
        />
        <Stat
          label={bilingual("Square Meter", "वर्ग मिटर")}
          value={`${formatNumber(standardResult.sqm, precision, numeralSystem)} m²`}
        />
        <Stat
          label={bilingual("Acre", "एकड")}
          value={formatNumber(standardResult.acre, Math.max(precision, 6), numeralSystem)}
        />
        <Stat
          label={bilingual("Hectare", "हेक्टर")}
          value={formatNumber(standardResult.hectare, Math.max(precision, 6), numeralSystem)}
        />
      </StatGrid>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">{bilingual("Nepal unit", "नेपाली एकाइ")}</th>
              <th className="px-4 py-3 font-semibold">{bilingual("Relationship", "सम्बन्ध")}</th>
              <th className="px-4 py-3 font-semibold">{bilingual("Square feet", "वर्ग फिट")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card text-muted-foreground">
            <tr><td className="px-4 py-3">Ropani / रोपनी</td><td className="px-4 py-3">16 Aana = 64 Paisa = 256 Daam</td><td className="px-4 py-3">5,476</td></tr>
            <tr><td className="px-4 py-3">Aana / आना</td><td className="px-4 py-3">4 Paisa = 16 Daam</td><td className="px-4 py-3">342.25</td></tr>
            <tr><td className="px-4 py-3">Paisa / पैसा</td><td className="px-4 py-3">4 Daam</td><td className="px-4 py-3">85.5625</td></tr>
            <tr><td className="px-4 py-3">Bigha / बिघा</td><td className="px-4 py-3">20 Kattha = 400 Dhur</td><td className="px-4 py-3">72,900</td></tr>
            <tr><td className="px-4 py-3">Kattha / कठ्ठा</td><td className="px-4 py-3">20 Dhur</td><td className="px-4 py-3">3,645</td></tr>
            <tr><td className="px-4 py-3">Dhur / धुर</td><td className="px-4 py-3">1/20 Kattha</td><td className="px-4 py-3">182.25</td></tr>
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
        <p>
          {language === "ne"
            ? "रूपान्तरणमा बीचको मानलाई गोलाइँदैन; गोलाइँ केवल देखाउँदा गरिन्छ। रोपनी प्रणाली १ रोपनी = ५,४७६ वर्ग फिट र बिघा प्रणाली १ बिघा = ७२,९०० वर्ग फिटको आधारमा गणना गरिएको छ।"
            : "Intermediate values are not rounded; rounding is applied only for display. The converter derives the customary units from 1 Ropani = 5,476 sq ft and 1 Bigha = 72,900 sq ft."}
        </p>
        <p className="mt-2">
          {language === "ne"
            ? "यो रूपान्तरण र आयताकार क्षेत्रफल अनुमानका लागि हो। कानुनी वा आधिकारिक जग्गा क्षेत्रफलका लागि लालपुर्जा, नापी अभिलेख वा सम्बन्धित नापी कार्यालयको विवरण प्रयोग गर्नुहोस्।"
            : "This tool is for conversion and rectangular-area estimation. For legal or official land area, rely on the Lalpurja/cadastral record or the relevant Survey Office."}
        </p>
      </div>
    </div>
  );
}
