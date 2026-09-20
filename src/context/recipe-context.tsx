"use client";

import * as React from "react";

import { ADDITIVES, ADDITIVES_BY_ID } from "@/data/additives";
import { OILS, OILS_BY_ID } from "@/data/oils";
import { SCENTS, SCENTS_BY_ID } from "@/data/scents";
import { createDefaultRecipe, normalizeRecipe } from "@/lib/default-recipe";
import {
  analyzeScentBlend,
  blendFattyAcids,
  blendSapNaOH,
  calculateBatchCosts,
  calculateLyeAndWater,
  calculateQualityScores,
  calculateYield,
  getLyeConcentrationAdvisory,
  getRecipeInsights,
  getSuperfatGuidance,
  toWeightedOils,
  toWeightedScents,
} from "@/lib/soap-math";
import type {
  Additive,
  Oil,
  Recipe,
  RecipeAdditiveEntry,
  RecipeOilEntry,
  RecipeScentEntry,
  Scent,
} from "@/lib/types";

const DRAFT_KEY = "soap-hub:draft-recipe";
const CUSTOM_OILS_KEY = "soap-hub:custom-oils";
const CUSTOM_SCENTS_KEY = "soap-hub:custom-scents";
const CUSTOM_ADDITIVES_KEY = "soap-hub:custom-additives";

interface RecipeContextValue {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe>>;
  loadRecipe: (recipe: Recipe) => void;
  resetRecipe: () => void;

  allOils: Oil[];
  allScents: Scent[];
  allAdditives: Additive[];
  oilsById: Map<string, Oil>;
  scentsById: Map<string, Scent>;
  additivesById: Map<string, Additive>;
  addCustomOil: (oil: Oil) => void;
  addCustomScent: (scent: Scent) => void;
  addCustomAdditive: (additive: Additive) => void;
  deleteCustomOil: (oilId: string) => void;
  deleteCustomScent: (scentId: string) => void;
  deleteCustomAdditive: (additiveId: string) => void;

  addOil: (oilId: string, percent?: number) => void;
  updateOilPercent: (oilId: string, percent: number) => void;
  removeOil: (oilId: string) => void;

  addScent: (scentId: string, percent?: number) => void;
  updateScentPercent: (scentId: string, percent: number) => void;
  removeScent: (scentId: string) => void;

  addAdditive: (additiveId: string, percent?: number) => void;
  updateAdditivePercent: (additiveId: string, percent: number) => void;
  removeAdditive: (additiveId: string) => void;

  // Derived
  fattyAcidBlend: ReturnType<typeof blendFattyAcids>;
  sapNaOHBlend: number;
  lyeWater: ReturnType<typeof calculateLyeAndWater>;
  qualityScores: ReturnType<typeof calculateQualityScores>;
  yieldResult: ReturnType<typeof calculateYield>;
  lyeAdvisories: ReturnType<typeof getLyeConcentrationAdvisory>;
  superfatGuidance: string[];
  recipeInsights: ReturnType<typeof getRecipeInsights>;
  scentBlendAnalysis: ReturnType<typeof analyzeScentBlend>;
  totalOilPercent: number;
  batchCosts: ReturnType<typeof calculateBatchCosts>;
}

const RecipeContext = React.createContext<RecipeContextValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  // Initial state must match between server and client render (no window on
  // the server), so localStorage is only read after mount, in an effect —
  // reading it inside useState's initializer caused a hydration mismatch.
  const [recipe, setRecipe] = React.useState<Recipe>(createDefaultRecipe);
  const [customOils, setCustomOils] = React.useState<Oil[]>([]);
  const [customScents, setCustomScents] = React.useState<Scent[]>([]);
  const [customAdditives, setCustomAdditives] = React.useState<Additive[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // One-time hydration from localStorage after mount (SSR has no
    // localStorage, so this can't run in the initializer without causing a
    // hydration mismatch — see the comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecipe(normalizeRecipe(loadJson(DRAFT_KEY, createDefaultRecipe())));
    setCustomOils(loadJson(CUSTOM_OILS_KEY, []));
    setCustomScents(loadJson(CUSTOM_SCENTS_KEY, []));
    setCustomAdditives(loadJson(CUSTOM_ADDITIVES_KEY, []));
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(recipe));
  }, [recipe, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CUSTOM_OILS_KEY, JSON.stringify(customOils));
  }, [customOils, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CUSTOM_SCENTS_KEY, JSON.stringify(customScents));
  }, [customScents, hydrated]);
  React.useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(CUSTOM_ADDITIVES_KEY, JSON.stringify(customAdditives));
  }, [customAdditives, hydrated]);

  const allOils = React.useMemo(() => [...OILS, ...customOils], [customOils]);
  const allScents = React.useMemo(() => [...SCENTS, ...customScents], [customScents]);
  const allAdditives = React.useMemo(() => [...ADDITIVES, ...customAdditives], [customAdditives]);
  const oilsById = React.useMemo(() => {
    const map = new Map(OILS_BY_ID);
    for (const oil of customOils) map.set(oil.id, oil);
    return map;
  }, [customOils]);
  const scentsById = React.useMemo(() => {
    const map = new Map(SCENTS_BY_ID);
    for (const scent of customScents) map.set(scent.id, scent);
    return map;
  }, [customScents]);
  const additivesById = React.useMemo(() => {
    const map = new Map(ADDITIVES_BY_ID);
    for (const additive of customAdditives) map.set(additive.id, additive);
    return map;
  }, [customAdditives]);

  const addCustomOil = React.useCallback((oil: Oil) => {
    setCustomOils((prev) => [...prev.filter((o) => o.id !== oil.id), oil]);
  }, []);
  const addCustomScent = React.useCallback((scent: Scent) => {
    setCustomScents((prev) => [...prev.filter((s) => s.id !== scent.id), scent]);
  }, []);
  const addCustomAdditive = React.useCallback((additive: Additive) => {
    setCustomAdditives((prev) => [...prev.filter((a) => a.id !== additive.id), additive]);
  }, []);
  // Also drops the oil/scent/additive from the active recipe, if it's currently in use.
  const deleteCustomOil = React.useCallback((oilId: string) => {
    setCustomOils((prev) => prev.filter((o) => o.id !== oilId));
    setRecipe((prev) => ({ ...prev, oils: prev.oils.filter((o) => o.oilId !== oilId) }));
  }, []);
  const deleteCustomScent = React.useCallback((scentId: string) => {
    setCustomScents((prev) => prev.filter((s) => s.id !== scentId));
    setRecipe((prev) => ({ ...prev, scents: prev.scents.filter((s) => s.scentId !== scentId) }));
  }, []);
  const deleteCustomAdditive = React.useCallback((additiveId: string) => {
    setCustomAdditives((prev) => prev.filter((a) => a.id !== additiveId));
    setRecipe((prev) => ({ ...prev, additives: prev.additives.filter((a) => a.additiveId !== additiveId) }));
  }, []);

  const loadRecipe = React.useCallback((next: Recipe) => setRecipe(normalizeRecipe(next)), []);
  const resetRecipe = React.useCallback(() => setRecipe(createDefaultRecipe()), []);

  const addOil = React.useCallback((oilId: string, percent = 10) => {
    setRecipe((prev) => {
      if (prev.oils.some((o) => o.oilId === oilId)) return prev;
      return { ...prev, oils: [...prev.oils, { oilId, percent }] };
    });
  }, []);
  const updateOilPercent = React.useCallback((oilId: string, percent: number) => {
    setRecipe((prev) => ({
      ...prev,
      oils: prev.oils.map((o): RecipeOilEntry => (o.oilId === oilId ? { ...o, percent } : o)),
    }));
  }, []);
  const removeOil = React.useCallback((oilId: string) => {
    setRecipe((prev) => ({ ...prev, oils: prev.oils.filter((o) => o.oilId !== oilId) }));
  }, []);

  const addScent = React.useCallback((scentId: string, percent = 10) => {
    setRecipe((prev) => {
      if (prev.scents.some((s) => s.scentId === scentId)) return prev;
      return { ...prev, scents: [...prev.scents, { scentId, percent }] };
    });
  }, []);
  const updateScentPercent = React.useCallback((scentId: string, percent: number) => {
    setRecipe((prev) => ({
      ...prev,
      scents: prev.scents.map((s): RecipeScentEntry =>
        s.scentId === scentId ? { ...s, percent } : s
      ),
    }));
  }, []);
  const removeScent = React.useCallback((scentId: string) => {
    setRecipe((prev) => ({ ...prev, scents: prev.scents.filter((s) => s.scentId !== scentId) }));
  }, []);

  const addAdditive = React.useCallback((additiveId: string, percent = 1) => {
    setRecipe((prev) => {
      if (prev.additives.some((a) => a.additiveId === additiveId)) return prev;
      return { ...prev, additives: [...prev.additives, { additiveId, percent }] };
    });
  }, []);
  const updateAdditivePercent = React.useCallback((additiveId: string, percent: number) => {
    setRecipe((prev) => ({
      ...prev,
      additives: prev.additives.map((a): RecipeAdditiveEntry =>
        a.additiveId === additiveId ? { ...a, percent } : a
      ),
    }));
  }, []);
  const removeAdditive = React.useCallback((additiveId: string) => {
    setRecipe((prev) => ({ ...prev, additives: prev.additives.filter((a) => a.additiveId !== additiveId) }));
  }, []);

  const weightedOils = React.useMemo(
    () => toWeightedOils(recipe.oils, oilsById),
    [recipe.oils, oilsById]
  );
  const weightedScents = React.useMemo(
    () => toWeightedScents(recipe.scents, scentsById),
    [recipe.scents, scentsById]
  );

  const fattyAcidBlend = React.useMemo(() => blendFattyAcids(weightedOils), [weightedOils]);
  const sapNaOHBlend = React.useMemo(() => blendSapNaOH(weightedOils), [weightedOils]);
  const lyeWater = React.useMemo(
    () =>
      calculateLyeAndWater({
        totalOilWeightGrams: recipe.totalOilWeightGrams,
        sapNaOHBlend,
        superfatPercent: recipe.superfatPercent,
        lyeConcentrationPercent: recipe.lyeConcentrationPercent,
      }),
    [recipe.totalOilWeightGrams, sapNaOHBlend, recipe.superfatPercent, recipe.lyeConcentrationPercent]
  );
  const qualityScores = React.useMemo(
    () => calculateQualityScores(fattyAcidBlend, sapNaOHBlend),
    [fattyAcidBlend, sapNaOHBlend]
  );
  const yieldResult = React.useMemo(
    () =>
      calculateYield({
        totalOilWeightGrams: recipe.totalOilWeightGrams,
        naohGrams: lyeWater.naohGrams,
        waterGrams: lyeWater.waterGrams,
        fragranceGrams: recipe.batchScentWeightGrams,
        cureWaterLossPercent: recipe.cureWaterLossPercent,
        barWeightGrams: recipe.barWeightGrams,
      }),
    [recipe.totalOilWeightGrams, lyeWater, recipe.batchScentWeightGrams, recipe.cureWaterLossPercent, recipe.barWeightGrams]
  );
  const lyeAdvisories = React.useMemo(
    () =>
      getLyeConcentrationAdvisory({
        oils: weightedOils,
        scents: weightedScents,
        lyeConcentrationPercent: recipe.lyeConcentrationPercent,
      }),
    [weightedOils, weightedScents, recipe.lyeConcentrationPercent]
  );
  const superfatGuidance = React.useMemo(
    () => getSuperfatGuidance(recipe.superfatPercent, fattyAcidBlend),
    [recipe.superfatPercent, fattyAcidBlend]
  );
  const recipeInsights = React.useMemo(
    () => (weightedOils.length > 0 ? getRecipeInsights(qualityScores, fattyAcidBlend) : []),
    [weightedOils.length, qualityScores, fattyAcidBlend]
  );
  const scentBlendAnalysis = React.useMemo(
    () => analyzeScentBlend(weightedScents),
    [weightedScents]
  );
  const totalOilPercent = React.useMemo(
    () => recipe.oils.reduce((s, o) => s + o.percent, 0),
    [recipe.oils]
  );
  const batchCosts = React.useMemo(
    () =>
      calculateBatchCosts({
        recipe,
        oilsById,
        scentsById,
        additivesById,
        naohGrams: lyeWater.naohGrams,
        estimatedBarCount: yieldResult.estimatedBarCount,
      }),
    [recipe, oilsById, scentsById, additivesById, lyeWater.naohGrams, yieldResult.estimatedBarCount]
  );

  const value: RecipeContextValue = {
    recipe,
    setRecipe,
    loadRecipe,
    resetRecipe,
    allOils,
    allScents,
    allAdditives,
    oilsById,
    scentsById,
    additivesById,
    addCustomOil,
    addCustomScent,
    addCustomAdditive,
    deleteCustomOil,
    deleteCustomScent,
    deleteCustomAdditive,
    addOil,
    updateOilPercent,
    removeOil,
    addScent,
    updateScentPercent,
    removeScent,
    addAdditive,
    updateAdditivePercent,
    removeAdditive,
    fattyAcidBlend,
    sapNaOHBlend,
    lyeWater,
    qualityScores,
    yieldResult,
    lyeAdvisories,
    superfatGuidance,
    recipeInsights,
    scentBlendAnalysis,
    totalOilPercent,
    batchCosts,
  };

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipe() {
  const ctx = React.useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipe must be used within a RecipeProvider");
  return ctx;
}
