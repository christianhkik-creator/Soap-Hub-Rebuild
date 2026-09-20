"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRecipe } from "@/context/recipe-context";
import {
  FATTY_ACID_LABELS,
  OIL_CATEGORY_LABELS,
  type FattyAcidKey,
  type Oil,
  type OilCategory,
  type RancidityRisk,
} from "@/lib/types";

const FATTY_ACID_KEYS = Object.keys(FATTY_ACID_LABELS) as FattyAcidKey[];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fieldsFromOil(oil: Oil | undefined, defaultCategory?: OilCategory) {
  return {
    name: oil?.name ?? "",
    botanicalName: oil?.botanicalName ?? "",
    category: oil?.category ?? defaultCategory ?? "conditioning",
    sapNaOH: String(oil?.sapNaOH ?? 0.135),
    densityGPerMl: oil?.densityGPerMl != null ? String(oil.densityGPerMl) : "",
    fattyAcids: Object.fromEntries(
      FATTY_ACID_KEYS.map((k) => [k, oil?.fattyAcids[k] != null ? String(oil.fattyAcids[k]) : ""])
    ),
    usageRateMin: String(oil?.usageRateMin ?? 5),
    usageRateMax: String(oil?.usageRateMax ?? 30),
    rancidityRisk: oil?.rancidityRisk ?? ("low" as RancidityRisk),
    priceTier: String(oil?.priceTier ?? 2),
    description: oil?.description ?? "",
    effects: oil?.effects ?? "",
    benefits: oil?.benefits ?? "",
  };
}

export function AddOilDialog({
  defaultCategory,
  editingOil,
  trigger,
}: {
  defaultCategory?: OilCategory;
  /** When set, the dialog edits this oil in place instead of creating a new one. */
  editingOil?: Oil;
  /** Custom trigger element (e.g. an edit icon button). Defaults to a "+ Add Oil" button. */
  trigger?: React.ReactNode;
}) {
  const { addCustomOil } = useRecipe();
  const [open, setOpen] = React.useState(false);
  const [fields, setFields] = React.useState(() => fieldsFromOil(editingOil, defaultCategory));

  // Re-sync form fields whenever the dialog opens, so editing a different
  // oil (or re-opening "Add") always starts from the right values.
  function handleOpenChange(next: boolean) {
    if (next) setFields(fieldsFromOil(editingOil, defaultCategory));
    setOpen(next);
  }

  function set<K extends keyof ReturnType<typeof fieldsFromOil>>(
    key: K,
    value: ReturnType<typeof fieldsFromOil>[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name.trim()) return;

    const oil: Oil = {
      id: editingOil?.id ?? `custom-${slugify(fields.name)}-${Date.now()}`,
      name: fields.name.trim(),
      botanicalName: fields.botanicalName.trim() || undefined,
      category: fields.category,
      sapNaOH: parseFloat(fields.sapNaOH) || 0,
      densityGPerMl: fields.densityGPerMl.trim() ? parseFloat(fields.densityGPerMl) : undefined,
      fattyAcids: Object.fromEntries(
        FATTY_ACID_KEYS.map((k) => [k, parseFloat(fields.fattyAcids[k] ?? "0") || 0]).filter(
          ([, v]) => (v as number) > 0
        )
      ),
      usageRateMin: parseFloat(fields.usageRateMin) || 0,
      usageRateMax: parseFloat(fields.usageRateMax) || 0,
      rancidityRisk: fields.rancidityRisk,
      priceTier: (parseInt(fields.priceTier, 10) || 2) as 1 | 2 | 3,
      description: fields.description.trim() || "No description added yet.",
      effects: fields.effects.trim() || "Not yet documented.",
      benefits: fields.benefits.trim() || "Not yet documented.",
      isCustom: true,
    };

    addCustomOil(oil);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus /> Add Oil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingOil ? `Edit ${editingOil.name}` : "Add a custom oil"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="oil-name">Name</Label>
              <Input id="oil-name" value={fields.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oil-botanical">Botanical name</Label>
              <Input
                id="oil-botanical"
                value={fields.botanicalName}
                onChange={(e) => set("botanicalName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={fields.category} onValueChange={(v) => set("category", v as OilCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OIL_CATEGORY_LABELS).map(([value, { title }]) => (
                    <SelectItem key={value} value={value}>
                      {title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="oil-sap">NaOH SAP value</Label>
                <Input
                  id="oil-sap"
                  type="number"
                  step="0.001"
                  value={fields.sapNaOH}
                  onChange={(e) => set("sapNaOH", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oil-density">Density g/mL</Label>
                <Input
                  id="oil-density"
                  type="number"
                  step="0.01"
                  placeholder="0.92"
                  value={fields.densityGPerMl}
                  onChange={(e) => set("densityGPerMl", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Fatty acid profile (%)</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {FATTY_ACID_KEYS.map((key) => (
                <div key={key} className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">
                    {FATTY_ACID_LABELS[key].split(" ")[0]}
                  </span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={fields.fattyAcids[key] ?? ""}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        fattyAcids: { ...prev.fattyAcids, [key]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="oil-usage-min">Usage min %</Label>
              <Input
                id="oil-usage-min"
                type="number"
                value={fields.usageRateMin}
                onChange={(e) => set("usageRateMin", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oil-usage-max">Usage max %</Label>
              <Input
                id="oil-usage-max"
                type="number"
                value={fields.usageRateMax}
                onChange={(e) => set("usageRateMax", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rancidity risk</Label>
              <Select value={fields.rancidityRisk} onValueChange={(v) => set("rancidityRisk", v as RancidityRisk)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-low">Very Low</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Price tier</Label>
              <Select value={fields.priceTier} onValueChange={(v) => set("priceTier", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">$</SelectItem>
                  <SelectItem value="2">$$</SelectItem>
                  <SelectItem value="3">$$$</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="oil-description">Description</Label>
            <Input
              id="oil-description"
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="oil-effects">Effects on batch</Label>
              <Input id="oil-effects" value={fields.effects} onChange={(e) => set("effects", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oil-benefits">Benefits</Label>
              <Input id="oil-benefits" value={fields.benefits} onChange={(e) => set("benefits", e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">{editingOil ? "Save changes" : "Add oil to library"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
