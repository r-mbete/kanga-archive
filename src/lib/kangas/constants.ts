/** The fixed palette the colour filter offers; each kanga maps to one or more. */
export const COLOUR_FAMILIES = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
  "brown",
  "black",
  "white",
] as const;

export type ColourFamily = (typeof COLOUR_FAMILIES)[number];

export const TAG_KINDS = ["motif", "theme"] as const;

export type TagKind = (typeof TAG_KINDS)[number];
