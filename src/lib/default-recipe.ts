import type { Recipe } from "./types";

export function createDefaultRecipe(): Recipe {
  return {
    name: "Untitled Recipe",
    totalOilWeightGrams: 1000,
    superfatPercent: 5,
    lyeConcentrationPercent: 33,
    oils: [],
    scents: [],
    batchScentWeightGrams: 30,
    barWeightGrams: 120,
    cureWaterLossPercent: 15,
    oilPricesPerLb: {},
    scentPricesPer100g: {},
    lyePricePerLb: 0,
    additionalCosts: [],
  };
}
