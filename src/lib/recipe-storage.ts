import { supabase } from "./supabase";
import type { Recipe } from "./types";

const LOCAL_KEY = "soap-hub:saved-recipes";

function readLocal(): Recipe[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Recipe[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(recipes: Recipe[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(recipes));
}

export async function listRecipes(): Promise<Recipe[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, data, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => ({
      ...(row.data as Recipe),
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
  return readLocal().sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}

export async function saveRecipe(recipe: Recipe): Promise<Recipe> {
  const now = new Date().toISOString();

  if (supabase) {
    if (recipe.id) {
      const { data, error } = await supabase
        .from("recipes")
        .update({ name: recipe.name, data: recipe })
        .eq("id", recipe.id)
        .select()
        .single();
      if (error) throw error;
      return { ...recipe, id: data.id, updatedAt: data.updated_at };
    }
    const { data, error } = await supabase
      .from("recipes")
      .insert({ name: recipe.name, data: recipe })
      .select()
      .single();
    if (error) throw error;
    return { ...recipe, id: data.id, createdAt: data.created_at, updatedAt: data.updated_at };
  }

  const recipes = readLocal();
  if (recipe.id) {
    const updated = { ...recipe, updatedAt: now };
    writeLocal(recipes.map((r) => (r.id === recipe.id ? updated : r)));
    return updated;
  }
  const created = { ...recipe, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  writeLocal([...recipes, created]);
  return created;
}

export async function deleteRecipe(id: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  writeLocal(readLocal().filter((r) => r.id !== id));
}
