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
];

export const SCENTS_BY_ID = new Map(SCENTS.map((s) => [s.id, s]));
