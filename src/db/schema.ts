import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { COLOUR_FAMILIES, TAG_KINDS } from "../lib/kangas/constants";

const tsvector = customType<{ data: string }>({ dataType: () => "tsvector" });

const quoted = (values: readonly string[]) =>
  values.map((v) => `'${v}'`).join(", ");

export const kanga = pgTable(
  "kanga",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    sayingSw: text("saying_sw").notNull(),
    translationEn: text("translation_en").notNull(),
    meaning: text("meaning"),
    context: text("context"),
    era: text("era"),
    region: text("region"),
    // All null until a photograph is added; a photograph must come with alt text, credit and licence.
    imageUrl: text("image_url"),
    imageAlt: text("image_alt"),
    imageCredit: text("image_credit"),
    imageLicence: text("image_licence"),
    imageSourceUrl: text("image_source_url"),
    dominantColours: text("dominant_colours").array().notNull(),
    colourFamilies: text("colour_families").array().notNull(),
    published: boolean("published").notNull().default(true),
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('simple', saying_sw), 'A') || setweight(to_tsvector('english', translation_en), 'B') || setweight(to_tsvector('english', coalesce(meaning, '')), 'C')`,
    ),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("kanga_search_idx").using("gin", t.search),
    index("kanga_colour_families_idx").using("gin", t.colourFamilies),
    index("kanga_archive_order_idx").on(t.sayingSw, t.slug),
    check(
      "kanga_colour_families_check",
      sql.raw(
        `cardinality(colour_families) > 0 AND colour_families <@ ARRAY[${quoted(COLOUR_FAMILIES)}]::text[]`,
      ),
    ),
    check(
      "kanga_image_complete_check",
      sql`${t.imageUrl} IS NULL OR (${t.imageAlt} IS NOT NULL AND ${t.imageCredit} IS NOT NULL AND ${t.imageLicence} IS NOT NULL)`,
    ),
    check(
      "kanga_dominant_colours_check",
      sql`array_to_string(${t.dominantColours}, ',') ~ '^#[0-9a-f]{6}(,#[0-9a-f]{6})*$'`,
    ),
  ],
);

export const tag = pgTable(
  "tag",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind", { enum: TAG_KINDS }).notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
  },
  (t) => [
    unique("tag_kind_name_unique").on(t.kind, t.name),
    check("tag_kind_check", sql.raw(`kind IN (${quoted(TAG_KINDS)})`)),
  ],
);

export const kangaTag = pgTable(
  "kanga_tag",
  {
    kangaId: uuid("kanga_id")
      .notNull()
      .references(() => kanga.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.kangaId, t.tagId] }),
    index("kanga_tag_tag_id_idx").on(t.tagId),
  ],
);
