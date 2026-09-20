import { describe, expect, it } from "vitest";

import {
  blendFattyAcids,
  blendSapNaOH,
  calculateLyeAndWater,
  calculateQualityScores,
  calculateYield,
  costForWeight,
  costPerFlOzApprox,
  costPerGram,
  getLyeConcentrationAdvisory,
  getRecipeInsights,
  GRAMS_PER_LB,
  lyeConcentrationFromRatio,
  QUALITY_RANGES,
  ratioFromLyeConcentration,
  type WeightedOil,
} from "./soap-math";
import type { FattyAcidProfile, Oil } from "./types";

/**
 * Every "PDF_*" constant below is transcribed directly from the user's own
 * real SoapCalc recipe export (15% Coconut 76 / 40% Olive / 40% Tallow / 5%
 * Castor, 1000g oils, 5% superfat, 33% lye concentration). These tests pin
 * the engine's behavior against that real, independently-generated output
 * rather than against our own assumptions, so a future change that breaks
 * the math shows up here first.
 */
const PDF_BLEND: FattyAcidProfile = {
  lauric: 8,
  myristic: 5,
  palmitic: 18,
  stearic: 10,
  ricinoleic: 5,
  oleic: 43,
  linoleic: 7,
  linolenic: 1,
};
const PDF_TOTAL_OIL_WEIGHT = 1000;
const PDF_SUPERFAT = 5;
const PDF_NAOH_GRAMS = 137.88;
const PDF_WATER_GRAMS = 279.93;
const PDF_FRAGRANCE_GRAMS = 40;
const PDF_LYE_CONCENTRATION = 33;
// Back-derived so calculateLyeAndWater's inputs reproduce the PDF's own NaOH figure.
const PDF_SAP_BLEND = PDF_NAOH_GRAMS / (PDF_TOTAL_OIL_WEIGHT * (1 - PDF_SUPERFAT / 100));

function makeOil(overrides: Partial<Oil>): Oil {
  return {
    id: "test-oil",
    name: "Test Oil",
    category: "conditioning",
    sapNaOH: 0.135,
    fattyAcids: {},
    usageRateMin: 0,
    usageRateMax: 100,
    rancidityRisk: "low",
    priceTier: 2,
    description: "",
    effects: "",
    benefits: "",
    ...overrides,
  };
}

describe("calculateQualityScores (pinned to the real SoapCalc PDF blend)", () => {
  const scores = calculateQualityScores(PDF_BLEND, PDF_SAP_BLEND);

  it("Hardness/Cleansing/Conditioning/Bubbly/Creamy are exact fatty-acid sums matching the PDF", () => {
    expect(scores.hardness).toBe(41); // PDF displays 42 (their own oils' decimals rounded differently)
    expect(scores.cleansing).toBe(13); // exact match
    expect(scores.conditioning).toBe(56); // PDF displays 55
    expect(scores.bubbly).toBe(18); // exact match
    expect(scores.creamy).toBe(33); // exact match
  });

  it("Iodine matches the PDF's 58 within real stoichiometric rounding", () => {
    expect(scores.iodine).toBeCloseTo(58.3, 1);
  });

  it("INS is close to the PDF's 144 (small variance expected — exact per-oil decimals aren't published)", () => {
    expect(scores.ins).toBeGreaterThan(140);
    expect(scores.ins).toBeLessThan(150);
  });

  it("DOS risk (linoleic + linolenic) is 8, comfortably inside the 0-10 ideal band", () => {
    expect(scores.dosRisk).toBe(8);
    expect(scores.dosRisk).toBeLessThanOrEqual(QUALITY_RANGES.dosRisk[1]);
  });

  it("all five SoapCalc-style scores land inside the PDF's own displayed ideal ranges", () => {
    expect(scores.hardness).toBeGreaterThanOrEqual(QUALITY_RANGES.hardness[0]);
    expect(scores.hardness).toBeLessThanOrEqual(QUALITY_RANGES.hardness[1]);
    expect(scores.cleansing).toBeGreaterThanOrEqual(QUALITY_RANGES.cleansing[0]);
    expect(scores.cleansing).toBeLessThanOrEqual(QUALITY_RANGES.cleansing[1]);
    expect(scores.conditioning).toBeGreaterThanOrEqual(QUALITY_RANGES.conditioning[0]);
    expect(scores.conditioning).toBeLessThanOrEqual(QUALITY_RANGES.conditioning[1]);
    expect(scores.bubbly).toBeGreaterThanOrEqual(QUALITY_RANGES.bubbly[0]);
    expect(scores.bubbly).toBeLessThanOrEqual(QUALITY_RANGES.bubbly[1]);
    expect(scores.creamy).toBeGreaterThanOrEqual(QUALITY_RANGES.creamy[0]);
    expect(scores.creamy).toBeLessThanOrEqual(QUALITY_RANGES.creamy[1]);
  });
});

describe("calculateLyeAndWater (pinned to the PDF's lye/water numbers)", () => {
  const result = calculateLyeAndWater({
    totalOilWeightGrams: PDF_TOTAL_OIL_WEIGHT,
    sapNaOHBlend: PDF_SAP_BLEND,
    superfatPercent: PDF_SUPERFAT,
    lyeConcentrationPercent: PDF_LYE_CONCENTRATION,
  });

  it("reproduces the PDF's NaOH and water weights", () => {
    expect(result.naohGrams).toBeCloseTo(PDF_NAOH_GRAMS, 1);
    expect(result.waterGrams).toBeCloseTo(PDF_WATER_GRAMS, 1);
  });

  it("reproduces the PDF's water:lye ratio (2.0303:1) and water-as-%-of-oils (27.99%)", () => {
    expect(result.waterToLyeRatio).toBeCloseTo(2.0303, 3);
    expect(result.waterAsPercentOfOils).toBeCloseTo(27.99, 1);
  });
});

describe("lye concentration <-> water:lye ratio interconversion", () => {
  it("33% lye concentration is exactly the PDF's 2.0303:1 ratio", () => {
    expect(ratioFromLyeConcentration(33)).toBeCloseTo(2.0303, 4);
  });

  it("round-trips back to the original percentage", () => {
    expect(lyeConcentrationFromRatio(ratioFromLyeConcentration(33))).toBeCloseTo(33, 6);
  });
});

describe("calculateYield (pinned to the PDF's pre-cure soap weight)", () => {
  it("matches the PDF's exact 1457.81g pre-cure mass balance", () => {
    const result = calculateYield({
      totalOilWeightGrams: PDF_TOTAL_OIL_WEIGHT,
      naohGrams: PDF_NAOH_GRAMS,
      waterGrams: PDF_WATER_GRAMS,
      fragranceGrams: PDF_FRAGRANCE_GRAMS,
      cureWaterLossPercent: 15,
      barWeightGrams: 120,
    });
    expect(result.preCureWeightGrams).toBeCloseTo(1457.81, 2);
    expect(result.estimatedCuredWeightGrams).toBeLessThan(result.preCureWeightGrams);
    expect(result.estimatedBarCount).toBe(12);
  });

  it("returns 0 bars rather than dividing by zero when bar weight is 0", () => {
    const result = calculateYield({
      totalOilWeightGrams: 1000,
      naohGrams: 140,
      waterGrams: 280,
      fragranceGrams: 0,
      cureWaterLossPercent: 15,
      barWeightGrams: 0,
    });
    expect(result.estimatedBarCount).toBe(0);
    expect(Number.isFinite(result.estimatedBarCount)).toBe(true);
  });
});

describe("rounding/color-agreement regression (a real bug caught during manual QA)", () => {
  it("a raw value that displays as the range's own minimum is treated as in-range, not below it", () => {
    // 7.75 lauric + 4.075 myristic = 11.825 raw -> displays as "12", the
    // bottom of the 12-22 cleansing band. It must not be flagged as low.
    const blend: FattyAcidProfile = { lauric: 7.75, myristic: 4.075, oleic: 50, palmitic: 10 };
    const scores = calculateQualityScores(blend, 0.14);
    expect(Math.round(scores.cleansing)).toBe(12);

    const insights = getRecipeInsights(scores, blend);
    const cleansingInsight = insights.find((i) => i.message.toLowerCase().includes("cleansing"));
    expect(cleansingInsight?.severity).toBe("success");
    expect(cleansingInsight?.message).toContain("Balanced cleansing");
  });
});

describe("getLyeConcentrationAdvisory (generalized off ricinoleic content, not a hardcoded oil id)", () => {
  it("fires for a high-ricinoleic custom oil that is NOT named 'castor-oil'", () => {
    const customCastorLike = makeOil({
      id: "my-custom-castor-substitute",
      fattyAcids: { ricinoleic: 90, oleic: 4, linoleic: 5.5 },
    });
    const oils: WeightedOil[] = [{ oil: customCastorLike, percent: 15 }];

    const advisories = getLyeConcentrationAdvisory({ oils, scents: [], lyeConcentrationPercent: 33 });
    expect(advisories.some((a) => a.message.includes("ricinoleic content"))).toBe(true);
  });

  it("does not fire for a normal low-ricinoleic recipe", () => {
    const olive = makeOil({ id: "olive-like", fattyAcids: { oleic: 70, linoleic: 9 } });
    const oils: WeightedOil[] = [{ oil: olive, percent: 100 }];

    const advisories = getLyeConcentrationAdvisory({ oils, scents: [], lyeConcentrationPercent: 33 });
    expect(advisories.some((a) => a.message.includes("ricinoleic content"))).toBe(false);
  });
});

describe("blendFattyAcids / blendSapNaOH weighted sums", () => {
  it("weights each oil's contribution by its recipe percentage", () => {
    const oilA = makeOil({ id: "a", sapNaOH: 0.1, fattyAcids: { oleic: 100 } });
    const oilB = makeOil({ id: "b", sapNaOH: 0.2, fattyAcids: { lauric: 50, myristic: 50 } });
    const entries: WeightedOil[] = [
      { oil: oilA, percent: 60 },
      { oil: oilB, percent: 40 },
    ];

    const blend = blendFattyAcids(entries);
    expect(blend.oleic).toBeCloseTo(60, 5); // 100% oleic * 60%
    expect(blend.lauric).toBeCloseTo(20, 5); // 50% lauric * 40%
    expect(blend.myristic).toBeCloseTo(20, 5);

    expect(blendSapNaOH(entries)).toBeCloseTo(0.1 * 0.6 + 0.2 * 0.4, 6);
  });
});

describe("cost math", () => {
  it("costForWeight converts a pound-based price to the right dollar amount", () => {
    expect(costForWeight(GRAMS_PER_LB, 10, "lb")).toBeCloseTo(10, 6);
    expect(costForWeight(GRAMS_PER_LB / 2, 10, "lb")).toBeCloseTo(5, 6);
  });

  it("costPerFlOzApprox uses the generic fallback density when none is given", () => {
    const withDefault = costPerFlOzApprox(10, "lb");
    const withExplicitDefault = costPerFlOzApprox(10, "lb", 0.92);
    expect(withDefault).toBeCloseTo(withExplicitDefault, 6);
  });

  it("costPerFlOzApprox scales with density (denser oil costs more per fl oz at the same $/g)", () => {
    const lighter = costPerFlOzApprox(10, "lb", 0.9);
    const denser = costPerFlOzApprox(10, "lb", 0.96); // castor oil
    expect(denser).toBeGreaterThan(lighter);
  });

  it("costPerGram is a pure per-unit conversion independent of quantity", () => {
    expect(costPerGram(10, "lb")).toBeCloseTo(10 / GRAMS_PER_LB, 6);
  });
});
