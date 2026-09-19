import { FATTY_ACID_LABELS, type FattyAcidKey, type FattyAcidProfile } from "@/lib/types";

const ORDER: FattyAcidKey[] = [
  "lauric",
  "myristic",
  "palmitic",
  "stearic",
  "ricinoleic",
  "oleic",
  "linoleic",
  "linolenic",
];

const DOT_COLORS: Record<FattyAcidKey, string> = {
  lauric: "bg-emerald-600",
  myristic: "bg-amber-600",
  palmitic: "bg-orange-700",
  stearic: "bg-violet-700",
  ricinoleic: "bg-fuchsia-700",
  oleic: "bg-lime-600",
  linoleic: "bg-rose-700",
  linolenic: "bg-sky-700",
};

export function FattyAcidBars({ profile }: { profile: FattyAcidProfile }) {
  const keys = ORDER.filter((k) => (profile[k] ?? 0) > 0);
  const max = Math.max(...keys.map((k) => profile[k] ?? 0), 1);

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Fatty Acid Composition
      </div>
      {keys.map((key) => {
        const value = profile[key] ?? 0;
        return (
          <div key={key} className="flex items-center gap-3 text-sm">
            <span className="w-36 shrink-0 text-foreground">{FATTY_ACID_LABELS[key]}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-foreground/70"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-muted-foreground">
              {value.toFixed(1)}%
            </span>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
        {keys.map((key) => (
          <span key={key} className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className={`size-1.5 rounded-full ${DOT_COLORS[key]}`} />
            {FATTY_ACID_LABELS[key].split(" ")[0]}
          </span>
        ))}
      </div>
    </div>
  );
}
