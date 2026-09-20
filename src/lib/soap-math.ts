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
  /**
   * Not a SoapCalc-standard metric. Combined linoleic + linolenic (PUFA)
   * content is the well-established driver of oxidative rancidity ("DOS" —
   * Dreaded Orange Spots) in cured soap; the fact that PUFAs autoxidize is
   * uncontested lipid chemistry, but the specific 0-10 "safe" cutoff below
   * is a practical soap-community guideline, not a lab-derived constant.
   */
  dosRisk: [0, 10] as [number, number],
};

/** Fixed display ceilings so the bars read consistently recipe to recipe, instead of rescaling. */
export const QUALITY_AXIS_MAX: Record<keyof typeof QUALITY_RANGES, number> = {
  hardness: 80,
  cleansing: 70,
  conditioning: 100,
  bubbly: 70,
  creamy: 70,
  iodine: 120,
  ins: 200,
  dosRisk: 40,
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
  dosRisk: number;
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
  const dosRisk = g("linoleic") + g("linolenic");

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
    dosRisk,
    saturatedPercent,
    unsaturatedPercent,
  };
}

export interface RecipeInsight {
  severity: "success" | "info" | "warning" | "danger";
  message: string;
}

/**
 * Compares the rounded (displayed) value against a range, not the raw
 * float — every score here is shown to 0 decimals, so a raw 11.83 that
 * displays as "12" must not be treated as below a "12-22" range.
 */
function inRange(value: number, [min, max]: [number, number]) {
  const rounded = Math.round(value);
  return rounded >= min && rounded <= max;
}

/**
 * Translates the raw quality numbers into plain-English guidance. Ranges
 * used here are the same QUALITY_RANGES bands shown on the bars; the
 * commentary (cure time, shelf life, texture) reflects standard soaping
 * practice rather than a separate data source.
 */
export function getRecipeInsights(scores: QualityScores, blend: FattyAcidProfile): RecipeInsight[] {
  const insights: RecipeInsight[] = [];
  const oleic = blend.oleic ?? 0;

  if (oleic >= 45) {
    insights.push({
      severity: "info",
      message: `Elevated oleic (${oleic.toFixed(0)}%). Allow at least 6-8 weeks of cure for proper bar firmness and lather development.`,
    });
  }

  const [, dosMax] = QUALITY_RANGES.dosRisk;
  if (scores.dosRisk <= dosMax) {
    insights.push({
      severity: "success",
      message: `Low DOS risk — only ${scores.dosRisk.toFixed(0)}% linoleic/linolenic. Stable formula. Expected shelf life: 12+ months.`,
    });
  } else if (scores.dosRisk <= dosMax * 2) {
    insights.push({
      severity: "warning",
      message: `Moderate DOS risk — ${scores.dosRisk.toFixed(0)}% linoleic/linolenic. Use within 6-9 months and store away from heat and light.`,
    });
  } else {
    insights.push({
      severity: "danger",
      message: `High DOS risk — ${scores.dosRisk.toFixed(0)}% linoleic/linolenic. Consider swapping in a more oxidation-stable oil (coconut, tallow, palm-free hard fats) or lowering superfat.`,
    });
  }

  const [hMin, hMax] = QUALITY_RANGES.hardness;
  if (inRange(scores.hardness, QUALITY_RANGES.hardness)) {
    insights.push({
      severity: "success",
      message: `Good hardness (${scores.hardness.toFixed(0)}) — should unmold cleanly and hold up well in the shower.`,
    });
  } else if (scores.hardness < hMin) {
    insights.push({
      severity: "warning",
      message: `Soft bar (${scores.hardness.toFixed(0)}). Bar may feel soft — allow extra cure and consider adding hard fats. Cure time: 6-8 weeks minimum.`,
    });
  } else {
    insights.push({
      severity: "info",
      message: `Very hard bar (${scores.hardness.toFixed(0)}, above ${hMax}) — may turn brittle; consider a bit more liquid oil.`,
    });
  }

  const [cMin, cMax] = QUALITY_RANGES.cleansing;
  if (inRange(scores.cleansing, QUALITY_RANGES.cleansing)) {
    insights.push({
      severity: "success",
      message: `Balanced cleansing (${scores.cleansing.toFixed(0)}) — effective without being harsh on normal skin.`,
    });
  } else if (scores.cleansing < cMin) {
    insights.push({
      severity: "info",
      message: `Low cleansing (${scores.cleansing.toFixed(0)}) — may feel under-cleansing; consider a bit more coconut or babassu oil.`,
    });
  } else {
    insights.push({
      severity: "warning",
      message: `High cleansing (${scores.cleansing.toFixed(0)}, above ${cMax}) — may feel stripping or drying; consider reducing lauric/myristic-heavy oils.`,
    });
  }

  const [condMin] = QUALITY_RANGES.conditioning;
  if (inRange(scores.conditioning, QUALITY_RANGES.conditioning)) {
    insights.push({
      severity: "success",
      message: `Good conditioning (${scores.conditioning.toFixed(0)}) — skin should feel comfortable and moisturised.`,
    });
  } else if (scores.conditioning < condMin) {
    insights.push({
      severity: "warning",
      message: `Low conditioning (${scores.conditioning.toFixed(0)}) — bar may feel drying; consider more conditioning oils (olive, sunflower, avocado).`,
    });
  }

  if (inRange(scores.bubbly, QUALITY_RANGES.bubbly) && inRange(scores.creamy, QUALITY_RANGES.creamy)) {
    insights.push({
      severity: "success",
      message: `Good lather balance (bubbly: ${scores.bubbly.toFixed(0)}, creamy: ${scores.creamy.toFixed(0)}) — rich, satisfying lather.`,
    });
  } else {
    if (!inRange(scores.bubbly, QUALITY_RANGES.bubbly)) {
      insights.push({
        severity: "info",
        message: `Bubbly lather (${scores.bubbly.toFixed(0)}) is outside the ideal ${QUALITY_RANGES.bubbly[0]}-${QUALITY_RANGES.bubbly[1]} range — adjust lauric/myristic/ricinoleic oils to change lather size.`,
      });
    }
    if (!inRange(scores.creamy, QUALITY_RANGES.creamy)) {
      insights.push({
        severity: "info",
        message: `Creamy lather (${scores.creamy.toFixed(0)}) is outside the ideal ${QUALITY_RANGES.creamy[0]}-${QUALITY_RANGES.creamy[1]} range — adjust palmitic/stearic/ricinoleic oils to change lather density.`,
      });
    }
  }

  return insights;
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

  // Keyed off ricinoleic content directly (not a specific oil id like
  // "castor-oil") so any high-ricinoleic oil — including a custom one —
  // triggers this, not just the seed castor oil entry.
  const ricinoleicPercent = oils.reduce(
    (s, o) => s + ((o.oil.fattyAcids.ricinoleic ?? 0) * o.percent) / 100,
    0
  );
  if (ricinoleicPercent > 8) {
    advisories.push({
      level: "caution",
      message: `This blend's ricinoleic content is ${ricinoleicPercent.toFixed(
        1
      )}% (equivalent to more than ~10% castor oil). High ricinoleic content can thicken batter fast — consider a lower lye concentration (more water) to slow trace.`,
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
 * Most soaping oils fall around 0.90-0.93 g/mL; 0.92 is the fallback used
 * when a specific oil has no `densityGPerMl` set. Pass that oil's own
 * density when known (see src/data/oils.ts) for a more accurate estimate —
 * castor oil in particular (~0.96) is notably denser than the rest.
 */
export const APPROX_OIL_DENSITY_G_PER_ML = 0.92;
const ML_PER_FL_OZ = 29.5735;

export function costPerFlOzApprox(
  price: number,
  unit: PriceUnit,
  densityGPerMl: number = APPROX_OIL_DENSITY_G_PER_ML
): number {
  const gramsPerFlOz = ML_PER_FL_OZ * densityGPerMl;
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
