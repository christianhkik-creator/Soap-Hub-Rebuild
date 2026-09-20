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
  { value: "oxide", label: "Oxide (e.g. cineole)" },
  { value: "blend", label: "Blend / unknown (e.g. fragrance oil)" },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fieldsFromScent(scent: Scent | undefined, defaultNote?: ScentNote) {
  return {
    name: scent?.name ?? "",
    botanicalName: scent?.botanicalName ?? "",
    note: scent?.note ?? defaultNote ?? ("heart" as ScentNote),
    molecularWeight: String(scent?.molecularWeight ?? 150),
    dominantClass: scent?.dominantClass ?? ("blend" as ChemicalClass),
    majorConstituents: scent?.majorConstituents ?? "",
    usageRateMin: String(scent?.usageRateMin ?? 3),
    usageRateMax: String(scent?.usageRateMax ?? 5),
    longevityMin: String(scent?.longevityMonths[0] ?? 2),
    longevityMax: String(scent?.longevityMonths[1] ?? 5),
    priceTier: String(scent?.priceTier ?? 2),
  };
}

export function AddScentDialog({
  defaultNote,
  editingScent,
  trigger,
}: {
  defaultNote?: ScentNote;
  /** When set, the dialog edits this scent in place instead of creating a new one. */
  editingScent?: Scent;
  /** Custom trigger element (e.g. an edit icon button). Defaults to a "+ Add Scent" button. */
  trigger?: React.ReactNode;
}) {
  const { addCustomScent } = useRecipe();
  const [open, setOpen] = React.useState(false);
  const [fields, setFields] = React.useState(() => fieldsFromScent(editingScent, defaultNote));

  // Re-sync form fields whenever the dialog opens, so editing a different
  // scent (or re-opening "Add") always starts from the right values.
  function handleOpenChange(next: boolean) {
    if (next) setFields(fieldsFromScent(editingScent, defaultNote));
    setOpen(next);
  }

  function set<K extends keyof ReturnType<typeof fieldsFromScent>>(
    key: K,
    value: ReturnType<typeof fieldsFromScent>[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name.trim()) return;

    const scent: Scent = {
      id: editingScent?.id ?? `custom-${slugify(fields.name)}-${Date.now()}`,
      name: fields.name.trim(),
      botanicalName: fields.botanicalName.trim() || undefined,
      note: fields.note,
      molecularWeight: parseFloat(fields.molecularWeight) || 0,
      dominantClass: fields.dominantClass,
      majorConstituents: fields.majorConstituents.trim() || "Not yet documented.",
      usageRateMin: parseFloat(fields.usageRateMin) || 0,
      usageRateMax: parseFloat(fields.usageRateMax) || 0,
      longevityMonths: [parseFloat(fields.longevityMin) || 0, parseFloat(fields.longevityMax) || 0],
      // Starts with no warnings — add them only once you've verified a
      // specific behavior (accelerant, discoloration, sensitizer) yourself,
      // keeping the warning system data-driven rather than assumed.
      warnings: editingScent?.warnings ?? [],
      priceTier: (parseInt(fields.priceTier, 10) || 2) as 1 | 2 | 3,
      isCustom: true,
    };

    addCustomScent(scent);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus /> Add Scent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingScent ? `Edit ${editingScent.name}` : "Add a custom scent"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scent-name">Name</Label>
              <Input id="scent-name" value={fields.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-botanical">Botanical name (if EO)</Label>
              <Input
                id="scent-botanical"
                value={fields.botanicalName}
                onChange={(e) => set("botanicalName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Select value={fields.note} onValueChange={(v) => set("note", v as ScentNote)}>
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
                value={fields.molecularWeight}
                onChange={(e) => set("molecularWeight", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Dominant chemical class</Label>
              <Select value={fields.dominantClass} onValueChange={(v) => set("dominantClass", v as ChemicalClass)}>
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
                value={fields.majorConstituents}
                onChange={(e) => set("majorConstituents", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="space-y-1.5">
              <Label htmlFor="scent-usage-min">Usage min %</Label>
              <Input
                id="scent-usage-min"
                type="number"
                value={fields.usageRateMin}
                onChange={(e) => set("usageRateMin", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-usage-max">Usage max %</Label>
              <Input
                id="scent-usage-max"
                type="number"
                value={fields.usageRateMax}
                onChange={(e) => set("usageRateMax", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-longevity-min">Longevity min (mo)</Label>
              <Input
                id="scent-longevity-min"
                type="number"
                value={fields.longevityMin}
                onChange={(e) => set("longevityMin", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scent-longevity-max">Longevity max (mo)</Label>
              <Input
                id="scent-longevity-max"
                type="number"
                value={fields.longevityMax}
                onChange={(e) => set("longevityMax", e.target.value)}
              />
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

          <DialogFooter>
            <Button type="submit">{editingScent ? "Save changes" : "Add scent to library"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
