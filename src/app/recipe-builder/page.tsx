"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QualityScoreBar } from "@/components/quality-score-bar";
import { RecipeOilPanel } from "@/components/recipe-oil-panel";
import { useRecipe } from "@/context/recipe-context";
import { QUALITY_AXIS_MAX, QUALITY_RANGES } from "@/lib/soap-math";
import type { OilCategory } from "@/lib/types";

const CATEGORIES: OilCategory[] = ["conditioning", "cleansing", "hardness", "lather-boost"];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const INSIGHT_STYLES = {
  success: { border: "border-success/30", bg: "bg-success/10", text: "text-success", Icon: CheckCircle2 },
  info: { border: "border-border", bg: "bg-muted", text: "text-muted-foreground", Icon: Info },
  warning: { border: "border-warning/30", bg: "bg-warning/10", text: "text-warning", Icon: AlertTriangle },
  danger: { border: "border-destructive/30", bg: "bg-destructive/10", text: "text-destructive", Icon: AlertTriangle },
} as const;

export default function RecipeBuilderPage() {
  const {
    recipe,
    setRecipe,
    totalOilPercent,
    lyeWater,
    qualityScores,
    lyeAdvisories,
    superfatGuidance,
    recipeInsights,
  } = useRecipe();

  const percentOff = Math.round((totalOilPercent - 100) * 10) / 10;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Recipe Builder</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Build your oil blend and watch the lye calculation and predicted bar qualities update live.
        </p>
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${
          percentOff === 0
            ? "border-success/30 bg-success/10 text-success"
            : "border-warning/30 bg-warning/10 text-warning"
        }`}
      >
        {percentOff === 0 ? <Info className="size-4" /> : <AlertTriangle className="size-4" />}
        <span className="font-medium">Oil blend total: {totalOilPercent.toFixed(1)}%</span>
        {percentOff !== 0 && (
          <span>
            {percentOff > 0 ? `Over by ${percentOff.toFixed(1)}%` : `Under by ${Math.abs(percentOff).toFixed(1)}%`}{" "}
            — adjust sliders so oils total 100%.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {CATEGORIES.map((category) => (
          <RecipeOilPanel key={category} category={category} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Batch Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="total-oil-weight">Total oil weight (g)</Label>
            <Input
              id="total-oil-weight"
              type="number"
              min={0}
              value={recipe.totalOilWeightGrams}
              onChange={(e) =>
                setRecipe((r) => ({
                  ...r,
                  totalOilWeightGrams: Math.max(0, parseFloat(e.target.value) || 0),
                }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="superfat">Superfat / discount (%)</Label>
            <Input
              id="superfat"
              type="number"
              min={0}
              max={20}
              value={recipe.superfatPercent}
              onChange={(e) =>
                setRecipe((r) => ({
                  ...r,
                  superfatPercent: clamp(parseFloat(e.target.value) || 0, 0, 20),
                }))
              }
            />
            <ul className="space-y-1 pt-1 text-xs text-muted-foreground">
              {superfatGuidance.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lye-concentration">Lye concentration (%)</Label>
            <Input
              id="lye-concentration"
              type="number"
              min={15}
              max={50}
              value={recipe.lyeConcentrationPercent}
              onChange={(e) =>
                setRecipe((r) => ({
                  ...r,
                  lyeConcentrationPercent: clamp(parseFloat(e.target.value) || 0, 15, 50),
                }))
              }
            />
            {lyeAdvisories.length > 0 && (
              <div className="space-y-2 pt-1">
                {lyeAdvisories.map((advisory, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 rounded-md border px-2.5 py-2 text-xs ${
                      advisory.level === "caution"
                        ? "border-warning/30 bg-warning/10 text-warning"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    <AlertTriangle className="size-3.5 shrink-0 translate-y-0.5" />
                    <span>{advisory.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Lye (NaOH)</div>
              <div className="font-semibold">{lyeWater.naohGrams.toFixed(1)} g</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Water</div>
              <div className="font-semibold">{lyeWater.waterGrams.toFixed(1)} g</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Water : Lye</div>
              <div className="font-semibold">{lyeWater.waterToLyeRatio.toFixed(4)} : 1</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Water % of oils</div>
              <div className="font-semibold">{lyeWater.waterAsPercentOfOils.toFixed(2)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Predicted Soap Bar Qualities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <QualityScoreBar
              label="Hardness"
              value={qualityScores.hardness}
              range={QUALITY_RANGES.hardness}
              axisMax={QUALITY_AXIS_MAX.hardness}
            />
            <QualityScoreBar
              label="Cleansing"
              value={qualityScores.cleansing}
              range={QUALITY_RANGES.cleansing}
              axisMax={QUALITY_AXIS_MAX.cleansing}
            />
            <QualityScoreBar
              label="Conditioning"
              value={qualityScores.conditioning}
              range={QUALITY_RANGES.conditioning}
              axisMax={QUALITY_AXIS_MAX.conditioning}
            />
            <QualityScoreBar
              label="Bubbly Lather"
              value={qualityScores.bubbly}
              range={QUALITY_RANGES.bubbly}
              axisMax={QUALITY_AXIS_MAX.bubbly}
            />
            <QualityScoreBar
              label="Creamy Lather"
              value={qualityScores.creamy}
              range={QUALITY_RANGES.creamy}
              axisMax={QUALITY_AXIS_MAX.creamy}
            />
            <QualityScoreBar
              label="DOS Risk (Linoleic)"
              value={qualityScores.dosRisk}
              range={QUALITY_RANGES.dosRisk}
              axisMax={QUALITY_AXIS_MAX.dosRisk}
            />

            <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
              <span className="text-xs text-muted-foreground">Sat : Unsat ratio</span>
              <span className="font-semibold">
                {qualityScores.saturatedPercent.toFixed(0)} : {qualityScores.unsaturatedPercent.toFixed(0)}
              </span>
            </div>

            <p className="border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">How to read:</span> the green zone is the ideal
              range. Your score (•) should land inside it. Outside = check the insights panel for guidance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recipeInsights.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">Add oils to see recipe insights.</p>
            ) : (
              recipeInsights.map((insight, i) => {
                const { border, bg, text, Icon } = INSIGHT_STYLES[insight.severity];
                return (
                  <div key={i} className={`flex gap-2 rounded-md border ${border} ${bg} px-3 py-2.5 text-sm ${text}`}>
                    <Icon className="size-4 shrink-0 translate-y-0.5" />
                    <span>{insight.message}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
