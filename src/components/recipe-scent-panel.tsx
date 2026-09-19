"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRecipe } from "@/context/recipe-context";
import { SCENT_NOTE_LABELS, type ScentNote } from "@/lib/types";

const NOTE_STYLES: Record<ScentNote, { badge: string; button: string }> = {
  top: { badge: "bg-cat-3/15 text-cat-3", button: "bg-cat-3 text-cat-3-foreground hover:bg-cat-3/90" },
  heart: { badge: "bg-cat-1/15 text-cat-1", button: "bg-cat-1 text-cat-1-foreground hover:bg-cat-1/90" },
  base: { badge: "bg-cat-4/15 text-cat-4", button: "bg-cat-4 text-cat-4-foreground hover:bg-cat-4/90" },
  "fragrance-oil": {
    badge: "bg-cat-2/15 text-cat-2",
    button: "bg-cat-2 text-cat-2-foreground hover:bg-cat-2/90",
  },
};

export function RecipeScentPanel({ note }: { note: ScentNote }) {
  const { allScents, recipe, addScent, updateScentPercent, removeScent } = useRecipe();
  const { title, blurb } = SCENT_NOTE_LABELS[note];
  const styles = NOTE_STYLES[note];

  const noteScents = allScents.filter((s) => s.note === note);
  const addedEntries = recipe.scents
    .map((entry) => ({ entry, scent: noteScents.find((s) => s.id === entry.scentId) }))
    .filter((x): x is { entry: typeof x.entry; scent: NonNullable<typeof x.scent> } => Boolean(x.scent));
  const availableScents = noteScents.filter((s) => !recipe.scents.some((e) => e.scentId === s.id));

  const [selectedId, setSelectedId] = useState("");

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${styles.badge}`}>
            {title[0]}
          </span>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {title}
            </div>
            <p className="text-sm text-muted-foreground">{blurb}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="— choose a scent —" />
            </SelectTrigger>
            <SelectContent>
              {availableScents.map((scent) => (
                <SelectItem key={scent.id} value={scent.id}>
                  {scent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className={styles.button}
            disabled={!selectedId}
            onClick={() => {
              if (!selectedId) return;
              addScent(selectedId);
              setSelectedId("");
            }}
          >
            + Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {addedEntries.length === 0 && (
          <p className="text-sm italic text-muted-foreground">No scents added yet.</p>
        )}
        {addedEntries.map(({ entry, scent }) => {
          const accelerant = scent.warnings.find((w) => w.type === "accelerant");
          return (
            <div key={scent.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  {scent.name}
                  {accelerant && (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning">
                      Strong Accelerator
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right tabular-nums">{entry.percent.toFixed(0)}%</span>
                  <button
                    type="button"
                    onClick={() => removeScent(scent.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${scent.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <Slider
                value={[entry.percent]}
                max={100}
                step={1}
                onValueChange={([v]) => updateScentPercent(scent.id, v)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
