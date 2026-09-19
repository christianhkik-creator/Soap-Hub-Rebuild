"use client";

import { AddOilDialog } from "@/components/add-oil-dialog";
import { OilCard } from "@/components/oil-card";
import { useRecipe } from "@/context/recipe-context";
import { OIL_CATEGORY_LABELS, type OilCategory } from "@/lib/types";

const CATEGORY_ORDER: OilCategory[] = ["conditioning", "cleansing", "hardness", "lather-boost"];

const CATEGORY_BADGE_CLASSES = [
  "bg-cat-1/15 text-cat-1",
  "bg-cat-2/15 text-cat-2",
  "bg-cat-3/15 text-cat-3",
  "bg-cat-4/15 text-cat-4",
];

export default function OilsGuidePage() {
  const { allOils } = useRecipe();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-2xl font-semibold">Oils Guide</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every oil, fat, and butter in your library — what it does chemically, what it costs, and
          when to reach for it. Add your own from any category.
        </p>
      </div>

      {CATEGORY_ORDER.map((category, index) => {
        const { title, blurb } = OIL_CATEGORY_LABELS[category];
        const oils = allOils.filter((o) => o.category === category);

        return (
          <section key={category} className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold ${CATEGORY_BADGE_CLASSES[index]}`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category {String(index + 1).padStart(2, "0")}
                  </div>
                  <h2 className="font-display text-xl font-semibold">{title}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{blurb}</p>
                </div>
              </div>
              <AddOilDialog defaultCategory={category} />
            </div>

            {oils.length === 0 ? (
              <p className="text-sm italic text-muted-foreground">No oils in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {oils.map((oil) => (
                  <OilCard key={oil.id} oil={oil} />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
