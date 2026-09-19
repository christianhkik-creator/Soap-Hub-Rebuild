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

export function AddOilDialog({ defaultCategory }: { defaultCategory?: OilCategory }) {
  const { addCustomOil } = useRecipe();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [botanicalName, setBotanicalName] = React.useState("");
  const [category, setCategory] = React.useState<OilCategory>(defaultCategory ?? "conditioning");
  const [sapNaOH, setSapNaOH] = React.useState("0.135");
  const [fattyAcids, setFattyAcids] = React.useState<Record<string, string>>({});
  const [usageRateMin, setUsageRateMin] = React.useState("5");
  const [usageRateMax, setUsageRateMax] = React.useState("30");
  const [rancidityRisk, setRancidityRisk] = React.useState<RancidityRisk>("low");
  const [priceTier, setPriceTier] = React.useState("2");
  const [description, setDescription] = React.useState("");
  const [effects, setEffects] = React.useState("");
  const [benefits, setBenefits] = React.useState("");

  function reset() {
    setName("");
    setBotanicalName("");
    setCategory(defaultCategory ?? "conditioning");
    setSapNaOH("0.135");
    setFattyAcids({});
    setUsageRateMin("5");
    setUsageRateMax("30");
    setRancidityRisk("low");
    setPriceTier("2");
    setDescription("");
    setEffects("");
    setBenefits("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const oil: Oil = {
      id: `custom-${slugify(name)}-${Date.now()}`,
      name: name.trim(),
      botanicalName: botanicalName.trim() || undefined,
      category,
      sapNaOH: parseFloat(sapNaOH) || 0,
      fattyAcids: Object.fromEntries(
        FATTY_ACID_KEYS.map((k) => [k, parseFloat(fattyAcids[k] ?? "0") || 0]).filter(
          ([, v]) => (v as number) > 0
        )
      ),
      usageRateMin: parseFloat(usageRateMin) || 0,
      usageRateMax: parseFloat(usageRateMax) || 0,
      rancidityRisk,
      priceTier: (parseInt(priceTier, 10) || 2) as 1 | 2 | 3,
      description: description.trim() || "No description added yet.",
      effects: effects.trim() || "Not yet documented.",
      benefits: benefits.trim() || "Not yet documented.",
      isCustom: true,
    };

    addCustomOil(oil);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus /> Add Oil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add a custom oil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="oil-name">Name</Label>
              <Input id="oil-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oil-botanical">Botanical name</Label>
              <Input
                id="oil-botanical"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as OilCategory)}>
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
            <div className="space-y-1.5">
              <Label htmlFor="oil-sap">NaOH SAP value</Label>
              <Input
                id="oil-sap"
                type="number"
                step="0.001"
                value={sapNaOH}
                onChange={(e) => setSapNaOH(e.target.value)}
                required
              />
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
                    value={fattyAcids[key] ?? ""}
                    onChange={(e) => setFattyAcids((prev) => ({ ...prev, [key]: e.target.value }))}
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
                value={usageRateMin}
                onChange={(e) => setUsageRateMin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oil-usage-max">Usage max %</Label>
              <Input
                id="oil-usage-max"
                type="number"
                value={usageRateMax}
                onChange={(e) => setUsageRateMax(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rancidity risk</Label>
              <Select value={rancidityRisk} onValueChange={(v) => setRancidityRisk(v as RancidityRisk)}>
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
              <Select value={priceTier} onValueChange={setPriceTier}>
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
            <Input id="oil-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="oil-effects">Effects on batch</Label>
              <Input id="oil-effects" value={effects} onChange={(e) => setEffects(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oil-benefits">Benefits</Label>
              <Input id="oil-benefits" value={benefits} onChange={(e) => setBenefits(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Add oil to library</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
