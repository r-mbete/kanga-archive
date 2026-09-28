import type { SeedKanga } from "./seed-lib";

/**
 * The archive's content. Check every translation and meaning against a published
 * source and record it in `source`; `npm run db:seed` warns about entries without one.
 */
export const seedKangas: SeedKanga[] = [
  {
    sayingSw: "Haba na haba hujaza kibaba",
    translationEn: "Little by little fills the measure",
    meaning:
      "Small, steady efforts add up to something whole. Often a nudge to keep saving or keep going.",
    dominantColours: ["#b3261e", "#f2c230", "#1f2a6b"],
    colourFamilies: ["red", "yellow", "indigo"],
    motifs: ["Geometric"],
    themes: ["Patience"],
    source: null,
  },
  {
    sayingSw: "Pole pole ndio mwendo",
    translationEn: "Slowly, slowly is the way to go",
    meaning: "Patience and care get you further than haste.",
    dominantColours: ["#1d5c3a", "#f4ecd8", "#c0392b"],
    colourFamilies: ["green", "white", "red"],
    motifs: ["Floral"],
    themes: ["Patience", "Advice"],
    source: null,
  },
  {
    sayingSw: "Mapenzi ni kikohozi, hayafichiki",
    translationEn: "Love is like a cough; it cannot be hidden",
    meaning: "However hard you try, affection shows.",
    dominantColours: ["#6a1b4d", "#f7b7c9", "#101010"],
    colourFamilies: ["purple", "pink", "black"],
    motifs: ["Floral"],
    themes: ["Love"],
    source: null,
  },
];
