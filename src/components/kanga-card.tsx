import Image from "next/image";
import Link from "next/link";
import { ART_HEIGHT, ART_WIDTH } from "@/lib/kangas/art";
import type { KangaCard as KangaCardData } from "@/lib/kangas/queries";

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
        {/* The link is named by the jina below, so the picture is decorative here; the detail page gives the full alt text. */}
        <Image
          src={kanga.imageUrl}
          alt=""
          width={ART_WIDTH}
          height={ART_HEIGHT}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          className="h-auto w-full"
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
