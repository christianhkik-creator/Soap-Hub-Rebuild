"use client";

import { AlertTriangle, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecipeScentPanel } from "@/components/recipe-scent-panel";
import { useRecipe } from "@/context/recipe-context";
import { SCENT_NOTE_LABELS, type ScentNote } from "@/lib/types";

const NOTES: ScentNote[] = ["top", "heart", "base", "fragrance-oil"];

const NOTE_BAR_CLASSES: Record<ScentNote, string> = {
  top: "bg-cat-3",
  heart: "bg-cat-1",
  base: "bg-cat-4",
  "fragrance-oil": "bg-cat-2",
};

export default function ScentBlendPage() {
  const { recipe, setRecipe, scentBlendAnalysis } = useRecipe();
  const { totalPercent, noteComposition, longevityMonths, recommendedUsagePercentOfOils, warnings } =
    scentBlendAnalysis;

  const off = Math.round((totalPercent - 100) * 10) / 10;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Scent Blend</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Layer top, heart, base, and fragrance-oil notes. Longevity and recommended usage rate are
          derived from each scent&apos;s molecular weight and chemical class.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {NOTES.map((note) => (
          <RecipeScentPanel key={note} note={note} />
        ))}
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
          totalPercent === 0
            ? "border-border bg-muted text-muted-foreground"
            : off === 0
              ? "border-success/30 bg-success/10 text-success"
              : "border-warning/30 bg-warning/10 text-warning"
        }`}
      >
        {off === 0 && totalPercent > 0 ? <Info className="size-4" /> : <AlertTriangle className="size-4" />}
        <span className="font-medium">Blend total: {totalPercent.toFixed(0)}%</span>
        {totalPercent > 0 && off !== 0 && (
          <span>
            {off > 0 ? `Over by ${off.toFixed(0)}%` : `Under by ${Math.abs(off).toFixed(0)}%`} — reduce
            some scents.
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="batch-scent-weight">Batch scent weight (g)</Label>
        <p className="text-xs text-muted-foreground">
          How many grams of finished scent blend you want to make.
        </p>
        <Input
          id="batch-scent-weight"
          type="number"
          className="max-w-[10rem]"
          value={recipe.batchScentWeightGrams}
          onChange={(e) =>
            setRecipe((r) => ({ ...r, batchScentWeightGrams: parseFloat(e.target.value) || 0 }))
          }
        />
      </div>

      {totalPercent > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Blend Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Note Composition
                </div>
                <div className="flex h-6 overflow-hidden rounded-full">
                  {NOTES.filter((n) => noteComposition[n]).map((n) => (
                    <span
                      key={n}
                      className={`flex items-center justify-center text-[11px] font-semibold text-white ${NOTE_BAR_CLASSES[n]}`}
                      style={{ width: `${((noteComposition[n] ?? 0) / totalPercent) * 100}%` }}
                    >
                      {Math.round(((noteComposition[n] ?? 0) / totalPercent) * 100)}%
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {NOTES.filter((n) => noteComposition[n]).map((n) => (
                    <span key={n} className="flex items-center gap-1">
                      <span className={`size-2 rounded-full ${NOTE_BAR_CLASSES[n]}`} />
                      {SCENT_NOTE_LABELS[n].title} {Math.round(((noteComposition[n] ?? 0) / totalPercent) * 100)}%
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Predicted longevity
                </div>
                <div className="font-display text-lg font-semibold text-success">
                  {longevityMonths[0]}-{longevityMonths[1]} months
                </div>
                <p className="text-xs text-muted-foreground">Based on weighted average molecular weight.</p>
              </div>

              <div className="rounded-md bg-muted px-3 py-2.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recommended usage rate
                </div>
                <div className="font-display text-lg font-semibold">
                  {recommendedUsagePercentOfOils.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Of your total oil weight. Adjusted lower for base-heavy blends, higher for top-heavy
                  citrus blends.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Insights &amp; Warnings
              </div>
              {warnings.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No documented concerns for this blend. Warnings only appear here when backed by cited
                  evidence — not soap-community folklore.
                </p>
              ) : (
                warnings.map(({ scentName, warning }, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 rounded-md border px-3 py-2 text-sm ${
                      warning.severity === "danger"
                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                        : warning.severity === "success"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    <AlertTriangle className="size-4 shrink-0 translate-y-0.5" />
                    <span>
                      <span className="font-medium">{scentName}: </span>
                      {warning.message}
                      <span className="ml-1 text-xs opacity-70">
                        ({warning.evidence === "documented" ? "documented chemistry" : "practitioner-reported"})
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
