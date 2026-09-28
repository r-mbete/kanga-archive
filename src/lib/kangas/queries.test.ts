import { beforeAll, describe, expect, it } from "vitest";
import { type SeedKanga, seed } from "@/db/seed-lib";
import { createTestDb } from "@/db/test-db";
import type { Db } from "@/db/types";
import {
  getKanga,
  getNeighbours,
  listArchivePage,
  listPublishedSlugs,
  listRelated,
} from "./queries";

const entry = (
  sayingSw: string,
  tags: { motifs?: string[]; themes?: string[] } = {},
  published = true,
): SeedKanga => ({
  sayingSw,
  translationEn: `Translation of ${sayingSw}`,
  dominantColours: ["#111111", "#222222", "#333333"],
  colourFamilies: ["black"],
  motifs: tags.motifs ?? [],
  themes: tags.themes ?? [],
  source: "Test",
  published,
});

let db: Db;

beforeAll(async () => {
  db = await createTestDb();
  await seed(db, [
    entry("Usipoziba ufa utajenga ukuta", {
      motifs: ["Floral"],
      themes: ["Advice", "Patience"],
    }),
    entry("Akili ni nywele", { themes: ["Advice"] }),
    entry("Haba na haba hujaza kibaba", {
      motifs: ["Floral"],
      themes: ["Advice", "Patience"],
    }),
    entry("Pole pole ndio mwendo", {
      motifs: ["Floral"],
      themes: ["Patience"],
    }),
    entry("Mapenzi ni kikohozi", { themes: ["Love"] }),
    entry("Bandu bandu huisha gogo", { themes: ["Advice", "Patience"] }, false),
  ]);
});

describe("listArchivePage", () => {
  it("lists only published kangas, alphabetically by saying", async () => {
    const page = await listArchivePage(db, 1);
    expect(page).toMatchObject({ page: 1, totalPages: 1, total: 5 });
    expect(page!.items.map((k) => k.sayingSw)).toEqual([
      "Akili ni nywele",
      "Haba na haba hujaza kibaba",
      "Mapenzi ni kikohozi",
      "Pole pole ndio mwendo",
      "Usipoziba ufa utajenga ukuta",
    ]);
  });

  it("slices pages and returns null past the last one", async () => {
    const second = await listArchivePage(db, 2, 2);
    expect(second).toMatchObject({ page: 2, totalPages: 3, total: 5 });
    expect(second!.items.map((k) => k.slug)).toEqual([
      "mapenzi-ni-kikohozi",
      "pole-pole-ndio-mwendo",
    ]);
    expect(await listArchivePage(db, 4, 2)).toBeNull();
  });

  it("lists published slugs for static generation", async () => {
    const slugs = await listPublishedSlugs(db);
    expect(slugs).toHaveLength(5);
    expect(slugs).not.toContain("bandu-bandu-huisha-gogo");
  });
});

describe("getKanga", () => {
  it("returns a kanga with its tags, motifs first", async () => {
    const kanga = await getKanga(db, "haba-na-haba-hujaza-kibaba");
    expect(kanga?.translationEn).toBe(
      "Translation of Haba na haba hujaza kibaba",
    );
    expect(kanga?.tags.map((t) => `${t.kind}:${t.name}`)).toEqual([
      "motif:Floral",
      "theme:Advice",
      "theme:Patience",
    ]);
    expect(kanga).not.toHaveProperty("search");
  });

  it("returns null for unknown and unpublished slugs", async () => {
    expect(await getKanga(db, "no-such-kanga")).toBeNull();
    expect(await getKanga(db, "bandu-bandu-huisha-gogo")).toBeNull();
  });
});

describe("getNeighbours", () => {
  it("returns the kangas either side in archive order", async () => {
    const { previous, next } = await getNeighbours(db, {
      sayingSw: "Haba na haba hujaza kibaba",
      slug: "haba-na-haba-hujaza-kibaba",
    });
    expect(previous?.slug).toBe("akili-ni-nywele");
    expect(next?.slug).toBe("mapenzi-ni-kikohozi");
  });

  it("returns null at either end", async () => {
    const first = await getNeighbours(db, {
      sayingSw: "Akili ni nywele",
      slug: "akili-ni-nywele",
    });
    const last = await getNeighbours(db, {
      sayingSw: "Usipoziba ufa utajenga ukuta",
      slug: "usipoziba-ufa-utajenga-ukuta",
    });
    expect(first.previous).toBeNull();
    expect(last.next).toBeNull();
  });
});

describe("listRelated", () => {
  it("ranks by shared tags, skips itself, unpublished and unrelated kangas", async () => {
    const haba = await getKanga(db, "haba-na-haba-hujaza-kibaba");
    const related = await listRelated(db, haba!.id);
    // Usipoziba shares 3 tags, Pole 2, Akili 1, Mapenzi none: shared tags outrank the alphabet.
    expect(related.map((k) => k.slug)).toEqual([
      "usipoziba-ufa-utajenga-ukuta",
      "pole-pole-ndio-mwendo",
      "akili-ni-nywele",
    ]);
  });

  it("respects the limit", async () => {
    const haba = await getKanga(db, "haba-na-haba-hujaza-kibaba");
    expect(await listRelated(db, haba!.id, 1)).toHaveLength(1);
  });
});
