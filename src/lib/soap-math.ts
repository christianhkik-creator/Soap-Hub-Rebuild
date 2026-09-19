import type {
  FattyAcidKey,
  FattyAcidProfile,
  Oil,
  Recipe,
  Scent,
  RecipeOilEntry,
  RecipeScentEntry,
} from "./types";

/**
 * Conversion between NaOH-basis and KOH-basis saponification values.
 * Both express "grams of base per gram of oil" for the same underlying
 * moles-of-base-per-mole-of-fatty-acid chemistry, so they differ only by
 * the ratio of molar masses: KOH (56.1) / NaOH (40) = 1.4025.
 */
export const NAOH_TO_KOH_FACTOR = 1.4025;

export const GRAMS_PER_LB = 453.59237;
export const GRAMS_PER_OZ = 28.349523125;
export const GRAMS_PER_KG = 1000;

/** Grams of I2 absorbed per 100g of the pure fatty acid (real stoichiometry, not a soap-community estimate). */
const IODINE_COEFFICIENTS: Record<FattyAcidKey, number> = {
  lauric: 0,
  myristic: 0,
  palmitic: 0,
  stearic: 0,
  ricinoleic: 85,
  oleic: 89.9,
  linoleic: 181.0,
  linolenic: 273.5,
};

const SATURATED_KEYS: FattyAcidKey[] = ["lauric", "myristic", "palmitic", "stearic"];
const UNSATURATED_KEYS: FattyAcidKey[] = ["ricinoleic", "oleic", "linoleic", "linolenic"];
const ALL_FATTY_ACID_KEYS: FattyAcidKey[] = [...SATURATED_KEYS, ...UNSATURATED_KEYS];

export interface WeightedOil {
  oil: Oil;
  percent: number;
}

export interface WeightedScent {
  scent: Scent;
  percent: number;
}

/** Ideal ranges as displayed by SoapCalc-style calculators, confirmed against a real recipe export. */
export const QUALITY_RANGES = {
  hardness: [29, 54] as [number, number],
  cleansing: [12, 22] as [number, number],
  conditioning: [44, 69] as [number, number],
  bubbly: [14, 46] as [number, number],
  creamy: [16, 48] as [number, number],
  iodine: [41, 70] as [number, number],
  ins: [136, 165] as [number, number],
};

/** Weighted-average fatty acid profile for a recipe. Percents should sum to ~100. */
export function blendFattyAcids(entries: WeightedOil[]): FattyAcidProfile {
  const blend: FattyAcidProfile = {};
  for (const key of ALL_FATTY_ACID_KEYS) {
    let total = 0;
    for (const { oil, percent } of entries) {
      const value = oil.fattyAcids[key] ?? 0;
      total += (value * percent) / 100;
    }
    if (total > 0) blend[key] = total;
  }
  return blend;
}

/** Weighted-average NaOH SAP value (g NaOH per g oil) for a recipe's oil blend. */
export function blendSapNaOH(entries: WeightedOil[]): number {
  return entries.reduce((sum, { oil, percent }) => sum + (oil.sapNaOH * percent) / 100, 0);
}

export interface QualityScores {
  hardness: number;
  cleansing: number;
  conditioning: number;
  bubbly: number;
  creamy: number;
  iodine: number;
  ins: number;
  saturatedPercent: number;
  unsaturatedPercent: number;
}

/**
 * Derives the standard soap-quality metrics from a recipe's blended fatty
 * acid profile. Hardness/Cleansing/Conditioning/Bubbly/Creamy are plain
 * sums of the relevant fatty-acid percentages (the convention used by
 * SoapCalc and its derivatives). Iodine uses real per-fatty-acid iodine
 * addition coefficients. INS = (weighted KOH SAP, mg/g) - Iodine.
 */
export function calculateQualityScores(blend: FattyAcidProfile, sapNaOHBlend: number): QualityScores {
  const g = (k: FattyAcidKey) => blend[k] ?? 0;

  const hardness = g("lauric") + g("myristic") + g("palmitic") + g("stearic");
  const cleansing = g("lauric") + g("myristic");
  const conditioning = g("oleic") + g("linoleic") + g("linolenic") + g("ricinoleic");
  const bubbly = g("lauric") + g("myristic") + g("ricinoleic");
  const creamy = g("palmitic") + g("stearic") + g("ricinoleic");

  const iodine = ALL_FATTY_ACID_KEYS.reduce(
    (sum, key) => sum + (g(key) * IODINE_COEFFICIENTS[key]) / 100,
    0
  );

  const kohSapMgPerG = sapNaOHBlend * NAOH_TO_KOH_FACTOR * 1000;
  const ins = kohSapMgPerG - iodine;

  const saturatedPercent = SATURATED_KEYS.reduce((s, k) => s + g(k), 0);
  const unsaturatedPercent = UNSATURATED_KEYS.reduce((s, k) => s + g(k), 0);

  return {
    hardness,
    cleansing,
    conditioning,
    bubbly,
    creamy,
    iodine,
    ins,
    saturatedPercent,
    unsaturatedPercent,
  };
}

export interface LyeWaterResult {
  naohGrams: number;
  waterGrams: number;
  waterAsPercentOfOils: number;
  waterToLyeRatio: number;
  lyeConcentrationPercent: number;
}

/**
 * NaOH (g) = total oil weight x weighted SAP x (1 - superfat%)
 * Lye concentration % = NaOH / (NaOH + water) -> water = NaOH x (1 - conc) / conc
 */
export function calculateLyeAndWater({
  totalOilWeightGrams,
  sapNaOHBlend,
  superfatPercent,
  lyeConcentrationPercent,
}: {
  totalOilWeightGrams: number;
  sapNaOHBlend: number;
  superfatPercent: number;
  lyeConcentrationPercent: number;
}): LyeWaterResult {
  const naohGrams = totalOilWeightGrams * sapNaOHBlend * (1 - superfatPercent / 100);
  const conc = lyeConcentrationPercent / 100;
  const waterGrams = conc > 0 ? (naohGrams * (1 - conc)) / conc : 0;

  return {
    naohGrams,
    waterGrams,
    waterAsPercentOfOils: totalOilWeightGrams > 0 ? (waterGrams / totalOilWeightGrams) * 100 : 0,
    waterToLyeRatio: naohGrams > 0 ? waterGrams / naohGrams : 0,
    lyeConcentrationPercent,
  };
}

/** Water:lye ratio (e.g. 2.03) <-> lye concentration % are two views of the same input. */
export function lyeConcentrationFromRatio(waterToLyeRatio: number): number {
  return 100 / (waterToLyeRatio + 1);
}
export function ratioFromLyeConcentration(lyeConcentrationPercent: number): number {
  return 100 / lyeConcentrationPercent - 1;
}

export interface YieldResult {
  preCureWeightGrams: number;
  estimatedCuredWeightGrams: number;
  estimatedBarCount: number;
}

/**
 * Pre-cure weight is an exact mass balance (oils + lye + water + fragrance).
 * Cured weight applies a user-adjustable water-evaporation assumption
 * (default 15% of the water mass) rather than a fixed rule-of-thumb
 * multiplier, since actual cure water loss varies with humidity and time.
 */
export function calculateYield({
  totalOilWeightGrams,
  naohGrams,
  waterGrams,
  fragranceGrams,
  cureWaterLossPercent,
  barWeightGrams,
}: {
  totalOilWeightGrams: number;
  naohGrams: number;
  waterGrams: number;
  fragranceGrams: number;
  cureWaterLossPercent: number;
  barWeightGrams: number;
}): YieldResult {
  const preCureWeightGrams = totalOilWeightGrams + naohGrams + waterGrams + fragranceGrams;
  const waterLost = waterGrams * (cureWaterLossPercent / 100);
  const estimatedCuredWeightGrams = preCureWeightGrams - waterLost;
  const estimatedBarCount =
    barWeightGrams > 0 ? Math.round(estimatedCuredWeightGrams / barWeightGrams) : 0;

  return { preCureWeightGrams, estimatedCuredWeightGrams, estimatedBarCount };
}

/**
 * Suggests a lye-concentration adjustment when the recipe carries real
 * heat/trace-acceleration risk factors, without overriding the user's
 * chosen value.
 */
export interface LyeAdvisory {
  level: "info" | "caution";
  message: string;
}

export function getLyeConcentrationAdvisory({
  oils,
  scents,
  lyeConcentrationPercent,
}: {
  oils: WeightedOil[];
  scents: WeightedScent[];
  lyeConcentrationPercent: number;
}): LyeAdvisory[] {
  const advisories: LyeAdvisory[] = [];

  const castorPercent = oils
    .filter((o) => o.oil.id === "castor-oil")
    .reduce((s, o) => s + o.percent, 0);
  if (castorPercent > 10) {
    advisories.push({
      level: "caution",
      message: `Castor oil is ${castorPercent.toFixed(
        0
      )}% of this recipe (above the typical 5-10% range). High ricinoleic content can thicken batter fast — consider a lower lye concentration (more water) to slow trace.`,
    });
  }

  const accelerantScents = scents.filter((s) =>
    s.scent.warnings.some((w) => w.type === "accelerant")
  );
  if (accelerantScents.length > 0 && lyeConcentrationPercent >= 33) {
    advisories.push({
      level: "caution",
      message: `${accelerantScents
        .map((s) => s.scent.name)
        .join(", ")} ${accelerantScents.length > 1 ? "are" : "is"} flagged as trace accelerant${
        accelerantScents.length > 1 ? "s" : ""
      }. At ${lyeConcentrationPercent}% lye concentration this recipe may seize or overheat quickly — consider dropping to ~28-30% lye concentration (more water) and adding fragrance at light trace.`,
    });
  }

  const softOilPercent = oils
    .filter((o) => (o.oil.fattyAcids.oleic ?? 0) + (o.oil.fattyAcids.linoleic ?? 0) > 60)
    .reduce((s, o) => s + o.percent, 0);
  if (softOilPercent > 70 && lyeConcentrationPercent < 30) {
    advisories.push({
      level: "info",
      message:
        "This recipe is liquid-oil-heavy and already slow to trace/unmold. A higher lye concentration (35-40%) can speed up unmolding without much added risk here.",
    });
  }

  return advisories;
}

export function getSuperfatGuidance(superfatPercent: number, blend: FattyAcidProfile): string[] {
  const notes: string[] = [];
  const linoleicHeavy = (blend.linoleic ?? 0) + (blend.linolenic ?? 0) > 15;

  if (superfatPercent <= 3) {
    notes.push("1-3%: laundry/utility bars — maximizes cleansing, longest shelf life, lowest DOS risk.");
  } else if (superfatPercent <= 5) {
    notes.push("5% (standard): balanced all-purpose body bar — the default most recipes use.");
  } else if (superfatPercent <= 8) {
    notes.push("6-8%: facial, baby, or sensitive-skin bars — softer and more conditioning, shorter shelf life.");
  } else {
    notes.push("8%+: luxury/cream bars — noticeably more conditioning.");
  }

  if (superfatPercent > 7 && linoleicHeavy) {
    notes.push(
      "This recipe combines a high superfat with a linoleic/linolenic-heavy oil blend — elevated rancidity (DOS) risk within ~6 months. Consider a lower superfat or more antioxidant-stable oils."
    );
  }

  return notes;
}

// ---------------------------------------------------------------------------
// Cost math
// ---------------------------------------------------------------------------

export type PriceUnit = "lb" | "kg" | "100g" | "oz" | "g";

export function costForWeight(weightGrams: number, price: number, unit: PriceUnit): number {
  switch (unit) {
    case "lb":
      return (weightGrams / GRAMS_PER_LB) * price;
    case "kg":
      return (weightGrams / GRAMS_PER_KG) * price;
    case "100g":
      return (weightGrams / 100) * price;
    case "oz":
      return (weightGrams / GRAMS_PER_OZ) * price;
    case "g":
      return weightGrams * price;
  }
}

export function costPerGram(price: number, unit: PriceUnit): number {
  return costForWeight(1, price, unit);
}

/**
 * Most soaping oils fall around 0.90-0.93 g/mL; 0.92 is used as a single
 * approximate density so a per-fl-oz cost can be shown alongside the
 * (accurate) per-gram cost. This is explicitly an approximation, not a
 * per-oil measured density.
 */
export const APPROX_OIL_DENSITY_G_PER_ML = 0.92;
const ML_PER_FL_OZ = 29.5735;

export function costPerFlOzApprox(price: number, unit: PriceUnit): number {
  const gramsPerFlOz = ML_PER_FL_OZ * APPROX_OIL_DENSITY_G_PER_ML;
  return costPerGram(price, unit) * gramsPerFlOz;
}

export function gramsToUnit(grams: number, unit: "g" | "oz" | "lb" | "kg"): number {
  switch (unit) {
    case "g":
      return grams;
    case "oz":
      return grams / GRAMS_PER_OZ;
    case "lb":
      return grams / GRAMS_PER_LB;
    case "kg":
      return grams / GRAMS_PER_KG;
  }
}

export function unitToGrams(value: number, unit: "g" | "oz" | "lb" | "kg"): number {
  switch (unit) {
    case "g":
      return value;
    case "oz":
      return value * GRAMS_PER_OZ;
    case "lb":
      return value * GRAMS_PER_LB;
    case "kg":
      return value * GRAMS_PER_KG;
  }
}

// ---------------------------------------------------------------------------
// Scent blend math
// ---------------------------------------------------------------------------

export interface ScentBlendAnalysis {
  totalPercent: number;
  noteComposition: Partial<Record<Scent["note"], number>>;
  longevityMonths: [number, number];
  recommendedUsagePercentOfOils: number;
  warnings: { scentName: string; warning: Scent["warnings"][number] }[];
}

export function analyzeScentBlend(entries: WeightedScent[]): ScentBlendAnalysis {
  const totalPercent = entries.reduce((s, e) => s + e.percent, 0);

  const noteComposition: Partial<Record<Scent["note"], number>> = {};
  for (const { scent, percent } of entries) {
    noteComposition[scent.note] = (noteComposition[scent.note] ?? 0) + percent;
  }

  let weightedMin = 0;
  let weightedMax = 0;
  let weightedUsage = 0;
  for (const { scent, percent } of entries) {
    const weight = totalPercent > 0 ? percent / totalPercent : 0;
    weightedMin += scent.longevityMonths[0] * weight;
    weightedMax += scent.longevityMonths[1] * weight;
    weightedUsage += ((scent.usageRateMin + scent.usageRateMax) / 2) * weight;
  }

  // Base-heavy blends can run lighter on total fragrance load; top-heavy
  // blends volatilize faster and often benefit from a touch more.
  const basePercent = (noteComposition.base ?? 0) / (totalPercent || 1);
  const topPercent = (noteComposition.top ?? 0) / (totalPercent || 1);
  let recommendedUsagePercentOfOils = weightedUsage;
  if (basePercent > 0.4) recommendedUsagePercentOfOils *= 0.9;
  if (topPercent > 0.4) recommendedUsagePercentOfOils *= 1.05;

  const warnings = entries.flatMap(({ scent }) =>
    scent.warnings.map((warning) => ({ scentName: scent.name, warning }))
  );

  return {
    totalPercent,
    noteComposition,
    longevityMonths: [Math.round(weightedMin * 10) / 10, Math.round(weightedMax * 10) / 10],
    recommendedUsagePercentOfOils: Math.round(recommendedUsagePercentOfOils * 10) / 10,
    warnings,
  };
}

export interface BatchCosts {
  oilCosts: { oil: Oil; percent: number; weightGrams: number; price: number; cost: number }[];
  totalOilCost: number;
  lyeCost: number;
  scentCosts: { scent: Scent; percent: number; weightGrams: number; price: number; cost: number }[];
  totalScentCost: number;
  additionalTotal: number;
  totalBatchCost: number;
  costPerBar: number;
}

export function calculateBatchCosts({
  recipe,
  oilsById,
  scentsById,
  naohGrams,
  estimatedBarCount,
}: {
  recipe: Recipe;
  oilsById: Map<string, Oil>;
  scentsById: Map<string, Scent>;
  naohGrams: number;
  estimatedBarCount: number;
}): BatchCosts {
  const oilCosts = recipe.oils
    .map((entry) => {
      const oil = oilsById.get(entry.oilId);
      if (!oil) return null;
      const weightGrams = (recipe.totalOilWeightGrams * entry.percent) / 100;
      const price = recipe.oilPricesPerLb[oil.id] ?? 0;
      return { oil, percent: entry.percent, weightGrams, price, cost: costForWeight(weightGrams, price, "lb") };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const totalOilCost = oilCosts.reduce((s, o) => s + o.cost, 0);

  const lyeCost = costForWeight(naohGrams, recipe.lyePricePerLb, "lb");

  const scentCosts = recipe.scents
    .map((entry) => {
      const scent = scentsById.get(entry.scentId);
      if (!scent) return null;
      const weightGrams = (recipe.batchScentWeightGrams * entry.percent) / 100;
      const price = recipe.scentPricesPer100g[scent.id] ?? 0;
      return {
        scent,
        percent: entry.percent,
        weightGrams,
        price,
        cost: costForWeight(weightGrams, price, "100g"),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const totalScentCost = scentCosts.reduce((s, o) => s + o.cost, 0);

  const additionalTotal = recipe.additionalCosts.reduce((s, c) => s + (c.amount || 0), 0);
  const totalBatchCost = totalOilCost + lyeCost + totalScentCost + additionalTotal;
  const costPerBar = estimatedBarCount > 0 ? totalBatchCost / estimatedBarCount : 0;

  return { oilCosts, totalOilCost, lyeCost, scentCosts, totalScentCost, additionalTotal, totalBatchCost, costPerBar };
}

export function toWeightedOils(entries: RecipeOilEntry[], oilsById: Map<string, Oil>): WeightedOil[] {
  return entries
    .map((e) => ({ oil: oilsById.get(e.oilId), percent: e.percent }))
    .filter((e): e is WeightedOil => Boolean(e.oil));
}

export function toWeightedScents(
  entries: RecipeScentEntry[],
  scentsById: Map<string, Scent>
): WeightedScent[] {
  return entries
    .map((e) => ({ scent: scentsById.get(e.scentId), percent: e.percent }))
    .filter((e): e is WeightedScent => Boolean(e.scent));
}
