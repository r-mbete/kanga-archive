import Image from "next/image";

type Props = {
  image: { url: string | null; alt: string | null };
  /** Cards crop to fill the frame; the detail page shows the whole cloth. */
  fit?: "cover" | "contain";
  sizes: string;
  eager?: boolean;
  /** Empty alt for cards, whose link is already named by the jina beside it. */
  decorative?: boolean;
};

/** A kanga photograph in a 3:2 frame, or a quiet spotted placeholder until one exists. */
export function KangaImage({
  image,
  fit = "cover",
  sizes,
  eager = false,
  decorative = false,
}: Props) {
  if (!image.url) {
    return (
      <div className="placeholder-spots bg-shell relative flex aspect-[3/2] items-end justify-center p-4">
        <span className="text-cocoa font-mono text-[0.65rem] tracking-widest uppercase">
          Photograph to come
        </span>
      </div>
    );
  }

  return (
    <div className="bg-shell relative aspect-[3/2] overflow-hidden">
      <Image
        src={image.url}
        alt={decorative ? "" : (image.alt ?? "")}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className={fit === "cover" ? "object-cover" : "object-contain"}
      />
    </div>
  );
}
