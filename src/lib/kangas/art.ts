export type KangaArtInput = {
  sayingSw: string;
  /** Pindo (border), mji (centre), accent. */
  dominantColours: readonly string[];
  /** Motif tag slugs; the first known one picks the centre pattern. */
  motifs: readonly string[];
};

export const ART_WIDTH = 300;
export const ART_HEIGHT = 200;

const HEX = /^#[0-9a-f]{6}$/i;
const FALLBACK = ["#282552", "#f3dfb1", "#d05127"] as const;

function escapeXml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}

function palette(colours: readonly string[]): [string, string, string] {
  const [pindo, mji, accent] = [0, 1, 2].map((i) => {
    const colour = colours[i];
    return colour && HEX.test(colour) ? colour : FALLBACK[i]!;
  });
  return [pindo!, mji!, accent!];
}

function mjiPattern(
  motif: string | undefined,
  pindo: string,
  accent: string,
): string {
  switch (motif) {
    case "geometric":
      return `<pattern id="mji" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M8 1 15 8 8 15 1 8Z" fill="none" stroke="${pindo}" stroke-width="1.5" opacity=".45"/></pattern>`;
    case "floral":
      return `<pattern id="mji" width="20" height="20" patternUnits="userSpaceOnUse"><g fill="${accent}" opacity=".5"><circle cx="10" cy="6" r="3"/><circle cx="14" cy="10" r="3"/><circle cx="10" cy="14" r="3"/><circle cx="6" cy="10" r="3"/></g><circle cx="10" cy="10" r="2" fill="${pindo}" opacity=".6"/></pattern>`;
    default:
      return `<pattern id="mji" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="1.8" fill="${pindo}" opacity=".4"/></pattern>`;
  }
}

/** A kanga layout as SVG: a patterned pindo, a mji with a medallion, and the jina along a band. */
export function renderKangaSvg({
  sayingSw,
  dominantColours,
  motifs,
}: KangaArtInput): string {
  const [pindo, mji, accent] = palette(dominantColours);
  const saying = escapeXml(sayingSw);
  const bandWidth = 244;
  // Georgia italic averages about 5.4 units per character at this size; squeeze long sayings to fit.
  const fit =
    sayingSw.length * 5.4 > bandWidth - 12
      ? ` textLength="${bandWidth - 12}" lengthAdjust="spacingAndGlyphs"`
      : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}" width="${ART_WIDTH}" height="${ART_HEIGHT}">`,
    `<defs>`,
    `<pattern id="pindo" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${pindo}"/><path d="M6 1 11 6 6 11 1 6Z" fill="${accent}"/></pattern>`,
    mjiPattern(
      motifs.find((m) => ["geometric", "floral"].includes(m)),
      pindo,
      accent,
    ),
    `</defs>`,
    `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#pindo)"/>`,
    `<rect x="22" y="22" width="256" height="156" fill="${pindo}"/>`,
    `<rect x="26" y="26" width="248" height="148" fill="${mji}"/>`,
    `<rect x="26" y="26" width="248" height="148" fill="url(#mji)"/>`,
    `<circle cx="150" cy="82" r="34" fill="${pindo}"/>`,
    `<circle cx="150" cy="82" r="26" fill="${accent}"/>`,
    `<circle cx="150" cy="82" r="10" fill="${mji}"/>`,
    `<rect x="${(ART_WIDTH - bandWidth) / 2}" y="136" width="${bandWidth}" height="26" fill="${pindo}"/>`,
    `<text x="150" y="153.5" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="11" fill="${mji}"${fit}>${saying}</text>`,
    `</svg>`,
  ].join("");
}
