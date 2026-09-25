/** Turns a jina into a URL slug, e.g. "Haba na haba hujaza kibaba" → "haba-na-haba-hujaza-kibaba". */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’‘]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
