"use client";

import { Pencil, Trash2 } from "lucide-react";

import { AddOilDialog } from "@/components/add-oil-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FattyAcidBars } from "@/components/fatty-acid-bars";
import { useRecipe } from "@/context/recipe-context";
import { RANCIDITY_LABELS, type Oil } from "@/lib/types";

const RANCIDITY_VARIANT = {
  "very-low": "success",
  low: "success",
  moderate: "warning",
  high: "destructive",
} as const;

export function OilCard({ oil }: { oil: Oil }) {
  const { deleteCustomOil } = useRecipe();

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="font-display text-lg font-semibold">{oil.name}</div>
            {oil.isCustom && (
              <div className="flex items-center gap-0.5">
                <AddOilDialog
                  editingOil={oil}
                  trigger={
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${oil.name}`}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                  }
                />
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete ${oil.name}? This also removes it from your current recipe.`)) {
                      deleteCustomOil(oil.id);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${oil.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            )}
          </div>
          {oil.botanicalName && (
            <div className="text-sm italic text-muted-foreground">{oil.botanicalName}</div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {"$".repeat(oil.priceTier)}
          </span>
          <Badge variant={RANCIDITY_VARIANT[oil.rancidityRisk]}>
            {RANCIDITY_LABELS[oil.rancidityRisk]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FattyAcidBars profile={oil.fattyAcids} />

        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          <Badge variant="secondary">
            {oil.usageRateMin}-{oil.usageRateMax}% usage
          </Badge>
          {oil.usageNote && <Badge variant="outline">{oil.usageNote}</Badge>}
        </div>

        <p className="text-sm italic leading-relaxed text-muted-foreground">{oil.description}</p>
      </CardContent>
    </Card>
  );
}
