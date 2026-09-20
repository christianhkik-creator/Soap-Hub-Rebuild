import type { Recipe } from "./types";

/**
 * Merges a possibly-older-shaped Recipe (from localStorage or Supabase,
 * saved before a field like `additives` existed) with current defaults, so
 * loading a recipe saved by an earlier version of the app never crashes on
 * a missing array/object.
 */
export function normalizeRecipe(recipe: Partial<Recipe>): Recipe {
  return { ...createDefaultRecipe(), ...recipe };
}

export function createDefaultRecipe(): Recipe {
  return {
    name: "Untitled Recipe",
    totalOilWeightGrams: 1000,
    superfatPercent: 5,
    lyeConcentrationPercent: 33,
    oils: [],
    scents: [],
    additives: [],
    batchScentWeightGrams: 30,
    barWeightGrams: 120,
    cureWaterLossPercent: 15,
    oilPricesPerLb: {},
    scentPricesPer100g: {},
    additivePricesPerLb: {},
    lyePricePerLb: 0,
    additionalCosts: [],
  };
}
