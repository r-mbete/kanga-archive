import { renderKangaSvg } from "@/lib/kangas/art";
import { getKangaBySlug, getPublishedSlugs } from "@/lib/kangas/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPublishedSlugs()).map((slug) => ({ file: `${slug}.svg` }));
}

export async function GET(_request: Request, ctx: RouteContext<"/art/[file]">) {
  const { file } = await ctx.params;
  const kanga = file.endsWith(".svg")
    ? await getKangaBySlug(file.slice(0, -".svg".length))
    : null;
  if (!kanga) return new Response("Not found", { status: 404 });

  const svg = renderKangaSvg({
    sayingSw: kanga.sayingSw,
    dominantColours: kanga.dominantColours,
    motifs: kanga.tags.filter((t) => t.kind === "motif").map((t) => t.slug),
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
