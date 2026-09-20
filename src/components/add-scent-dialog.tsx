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
import type { ChemicalClass, Scent, ScentNote } from "@/lib/types";

const CHEMICAL_CLASSES: { value: ChemicalClass; label: string }[] = [
  { value: "aldehyde", label: "Aldehyde" },
  { value: "monoterpene", label: "Monoterpene" },
  { value: "monoterpene-alcohol", label: "Monoterpene alcohol" },
  { value: "monoterpene-ester", label: "Monoterpene ester" },
  { value: "sesquiterpene", label: "Sesquiterpene" },
  { value: "sesquiterpene-alcohol", label: "Sesquiterpene alcohol" },
  { value: "phenol", label: "Phenol" },
  { value: "blend", label: "Blend / unknown (e.g. fragrance oil)" },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AddScentDialog({ defaultNote }: { defaultNote?: ScentNote }) {
  const { addCustomScent } = useRecipe();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [botanicalName, setBotanicalName] = React.useState("");
  const [note, setNote] = React.useState<ScentNote>(defaultNote ?? "heart");
  const [molecularWeight, setMolecularWeight] = React.useState("150");
  const [dominantClass, setDominantClass] = React.useState<ChemicalClass>("blend");
  const [majorConstituents, setMajorConstituents] = React.useState("");
  const [usageRateMin, setUsageRateMin] = React.useState("3");
  const [usageRateMax, setUsageRateMax] = React.useState("5");
  const [longevityMin, setLongevityMin] = React.useState("2");
  const [longevityMax, setLongevityMax] = React.useState("5");
  const [priceTier, setPriceTier] = React.useState("2");

  function reset() {
    setName("");
    setBotanicalName("");
    setNote(defaultNote ?? "heart");
    setMolecularWeight("150");
    setDominantClass("blend");
    setMajorConstituents("");
    setUsageRateMin("3");
    setUsageRateMax("5");
    setLongevityMin("2");
    setLongevityMax("5");
    setPriceTier("2");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const scent: Scent = {
      id: `custom-${slugify(name)}-${Date.now()}`,
      name: name.trim(),
      botanicalName: botanicalName.trim() || undefined,
      note,
      molecularWeight: parseFloat(molecularWeight) || 0,
      dominantClass,
      majorConstituents: majorConstituents.trim() || "Not yet documented.",
      usageRateMin: parseFloat(usageRateMin) || 0,
      usageRateMax: parseFloat(usageRateMax) || 0,
      longevityMonths: [parseFloat(longevityMin) || 0, parseFloat(longevityMax) || 0],
      // Starts with no warnings — add them only once you've verified a
      // specific behavior (accelerant, discoloration, sensitizer) yourself,
      // keeping the warning system data-driven rather than assumed.
      warnings: [],
      priceTier: (parseInt(priceTier, 10) || 2) as 1 | 2 | 3,
      isCustom: true,
    };

    addCustomScent(scent);
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus /> Add Scent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a custom scent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scent-name">Name</Label>
              <Input id="scent-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-botanical">Botanical name (if EO)</Label>
              <Input
                id="scent-botanical"
                value={botanicalName}
                onChange={(e) => setBotanicalName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Select value={note} onValueChange={(v) => setNote(v as ScentNote)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="heart">Heart</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="fragrance-oil">Fragrance Oil (CP safe)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-mw">Molecular weight (g/mol)</Label>
              <Input
                id="scent-mw"
                type="number"
                step="0.1"
                value={molecularWeight}
                onChange={(e) => setMolecularWeight(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Dominant chemical class</Label>
              <Select value={dominantClass} onValueChange={(v) => setDominantClass(v as ChemicalClass)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHEMICAL_CLASSES.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="scent-constituents">Major constituents</Label>
              <Input
                id="scent-constituents"
                placeholder="e.g. Linalool, Linalyl acetate"
                value={majorConstituents}
                onChange={(e) => setMajorConstituents(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="scent-usage-min">Usage min %</Label>
              <Input
                id="scent-usage-min"
                type="number"
                value={usageRateMin}
                onChange={(e) => setUsageRateMin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-usage-max">Usage max %</Label>
              <Input
                id="scent-usage-max"
                type="number"
                value={usageRateMax}
                onChange={(e) => setUsageRateMax(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-longevity-min">Longevity min (mo)</Label>
              <Input
                id="scent-longevity-min"
                type="number"
                value={longevityMin}
                onChange={(e) => setLongevityMin(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-longevity-max">Longevity max (mo)</Label>
              <Input
                id="scent-longevity-max"
                type="number"
                value={longevityMax}
                onChange={(e) => setLongevityMax(e.target.value)}
              />
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

          <DialogFooter>
            <Button type="submit">Add scent to library</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
