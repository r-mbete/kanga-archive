import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ne,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { kanga, kangaTag, tag } from "@/db/schema";
import type { Db } from "@/db/types";
import { ARCHIVE_PAGE_SIZE, pageCount } from "./archive";

const cardColumns = {
  slug: kanga.slug,
  sayingSw: kanga.sayingSw,
  imageUrl: kanga.imageUrl,
  imageAlt: kanga.imageAlt,
};

export type KangaCard = {
  slug: string;
  sayingSw: string;
  imageUrl: string;
  imageAlt: string;
};

export type ArchivePage = {
  items: KangaCard[];
  page: number;
  totalPages: number;
  total: number;
};

const archiveOrder = [asc(kanga.sayingSw), asc(kanga.slug)];

/** One page of published kangas in archive order; `null` when the page is past the end. */
export async function listArchivePage(
  db: Db,
  page: number,
  pageSize = ARCHIVE_PAGE_SIZE,
): Promise<ArchivePage | null> {
  const [{ total } = { total: 0 }] = await db
    .select({ total: count() })
    .from(kanga)
    .where(eq(kanga.published, true));
  const totalPages = pageCount(total, pageSize);
  if (page > totalPages) return null;

  const items = await db
    .select(cardColumns)
    .from(kanga)
    .where(eq(kanga.published, true))
    .orderBy(...archiveOrder)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return { items, page, totalPages, total };
}

export async function listPublishedSlugs(db: Db): Promise<string[]> {
  const rows = await db
    .select({ slug: kanga.slug })
    .from(kanga)
    .where(eq(kanga.published, true))
    .orderBy(...archiveOrder);
  return rows.map((r) => r.slug);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { search, ...detailColumns } = getTableColumns(kanga);

export type KangaTag = { kind: "motif" | "theme"; name: string; slug: string };

export type KangaDetail = Omit<typeof kanga.$inferSelect, "search"> & {
  tags: KangaTag[];
};

/** A published kanga with its tags, or `null` if the slug is unknown or unpublished. */
export async function getKanga(
  db: Db,
  slug: string,
): Promise<KangaDetail | null> {
  const [row] = await db
    .select(detailColumns)
    .from(kanga)
    .where(and(eq(kanga.slug, slug), eq(kanga.published, true)));
  if (!row) return null;

  const tags = await db
    .select({ kind: tag.kind, name: tag.name, slug: tag.slug })
    .from(kangaTag)
    .innerJoin(tag, eq(tag.id, kangaTag.tagId))
    .where(eq(kangaTag.kangaId, row.id))
    .orderBy(asc(tag.kind), asc(tag.name));
  return { ...row, tags };
}

export type Neighbours = { previous: KangaCard | null; next: KangaCard | null };

/** The kangas either side of this one in archive order, ignoring any filters. */
export async function getNeighbours(
  db: Db,
  current: { sayingSw: string; slug: string },
): Promise<Neighbours> {
  const position = sql`(${kanga.sayingSw}, ${kanga.slug})`;
  const here = sql`(${current.sayingSw}, ${current.slug})`;
  const neighbour = (before: boolean) =>
    db
      .select(cardColumns)
      .from(kanga)
      .where(
        and(
          eq(kanga.published, true),
          before ? sql`${position} < ${here}` : sql`${position} > ${here}`,
        ),
      )
      .orderBy(
        ...(before ? [desc(kanga.sayingSw), desc(kanga.slug)] : archiveOrder),
      )
      .limit(1);

  const [[previous], [next]] = await Promise.all([
    neighbour(true),
    neighbour(false),
  ]);
  return { previous: previous ?? null, next: next ?? null };
}

/** Up to `limit` published kangas sharing the most tags with this one, then in archive order. */
export async function listRelated(
  db: Db,
  kangaId: string,
  limit = 4,
): Promise<KangaCard[]> {
  const mine = alias(kangaTag, "mine");
  return db
    .select(cardColumns)
    .from(kangaTag)
    .innerJoin(
      mine,
      and(eq(mine.tagId, kangaTag.tagId), eq(mine.kangaId, kangaId)),
    )
    .innerJoin(kanga, eq(kanga.id, kangaTag.kangaId))
    .where(and(ne(kangaTag.kangaId, kangaId), eq(kanga.published, true)))
    .groupBy(kanga.id)
    .orderBy(desc(count()), ...archiveOrder)
    .limit(limit);
}
