# Soap Hub

A personal cold-process soap-making tool: design recipes, see predicted bar
qualities live, cost a batch out in USD before you buy anything, and browse
what every oil/butter/scent actually does — modeled after
[soapcalc.net](https://soapcalc.net) but tailored to one person's workflow.

No login — this is a single-user app by design.

## Stack

Next.js (App Router, TypeScript) + Tailwind CSS + hand-rolled shadcn/ui-style
components (Radix primitives) + Supabase (Postgres only, no Auth) for saved
recipes.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase
configured, saved recipes fall back to this browser's `localStorage`
automatically — the app works fully without any setup.

## Wiring up Supabase (optional, for cross-device saved recipes)

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in that project's SQL editor.
3. Copy `.env.local.example` to `.env.local` and fill in the URL/anon key
   from Project Settings → API.
4. Since there's no login, treat the deployed URL itself as the access
   control (e.g. Vercel deployment protection) — anyone with the anon key
   and URL can read/write your recipes.

## What's in here

- `src/lib/soap-math.ts` — the calculation engine: lye/water math, the
  SoapCalc-style quality scores (Hardness/Cleansing/Conditioning/Bubbly/
  Creamy), Iodine (real stoichiometry), INS, yield, and cost math. Formulas
  were cross-checked against a real SoapCalc recipe export.
- `src/data/oils.ts`, `src/data/scents.ts` — the seed oil and fragrance
  library, with sourced SAP values, fatty-acid profiles, and molecular/note
  data. Each entry documents its `sources` and any known regional/cultivar
  variance.
- `src/context/recipe-context.tsx` — shared recipe state and all derived
  calculations, available to every step of the wizard.
- `src/app/{oils-guide,recipe-builder,scent-blend,cost-analysis}` — the
  4-step wizard.
- `src/app/recipes` — save/load recipes, and a printable SoapCalc-style
  recipe summary (`recipes/summary`) for "Save as PDF" via the browser's
  print dialog.

Warning flags on scents (accelerant, discoloration, sensitizer) are
deliberately data-driven — only shown when backed by cited evidence, not
carried over from soap-community folklore.
