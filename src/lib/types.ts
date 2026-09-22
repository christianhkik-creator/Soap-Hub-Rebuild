export type FattyAcidKey =
  | "lauric"
  | "myristic"
  | "palmitic"
  | "stearic"
  | "ricinoleic"
  | "oleic"
  | "linoleic"
  | "linolenic";

export const FATTY_ACID_LABELS: Record<FattyAcidKey, string> = {
  lauric: "Lauric (C12:0)",
  myristic: "Myristic (C14:0)",
  palmitic: "Palmitic (C16:0)",
  stearic: "Stearic (C18:0)",
  ricinoleic: "Ricinoleic (C18:1-OH)",
  oleic: "Oleic (C18:1)",
  linoleic: "Linoleic (C18:2)",
  linolenic: "Linolenic (C18:3)",
};

/** Percent of total oil mass contributed by that fatty acid (0-100). */
export type FattyAcidProfile = Partial<Record<FattyAcidKey, number>>;

export type OilCategory = "conditioning" | "cleansing" | "hardness" | "lather-boost";

export const OIL_CATEGORY_LABELS: Record<OilCategory, { title: string; blurb: string }> = {
  conditioning: {
    title: "Conditioning Oils",
    blurb:
      "High in oleic & linoleic acids — moisturising, skin-softening, ideal for sensitive-skin bars. Oleic = stability; linoleic = luxurious skin feel but raises DOS risk.",
  },
  cleansing: {
    title: "Cleansing Oils",
    blurb:
      "High in lauric & myristic acids — the lather workhorses. Produce large, fluffy bubbles and contribute long-lasting hardness to finished bars.",
  },
  hardness: {
    title: "Creaminess & Hardness",
    blurb:
      "High in stearic & palmitic acids — butters and animal fats that create hard, long-lasting bars with a dense, skin-loving creamy lather.",
  },
  "lather-boost": {
    title: "Lather Boost & Slip",
    blurb:
      "Unique fatty acids that enhance lather quality, add silkiness and slip, and elevate overall bar performance — used in small, precise amounts.",
  },
};

export type RancidityRisk = "very-low" | "low" | "moderate" | "high";

export const RANCIDITY_LABELS: Record<RancidityRisk, string> = {
  "very-low": "Very Low Rancidity",
  low: "Low Rancidity",
  moderate: "Moderate Rancidity",
  high: "High Rancidity",
};

export interface DataSource {
  claim: string;
  confidence: "cross-referenced" | "single-source" | "user-confirmed";
  note?: string;
}

export interface Oil {
  id: string;
  name: string;
  botanicalName?: string;
  category: OilCategory;
  /** grams of NaOH required per gram of this oil at 0% superfat */
  sapNaOH: number;
  /** g/mL in its measured (liquid/melted) state — used to convert a fl-oz purchase into grams. Falls back to a generic oil-density approximation when unset. */
  densityGPerMl?: number;
  fattyAcids: FattyAcidProfile;
  usageRateMin: number;
  usageRateMax: number;
  usageNote?: string;
  rancidityRisk: RancidityRisk;
  priceTier: 1 | 2 | 3;
  description: string;
  effects: string;
  benefits: string;
  sources?: DataSource[];
  isCustom?: boolean;
}

export type ScentNote = "top" | "heart" | "base" | "fragrance-oil";

export const SCENT_NOTE_LABELS: Record<ScentNote, { title: string; blurb: string }> = {
  top: {
    title: "Top Notes",
    blurb: "Fast, bright, volatile — citrus, mint, tea tree. 2-8 week longevity in soap.",
  },
  heart: {
    title: "Heart Notes",
    blurb: "Balanced, moderate longevity — lavender, rosemary, geranium. 2-5 months.",
  },
  base: {
    title: "Base Notes",
    blurb: "Heavy anchors — patchouli, cedarwood, vetiver, balsams. 6-12+ months.",
  },
  "fragrance-oil": {
    title: "Fragrance Oils (CP Safe)",
    blurb: "Engineered for soap · 12+ months · Consistent, predictable · Always verify IFRA certificate.",
  },
};

export type ChemicalClass =
  | "aldehyde"
  | "monoterpene"
  | "monoterpene-alcohol"
  | "monoterpene-ester"
  | "sesquiterpene"
  | "sesquiterpene-alcohol"
  | "phenol"
  | "oxide"
  | "blend";

export type WarningEvidence = "documented" | "practitioner-reported";

export interface ScentWarning {
  type: "accelerant" | "discoloration" | "sensitizer" | "ifra-caution" | "toxicity";
  severity: "danger" | "warning" | "info" | "success";
  label: string;
  message: string;
  evidence: WarningEvidence;
}

export interface Scent {
  id: string;
  name: string;
  botanicalName?: string;
  note: ScentNote;
  molecularWeight: number;
  dominantClass: ChemicalClass;
  majorConstituents: string;
  /** g/mL — used to convert a fl-oz purchase into grams. Falls back to a generic essential-oil-density approximation when unset. */
  densityGPerMl?: number;
  usageRateMin: number;
  usageRateMax: number;
  /** [min, max] months the scent is expected to remain perceptible in cured soap */
  longevityMonths: [number, number];
  warnings: ScentWarning[];
  priceTier: 1 | 2 | 3;
  /** Framing that doesn't fit a discrete warning — sourcing/authenticity caveats, absolute-vs-EO distinctions, species ambiguity, etc. */
  description?: string;
  sources?: DataSource[];
  isCustom?: boolean;
}

export type AdditiveCategory = "colorant" | "clay" | "exfoliant" | "botanical" | "preservative" | "other";

export const ADDITIVE_CATEGORY_LABELS: Record<AdditiveCategory, string> = {
  colorant: "Colorant",
  clay: "Clay",
  exfoliant: "Exfoliant",
  botanical: "Botanical",
  preservative: "Preservative",
  other: "Other",
};

/**
 * Non-oil, non-fragrance ingredients: clays, colorants, exfoliants, and
 * similar. These don't participate in the lye/fatty-acid chemistry the way
 * oils do — usage rate is simply a % of total oil weight added at trace.
 */
export interface Additive {
  id: string;
  name: string;
  category: AdditiveCategory;
  usageRateMin: number;
  usageRateMax: number;
  /** g/mL (bulk density) — used to convert a fl-oz purchase into grams. Falls back to a generic powder-density approximation when unset; bulk density varies a lot by how packed the powder is, so treat the fallback as rough. */
  densityGPerMl?: number;
  usageNote?: string;
  description: string;
  effects: string;
  benefits: string;
  /** Safety notes and marketing-claim caveats (e.g. "detox" claims are overstated for a rinse-off product) — shown prominently in the UI, not buried. */
  disclaimers?: string[];
  priceTier: 1 | 2 | 3;
  sources?: DataSource[];
  isCustom?: boolean;
}

export interface RecipeOilEntry {
  oilId: string;
  percent: number;
}

export interface RecipeScentEntry {
  scentId: string;
  percent: number;
}

export interface RecipeAdditiveEntry {
  additiveId: string;
  percent: number;
}

/** Units a real receipt is denominated in — how much you actually paid for how much stuff. */
export type PurchaseUnit = "flOz" | "g" | "lb";

export const PURCHASE_UNIT_LABELS: Record<PurchaseUnit, string> = {
  flOz: "fl oz",
  g: "g",
  lb: "lb",
};

/** "I paid $amountPaid for a container of containerAmount containerUnit." The true $/g is derived from this, not entered directly. */
export interface PurchaseInfo {
  amountPaid: number;
  containerAmount: number;
  containerUnit: PurchaseUnit;
}

export function emptyPurchase(unit: PurchaseUnit = "flOz"): PurchaseInfo {
  return { amountPaid: 0, containerAmount: 0, containerUnit: unit };
}

/** Lye is always sold by weight (flakes/pellets/beads), never by fluid volume. */
export type LyePurchaseUnit = "g" | "lb";
export interface LyePurchaseInfo {
  amountPaid: number;
  containerAmount: number;
  containerUnit: LyePurchaseUnit;
}

export interface Recipe {
  id?: string;
  name: string;
  totalOilWeightGrams: number;
  superfatPercent: number;
  lyeConcentrationPercent: number;
  oils: RecipeOilEntry[];
  scents: RecipeScentEntry[];
  additives: RecipeAdditiveEntry[];
  batchScentWeightGrams: number;
  barWeightGrams: number;
  cureWaterLossPercent: number;
  oilPurchases: Record<string, PurchaseInfo>;
  scentPurchases: Record<string, PurchaseInfo>;
  additivePurchases: Record<string, PurchaseInfo>;
  lyePurchase: LyePurchaseInfo;
  additionalCosts: { label: string; amount: number }[];
  createdAt?: string;
  updatedAt?: string;
}
