import type { Oil } from "@/lib/types";

/**
 * Seed oil library. Values are cross-referenced across multiple soap-chemistry
 * sources (see `sources` on each oil). Where natural/regional variation made
 * a single number impossible to justify, a representative midpoint is used
 * and the range is noted in `sources`. Coconut (0.178) and Tallow (0.140)
 * were specifically confirmed against the user's own real recipe.
 *
 * `densityGPerMl` values are approximate liquid/melted-state densities used
 * only for the Cost Analysis fl-oz estimate — they're commonly-cited
 * reference figures, not lab measurements of a specific lot.
 */
export const OILS: Oil[] = [
  {
    id: "olive-oil",
    name: "Olive Oil",
    botanicalName: "Olea europaea",
    category: "conditioning",
    sapNaOH: 0.135,
    densityGPerMl: 0.91,
    fattyAcids: { oleic: 70, palmitic: 12, stearic: 3, linoleic: 9, linolenic: 0.5 },
    usageRateMin: 10,
    usageRateMax: 100,
    rancidityRisk: "low",
    priceTier: 2,
    description:
      "The gold standard conditioning oil. Slow to trace; high-% bars need 6+ months cure. Affordable and sustainable — if you only buy one oil, this is it.",
    effects: "Slows trace significantly; contributes a soft, silky, low-lather bar.",
    benefits: "Gentle, moisturising, skin-compatible; supports up to 100% \"Castile\" recipes.",
    sources: [
      {
        claim: "NaOH SAP 0.135; natural oleic range 55-83%, representative point ~70%",
        confidence: "cross-referenced",
        note: "Agronomic range is wide (55-83% oleic); 70% used as a soaping-representative single point.",
      },
    ],
  },
  {
    id: "high-oleic-sunflower-oil",
    name: "High Oleic Sunflower Oil",
    botanicalName: "Helianthus annuus (high-oleic variety)",
    category: "conditioning",
    sapNaOH: 0.135,
    densityGPerMl: 0.92,
    fattyAcids: { oleic: 80, linoleic: 6.5, palmitic: 5, stearic: 4 },
    usageRateMin: 10,
    usageRateMax: 40,
    rancidityRisk: "low",
    priceTier: 2,
    description:
      "Lighter skin feel than olive oil. Must be labelled \"high oleic\" — standard sunflower is 60-70% linoleic and will DOS rapidly.",
    effects: "Bred to suppress linoleic content, giving it far better oxidative stability than standard sunflower oil.",
    benefits: "Conditioning, mild, a more stable substitute for olive oil in a blend.",
    sources: [
      {
        claim: "NaOH SAP ~0.134-0.136; oleic 75-91% depending on cultivar (spec minimum ~80%)",
        confidence: "cross-referenced",
        note: "Do not confuse with standard sunflower oil (~65% linoleic) — a chemically different, DOS-prone oil.",
      },
    ],
  },
  {
    id: "avocado-oil",
    name: "Avocado Oil",
    botanicalName: "Persea americana",
    category: "conditioning",
    sapNaOH: 0.133,
    densityGPerMl: 0.91,
    fattyAcids: { oleic: 65, palmitic: 13, stearic: 1, linoleic: 10.5 },
    usageRateMin: 10,
    usageRateMax: 30,
    rancidityRisk: "low",
    priceTier: 3,
    description:
      "Performs comparably to olive oil but costs 2-3x more. Best justified by the natural green tint or a luxury brand story.",
    effects: "Behaves similarly to olive oil at trace; adds a small hardness boost from its palmitic fraction.",
    benefits: "Rich and moisturising; unrefined grades add a natural green tint.",
    sources: [
      {
        claim: "NaOH SAP 0.133 (refined/deodorized grade); oleic ~46-55% for this grade",
        confidence: "user-confirmed",
        note: "Sources disagreed: academic KOH data implied ~0.141 and 65-72% oleic for other (virgin/cultivar) grades. Refined-grade values used per user preference since exact oil isn't a priority for their recipes.",
      },
    ],
  },
  {
    id: "coconut-oil-76",
    name: "Coconut Oil, 76°",
    botanicalName: "Cocos nucifera · 76° refined",
    category: "cleansing",
    sapNaOH: 0.178,
    densityGPerMl: 0.92,
    fattyAcids: { lauric: 49, myristic: 18.5, palmitic: 9.5, oleic: 7, linoleic: 1.5 },
    usageRateMin: 10,
    usageRateMax: 100,
    rancidityRisk: "very-low",
    priceTier: 1,
    description:
      "The lather workhorse of soapmaking. Produces big, fluffy bubbles and rock-hard bars, but can be harsh and stripping above ~30% unless balanced with superfat or conditioning oils.",
    effects: "Drives big, fluffy \"bubbly\" lather and fast hardness/unmold time.",
    benefits: "Cheap, widely available, essentially immune to oxidative rancidity.",
    sources: [
      {
        claim: "NaOH SAP 0.178",
        confidence: "user-confirmed",
        note: "Sources ranged 0.178-0.190 for 76° refined coconut oil; 0.178 selected by user as the professional-supplier-cited figure.",
      },
      {
        claim: "Fatty acid profile omits ~14-15% of mass (caproic/caprylic/capric short-chain acids)",
        confidence: "cross-referenced",
        note: "These short-chain acids aren't part of the standard 8-acid soap-quality model but are real mass in the oil.",
      },
    ],
  },
  {
    id: "babassu-oil",
    name: "Babassu Oil",
    botanicalName: "Attalea speciosa",
    category: "cleansing",
    sapNaOH: 0.176,
    densityGPerMl: 0.92,
    fattyAcids: { lauric: 44, myristic: 13, palmitic: 9, stearic: 3, oleic: 13.5, linoleic: 3 },
    usageRateMin: 10,
    usageRateMax: 33,
    rancidityRisk: "very-low",
    priceTier: 3,
    description:
      "A coconut-oil alternative with a near-identical saturated fatty acid profile, but a lighter, less-drying skin feel at the same usage rate.",
    effects: "Drop-in substitute for coconut oil — same big-bubble lather and hardness contribution.",
    benefits: "Less stripping on skin than coconut at equal usage; very shelf-stable.",
    sources: [
      { claim: "NaOH SAP ~0.175-0.178", confidence: "cross-referenced" },
    ],
  },
  {
    id: "shea-butter",
    name: "Shea Butter",
    botanicalName: "Vitellaria paradoxa · refined",
    category: "hardness",
    sapNaOH: 0.129,
    densityGPerMl: 0.91,
    fattyAcids: { stearic: 43, oleic: 46, palmitic: 5, linoleic: 4 },
    usageRateMin: 5,
    usageRateMax: 30,
    usageNote: "Avoid above 30% — reduces lather quality.",
    rancidityRisk: "very-low",
    priceTier: 2,
    description:
      "The luxury upgrade. High stearic gives hardness; high oleic gives conditioning. Makes soap feel noticeably expensive. Avoid above 30% — reduces lather quality.",
    effects: "Contributes hardness plus a silky/creamy feel beyond what its fatty-acid math alone predicts, thanks to its natural unsaponifiable fraction (triterpenes, tocopherols).",
    benefits: "Doesn't add much lather itself, but elevates the overall skin feel of a bar.",
    sources: [
      {
        claim: "Stearic ~43%, Oleic ~46% (commercial-blend average)",
        confidence: "user-confirmed",
        note: "Real, well-documented regional split: West African shea runs ~40-48% stearic, East African/Ugandan shea runs ~25-38% stearic (oleic moves inversely). Commercial-blend average used since origin usually isn't disclosed by suppliers.",
      },
    ],
  },
  {
    id: "cocoa-butter",
    name: "Cocoa Butter",
    botanicalName: "Theobroma cacao",
    category: "hardness",
    sapNaOH: 0.138,
    densityGPerMl: 0.905,
    fattyAcids: { stearic: 36, oleic: 32.5, palmitic: 26.5, linoleic: 2.5 },
    usageRateMin: 5,
    usageRateMax: 15,
    usageNote: "Keep under 15% or lather suffers.",
    rancidityRisk: "very-low",
    priceTier: 2,
    description:
      "Highest combined stearic + palmitic — creates rock-hard bars. Keep under 15% or lather suffers. Pairs beautifully with shea at 5-10% each.",
    effects: "Very hard, brittle bar contributor; can thicken batter quickly if added warm then cooled.",
    benefits: "Extremely hard, long-lasting bars; naturally antioxidant-rich (cocoa polyphenols).",
    sources: [
      {
        claim: "Stearic ~36% (representative point)",
        confidence: "cross-referenced",
        note: "Origin-driven spread of 24-37% stearic across sources — smaller than shea's but same underlying cause.",
      },
    ],
  },
  {
    id: "lard",
    name: "Lard",
    botanicalName: "Sus scrofa domesticus · rendered pork fat",
    category: "hardness",
    sapNaOH: 0.140,
    densityGPerMl: 0.90,
    fattyAcids: { oleic: 45, palmitic: 27.5, stearic: 15, linoleic: 8 },
    usageRateMin: 20,
    usageRateMax: 50,
    rancidityRisk: "low",
    priceTier: 1,
    description:
      "Exceptional value. Balanced fatty acid profile produces creamy, hard bars. Not vegan. Slightly higher linoleic than tallow, but still very stable.",
    effects: "Produces a hard, long-lasting, notably skin-compatible bar — its oleic-dominant profile resembles human sebum.",
    benefits: "A common palm-oil-free substitute for hardness; low cost, often available from a local butcher.",
    sources: [
      {
        claim: "NaOH SAP ~0.140",
        confidence: "cross-referenced",
        note: "Academic KOH-based range (190-205 mg/g) is wider than the soap-community's converged ~0.138-0.141; midpoint used.",
      },
    ],
  },
  {
    id: "tallow-beef",
    name: "Tallow, Beef",
    botanicalName: "Bos taurus · rendered beef fat",
    category: "hardness",
    sapNaOH: 0.140,
    densityGPerMl: 0.90,
    fattyAcids: { oleic: 38.5, palmitic: 26, stearic: 18, linoleic: 4.5, myristic: 3.25, lauric: 1 },
    usageRateMin: 20,
    usageRateMax: 80,
    usageNote: "Can be used up to 100% in traditional \"tallow soap\" recipes.",
    rancidityRisk: "low",
    priceTier: 1,
    description:
      "The most underrated soap fat. Lowest linoleic of all animal fats. A byproduct of the meat industry — circular and zero-waste. Often free from your local butcher.",
    effects: "Produces a very hard, long-lasting bar with a stable, creamy lather; among the most oxidatively stable common soaping fats.",
    benefits: "Hard, durable, inexpensive, and a traditional base for classic bar soap — pairs well with coconut oil for lather.",
    sources: [
      {
        claim: "NaOH SAP ~0.140; Palmitic 25-27%, Stearic 17-19%, Oleic 35-42%, Myristic 2.5-4%, Linoleic 4-5%",
        confidence: "cross-referenced",
        note: "Verified against the user's own SoapCalc export recipe (15% coconut / 40% olive / 40% tallow / 5% castor) — the resulting quality scores matched within rounding.",
      },
    ],
  },
  {
    id: "castor-oil",
    name: "Castor Oil",
    botanicalName: "Ricinus communis",
    category: "lather-boost",
    sapNaOH: 0.128,
    densityGPerMl: 0.96,
    fattyAcids: { ricinoleic: 90, oleic: 4, linoleic: 5.5 },
    usageRateMin: 5,
    usageRateMax: 10,
    usageNote: "Above 10% tends to make bars sticky/soft.",
    rancidityRisk: "low",
    priceTier: 2,
    description:
      "Unique lather amplifier — boosts and stabilizes bubbles out of proportion to its small usage rate, thanks to ricinoleic acid's strongly hydrophilic hydroxyl group.",
    effects: "Adds slip and silk to lather; used in small, precise amounts.",
    benefits: "Stabilizes and thickens lather from other oils rather than generating much of its own.",
    sources: [
      {
        claim: "NaOH SAP 0.128; Ricinoleic 85-95%",
        confidence: "cross-referenced",
        note: "Ricinoleic acid's contribution to the standard Bubbly/Creamy quality formulas is a documented simplification — it's better described chemically as a lather stabilizer than a bubble- or creaminess-generator in its own right.",
      },
    ],
  },
];

export const OILS_BY_ID = new Map(OILS.map((o) => [o.id, o]));
