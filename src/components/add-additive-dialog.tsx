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
import { ADDITIVE_CATEGORY_LABELS, type Additive, type AdditiveCategory } from "@/lib/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function fieldsFromAdditive(additive: Additive | undefined) {
  return {
    name: additive?.name ?? "",
    category: additive?.category ?? ("colorant" as AdditiveCategory),
    usageRateMin: String(additive?.usageRateMin ?? 0.5),
    usageRateMax: String(additive?.usageRateMax ?? 2),
    usageNote: additive?.usageNote ?? "",
    description: additive?.description ?? "",
    effects: additive?.effects ?? "",
    benefits: additive?.benefits ?? "",
    disclaimers: (additive?.disclaimers ?? []).join("\n"),
    priceTier: String(additive?.priceTier ?? 2),
  };
}

export function AddAdditiveDialog({
  editingAdditive,
  trigger,
}: {
  /** When set, the dialog edits this additive in place instead of creating a new one. */
  editingAdditive?: Additive;
  /** Custom trigger element (e.g. an edit icon button). Defaults to a "+ Add Additive" button. */
  trigger?: React.ReactNode;
}) {
  const { addCustomAdditive } = useRecipe();
  const [open, setOpen] = React.useState(false);
  const [fields, setFields] = React.useState(() => fieldsFromAdditive(editingAdditive));

  function handleOpenChange(next: boolean) {
    if (next) setFields(fieldsFromAdditive(editingAdditive));
    setOpen(next);
  }

  function set<K extends keyof ReturnType<typeof fieldsFromAdditive>>(
    key: K,
    value: ReturnType<typeof fieldsFromAdditive>[K]
  ) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fields.name.trim()) return;

    const additive: Additive = {
      id: editingAdditive?.id ?? `custom-${slugify(fields.name)}-${Date.now()}`,
      name: fields.name.trim(),
      category: fields.category,
      usageRateMin: parseFloat(fields.usageRateMin) || 0,
      usageRateMax: parseFloat(fields.usageRateMax) || 0,
      usageNote: fields.usageNote.trim() || undefined,
      description: fields.description.trim() || "No description added yet.",
      effects: fields.effects.trim() || "Not yet documented.",
      benefits: fields.benefits.trim() || "Not yet documented.",
      disclaimers: fields.disclaimers
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      priceTier: (parseInt(fields.priceTier, 10) || 2) as 1 | 2 | 3,
      isCustom: true,
    };

    addCustomAdditive(additive);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Plus /> Add Additive
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editingAdditive ? `Edit ${editingAdditive.name}` : "Add a custom additive"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="additive-name">Name</Label>
              <Input
                id="additive-name"
                value={fields.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={fields.category} onValueChange={(v) => set("category", v as AdditiveCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ADDITIVE_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="additive-usage-min">Usage min %</Label>
              <Input
                id="additive-usage-min"
                type="number"
                step="0.1"
                value={fields.usageRateMin}
                onChange={(e) => set("usageRateMin", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="additive-usage-max">Usage max %</Label>
              <Input
                id="additive-usage-max"
                type="number"
                step="0.1"
                value={fields.usageRateMax}
                onChange={(e) => set("usageRateMax", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="additive-usage-note">Usage note (e.g. tsp/lb, prep method)</Label>
              <Input
                id="additive-usage-note"
                value={fields.usageNote}
                onChange={(e) => set("usageNote", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="additive-description">Description</Label>
            <Input
              id="additive-description"
              value={fields.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="additive-effects">Effects on batch</Label>
              <Input
                id="additive-effects"
                value={fields.effects}
                onChange={(e) => set("effects", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="additive-benefits">Benefits</Label>
              <Input
                id="additive-benefits"
                value={fields.benefits}
                onChange={(e) => set("benefits", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="additive-disclaimers">Disclaimers (one per line)</Label>
            <textarea
              id="additive-disclaimers"
              rows={3}
              value={fields.disclaimers}
              onChange={(e) => set("disclaimers", e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Price tier</Label>
            <Select value={fields.priceTier} onValueChange={(v) => set("priceTier", v)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">$</SelectItem>
                <SelectItem value="2">$$</SelectItem>
                <SelectItem value="3">$$$</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit">{editingAdditive ? "Save changes" : "Add additive to library"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
