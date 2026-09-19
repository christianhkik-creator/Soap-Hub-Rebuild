"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRecipe } from "@/context/recipe-context";
import { OIL_CATEGORY_LABELS, type OilCategory } from "@/lib/types";
import { useState } from "react";

const CATEGORY_STYLES: Record<
  OilCategory,
  { badge: string; button: string; iconBg: string }
> = {
  conditioning: {
    badge: "bg-cat-1/15 text-cat-1",
    button: "bg-cat-1 text-cat-1-foreground hover:bg-cat-1/90",
    iconBg: "bg-cat-1/15",
  },
  cleansing: {
    badge: "bg-cat-2/15 text-cat-2",
    button: "bg-cat-2 text-cat-2-foreground hover:bg-cat-2/90",
    iconBg: "bg-cat-2/15",
  },
  hardness: {
    badge: "bg-cat-3/15 text-cat-3",
    button: "bg-cat-3 text-cat-3-foreground hover:bg-cat-3/90",
    iconBg: "bg-cat-3/15",
  },
  "lather-boost": {
    badge: "bg-cat-4/15 text-cat-4",
    button: "bg-cat-4 text-cat-4-foreground hover:bg-cat-4/90",
    iconBg: "bg-cat-4/15",
  },
};

export function RecipeOilPanel({ category }: { category: OilCategory }) {
  const { allOils, recipe, addOil, updateOilPercent, removeOil } = useRecipe();
  const { title, blurb } = OIL_CATEGORY_LABELS[category];
  const styles = CATEGORY_STYLES[category];

  const categoryOils = allOils.filter((o) => o.category === category);
  const addedEntries = recipe.oils
    .map((entry) => ({ entry, oil: categoryOils.find((o) => o.id === entry.oilId) }))
    .filter((x): x is { entry: typeof x.entry; oil: NonNullable<typeof x.oil> } => Boolean(x.oil));

  const availableOils = categoryOils.filter(
    (oil) => !recipe.oils.some((e) => e.oilId === oil.id)
  );

  const [selectedOilId, setSelectedOilId] = useState<string>("");

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
          <Select value={selectedOilId} onValueChange={setSelectedOilId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="— choose an oil —" />
            </SelectTrigger>
            <SelectContent>
              {availableOils.map((oil) => (
                <SelectItem key={oil.id} value={oil.id}>
                  {oil.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className={styles.button}
            disabled={!selectedOilId}
            onClick={() => {
              if (!selectedOilId) return;
              addOil(selectedOilId);
              setSelectedOilId("");
            }}
          >
            + Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {addedEntries.length === 0 && (
          <p className="text-sm italic text-muted-foreground">No oils added yet.</p>
        )}
        {addedEntries.map(({ entry, oil }) => {
          const overMax = entry.percent > oil.usageRateMax;
          return (
            <div key={oil.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  {oil.name}
                  <span className="text-xs text-muted-foreground">{"$".repeat(oil.priceTier)}</span>
                  {overMax && (
                    <span className="text-xs font-medium text-warning">
                      {oil.usageNote ?? `Typically kept under ${oil.usageRateMax}%`}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-right tabular-nums">{entry.percent.toFixed(0)}%</span>
                  <button
                    type="button"
                    onClick={() => removeOil(oil.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${oil.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <Slider
                value={[entry.percent]}
                max={100}
                step={1}
                onValueChange={([v]) => updateOilPercent(oil.id, v)}
                thumbClassName={overMax ? "border-warning" : undefined}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
