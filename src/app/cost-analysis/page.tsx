"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { PurchasePriceInput } from "@/components/purchase-price-input";
import { RecipeAdditivePanel } from "@/components/recipe-additive-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRecipe } from "@/context/recipe-context";
import { costPerGramToFlOz, gramsToUnit, unitToGrams } from "@/lib/soap-math";
import { emptyPurchase, type LyePurchaseUnit } from "@/lib/types";

type WeightUnit = "g" | "oz" | "lb" | "kg";

export default function CostAnalysisPage() {
  const { recipe, setRecipe, lyeWater, yieldResult, batchCosts } = useRecipe();
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("g");

  const {
    oilCosts,
    totalOilCost,
    lyeCost,
    scentCosts,
    totalScentCost,
    totalBatchCost,
    costPerBar,
  } = batchCosts;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Cost Analysis</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          All prices are USD and start blank — enter what you actually paid. Per-gram and per-fl-oz
          costs are calculated automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Batch Weight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Total oil weight for this batch.</p>
            <div className="flex gap-2">
              <Input
                type="number"
                value={gramsToUnit(recipe.totalOilWeightGrams, weightUnit).toFixed(weightUnit === "g" ? 0 : 2)}
                onChange={(e) =>
                  setRecipe((r) => ({
                    ...r,
                    totalOilWeightGrams: unitToGrams(parseFloat(e.target.value) || 0, weightUnit),
                  }))
                }
                className="max-w-[10rem]"
              />
              <div className="flex gap-1">
                {(["g", "oz", "lb"] as WeightUnit[]).map((u) => (
                  <Button
                    key={u}
                    type="button"
                    size="sm"
                    variant={weightUnit === u ? "default" : "outline"}
                    onClick={() => setWeightUnit(u)}
                  >
                    {u}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {recipe.totalOilWeightGrams.toFixed(0)} g · {gramsToUnit(recipe.totalOilWeightGrams, "oz").toFixed(1)} oz ·{" "}
              {gramsToUnit(recipe.totalOilWeightGrams, "lb").toFixed(2)} lb
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Yield</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bar-weight">Estimated bars at what weight each? (g)</Label>
              <Input
                id="bar-weight"
                type="number"
                className="max-w-[10rem]"
                value={recipe.barWeightGrams}
                onChange={(e) =>
                  setRecipe((r) => ({ ...r, barWeightGrams: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="font-display text-2xl font-semibold">{yieldResult.estimatedBarCount} bars</div>
            <p className="text-xs text-muted-foreground">
              Based on oil + lye + water, minus an assumed {recipe.cureWaterLossPercent}% cure water loss.
              Knowing this tells you how many molds to prep and lets us split the batch cost per bar.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Oil Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Oil</TableHead>
                <TableHead>% in Recipe</TableHead>
                <TableHead>Weight Used</TableHead>
                <TableHead>What you paid</TableHead>
                <TableHead>Derived</TableHead>
                <TableHead className="text-right">Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {oilCosts.map(({ oil, percent, weightGrams, densityGPerMl, costPerGram, cost }) => (
                <TableRow key={oil.id}>
                  <TableCell className="font-medium">{oil.name}</TableCell>
                  <TableCell>{percent.toFixed(0)}%</TableCell>
                  <TableCell>{weightGrams.toFixed(0)} g</TableCell>
                  <TableCell>
                    <PurchasePriceInput
                      value={recipe.oilPurchases[oil.id] ?? emptyPurchase()}
                      onChange={(next) =>
                        setRecipe((r) => ({
                          ...r,
                          oilPurchases: { ...r.oilPurchases, [oil.id]: next },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {costPerGram > 0 ? (
                      <span title={`Assumes ${densityGPerMl.toFixed(2)} g/mL density for the fl-oz conversion`}>
                        ${costPerGram.toFixed(4)}/g · ${costPerGramToFlOz(costPerGram, densityGPerMl).toFixed(2)}/fl oz
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">${cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 flex justify-end border-t border-border pt-3 text-sm font-semibold">
            Total oil cost: <span className="ml-2">${totalOilCost.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Batch Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-muted px-3 py-2.5">
            <div>
              <div className="text-sm font-medium">Lye (NaOH)</div>
              <div className="text-xs text-muted-foreground">{lyeWater.naohGrams.toFixed(0)} g needed</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Paid $</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-8 w-20"
                  value={recipe.lyePurchase.amountPaid || ""}
                  onChange={(e) =>
                    setRecipe((r) => ({
                      ...r,
                      lyePurchase: { ...r.lyePurchase, amountPaid: parseFloat(e.target.value) || 0 },
                    }))
                  }
                />
                <span className="text-muted-foreground">for</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  className="h-8 w-16"
                  value={recipe.lyePurchase.containerAmount || ""}
                  onChange={(e) =>
                    setRecipe((r) => ({
                      ...r,
                      lyePurchase: { ...r.lyePurchase, containerAmount: parseFloat(e.target.value) || 0 },
                    }))
                  }
                />
                <Select
                  value={recipe.lyePurchase.containerUnit}
                  onValueChange={(v) =>
                    setRecipe((r) => ({
                      ...r,
                      lyePurchase: { ...r.lyePurchase, containerUnit: v as LyePurchaseUnit },
                    }))
                  }
                >
                  <SelectTrigger className="h-8 w-[4.5rem]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="font-semibold">${lyeCost.toFixed(2)}</div>
            </div>
          </div>

          {scentCosts.length > 0 && (
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium">
                  Scent blend — {scentCosts.length} scent{scentCosts.length > 1 ? "s" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  Total batch scent: {recipe.batchScentWeightGrams} g · edit weight in Step 3
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scent</TableHead>
                    <TableHead>% Blend</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>What you paid</TableHead>
                    <TableHead>Derived</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scentCosts.map(({ scent, percent, weightGrams, densityGPerMl, costPerGram, cost }) => (
                    <TableRow key={scent.id}>
                      <TableCell className="font-medium">{scent.name}</TableCell>
                      <TableCell>{percent.toFixed(0)}%</TableCell>
                      <TableCell>{weightGrams.toFixed(1)} g</TableCell>
                      <TableCell>
                        <PurchasePriceInput
                          value={recipe.scentPurchases[scent.id] ?? emptyPurchase()}
                          onChange={(next) =>
                            setRecipe((r) => ({
                              ...r,
                              scentPurchases: { ...r.scentPurchases, [scent.id]: next },
                            }))
                          }
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {costPerGram > 0 ? (
                          <span title={`Assumes ${densityGPerMl.toFixed(2)} g/mL density for the fl-oz conversion`}>
                            ${costPerGram.toFixed(4)}/g · ${costPerGramToFlOz(costPerGram, densityGPerMl).toFixed(2)}/fl oz
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">${cost.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-2 flex justify-end text-sm font-semibold">
                Total scent cost: <span className="ml-2">${totalScentCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          <RecipeAdditivePanel />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Other Costs (packaging, labels, etc.)</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setRecipe((r) => ({
                    ...r,
                    additionalCosts: [...r.additionalCosts, { label: "New item", amount: 0 }],
                  }))
                }
              >
                <Plus /> Add item
              </Button>
            </div>
            <div className="space-y-2">
              {recipe.additionalCosts.length === 0 && (
                <p className="text-sm italic text-muted-foreground">No additional costs added.</p>
              )}
              {recipe.additionalCosts.map((cost, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={cost.label}
                    onChange={(e) =>
                      setRecipe((r) => ({
                        ...r,
                        additionalCosts: r.additionalCosts.map((c, idx) =>
                          idx === i ? { ...c, label: e.target.value } : c
                        ),
                      }))
                    }
                    className="flex-1"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      className="w-24"
                      value={cost.amount || ""}
                      onChange={(e) =>
                        setRecipe((r) => ({
                          ...r,
                          additionalCosts: r.additionalCosts.map((c, idx) =>
                            idx === i ? { ...c, amount: parseFloat(e.target.value) || 0 } : c
                          ),
                        }))
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setRecipe((r) => ({
                        ...r,
                        additionalCosts: r.additionalCosts.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total batch cost
            </div>
            <div className="font-display text-3xl font-semibold">${totalBatchCost.toFixed(2)}</div>
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Cost per bar ({yieldResult.estimatedBarCount} bars)
            </div>
            <div className="font-display text-3xl font-semibold">${costPerBar.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
