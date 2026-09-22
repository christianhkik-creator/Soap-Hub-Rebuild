"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PURCHASE_UNIT_LABELS, type PurchaseInfo, type PurchaseUnit } from "@/lib/types";

/**
 * "I paid $[amountPaid] for [containerAmount] [containerUnit] of this."
 * The true $/g is derived from these, never entered directly.
 */
export function PurchasePriceInput({
  value,
  onChange,
  units = ["flOz", "g", "lb"],
  className,
}: {
  value: PurchaseInfo;
  onChange: (next: PurchaseInfo) => void;
  units?: PurchaseUnit[];
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-1 text-sm ${className ?? ""}`}>
      <span className="text-muted-foreground">Paid $</span>
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        className="h-8 w-20"
        value={value.amountPaid || ""}
        onChange={(e) => onChange({ ...value, amountPaid: parseFloat(e.target.value) || 0 })}
      />
      <span className="text-muted-foreground">for</span>
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="0"
        className="h-8 w-16"
        value={value.containerAmount || ""}
        onChange={(e) => onChange({ ...value, containerAmount: parseFloat(e.target.value) || 0 })}
      />
      <Select
        value={value.containerUnit}
        onValueChange={(v) => onChange({ ...value, containerUnit: v as PurchaseUnit })}
      >
        <SelectTrigger className="h-8 w-[4.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={u} value={u}>
              {PURCHASE_UNIT_LABELS[u]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
