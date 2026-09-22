import type { PurchaseInfo, Recipe } from "./types";

/** Best-effort conversion of a recipe saved under the old "$/lb" or "$/100g" price model into the new paid-amount + content-weight model, so prices already entered aren't silently dropped. */
function migrateOldPrices(
  oldPrices: Record<string, number> | undefined,
  unit: "lb" | "100g"
): Record<string, PurchaseInfo> | undefined {
  if (!oldPrices) return undefined;
  const migrated: Record<string, PurchaseInfo> = {};
  for (const [id, pricePerUnit] of Object.entries(oldPrices)) {
    if (!pricePerUnit) continue;
    migrated[id] =
      unit === "lb"
        ? { amountPaid: pricePerUnit, containerAmount: 1, containerUnit: "lb" }
        : { amountPaid: pricePerUnit, containerAmount: 100, containerUnit: "g" };
  }
  return migrated;
}

/**
 * Merges a possibly-older-shaped Recipe (from localStorage or Supabase,
 * saved before a field like `additives` existed, or before the pricing
 * model switched from "$/lb" to "amount paid for a container size") with
 * current defaults, so loading a recipe saved by an earlier version of the
 * app never crashes on a missing field and doesn't lose prices already
 * entered.
 */
export function normalizeRecipe(recipe: Partial<Recipe>): Recipe {
  const legacy = recipe as Partial<Recipe> & {
    oilPricesPerLb?: Record<string, number>;
    scentPricesPer100g?: Record<string, number>;
    additivePricesPerLb?: Record<string, number>;
    lyePricePerLb?: number;
  };

  const merged: Recipe = { ...createDefaultRecipe(), ...recipe };

  if (!recipe.oilPurchases && legacy.oilPricesPerLb) {
    merged.oilPurchases = migrateOldPrices(legacy.oilPricesPerLb, "lb") ?? merged.oilPurchases;
  }
  if (!recipe.scentPurchases && legacy.scentPricesPer100g) {
    merged.scentPurchases = migrateOldPrices(legacy.scentPricesPer100g, "100g") ?? merged.scentPurchases;
  }
  if (!recipe.additivePurchases && legacy.additivePricesPerLb) {
    merged.additivePurchases = migrateOldPrices(legacy.additivePricesPerLb, "lb") ?? merged.additivePurchases;
  }
  if (!recipe.lyePurchase && legacy.lyePricePerLb) {
    merged.lyePurchase = { amountPaid: legacy.lyePricePerLb, containerAmount: 1, containerUnit: "lb" };
  }

  return merged;
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
    oilPurchases: {},
    scentPurchases: {},
    additivePurchases: {},
    lyePurchase: { amountPaid: 0, containerAmount: 0, containerUnit: "lb" },
    additionalCosts: [],
  };
}
