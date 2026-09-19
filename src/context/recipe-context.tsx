"use client";

import * as React from "react";

import { OILS, OILS_BY_ID } from "@/data/oils";
import { SCENTS, SCENTS_BY_ID } from "@/data/scents";
import { createDefaultRecipe } from "@/lib/default-recipe";
import {
  analyzeScentBlend,
  blendFattyAcids,
  blendSapNaOH,
  calculateBatchCosts,
  calculateLyeAndWater,
  calculateQualityScores,
  calculateYield,
  getLyeConcentrationAdvisory,
  getSuperfatGuidance,
  toWeightedOils,
  toWeightedScents,
} from "@/lib/soap-math";
import type { Oil, Recipe, RecipeOilEntry, RecipeScentEntry, Scent } from "@/lib/types";

const DRAFT_KEY = "soap-hub:draft-recipe";
const CUSTOM_OILS_KEY = "soap-hub:custom-oils";
const CUSTOM_SCENTS_KEY = "soap-hub:custom-scents";

interface RecipeContextValue {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe>>;
  loadRecipe: (recipe: Recipe) => void;
  resetRecipe: () => void;

  allOils: Oil[];
  allScents: Scent[];
  oilsById: Map<string, Oil>;
  scentsById: Map<string, Scent>;
  addCustomOil: (oil: Oil) => void;
  addCustomScent: (scent: Scent) => void;

  addOil: (oilId: string, percent?: number) => void;
  updateOilPercent: (oilId: string, percent: number) => void;
  removeOil: (oilId: string) => void;

  addScent: (scentId: string, percent?: number) => void;
  updateScentPercent: (scentId: string, percent: number) => void;
  removeScent: (scentId: string) => void;

  // Derived
  fattyAcidBlend: ReturnType<typeof blendFattyAcids>;
  sapNaOHBlend: number;
  lyeWater: ReturnType<typeof calculateLyeAndWater>;
  qualityScores: ReturnType<typeof calculateQualityScores>;
  yieldResult: ReturnType<typeof calculateYield>;
  lyeAdvisories: ReturnType<typeof getLyeConcentrationAdvisory>;
  superfatGuidance: string[];
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
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // One-time hydration from localStorage after mount (SSR has no
    // localStorage, so this can't run in the initializer without causing a
    // hydration mismatch — see the comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRecipe(loadJson(DRAFT_KEY, createDefaultRecipe()));
    setCustomOils(loadJson(CUSTOM_OILS_KEY, []));
    setCustomScents(loadJson(CUSTOM_SCENTS_KEY, []));
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

  const allOils = React.useMemo(() => [...OILS, ...customOils], [customOils]);
  const allScents = React.useMemo(() => [...SCENTS, ...customScents], [customScents]);
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

  const addCustomOil = React.useCallback((oil: Oil) => {
    setCustomOils((prev) => [...prev.filter((o) => o.id !== oil.id), oil]);
  }, []);
  const addCustomScent = React.useCallback((scent: Scent) => {
    setCustomScents((prev) => [...prev.filter((s) => s.id !== scent.id), scent]);
  }, []);

  const loadRecipe = React.useCallback((next: Recipe) => setRecipe(next), []);
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
        naohGrams: lyeWater.naohGrams,
        estimatedBarCount: yieldResult.estimatedBarCount,
      }),
    [recipe, oilsById, scentsById, lyeWater.naohGrams, yieldResult.estimatedBarCount]
  );

  const value: RecipeContextValue = {
    recipe,
    setRecipe,
    loadRecipe,
    resetRecipe,
    allOils,
    allScents,
    oilsById,
    scentsById,
    addCustomOil,
    addCustomScent,
    addOil,
    updateOilPercent,
    removeOil,
    addScent,
    updateScentPercent,
    removeScent,
    fattyAcidBlend,
    sapNaOHBlend,
    lyeWater,
    qualityScores,
    yieldResult,
    lyeAdvisories,
    superfatGuidance,
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
