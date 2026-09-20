"use client";

import { AlertTriangle, ChevronDown, X } from "lucide-react";
import { useState } from "react";

import { AddAdditiveDialog } from "@/components/add-additive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRecipe } from "@/context/recipe-context";
import { costForWeight } from "@/lib/soap-math";
import { ADDITIVE_CATEGORY_LABELS } from "@/lib/types";

export function RecipeAdditivePanel() {
  const { recipe, setRecipe, allAdditives, batchCosts } = useRecipe();
  const [selectedId, setSelectedId] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const availableAdditives = allAdditives.filter(
    (a) => !recipe.additives.some((e) => e.additiveId === a.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">Additives (clays, colorants, etc.)</div>
          <p className="text-xs text-muted-foreground">Usage is % of total oil weight.</p>
        </div>
        <AddAdditiveDialog />
      </div>

      <div className="flex gap-2">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="— choose an additive —" />
          </SelectTrigger>
          <SelectContent>
            {availableAdditives.map((additive) => (
              <SelectItem key={additive.id} value={additive.id}>
                {additive.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="secondary"
          disabled={!selectedId}
          onClick={() => {
            if (!selectedId) return;
            const additive = allAdditives.find((a) => a.id === selectedId);
            setRecipe((r) => ({
              ...r,
              additives: [
                ...r.additives,
                { additiveId: selectedId, percent: additive?.usageRateMin ?? 1 },
              ],
            }));
            setSelectedId("");
          }}
        >
          + Add
        </Button>
      </div>

      {batchCosts.additiveCosts.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">No additives added yet.</p>
      ) : (
        <div className="space-y-3">
          {batchCosts.additiveCosts.map(({ additive, percent, weightGrams, price, cost }) => {
            const expanded = expandedId === additive.id;
            return (
              <div key={additive.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : additive.id)}
                    className="flex items-center gap-1.5 font-medium hover:text-primary"
                  >
                    <ChevronDown className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    {additive.name}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({ADDITIVE_CATEGORY_LABELS[additive.category]})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRecipe((r) => ({
                        ...r,
                        additives: r.additives.filter((a) => a.additiveId !== additive.id),
                      }))
                    }
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Remove ${additive.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <Slider
                    value={[percent]}
                    min={0}
                    max={Math.max(additive.usageRateMax * 2, 5)}
                    step={0.1}
                    onValueChange={([v]) =>
                      setRecipe((r) => ({
                        ...r,
                        additives: r.additives.map((a) =>
                          a.additiveId === additive.id ? { ...a, percent: v } : a
                        ),
                      }))
                    }
                  />
                  <span className="w-14 shrink-0 text-right text-sm tabular-nums">{percent.toFixed(1)}%</span>
                </div>
                {additive.usageNote && (
                  <p className="mt-1 text-xs text-muted-foreground">{additive.usageNote}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{weightGrams.toFixed(1)} g</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="h-7 w-20"
                      value={price || ""}
                      onChange={(e) =>
                        setRecipe((r) => ({
                          ...r,
                          additivePricesPerLb: {
                            ...r.additivePricesPerLb,
                            [additive.id]: parseFloat(e.target.value) || 0,
                          },
                        }))
                      }
                    />
                    <span className="text-muted-foreground">/lb</span>
                  </div>
                  {price > 0 && (
                    <span className="text-muted-foreground">
                      ${costForWeight(1, price, "lb").toFixed(4)}/g
                    </span>
                  )}
                  <span className="ml-auto font-medium">${cost.toFixed(2)}</span>
                </div>

                {expanded && (
                  <div className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
                    <p className="text-muted-foreground">{additive.description}</p>
                    <p>
                      <span className="font-medium">Effects: </span>
                      <span className="text-muted-foreground">{additive.effects}</span>
                    </p>
                    <p>
                      <span className="font-medium">Benefits: </span>
                      <span className="text-muted-foreground">{additive.benefits}</span>
                    </p>
                    {additive.disclaimers && additive.disclaimers.length > 0 && (
                      <div className="space-y-1.5">
                        {additive.disclaimers.map((d, i) => (
                          <div
                            key={i}
                            className="flex gap-2 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-2 text-xs text-warning"
                          >
                            <AlertTriangle className="size-3.5 shrink-0 translate-y-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex justify-end text-sm font-semibold">
            Total additive cost: <span className="ml-2">${batchCosts.totalAdditiveCost.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
