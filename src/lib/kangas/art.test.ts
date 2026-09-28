import { describe, expect, it } from "vitest";
import { renderKangaSvg } from "./art";

const base = {
  sayingSw: "Haba na haba",
  dominantColours: ["#b3261e", "#f2c230", "#1f2a6b"],
  motifs: [],
};

describe("renderKangaSvg", () => {
  it("draws with the kanga's own colours", () => {
    const svg = renderKangaSvg(base);
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
    for (const colour of base.dominantColours) expect(svg).toContain(colour);
  });

  it("escapes the saying so it cannot break out of the text element", () => {
    const svg = renderKangaSvg({ ...base, sayingSw: `Ng'ombe <script>&"` });
    expect(svg).toContain("Ng&apos;ombe &lt;script&gt;&amp;&quot;");
    expect(svg).not.toContain("<script>");
  });

  it("falls back to the site palette for invalid colours", () => {
    const svg = renderKangaSvg({
      ...base,
      dominantColours: ['red" onload="x'],
    });
    expect(svg).not.toContain("onload");
    expect(svg).toContain("#2f1b1a");
  });

  it("squeezes long sayings into the band but leaves short ones alone", () => {
    expect(renderKangaSvg(base)).not.toContain("textLength");
    const long = renderKangaSvg({
      ...base,
      sayingSw: "Asiyefunzwa na mamaye hufunzwa na ulimwengu",
    });
    expect(long).toContain('textLength="232"');
  });

  it("picks the centre pattern from the first known motif", () => {
    expect(renderKangaSvg({ ...base, motifs: ["bird", "floral"] })).toContain(
      '<circle cx="10" cy="6"',
    );
    expect(renderKangaSvg({ ...base, motifs: ["geometric"] })).toContain(
      "M8 1 15 8 8 15 1 8Z",
    );
  });
});
