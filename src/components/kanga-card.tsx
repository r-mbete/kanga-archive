import Link from "next/link";
import type { KangaCard as KangaCardData } from "@/lib/kangas/queries";
import { KangaImage } from "./kanga-image";

type Props = {
  kanga: KangaCardData;
  /** Load eagerly and at high priority; for cards visible on first paint. */
  eager?: boolean;
  sizes?: string;
};

export function KangaCard({
  kanga,
  eager = false,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
}: Props) {
  return (
    <Link href={`/kanga/${kanga.slug}`} className="group block">
      <div className="ease-flutter transition-[translate,rotate,box-shadow] duration-500 group-hover:-translate-y-1.5 group-hover:-rotate-1 group-hover:shadow-[6px_6px_0_var(--color-rust)] group-focus-visible:-translate-y-1.5 group-focus-visible:shadow-[6px_6px_0_var(--color-rust)]">
        <KangaImage
          image={{ url: kanga.imageUrl, alt: kanga.imageAlt }}
          sizes={sizes}
          eager={eager}
          decorative
        />
      </div>
      <p
        lang="sw"
        className="font-display mt-3 text-xl leading-snug italic group-hover:underline group-hover:underline-offset-4"
      >
        {kanga.sayingSw}
      </p>
    </Link>
  );
}
