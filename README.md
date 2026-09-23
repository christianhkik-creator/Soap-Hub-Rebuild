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

Run `npm test` to check the calculation engine — the suite is pinned
against a real SoapCalc recipe export (see `src/lib/soap-math.test.ts`),
so a future change that breaks the math fails a test instead of silently
shipping a wrong lye weight.

## Wiring up Supabase (optional, for syncing recipes to your phone)

Without this, saved recipes and any custom oils/scents/additives you add
live only in the browser you made them in (localStorage) — they won't
appear on another device. Wiring up Supabase makes both sync everywhere the
site is loaded.

1. Create a free project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in that project's SQL editor (Supabase
   dashboard → SQL Editor → paste the file → Run). It's safe to re-run.
3. Grab the URL and anon key from Project Settings → API.
4. **Locally:** copy `.env.local.example` to `.env.local` and fill those in.
   **On Vercel:** Project Settings → Environment Variables → add
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the
   Production environment, then redeploy (env var changes don't apply to
   already-built deployments).
5. Since there's no login, treat the deployed URL itself as the access
   control (e.g. Vercel deployment protection) — anyone with the anon key
   and URL can read/write your recipes.

The working recipe you're actively editing (before you hit Save) stays
local to that device on purpose — only what's in the "My Recipes" list and
your custom ingredient library sync.

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
