import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JinaBand } from "@/components/jina-band";
import { KangaCard } from "@/components/kanga-card";
import { KangaImage } from "@/components/kanga-image";
import {
  getKangaBySlug,
  getKangaNeighbours,
  getPublishedSlugs,
  getRelatedKangas,
} from "@/lib/kangas/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPublishedSlugs()).map((slug) => ({ slug }));
}

function describe(translation: string, meaning: string | null): string {
  const text = meaning ? `${translation}. ${meaning}` : translation;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export async function generateMetadata(
  props: PageProps<"/kanga/[slug]">,
): Promise<Metadata> {
  const kanga = await getKangaBySlug((await props.params).slug);
  if (!kanga) return {};
  return {
    title: kanga.sayingSw,
    description: describe(kanga.translationEn, kanga.meaning),
    alternates: { canonical: `/kanga/${kanga.slug}` },
  };
}

export default async function KangaPage(props: PageProps<"/kanga/[slug]">) {
  const kanga = await getKangaBySlug((await props.params).slug);
  if (!kanga) notFound();

  const [neighbours, related] = await Promise.all([
    getKangaNeighbours(kanga),
    getRelatedKangas(kanga.id),
  ]);
  const [pindo, , accent] = kanga.dominantColours;
  const motifs = kanga.tags
    .filter((t) => t.kind === "motif")
    .map((t) => t.name);
  const themes = kanga.tags
    .filter((t) => t.kind === "theme")
    .map((t) => t.name);
  const facts = [
    ["Era", kanga.era],
    ["Region", kanga.region],
    ["Motifs", motifs.join(", ")],
    ["Themes", themes.join(", ")],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-8 sm:py-16">
      {/* The pindo: the kanga's own border colour frames the page, with its accent as an inner rule. */}
      <div style={{ borderColor: pindo }} className="border-[6px] sm:border-8">
        <div style={{ borderColor: accent }} className="border p-4 sm:p-8">
          <figure>
            <KangaImage
              image={{ url: kanga.imageUrl, alt: kanga.imageAlt }}
              fit="contain"
              sizes="(min-width: 1024px) 896px, 100vw"
              eager
            />
            {kanga.imageUrl && (
              <figcaption className="mt-2 font-mono text-[0.7rem] tracking-wide opacity-80">
                {kanga.imageSourceUrl ? (
                  <a
                    href={kanga.imageSourceUrl}
                    className="underline underline-offset-2"
                  >
                    {kanga.imageCredit}
                  </a>
                ) : (
                  kanga.imageCredit
                )}{" "}
                · {kanga.imageLicence}
              </figcaption>
            )}
          </figure>

          <div className="my-10">
            <JinaBand>{kanga.sayingSw}</JinaBand>
          </div>

          <div className="grid gap-10 md:grid-cols-[3fr_2fr]">
            <div className="max-w-prose space-y-6">
              <p className="font-display text-forest text-2xl leading-snug">
                “{kanga.translationEn}”
              </p>
              {kanga.meaning && (
                <section>
                  <h2 className="font-mono text-xs tracking-widest uppercase">
                    What it means
                  </h2>
                  <p className="mt-2 text-lg">{kanga.meaning}</p>
                </section>
              )}
              {kanga.context && (
                <section>
                  <h2 className="font-mono text-xs tracking-widest uppercase">
                    When it is worn
                  </h2>
                  <p className="mt-2 text-lg">{kanga.context}</p>
                </section>
              )}
            </div>
            {facts.length > 0 && (
              <dl className="border-indigo/15 space-y-4 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
                {facts.map(([term, value]) => (
                  <div key={term}>
                    <dt className="font-mono text-xs tracking-widest uppercase">
                      {term}
                    </dt>
                    <dd className="mt-1">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>

      <nav
        aria-label="Archive order"
        className="mt-10 grid gap-6 sm:grid-cols-2"
      >
        {neighbours.previous && (
          <Link
            href={`/kanga/${neighbours.previous.slug}`}
            rel="prev"
            className="group block"
          >
            <span className="font-mono text-xs tracking-widest uppercase">
              ← Previous
            </span>
            <span
              lang="sw"
              className="font-display mt-1 block text-lg italic group-hover:underline"
            >
              {neighbours.previous.sayingSw}
            </span>
          </Link>
        )}
        {neighbours.next && (
          <Link
            href={`/kanga/${neighbours.next.slug}`}
            rel="next"
            className="group block sm:col-start-2 sm:text-right"
          >
            <span className="font-mono text-xs tracking-widest uppercase">
              Next →
            </span>
            <span
              lang="sw"
              className="font-display mt-1 block text-lg italic group-hover:underline"
            >
              {neighbours.next.sayingSw}
            </span>
          </Link>
        )}
      </nav>

      {related.length > 0 && (
        <section
          aria-labelledby="related"
          className="border-indigo/15 mt-16 border-t pt-10"
        >
          <h2 id="related" className="font-display text-3xl italic">
            Related kangas
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((card) => (
              <li key={card.slug}>
                <KangaCard
                  kanga={card}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
