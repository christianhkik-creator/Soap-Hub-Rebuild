"use client";

import Link from "next/link";
import { FileText, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRecipe } from "@/context/recipe-context";
import { deleteRecipe, listRecipes, saveRecipe } from "@/lib/recipe-storage";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Recipe } from "@/lib/types";

export default function RecipesPage() {
  const { recipe, setRecipe, loadRecipe } = useRecipe();
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setSaved(await listRecipes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load recipes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    listRecipes()
      .then((data) => {
        if (!cancelled) setSaved(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load recipes.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await saveRecipe(recipe);
      loadRecipe(result);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save recipe.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteRecipe(id);
      if (recipe.id === id) loadRecipe({ ...recipe, id: undefined });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete recipe.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">My Recipes</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Save your current working recipe, or load a saved one back into the builder.
        </p>
        {!isSupabaseConfigured && (
          <p className="mt-2 max-w-2xl text-xs text-warning">
            No Supabase project connected yet — recipes are saved to this browser only (see
            .env.local.example). They won&apos;t sync to your phone until Supabase is configured.
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Save current recipe</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="min-w-[16rem] flex-1 space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recipe name
            </label>
            <Input
              value={recipe.name}
              onChange={(e) => setRecipe((r) => ({ ...r, name: e.target.value }))}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save /> {recipe.id ? "Update Recipe" : "Save as New"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/recipes/summary">
              <FileText /> View / Print Summary
            </Link>
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : saved.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">No saved recipes yet.</p>
        ) : (
          saved.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.oils.length} oils · {r.scents.length} scents · {r.totalOilWeightGrams}g batch
                    {r.updatedAt ? ` · updated ${new Date(r.updatedAt).toLocaleString()}` : ""}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => loadRecipe(r)}>
                    Load
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => r.id && handleDelete(r.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
