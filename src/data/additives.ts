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
    id: "white-bentonite-clay",
    name: "White Bentonite Clay",
    category: "clay",
    usageRateMin: 0.5,
    usageRateMax: 1.5,
    usageNote:
      "~1 tsp per lb of oils to start — more drying/thickening than kaolin. Disperse in water (roughly 1 tsp clay to 1 tbsp water) before adding; it's a swelling clay and prone to cracking the bar if added dry.",
    description:
      "A swelling (smectite) clay, stronger and more oil-absorbing than kaolin. \"White\" bentonite is usually calcium bentonite (the gentler, more common cosmetic type) rather than sodium bentonite, which swells far more — check your label if it specifies.",
    effects:
      "Accelerates trace more than kaolin and is more prone to cracking the cured bar if not pre-hydrated. Adds slip rather than lather boost; more drying overall, which is why it's popular for oily-skin facial bars. Color can come out pale greenish-grey rather than pure white depending on the specific clay's mineral content.",
    benefits:
      "The strongest, best-documented oil/sebum-absorbing capacity of the common cosmetic clays, from its swelling clay structure.",
    disclaimers: [
      "\"Draws out toxins\" marketing claims go beyond the evidence for a quick, rinsed-off wash. Bentonite's actual documented uses — binding ingested toxins in the gut, or blocking skin contact with an external allergen like poison ivy oil in a leave-on lotion — are different exposure scenarios than a bar of soap.",
      "Dry bentonite commonly contains crystalline silica; repeated inhalation of the dry powder is a documented lung hazard (silicosis). Avoid generating dust clouds when measuring, and ventilate.",
    ],
    priceTier: 2,
    sources: [
      {
        claim: "~1 tsp per lb of oils to start, more drying/trace-accelerating than kaolin",
        confidence: "cross-referenced",
      },
      {
        claim: "Swelling (smectite) clay; pre-hydration in water is standard practice to avoid cracking the cured bar",
        confidence: "cross-referenced",
      },
      {
        claim: "\"White bentonite\" is usually calcium bentonite (gentler) rather than sodium bentonite (much higher swelling)",
        confidence: "cross-referenced",
        note: "If your product specifies sodium bentonite, expect stronger trace acceleration and more water needed in the pre-dispersion slurry.",
      },
      {
        claim: "Toxin-binding/allergen-blocking benefits are documented for different exposure routes (ingestion, leave-on lotion), not rinse-off soap",
        confidence: "cross-referenced",
      },
      {
        claim: "Documented crystalline-silica inhalation hazard in dry powder form",
        confidence: "cross-referenced",
        note: "From multiple manufacturer safety data sheets — more consistently flagged for bentonite than for kaolin.",
      },
    ],
  },
];

export const ADDITIVES_BY_ID = new Map(ADDITIVES.map((a) => [a.id, a]));
