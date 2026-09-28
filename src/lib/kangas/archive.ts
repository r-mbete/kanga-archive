export const ARCHIVE_PAGE_SIZE = 24;

/** Reads `?page=` as a whole number from 1 up; anything else falls back to 1. */
export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

/** Always at least 1, so an empty archive still has a first page to show its empty state on. */
export function pageCount(total: number, pageSize = ARCHIVE_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

/** Page 1 is the bare `/archive`, so each page has exactly one URL. */
export function archiveHref(page: number): string {
  return page <= 1 ? "/archive" : `/archive?page=${page}`;
}
