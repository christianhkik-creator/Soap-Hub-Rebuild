import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FattyAcidBars } from "@/components/fatty-acid-bars";
import { RANCIDITY_LABELS, type Oil } from "@/lib/types";

const RANCIDITY_VARIANT = {
  "very-low": "success",
  low: "success",
  moderate: "warning",
  high: "destructive",
} as const;

export function OilCard({ oil }: { oil: Oil }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <div className="font-display text-lg font-semibold">{oil.name}</div>
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
