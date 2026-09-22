"use client";

import { AlertTriangle, ChevronDown, X } from "lucide-react";
import { useState } from "react";

import { AddAdditiveDialog } from "@/components/add-additive-dialog";
import { PurchasePriceInput } from "@/components/purchase-price-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useRecipe } from "@/context/recipe-context";
import { costPerGramToFlOz } from "@/lib/soap-math";
import { ADDITIVE_CATEGORY_LABELS, emptyPurchase } from "@/lib/types";

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
          {batchCosts.additiveCosts.map(({ additive, percent, weightGrams, densityGPerMl, costPerGram, cost }) => {
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
                  <PurchasePriceInput
                    value={recipe.additivePurchases[additive.id] ?? emptyPurchase("g")}
                    onChange={(next) =>
                      setRecipe((r) => ({
                        ...r,
                        additivePurchases: { ...r.additivePurchases, [additive.id]: next },
                      }))
                    }
                  />
                  {costPerGram > 0 && (
                    <span
                      className="text-muted-foreground"
                      title={`Assumes ${densityGPerMl.toFixed(2)} g/mL bulk density for the fl-oz conversion`}
                    >
                      ${costPerGram.toFixed(4)}/g · ${costPerGramToFlOz(costPerGram, densityGPerMl).toFixed(2)}/fl oz
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
