import { inArray, notInArray, sql } from "drizzle-orm";
import { COLOUR_FAMILIES, type ColourFamily } from "../lib/kangas/constants";
import { slugify } from "../lib/slug";
import * as schema from "./schema";
import type { Db } from "./types";

/** One kanga as written in seed-data.ts. */
export type SeedKanga = {
  sayingSw: string;
  translationEn: string;
  meaning?: string;
  context?: string;
  era?: string;
  region?: string;
  /** Pindo (border), mji (centre) and accent, as #rrggbb. */
  dominantColours: [string, string, string];
  colourFamilies: ColourFamily[];
  motifs: string[];
  themes: string[];
  /** Published reference the translation and meaning were checked against. */
  source: string | null;
  /** A photograph, e.g. `/kangas/<slug>.jpg` in public/; omit it and the site shows a placeholder. */
  photo?: {
    url: string;
    alt: string;
    credit: string;
    licence: string;
    sourceUrl?: string;
  };
  published?: boolean;
  /** Overrides the slug derived from `sayingSw`. */
  slug?: string;
};

export type SeedReport = { errors: string[]; warnings: string[] };

export type SeedSummary = {
  inserted: number;
  updated: number;
  unchanged: number;
  deleted: number;
  warnings: string[];
};

const HEX = /^#[0-9a-f]{6}$/i;

export function seedSlug(entry: SeedKanga): string {
  return entry.slug ?? slugify(entry.sayingSw);
}

/** Errors block the seed; warnings (like a missing source) are printed but allowed. */
export function validateSeed(entries: readonly SeedKanga[]): SeedReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const slug = seedSlug(entry);
    const where = `"${entry.sayingSw}"`;
    if (!slug) errors.push(`${where}: slug is empty`);
    if (seen.has(slug)) errors.push(`${where}: duplicate slug "${slug}"`);
    seen.add(slug);
    if (!entry.sayingSw.trim() || !entry.translationEn.trim()) {
      errors.push(`${where}: saying and translation are required`);
    }
    for (const hex of entry.dominantColours) {
      if (!HEX.test(hex))
        errors.push(`${where}: "${hex}" is not a #rrggbb colour`);
    }
    if (entry.colourFamilies.length === 0)
      errors.push(`${where}: needs at least one colour family`);
    for (const family of entry.colourFamilies) {
      if (!COLOUR_FAMILIES.includes(family))
        errors.push(`${where}: unknown colour family "${family}"`);
    }
    if (entry.photo) {
      const { url, alt, credit, licence } = entry.photo;
      if (!/^(\/|https:\/\/)/.test(url)) {
        errors.push(`${where}: photo url must start with / or https://`);
      }
      if (!alt.trim() || !credit.trim() || !licence.trim()) {
        errors.push(`${where}: a photo needs alt text, a credit and a licence`);
      }
    }
    if (!entry.source?.trim())
      warnings.push(`${where}: no published source recorded`);
  }

  return { errors, warnings };
}

function kangaRow(entry: SeedKanga): typeof schema.kanga.$inferInsert {
  const photo = entry.photo;
  return {
    slug: seedSlug(entry),
    sayingSw: entry.sayingSw.trim(),
    translationEn: entry.translationEn.trim(),
    meaning: entry.meaning?.trim() ?? null,
    context: entry.context?.trim() ?? null,
    era: entry.era ?? null,
    region: entry.region ?? null,
    imageUrl: photo?.url.trim() ?? null,
    imageAlt: photo?.alt.trim() ?? null,
    imageCredit: photo?.credit.trim() ?? null,
    imageLicence: photo?.licence.trim() ?? null,
    imageSourceUrl: photo?.sourceUrl?.trim() ?? null,
    dominantColours: entry.dominantColours.map((hex) => hex.toLowerCase()),
    colourFamilies: [...entry.colourFamilies],
    published: entry.published ?? true,
  };
}

function tagRows(entries: readonly SeedKanga[]) {
  const tags = new Map<string, typeof schema.tag.$inferInsert>();
  for (const entry of entries) {
    for (const name of entry.motifs)
      tags.set(slugify(name), { kind: "motif", name, slug: slugify(name) });
    for (const name of entry.themes)
      tags.set(slugify(name), { kind: "theme", name, slug: slugify(name) });
  }
  return [...tags.values()];
}

/** Columns the seed file owns; a row is only rewritten when one of these changes. */
const DATA_KEYS = [
  "sayingSw",
  "translationEn",
  "meaning",
  "context",
  "era",
  "region",
  "imageUrl",
  "imageAlt",
  "imageCredit",
  "imageLicence",
  "imageSourceUrl",
  "dominantColours",
  "colourFamilies",
  "published",
] as const;

/** Makes the database match `entries` exactly: upserts by slug, deletes what the file no longer lists. */
export async function seed(
  db: Db,
  entries: readonly SeedKanga[],
): Promise<SeedSummary> {
  const { errors, warnings } = validateSeed(entries);
  if (errors.length > 0)
    throw new Error(`Seed data is invalid:\n- ${errors.join("\n- ")}`);

  const kangas = entries.map(kangaRow);
  const tags = tagRows(entries);
  const slugs = kangas.map((k) => k.slug);
  const tagSlugs = tags.map((t) => t.slug);

  return db.transaction(async (tx) => {
    const deleted = await tx
      .delete(schema.kanga)
      .where(
        slugs.length > 0 ? notInArray(schema.kanga.slug, slugs) : undefined,
      )
      .returning({ id: schema.kanga.id });
    await tx
      .delete(schema.tag)
      .where(
        tagSlugs.length > 0 ? notInArray(schema.tag.slug, tagSlugs) : undefined,
      );

    if (kangas.length === 0) {
      return {
        inserted: 0,
        updated: 0,
        unchanged: 0,
        deleted: deleted.length,
        warnings,
      };
    }

    if (tags.length > 0) {
      await tx
        .insert(schema.tag)
        .values(tags)
        .onConflictDoUpdate({
          target: schema.tag.slug,
          set: { kind: sql`excluded.kind`, name: sql`excluded.name` },
        });
    }

    const columns = DATA_KEYS.map((key) => schema.kanga[key].name);
    const set = Object.fromEntries(
      DATA_KEYS.map((key, i) => [key, sql.raw(`excluded.${columns[i]}`)]),
    );
    const current = sql.raw(columns.map((c) => `kanga.${c}`).join(", "));
    const incoming = sql.raw(columns.map((c) => `excluded.${c}`).join(", "));
    const written = await tx
      .insert(schema.kanga)
      .values(kangas)
      .onConflictDoUpdate({
        target: schema.kanga.slug,
        set: { ...set, updatedAt: sql`now()` },
        setWhere: sql`(${current}) IS DISTINCT FROM (${incoming})`,
      })
      .returning({ inserted: sql<boolean>`(xmax = 0)` });

    const kangaIds = await tx
      .select({ id: schema.kanga.id, slug: schema.kanga.slug })
      .from(schema.kanga)
      .where(inArray(schema.kanga.slug, slugs));
    const tagIds = await tx
      .select({ id: schema.tag.id, slug: schema.tag.slug })
      .from(schema.tag);
    const kangaIdBySlug = new Map(kangaIds.map((k) => [k.slug, k.id]));
    const tagIdBySlug = new Map(tagIds.map((t) => [t.slug, t.id]));

    const links = entries.flatMap((entry) => {
      const kangaId = kangaIdBySlug.get(seedSlug(entry))!;
      const names = new Set([...entry.motifs, ...entry.themes].map(slugify));
      return [...names].map((slug) => ({
        kangaId,
        tagId: tagIdBySlug.get(slug)!,
      }));
    });
    await tx
      .delete(schema.kangaTag)
      .where(inArray(schema.kangaTag.kangaId, [...kangaIdBySlug.values()]));
    if (links.length > 0) await tx.insert(schema.kangaTag).values(links);

    const inserted = written.filter((w) => w.inserted).length;
    const updated = written.length - inserted;
    return {
      inserted,
      updated,
      unchanged: kangas.length - written.length,
      deleted: deleted.length,
      warnings,
    };
  });
}
