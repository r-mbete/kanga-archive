import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("hyphenates a saying", () => {
    expect(slugify("Haba na haba hujaza kibaba")).toBe(
      "haba-na-haba-hujaza-kibaba",
    );
  });

  it("drops punctuation and trims separators", () => {
    expect(slugify("  Pole pole, ndio mwendo!  ")).toBe(
      "pole-pole-ndio-mwendo",
    );
  });

  it("removes apostrophes inside words", () => {
    expect(slugify("Ng’ombe hanenepi siku ya mnada")).toBe(
      "ngombe-hanenepi-siku-ya-mnada",
    );
  });

  it("strips diacritics", () => {
    expect(slugify("Café à Zanzibar")).toBe("cafe-a-zanzibar");
  });

  it("returns an empty string when nothing is left", () => {
    expect(slugify("—!?")).toBe("");
  });
});
