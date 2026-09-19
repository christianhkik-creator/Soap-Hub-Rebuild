"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QualityScoreBar } from "@/components/quality-score-bar";
import { FattyAcidBars } from "@/components/fatty-acid-bars";
import { useRecipe } from "@/context/recipe-context";
import { QUALITY_RANGES } from "@/lib/soap-math";
import { SCENT_NOTE_LABELS } from "@/lib/types";

export default function RecipeSummaryPage() {
  const {
    recipe,
    oilsById,
    scentsById,
    lyeWater,
    qualityScores,
    fattyAcidBlend,
    yieldResult,
    scentBlendAnalysis,
    batchCosts,
  } = useRecipe();

  const oilRows = recipe.oils
    .map((entry) => ({ entry, oil: oilsById.get(entry.oilId) }))
    .filter((x): x is { entry: typeof x.entry; oil: NonNullable<typeof x.oil> } => Boolean(x.oil));

  const scentRows = recipe.scents
    .map((entry) => ({ entry, scent: scentsById.get(entry.scentId) }))
    .filter((x): x is { entry: typeof x.entry; scent: NonNullable<typeof x.scent> } => Boolean(x.scent));

  return (
    <div className="mx-auto max-w-3xl space-y-6 print:max-w-none">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="font-display text-2xl font-semibold">{recipe.name}</h1>
        <Button onClick={() => window.print()}>
          <Printer /> Print / Save as PDF
        </Button>
      </div>

      <div className="hidden print:block">
        <h1 className="font-display text-2xl font-semibold">{recipe.name}</h1>
      </div>

      <section className="grid grid-cols-2 gap-x-8 gap-y-1 rounded-lg border border-border p-4 text-sm">
        <Row label="Total oil weight" value={`${recipe.totalOilWeightGrams} g`} />
        <Row label="Sat : Unsat ratio" value={`${qualityScores.saturatedPercent.toFixed(0)} : ${qualityScores.unsaturatedPercent.toFixed(0)}`} />
        <Row label="Water as % of oil weight" value={`${lyeWater.waterAsPercentOfOils.toFixed(2)}%`} />
        <Row label="Iodine" value={qualityScores.iodine.toFixed(0)} />
        <Row label="Super Fat / Discount" value={`${recipe.superfatPercent}%`} />
        <Row label="INS" value={qualityScores.ins.toFixed(0)} />
        <Row label="Lye Concentration" value={`${recipe.lyeConcentrationPercent.toFixed(3)}%`} bold />
        <Row label="Fragrance Weight" value={`${recipe.batchScentWeightGrams} g`} />
        <Row label="Water : Lye Ratio" value={`${lyeWater.waterToLyeRatio.toFixed(4)}:1`} />
      </section>

      <section className="overflow-hidden rounded-lg border border-border text-sm">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-border bg-sky-50">
              <td className="p-2">Water</td>
              <td className="p-2 text-right">{lyeWater.waterGrams.toFixed(2)} g</td>
            </tr>
            <tr className="border-b border-border bg-rose-50">
              <td className="p-2">Lye - NaOH</td>
              <td className="p-2 text-right">{lyeWater.naohGrams.toFixed(2)} g</td>
            </tr>
            <tr className="border-b border-border bg-amber-50">
              <td className="p-2">Oils</td>
              <td className="p-2 text-right">{recipe.totalOilWeightGrams.toFixed(2)} g</td>
            </tr>
            <tr className="border-b border-border bg-violet-50">
              <td className="p-2">Fragrance</td>
              <td className="p-2 text-right">{recipe.batchScentWeightGrams.toFixed(2)} g</td>
            </tr>
            <tr className="font-semibold">
              <td className="p-2">Soap weight before CP cure</td>
              <td className="p-2 text-right">
                {(lyeWater.waterGrams + lyeWater.naohGrams + recipe.totalOilWeightGrams + recipe.batchScentWeightGrams).toFixed(2)} g
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Oils</h2>
        <table className="w-full overflow-hidden rounded-lg border border-border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Oil/Fat</th>
              <th className="p-2 text-right">%</th>
              <th className="p-2 text-right">Grams</th>
            </tr>
          </thead>
          <tbody>
            {oilRows.map(({ entry, oil }) => (
              <tr key={oil.id} className="border-t border-border">
                <td className="p-2">{oil.name}</td>
                <td className="p-2 text-right">{entry.percent.toFixed(2)}</td>
                <td className="p-2 text-right">
                  {((recipe.totalOilWeightGrams * entry.percent) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-border font-semibold">
              <td className="p-2">Totals</td>
              <td className="p-2 text-right">
                {oilRows.reduce((s, r) => s + r.entry.percent, 0).toFixed(2)}
              </td>
              <td className="p-2 text-right">{recipe.totalOilWeightGrams.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold">Soap Bar Quality</h2>
          <div className="space-y-3 rounded-lg border border-border p-4">
            <QualityScoreBar label="Hardness" value={qualityScores.hardness} range={QUALITY_RANGES.hardness} />
            <QualityScoreBar label="Cleansing" value={qualityScores.cleansing} range={QUALITY_RANGES.cleansing} />
            <QualityScoreBar label="Conditioning" value={qualityScores.conditioning} range={QUALITY_RANGES.conditioning} />
            <QualityScoreBar label="Bubbly" value={qualityScores.bubbly} range={QUALITY_RANGES.bubbly} />
            <QualityScoreBar label="Creamy" value={qualityScores.creamy} range={QUALITY_RANGES.creamy} />
            <QualityScoreBar label="Iodine" value={qualityScores.iodine} range={QUALITY_RANGES.iodine} />
            <QualityScoreBar label="INS" value={qualityScores.ins} range={QUALITY_RANGES.ins} />
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-display text-lg font-semibold">Fatty Acid Profile</h2>
          <div className="rounded-lg border border-border p-4">
            <FattyAcidBars profile={fattyAcidBlend} />
          </div>
        </div>
      </section>

      {scentRows.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Scent Blend</h2>
          <table className="w-full overflow-hidden rounded-lg border border-border text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">Scent</th>
                <th className="p-2 text-left">Note</th>
                <th className="p-2 text-right">%</th>
                <th className="p-2 text-right">Grams</th>
              </tr>
            </thead>
            <tbody>
              {scentRows.map(({ entry, scent }) => (
                <tr key={scent.id} className="border-t border-border">
                  <td className="p-2">{scent.name}</td>
                  <td className="p-2">{SCENT_NOTE_LABELS[scent.note].title}</td>
                  <td className="p-2 text-right">{entry.percent.toFixed(0)}</td>
                  <td className="p-2 text-right">
                    {((recipe.batchScentWeightGrams * entry.percent) / 100).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-sm text-muted-foreground">
            Predicted longevity: {scentBlendAnalysis.longevityMonths[0]}-{scentBlendAnalysis.longevityMonths[1]}{" "}
            months · Recommended usage: {scentBlendAnalysis.recommendedUsagePercentOfOils.toFixed(1)}% of oil
            weight
          </p>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-display text-lg font-semibold">Cost &amp; Yield</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 rounded-lg border border-border p-4 text-sm sm:grid-cols-4">
          <Row label="Estimated bars" value={`${yieldResult.estimatedBarCount}`} />
          <Row label="Bar weight" value={`${recipe.barWeightGrams} g`} />
          <Row label="Total batch cost" value={`$${batchCosts.totalBatchCost.toFixed(2)}`} bold />
          <Row label="Cost per bar" value={`$${batchCosts.costPerBar.toFixed(2)}`} bold />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right ${bold ? "font-semibold" : ""}`}>{value}</span>
    </>
  );
}
