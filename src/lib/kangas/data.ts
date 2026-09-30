import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getDb } from "@/db/client";
import {
  getKanga,
  getNeighbours,
  listArchivePage,
  listHeroSayings,
  listPublishedSlugs,
  listRelated,
} from "./queries";

/** Revalidation window for everything read from the database, in seconds. */
export const CONTENT_REVALIDATE = 3600;

// The archive renders per request because it reads ?page=; caching the query keeps Neon's cold starts off that path.
export const getArchivePage = unstable_cache(
  (page: number) => listArchivePage(getDb(), page),
  // Cached entries outlive deploys on Vercel; bump the version whenever the card shape changes.
  ["archive-page", "v2"],
  {
    revalidate: CONTENT_REVALIDATE,
    tags: ["kangas"],
  },
);

export const getHeroSayings = () => listHeroSayings(getDb());

export const getPublishedSlugs = () => listPublishedSlugs(getDb());

/** Deduped per render, so generateMetadata and the page share one query. */
export const getKangaBySlug = cache((slug: string) => getKanga(getDb(), slug));

export const getKangaNeighbours = (current: {
  sayingSw: string;
  slug: string;
}) => getNeighbours(getDb(), current);

export const getRelatedKangas = (kangaId: string) =>
  listRelated(getDb(), kangaId);
