import type { Additive } from "@/lib/types";

/**
 * Seed additive library: clays, colorants, and similar non-oil, non-fragrance
 * ingredients. Usage rates are converted from the real-world convention
 * (teaspoons per pound of oils, since bulk density varies by product) to an
 * approximate % of oil weight — treat the usageNote's tsp/lb figure as the
 * more precise, supplier-standard measure.
 *
 * "Detox"/toxin-removal marketing claims for charcoal and clay were
 * evaluated critically per the same data-driven policy as scent warnings:
 * physical surface-oil adsorption is real and documented; systemic
 * "toxin removal" through a brief, rinsed-off soap bar is not supported by
 * the evidence found, and the disclaimers say so plainly rather than
 * repeating supplier marketing copy.
 */
export const ADDITIVES: Additive[] = [
  {
    id: "activated-charcoal",
    name: "Activated Charcoal",
    category: "colorant",
    usageRateMin: 0.5,
    usageRateMax: 2,
    usageNote: "~1-2 tsp per lb of oils. Mix into a little oil to a smooth paste first, not added dry.",
    description:
      "Fine black powder, steam- or chemically-activated for a very high internal surface area. Chemically inert — unlike clays, it doesn't swell or absorb batter moisture.",
    effects:
      "Does not accelerate trace or shift color through cure (carbon is essentially inert). Mixed in dry, it clumps and streaks — always pre-mix into a little oil first. Above roughly 2 tsp/lb, lather can turn visibly grey.",
    benefits:
      "Reliable, stable grey-to-black colorant that won't fade or shift with pH. Its large surface area does give it real, physical adsorption of surface oil and dirt during washing.",
    disclaimers: [
      "\"Detox\" or \"draws out toxins\" marketing claims aren't supported by evidence for a rinsed-off soap bar. Activated charcoal's real medical use — binding ingested poisons in the gut — is a completely different exposure route and doesn't transfer to a few seconds of skin contact.",
      "Dry powder is a documented mild inhalation irritant with repeated exposure, and airborne clouds of it are a combustible dust hazard — avoid stirring up visible dust when measuring.",
      "Can temporarily tint washcloths or a tub grey; this rinses out and isn't a permanent stain.",
    ],
    priceTier: 2,
    sources: [
      {
        claim: "~1-2 tsp per lb of oils typical usage; more causes grey lather",
        confidence: "cross-referenced",
      },
      {
        claim: "Chemically inert — does not accelerate trace or fade/shift with cure, unlike clays",
        confidence: "cross-referenced",
      },
      {
        claim: "\"Detox\"/toxin-removal cosmetic claims are not supported by clinical evidence for rinse-off use",
        confidence: "cross-referenced",
        note: "Real property is surface oil/dirt adsorption; the oral medical use (GI decontamination) is a different exposure route entirely, not evidence for topical rinse-off benefit.",
      },
      {
        claim: "Dry powder: mild inhalation irritant with repeated exposure; combustible dust hazard in concentrated clouds",
        confidence: "cross-referenced",
        note: "From safety data sheets (Fisher Scientific, Cole-Parmer, and others) — an occupational/repeated-handling caution, not an acute single-use danger.",
      },
    ],
  },
  {
    id: "pink-kaolin-clay",
    name: "Pink Kaolin Clay",
    category: "clay",
    usageRateMin: 0.5,
    usageRateMax: 1,
    usageNote:
      "~1-2 tsp per lb of oils. Disperse in water (roughly 1 part clay to 3 parts water) before adding — added dry, it pulls moisture out of the batter.",
    description:
      "The mildest, non-swelling common cosmetic clay. Pink color usually comes from natural iron-oxide content in the clay itself (some supplier products instead blend white kaolin with an added iron-oxide or mica tint — check yours).",
    effects:
      "Clays as a group accelerate trace due to their fine particle size and water-absorbing nature; kaolin is the gentlest of them. Also reported to add a silkier, creamier lather texture, unlike bentonite.",
    benefits:
      "Genuine mild mechanical exfoliation and real surface-level oil adsorption. Non-swelling, so it draws less moisture from skin than bentonite — the basis for its reputation as the gentlest clay, reasonable for sensitive or dry skin.",
    disclaimers: [
      "\"Detox\" claims are overstated for a rinsed-off soap bar, same as with other clays — the documented property is surface oil/debris adsorption, not systemic toxin removal.",
      "Dry clay can contain trace crystalline silica; repeated inhalation of dry clay dust is a documented occupational lung hazard (silicosis). Wetted clay poses no inhalation risk — just avoid generating dust clouds when measuring the dry powder.",
    ],
    priceTier: 2,
    sources: [
      { claim: "~1-2 tsp per lb of oils typical usage", confidence: "cross-referenced" },
      {
        claim: "Clays accelerate trace; standard practice is pre-dispersing in water, not adding dry",
        confidence: "cross-referenced",
      },
      {
        claim: "Kaolin is non-swelling and the gentlest common cosmetic clay, vs. bentonite's stronger oil-absorbing/drying profile",
        confidence: "cross-referenced",
      },
      {
        claim: "Pink color source (natural iron oxide vs. blended tint) varies by supplier product",
        confidence: "single-source",
        note: "Worth checking your specific product's listing if \"no added colorant\" matters to you.",
      },
    ],
  },
  {
    // id kept as "white-bentonite-clay" even though the ingredient is now
    // White Kaolin Clay — this id may already be referenced inside a saved
    // recipe's `additives` array, and changing it would silently drop the
    // line item from that recipe rather than update it.
    id: "white-bentonite-clay",
    name: "White Kaolin Clay",
    category: "clay",
    usageRateMin: 0.5,
    usageRateMax: 1,
    usageNote:
      "~1-2 tsp per lb of oils. Disperse in water (roughly 1 part clay to 3 parts water) before adding — added dry, it pulls moisture out of the batter.",
    description:
      "The same non-swelling kaolinite base as Pink Kaolin Clay (already in this library), just without the added iron-oxide/mica tint — sometimes labeled \"China clay.\" Naturally off-white to white, so it won't tint your batter, unlike the pink or colored kaolin variants.",
    effects:
      "Clays as a group accelerate trace due to their fine particle size and water-absorbing nature; kaolin is the gentlest of them, well short of a swelling clay like bentonite. Adds a silkier, creamier lather texture and mild slip without adding its own color to the bar.",
    benefits:
      "Genuine mild mechanical exfoliation and real surface-level oil adsorption. Non-swelling, so it draws less moisture from skin than bentonite — reasonable for sensitive or dry skin, and a clean base if you want to add your own colorant without a clay tint underneath it.",
    disclaimers: [
      "\"Detox\" claims are overstated for a rinsed-off soap bar, same as with other clays — the documented property is surface oil/debris adsorption, not systemic toxin removal.",
      "Dry clay can contain trace crystalline silica; repeated inhalation of dry clay dust is a documented occupational lung hazard (silicosis). Wetted clay poses no inhalation risk — just avoid generating dust clouds when measuring the dry powder.",
    ],
    priceTier: 2,
    sources: [
      { claim: "~1-2 tsp per lb of oils typical usage", confidence: "cross-referenced" },
      {
        claim: "Clays accelerate trace; standard practice is pre-dispersing in water, not adding dry",
        confidence: "cross-referenced",
      },
      {
        claim:
          "Kaolin (white/uncolored and pink/tinted variants share the same kaolinite base) is non-swelling and the gentlest common cosmetic clay, vs. bentonite's stronger oil-absorbing/drying profile",
        confidence: "cross-referenced",
      },
      {
        claim: "White/uncolored kaolin has no significant iron-oxide content, unlike pink kaolin",
        confidence: "cross-referenced",
      },
    ],
  },
];

export const ADDITIVES_BY_ID = new Map(ADDITIVES.map((a) => [a.id, a]));
