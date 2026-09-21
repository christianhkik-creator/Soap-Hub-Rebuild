import type { Scent } from "@/lib/types";

/**
 * Seed scent library. Warning flags are strictly data-driven: a flag only
 * appears when independent, cited evidence supports it. Community folklore
 * that didn't hold up under research (e.g. "aldehyde-rich EOs always
 * accelerate trace" — contradicted by real CP-soap testing of Litsea
 * Cubeba) is deliberately left out rather than carried over from the
 * original mockup.
 */
export const SCENTS: Scent[] = [
  {
    id: "litsea-cubeba-eo",
    name: "Litsea Cubeba EO",
    botanicalName: "Litsea cubeba",
    note: "top",
    molecularWeight: 152.2,
    dominantClass: "aldehyde",
    majorConstituents: "Citral (neral + geranial isomers, 62-87%), D-limonene",
    usageRateMin: 3,
    usageRateMax: 6,
    longevityMonths: [0.5, 2],
    priceTier: 2,
    warnings: [
      {
        type: "discoloration",
        severity: "info",
        label: "Discoloration",
        message:
          "Reported to cause dark-yellow discoloration in cold-process soap over time, based on independent supplier CP-soap testing.",
        evidence: "practitioner-reported",
      },
    ],
    sources: [
      {
        claim: "Citral-dominant monoterpene aldehyde, MW ~152; classified top note by volatility",
        confidence: "cross-referenced",
      },
      {
        claim: "Does NOT reliably accelerate CP soap trace despite high aldehyde content",
        confidence: "cross-referenced",
        note: "Multiple independent CP-testing sources found no acceleration/seizing from this oil. The common 'aldehydes accelerate trace' rule is soap-community folklore, not supported here — no accelerant flag applied.",
      },
    ],
  },
  {
    id: "lavender-eo",
    name: "Lavender EO",
    botanicalName: "Lavandula angustifolia",
    note: "heart",
    molecularWeight: 175,
    dominantClass: "monoterpene-alcohol",
    majorConstituents: "Linalool, Linalyl acetate",
    usageRateMin: 3,
    usageRateMax: 5,
    longevityMonths: [2, 5],
    priceTier: 2,
    warnings: [],
    sources: [
      {
        claim: "Linalool + linalyl acetate dominant; MW range ~154-196; heart-note classification",
        confidence: "cross-referenced",
      },
      {
        claim: "No discoloration or accelerant behavior asserted",
        confidence: "cross-referenced",
        note: "No EO-specific discoloration data was found for lavender (distinct from fragrance oils, which are well documented to discolor). Left unflagged rather than asserting an unconfirmed claim.",
      },
    ],
  },
  {
    id: "patchouli-eo",
    name: "Patchouli EO",
    botanicalName: "Pogostemon cablin",
    note: "base",
    molecularWeight: 222.37,
    dominantClass: "sesquiterpene-alcohol",
    majorConstituents: "Patchoulol (27-45%), a-guaiene, a-bulnesene, seychellene",
    usageRateMin: 3,
    usageRateMax: 5,
    longevityMonths: [6, 12],
    priceTier: 3,
    warnings: [
      {
        type: "discoloration",
        severity: "info",
        label: "Discoloration",
        message:
          "Well-documented to lend a yellow/pale-tan color to CP soap over cure time, like most heavy resinous/sesquiterpene-rich oils.",
        evidence: "practitioner-reported",
      },
    ],
    sources: [
      {
        claim: "Patchoulol-dominant sesquiterpene alcohol, MW ~222; base-note classification (low volatility, classic fixative)",
        confidence: "cross-referenced",
      },
    ],
  },
  {
    id: "jasmine-absolute",
    name: "Jasmine Absolute",
    botanicalName: "Jasminum grandiflorum or J. sambac — verify which; check if yours is really an absolute",
    note: "heart",
    molecularWeight: 150,
    dominantClass: "blend",
    majorConstituents:
      "Benzyl acetate (MW 150, aromatic ester), benzyl benzoate (MW 212), linalool (MW 154), benzyl alcohol (MW 108), indole (MW 117, a heterocyclic amine, not a terpenoid), cis-jasmone (MW 164). Percentages vary widely (e.g. benzyl acetate 17-67%) by extraction method and cultivar.",
    usageRateMin: 0.3,
    usageRateMax: 1,
    longevityMonths: [3, 6],
    priceTier: 3,
    description:
      "What's commercially sold as \"Jasmine EO\" is almost always Jasmine Absolute (solvent-extracted) — true steam-distilled jasmine oil has such a low yield it isn't commercially viable. Its aromatic (non-terpene) esters and indole content don't fit a single chemical-class bucket the way most EOs do, hence \"blend\" here. Used at far lower % than typical EOs — extremely potent and expensive.",
    warnings: [
      {
        type: "discoloration",
        severity: "info",
        label: "Discoloration",
        message:
          "Jasmine absolute is a dark orange-brown viscous liquid; expect tan/brown discoloration in cold-process soap, the same mechanism as vanilla-heavy fragrance oils.",
        evidence: "practitioner-reported",
      },
      {
        type: "sensitizer",
        severity: "warning",
        label: "Contains IFRA-declarable allergens",
        message:
          "Contains benzyl salicylate, benzyl benzoate, and benzyl alcohol — all IFRA/EU-declarable fragrance allergens with their own concentration limits, independent of the jasmine absolute's overall usage rate.",
        evidence: "documented",
      },
    ],
    sources: [
      {
        claim: "Nearly all commercial 'Jasmine EO' is actually Jasmine Absolute, not steam-distilled",
        confidence: "cross-referenced",
      },
      {
        claim: "Constituent percentages vary substantially by extraction solvent, cultivar, and harvest time",
        confidence: "cross-referenced",
        note: "Treat any single percentage as illustrative, not definitive — GC-MS studies disagree meaningfully.",
      },
      {
        claim: "Note classification (heart vs. base) is genuinely disputed across perfumery sources",
        confidence: "cross-referenced",
        note: "Classified as heart here (majority view); its heavier indole/benzyl-benzoate fraction gives real base-note fixative behavior too.",
      },
      {
        claim: "Does NOT reliably accelerate trace",
        confidence: "single-source",
        note: "Only broad-brush 'florals can accelerate' guidance and one inconsistent forum anecdote found — not confident enough to flag as an accelerant, consistent with the Litsea Cubeba precedent of not asserting unconfirmed acceleration claims.",
      },
    ],
  },
  {
    id: "sandalwood-eo",
    name: "Sandalwood EO",
    botanicalName: "Santalum album — often substituted; verify your bottle's species",
    note: "base",
    molecularWeight: 220.35,
    dominantClass: "sesquiterpene-alcohol",
    majorConstituents:
      "alpha-Santalol + beta-Santalol, combined ~90% per ISO 3518:2002 (41-54% alpha, 16-24% beta)",
    usageRateMin: 1,
    usageRateMax: 3,
    longevityMonths: [6, 12],
    priceTier: 3,
    description:
      "Genuine Santalum album (Indian/Mysore sandalwood) is over-harvested and export-regulated, and real oil is rare and expensive. Bottles are frequently cut with or fully substituted by S. spicatum (Australian sandalwood) or amyris, which have a different, less potent chemical profile — check your supplier's species/origin listing, since the data here assumes genuine S. album. Despite its exceptional fixative reputation in perfumery (400+ hours of substantivity), practitioners report its scent throw in cold-process soap can be weaker/faster-fading than the cost would suggest.",
    warnings: [],
    sources: [
      {
        claim: "alpha/beta-santalol content per ISO 3518:2002 quality standard for genuine S. album oil",
        confidence: "cross-referenced",
      },
      {
        claim: "Base-note classification justified by very low vapor pressure / high molecular weight (MW 220)",
        confidence: "cross-referenced",
      },
      {
        claim: "No discoloration or accelerant behavior confidently documented",
        confidence: "single-source",
        note: "Left unflagged rather than asserting an unconfirmed claim — one accelerant reference found was for a sandalwood-containing fragrance-oil blend, not pure sandalwood EO, so it wasn't attributed here.",
      },
    ],
  },
  {
    id: "eucalyptus-globulus-eo",
    name: "Eucalyptus EO (Globulus)",
    botanicalName: "Eucalyptus globulus — verify species on your bottle (see description)",
    note: "top",
    molecularWeight: 154.25,
    dominantClass: "oxide",
    majorConstituents: "1,8-Cineole / eucalyptol, ~54-95% (representative figure ~69%) — a monoterpene oxide",
    usageRateMin: 2,
    usageRateMax: 4,
    longevityMonths: [0.5, 2],
    priceTier: 1,
    description:
      "This entry assumes Eucalyptus globulus, the most common oil sold simply as \"Eucalyptus EO.\" E. radiata is a close match (also cineole-dominant, but gentler). E. citriodora (lemon eucalyptus) is chemically a completely different oil — citronellal-dominant, not cineole — and would need its own entry; check your bottle's Latin name.",
    warnings: [
      {
        type: "ifra-caution",
        severity: "warning",
        label: "IFRA-restricted co-constituents",
        message:
          "IFRA conformity certificates for eucalyptus globulus oil list restricted co-occurring constituents (limonene, linalool) from oxidation-sensitizer risk — not cineole itself. Exact limits are batch/supplier-specific; check your bottle's IFRA certificate rather than assuming a flat percentage.",
        evidence: "documented",
      },
      {
        type: "toxicity",
        severity: "danger",
        label: "Ingestion risk for kids and pets",
        message:
          "Neat eucalyptus oil is a real ingestion hazard — as little as 0.6-5 mL has caused serious illness in a child, with seizures reported at higher doses. This is about handling the concentrated bottle, not the finished diluted soap — store it out of reach of children and pets like any concentrated EO.",
        evidence: "documented",
      },
    ],
    sources: [
      {
        claim: "1,8-cineole content and MW confirmed via NIST WebBook / ChemicalBook (CAS 470-82-6)",
        confidence: "cross-referenced",
      },
      {
        claim: "Pediatric ingestion toxicity case reports (seizures from small volumes)",
        confidence: "cross-referenced",
        note: "Multiple peer-reviewed case-report sources (PMC); genuine documented hazard distinct from any fragrance-allergen concern.",
      },
      {
        claim: "Does not reliably accelerate trace or discolor at typical usage rates",
        confidence: "cross-referenced",
        note: "practitioner-reported, dose-dependent; treated the same evidentiary tier as Litsea Cubeba's non-accelerant finding.",
      },
      {
        claim: "Eucalyptus species vary chemically — globulus/radiata are cineole-dominant, citriodora is citronellal-dominant",
        confidence: "cross-referenced",
        note: "The user should confirm which species their bottle actually is; this entry will be wrong for citriodora.",
      },
    ],
  },
  {
    id: "lemongrass-eo",
    name: "Lemongrass EO",
    botanicalName: "Cymbopogon citratus (West Indian) or C. flexuosus (East Indian) — verify which; flexuosus runs higher citral",
    note: "top",
    molecularWeight: 152.2,
    dominantClass: "aldehyde",
    majorConstituents:
      "Citral (neral + geranial isomers, ~60-85% combined, higher in C. flexuosus/East Indian oil), myrcene (~8-20%, highly variable by origin), geraniol (~2-7%, highly variable), limonene (~1-8%). Citronellal is NOT a major constituent here — that's a Citronella (C. nardus/winterianus) or lemon eucalyptus trait, a different oil despite the similar name/scent.",
    usageRateMin: 3,
    usageRateMax: 6,
    longevityMonths: [0.5, 2],
    priceTier: 1,
    description:
      "Same citral chemistry and top-note behavior as Litsea Cubeba (already in this library), but treat trace-acceleration folklore separately: unlike Litsea, real practitioner reports for lemongrass are genuinely split — some report it traces almost instantly, others report no issue after years of use — so no accelerant claim is asserted either way here. Because citral is a recognized skin sensitizer with its own IFRA usage cap (see warning below), a higher-citral East Indian (C. flexuosus) bottle used at the top of the usage range is the scenario most worth double-checking.",
    warnings: [
      {
        type: "discoloration",
        severity: "info",
        label: "Discoloration",
        message:
          "Practitioner reports disagree — some describe cured bars turning bright orange with no colorant added, others report no discoloration at all. Likely supplier/usage-rate dependent rather than a settled effect.",
        evidence: "practitioner-reported",
      },
      {
        type: "ifra-caution",
        severity: "warning",
        label: "Citral sensitizer cap (IFRA Category 9)",
        message:
          "Citral is a documented skin sensitizer with an IFRA Category 9 (rinse-off, includes bar soap) limit commonly cited at 5% of the finished product. At 3-6% EO usage and ~60-85% citral content, citral load in the bar works out to roughly 2-5% — comfortably under the cap at typical usage, but a high-citral East Indian oil used at the top of the range can reach or exceed it. Worth doing the math for your specific bottle rather than assuming the general 3-6% EO guidance is automatically safe here.",
        evidence: "documented",
      },
    ],
    sources: [
      {
        claim: "Citral-dominant monoterpene aldehyde, MW ~152.2 — same identity and top-note classification as Litsea Cubeba",
        confidence: "cross-referenced",
      },
      {
        claim: "Trace acceleration evidence is genuinely split among practitioners, not a clean folklore-vs-refuted case like Litsea Cubeba",
        confidence: "cross-referenced",
        note: "Multiple independent first-hand reports go both ways ('traces almost instantly' vs. 'no issue after years of use'). Left unflagged as neither a confirmed accelerant nor a confirmed non-accelerant, rather than asserting either direction without a real consensus.",
      },
      {
        claim: "Citral IFRA Category 9 limit commonly cited at 5% of finished product",
        confidence: "cross-referenced",
        note: "Confirmed via multiple independent secondary industry sources citing the current IFRA Amendment text; the primary IFRA Standards PDF itself was not directly accessible this research session — worth an independent check against the current amendment if this number needs to be authoritative rather than well-corroborated.",
      },
      {
        claim: "C. citratus vs. C. flexuosus differ meaningfully in citral concentration (flexuosus runs consistently higher, ~85-90%)",
        confidence: "cross-referenced",
        note: "A real species/sourcing difference, same pattern as the Sandalwood and Eucalyptus entries — affects how close a given usage rate sits to the IFRA cap above.",
      },
    ],
  },
];

export const SCENTS_BY_ID = new Map(SCENTS.map((s) => [s.id, s]));
