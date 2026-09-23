import { supabase } from "./supabase";
import type { Additive, Oil, Scent } from "./types";

/**
 * Supabase-backed CRUD for a custom-ingredient table (custom_oils,
 * custom_scents, custom_additives), all sharing the same shape: a
 * client-supplied text `id` (the same id used elsewhere in the app, e.g. in
 * a recipe's oils/scents/additives arrays) plus a `data` jsonb blob.
 *
 * Callers fall back to localStorage themselves when `!isSupabaseConfigured`
 * — this module only talks to Supabase and assumes `supabase` is non-null.
 */
function makeCustomIngredientStore<T extends { id: string }>(table: string) {
  return {
    async list(): Promise<T[]> {
      const { data, error } = await supabase!
        .from(table)
        .select("data")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => row.data as T);
    },
    async save(item: T): Promise<void> {
      const { error } = await supabase!.from(table).upsert({ id: item.id, data: item });
      if (error) throw error;
    },
    async remove(id: string): Promise<void> {
      const { error } = await supabase!.from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}

export const customOilStore = makeCustomIngredientStore<Oil>("custom_oils");
export const customScentStore = makeCustomIngredientStore<Scent>("custom_scents");
export const customAdditiveStore = makeCustomIngredientStore<Additive>("custom_additives");
