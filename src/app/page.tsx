import Link from "next/link";
import { GuineafowlSpots } from "@/components/guineafowl-spots";
import { JinaBand } from "@/components/jina-band";

export default function Home() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-16 sm:px-8 md:grid-cols-[3fr_2fr] md:py-24">
      <div className="flex flex-col gap-8">
        <p className="animate-rise text-cocoa font-mono text-xs tracking-widest uppercase">
          Kanga Archive
        </p>
        <JinaBand size="text-5xl sm:text-7xl">
          Haba na haba hujaza kibaba
        </JinaBand>
        <p className="animate-rise max-w-prose text-lg [animation-delay:400ms]">
          Little by little fills the measure. Every kanga carries a saying
          printed along the cloth; this archive gathers them, with what they
          mean and when they are worn.
        </p>
        <p className="animate-rise [animation-delay:550ms]">
          <Link
            href="/archive"
            className="bg-indigo text-sand ease-flutter hover:bg-forest inline-block px-5 py-3 font-mono text-xs tracking-widest uppercase transition-[background-color,translate] duration-300 hover:-translate-y-0.5"
          >
            Browse the archive →
          </Link>
        </p>
      </div>
      <GuineafowlSpots className="order-first mx-auto aspect-square w-40 md:order-none md:w-full" />
    </div>
  );
}
