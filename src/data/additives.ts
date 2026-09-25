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
    id: "turmeric",
    name: "Turmeric",
    category: "colorant",
    usageRateMin: 0.5,
    usageRateMax: 2,
    usageNote:
      "~1-2 tsp per lb of oils. Infusing the powder into a little of your oil first (and straining) gives a smoother color than adding it dry, which can leave visible flecks/speckling.",
    description:
      "Ground Curcuma longa rhizome. Its color comes from curcumin, a natural polyphenol — a real, well-studied compound, but see the color and benefit notes below before expecting a bright, stable yellow bar.",
    effects:
      "Curcumin acts as a pH indicator: yellow in acid, shifting toward red/brown in base. Cold-process soap's batter is highly alkaline, so turmeric reliably shifts toward red, burnt-orange, or brown rather than staying the bright yellow of the raw powder — the exact shade is hard to predict and varies by amount used and cure conditions. Curcumin is also chemically unstable under light, heat, and oxygen, so the color commonly keeps shifting or fading over cure rather than settling into something stable.",
    benefits:
      "A genuine, inexpensive natural colorant, if you're prepared for an unpredictable orange/brown/red result rather than a controlled yellow. Curcumin does have real, clinically studied anti-inflammatory, antioxidant, and antimicrobial activity for skin — see the disclaimer below on why a soap bar is unlikely to actually deliver it.",
    disclaimers: [
      "\"Brightening\" or anti-inflammatory marketing claims for turmeric soap point to genuine research on curcumin, but that research almost entirely relies on specialized delivery systems (nanoemulsions, liposomes, piperine-enhanced formulations) built specifically to work around curcumin's notoriously poor water solubility and skin penetration. Plain turmeric powder in a bar of soap — further degraded by the soap's high pH, and rinsed off within seconds — is a very different, much lower-bioavailability delivery route than what those studies used.",
      "Can temporarily stain skin, nails, and light-colored washcloths/towels a yellow-orange tint, the same way cooking with turmeric does. Usually rinses out of fabric with a wash or two, not permanent.",
    ],
    priceTier: 1,
    sources: [
      {
        claim: "Curcumin functions as a pH indicator (yellow in acid, red/brown in base), which is why cold-process soap's alkalinity shifts turmeric's color toward red/burnt-orange/brown",
        confidence: "cross-referenced",
      },
      {
        claim: "Curcumin is unstable under light, heat, oxygen, and high pH, so turmeric-colored soap commonly fades or keeps shifting shade over cure",
        confidence: "cross-referenced",
      },
      {
        claim: "Curcumin has real documented anti-inflammatory, antioxidant, and antimicrobial activity studied for skin conditions (psoriasis, acne, photoaging)",
        confidence: "cross-referenced",
        note: "Virtually all of this research uses specialized delivery formulations built to overcome curcumin's poor water solubility/skin permeability — not plain powder in a rinsed-off soap bar, which is why the benefit isn't asserted as something the soap itself reliably delivers.",
      },
    ],
  },
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
  {
    id: "natural-loofah",
    name: "Natural Loofah",
    category: "exfoliant",
    usageRateMin: 0,
    usageRateMax: 20,
    usageNote:
      "Not blended in like a powder — loofah is used as whole/cut pieces or slices embedded in the mold, not measured as a formulation percentage. The % here just controls the weight/cost shown; set it (or edit the resulting gram figure directly) to match the actual dried loofah weight you're using in this batch.",
    description:
      "The dried, fibrous inner skeleton of the loofah gourd (Luffa aegyptiaca / L. cylindrica), used whole, sliced, or chopped for mechanical exfoliation. It's a plant fiber, not a chemical additive — it doesn't take part in the lye/oil saponification chemistry at all.",
    effects:
      "Purely physical: doesn't accelerate trace, discolor the batter, or change lather chemistry. If embedding a solid slice, the batter needs to fully saturate and surround it as you pour — an unsaturated air pocket is the main practical failure mode (see disclaimers), not a chemistry issue.",
    benefits:
      "Genuine, noticeably more vigorous mechanical exfoliation than a clay or ground botanical — a built-in scrubber bar rather than just a soap.",
    disclaimers: [
      "More abrasive than clay-based exfoliants — not recommended for sensitive, broken, or irritated skin, or for facial use.",
      "If embedding a solid loofah piece: fully submerge it and work out air bubbles as you pour. A trapped, unsaturated air pocket inside the bar is a well-documented practical cause of mold/mildew forming inside an otherwise-fine bar — the standard fix is full saturation and tamping out air, not any special preservative.",
      "Like any natural bath sponge, a wet loofah left without drying between uses can grow bacteria or mildew — let the finished bar fully air-dry between washes, same as you would a standalone loofah.",
    ],
    priceTier: 1,
    sources: [
      {
        claim: "Purely mechanical exfoliant with no fatty-acid/lye chemistry — doesn't affect trace, cure, or the standard quality metrics",
        confidence: "cross-referenced",
      },
      {
        claim: "Trapped, unsaturated air pockets inside an embedded loofah slice are a widely-reported cause of internal mold/mildew in cured bars",
        confidence: "cross-referenced",
        note: "Practitioner-documented failure mode rather than a lab study — the fix (full saturation, tamping out air when pouring) is standard soap-making practice, not a special product needed.",
      },
      {
        claim: "General bacterial/mildew hygiene caution for a wet, undried loofah applies the same way to a soap-embedded loofah as a standalone bath loofah",
        confidence: "cross-referenced",
      },
    ],
  },
];

export const ADDITIVES_BY_ID = new Map(ADDITIVES.map((a) => [a.id, a]));
