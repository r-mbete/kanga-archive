import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuineafowlSpots } from "@/components/guineafowl-spots";
import { KangaCard } from "@/components/kanga-card";
import { Pagination } from "@/components/pagination";
import { archiveHref, parsePage } from "@/lib/kangas/archive";
import { getArchivePage } from "@/lib/kangas/data";

export async function generateMetadata(
  props: PageProps<"/archive">,
): Promise<Metadata> {
  const page = parsePage((await props.searchParams).page);
  return {
    title: page > 1 ? `Archive, page ${page}` : "Archive",
    description:
      "Browse kanga designs and their Swahili sayings, in alphabetical order.",
    alternates: { canonical: archiveHref(page) },
  };
}

export default async function ArchivePage(props: PageProps<"/archive">) {
  const page = parsePage((await props.searchParams).page);
  const archive = await getArchivePage(page);
  if (!archive) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-8 sm:py-24">
      <header className="mb-12 flex items-end justify-between gap-8">
        <div className="max-w-prose">
          <h1 className="animate-rise font-display text-5xl leading-tight italic sm:text-6xl">
            The archive
          </h1>
          {archive.total > 0 && (
            <p className="text-cocoa mt-4 font-mono text-xs tracking-widest uppercase">
              {archive.total} {archive.total === 1 ? "kanga" : "kangas"} · A to
              Z by saying
            </p>
          )}
        </div>
        <GuineafowlSpots className="hidden aspect-square w-40 shrink-0 sm:block" />
      </header>

      {archive.total === 0 ? (
        <p className="max-w-prose text-lg">
          The archive is empty for now. Sayings are being gathered and checked
          against published sources, so come back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {archive.items.map((kanga, i) => (
            <li key={kanga.slug}>
              <KangaCard kanga={kanga} eager={page === 1 && i < 3} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={archive.page} totalPages={archive.totalPages} />
    </div>
  );
}
