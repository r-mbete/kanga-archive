import { PGlite } from "@electric-sql/pglite";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "./schema";
import { type SeedKanga, seed, validateSeed } from "./seed-lib";

const haba: SeedKanga = {
  sayingSw: "Haba na haba hujaza kibaba",
  translationEn: "Little by little fills the measure",
  meaning: "Small efforts add up.",
  dominantColours: ["#B3261E", "#f2c230", "#1f2a6b"],
  colourFamilies: ["red", "yellow"],
  motifs: ["Geometric"],
  themes: ["Patience"],
  source: "Test source",
};

const pole: SeedKanga = {
  sayingSw: "Pole pole ndio mwendo",
  translationEn: "Slowly, slowly is the way to go; haba is not the point",
  dominantColours: ["#1d5c3a", "#f4ecd8", "#c0392b"],
  colourFamilies: ["green"],
  motifs: ["Floral"],
  themes: ["Patience", "Advice"],
  source: "Test source",
};

let db: ReturnType<typeof drizzle<typeof schema>>;

beforeAll(async () => {
  db = drizzle(new PGlite(), { schema });
  await migrate(db, { migrationsFolder: "drizzle" });
});

beforeEach(async () => {
  await db.execute(sql`TRUNCATE kanga, tag CASCADE`);
});

const tagNames = async (slug: string) => {
  const rows = await db
    .select({ name: schema.tag.name })
    .from(schema.kangaTag)
    .innerJoin(schema.kanga, eq(schema.kanga.id, schema.kangaTag.kangaId))
    .innerJoin(schema.tag, eq(schema.tag.id, schema.kangaTag.tagId))
    .where(eq(schema.kanga.slug, slug));
  return rows.map((r) => r.name).sort();
};

describe("seed", () => {
  it("inserts entries with a derived slug, generated image and tags", async () => {
    const summary = await seed(db, [haba, pole]);
    expect(summary).toMatchObject({
      inserted: 2,
      updated: 0,
      unchanged: 0,
      deleted: 0,
    });

    const [row] = await db
      .select()
      .from(schema.kanga)
      .where(eq(schema.kanga.slug, "haba-na-haba-hujaza-kibaba"));
    expect(row).toMatchObject({
      imageUrl: "/art/haba-na-haba-hujaza-kibaba.svg",
      imageCredit: "Generated design",
      dominantColours: ["#b3261e", "#f2c230", "#1f2a6b"],
      published: true,
    });
    expect(await tagNames("pole-pole-ndio-mwendo")).toEqual([
      "Advice",
      "Floral",
      "Patience",
    ]);
  });

  it("is idempotent: a second run changes nothing", async () => {
    await seed(db, [haba, pole]);
    const before = await db
      .select()
      .from(schema.kanga)
      .orderBy(schema.kanga.slug);

    const summary = await seed(db, [haba, pole]);

    expect(summary).toMatchObject({
      inserted: 0,
      updated: 0,
      unchanged: 2,
      deleted: 0,
    });
    expect(
      await db.select().from(schema.kanga).orderBy(schema.kanga.slug),
    ).toEqual(before);
  });

  it("updates a changed entry in place and bumps updated_at", async () => {
    await seed(db, [haba]);
    const [before] = await db.select().from(schema.kanga);

    const summary = await seed(db, [
      { ...haba, themes: ["Advice"], meaning: "Revised." },
    ]);

    const [after] = await db.select().from(schema.kanga);
    expect(summary).toMatchObject({ inserted: 0, updated: 1 });
    expect(after!.id).toBe(before!.id);
    expect(after!.meaning).toBe("Revised.");
    expect(after!.updatedAt.getTime()).toBeGreaterThan(
      before!.updatedAt.getTime(),
    );
    expect(await tagNames("haba-na-haba-hujaza-kibaba")).toEqual([
      "Advice",
      "Geometric",
    ]);
  });

  it("deletes kangas and tags the file no longer lists", async () => {
    await seed(db, [haba, pole]);

    const summary = await seed(db, [haba]);

    expect(summary.deleted).toBe(1);
    expect(
      await db.select({ slug: schema.kanga.slug }).from(schema.kanga),
    ).toEqual([{ slug: "haba-na-haba-hujaza-kibaba" }]);
    const tags = await db.select({ name: schema.tag.name }).from(schema.tag);
    expect(tags.map((t) => t.name).sort()).toEqual(["Geometric", "Patience"]);
    expect(await db.select().from(schema.kangaTag)).toHaveLength(2);
  });

  it("rejects invalid data before touching the database", async () => {
    await expect(
      seed(db, [haba, { ...haba, translationEn: "Duplicate" }]),
    ).rejects.toThrow(/duplicate slug/);
    expect(await db.select().from(schema.kanga)).toHaveLength(0);
  });
});

describe("schema constraints", () => {
  it("rejects colour families outside the fixed palette", async () => {
    const insert = db.execute(sql`
        INSERT INTO kanga (slug, saying_sw, translation_en, image_url, image_alt, image_credit, image_licence, dominant_colours, colour_families)
        VALUES ('x', 'x', 'x', '/x.svg', 'x', 'x', 'x', ARRAY['#000000'], ARRAY['teal'])`);
    await expect(insert).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/kanga_colour_families_check/) },
    });
  });
});

describe("search column", () => {
  it("ranks a match in the saying above a match in the translation", async () => {
    await seed(db, [haba, pole]);

    const rows = await db.execute<{ slug: string }>(sql`
      SELECT slug FROM kanga
      WHERE search @@ to_tsquery('simple', 'haba')
      ORDER BY ts_rank(search, to_tsquery('simple', 'haba')) DESC`);

    expect(rows.rows.map((r) => r.slug)).toEqual([
      "haba-na-haba-hujaza-kibaba",
      "pole-pole-ndio-mwendo",
    ]);
  });
});

describe("validateSeed", () => {
  it("reports bad colours and unknown families as errors", () => {
    const { errors } = validateSeed([
      {
        ...haba,
        dominantColours: ["red", "#f2c230", "#1f2a6b"],
        colourFamilies: ["teal" as "red"],
      },
    ]);
    expect(errors).toEqual([
      '"Haba na haba hujaza kibaba": "red" is not a #rrggbb colour',
      '"Haba na haba hujaza kibaba": unknown colour family "teal"',
    ]);
  });

  it("warns, but does not fail, when a source is missing", () => {
    const report = validateSeed([{ ...haba, source: null }]);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([
      '"Haba na haba hujaza kibaba": no published source recorded',
    ]);
  });
});
