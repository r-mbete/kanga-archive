"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { HeroSaying } from "@/lib/kangas/queries";
import { JinaBand } from "./jina-band";

const FALLBACK: HeroSaying = {
  slug: "",
  sayingSw: "Haba na haba hujaza kibaba",
  translationEn: "Little by little fills the measure",
};

/** The hero: a saying in Swahili the visitor can reveal, then swap for another. */
export function SayingRiddle({ sayings }: { sayings: HeroSaying[] }) {
  const pool = sayings.length > 0 ? sayings : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const answerId = useId();
  const answerRef = useRef<HTMLParagraphElement>(null);
  const current = pool[index] ?? FALLBACK;

  // The reveal button disappears once used, so keyboard focus moves to what it revealed.
  useEffect(() => {
    if (revealed) answerRef.current?.focus();
  }, [revealed]);

  function another() {
    const choices = pool.map((_, i) => i).filter((i) => i !== index);
    const next = choices[Math.floor(Math.random() * choices.length)] ?? 0;
    setIndex(next);
    setRevealed(false);
    setAnnouncement(`New saying: ${pool[next]?.sayingSw ?? ""}`);
  }

  const button =
    "ease-flutter inline-block px-5 py-3 font-mono text-xs tracking-widest uppercase transition-[background-color,translate] duration-300 hover:-translate-y-0.5";

  return (
    <div className="flex flex-col gap-8">
      <p className="animate-rise text-cocoa font-mono text-xs tracking-widest uppercase">
        Every kanga speaks · Can you read this one?
      </p>

      <JinaBand key={current.sayingSw} size="text-5xl sm:text-7xl">
        {current.sayingSw}
      </JinaBand>

      <div id={answerId} className="min-h-28">
        {revealed ? (
          <div className="animate-rise">
            <p
              ref={answerRef}
              tabIndex={-1}
              className="font-display text-forest text-3xl leading-snug outline-none sm:text-4xl"
            >
              “{current.translationEn}”
            </p>
            {current.slug && (
              <Link
                href={`/kanga/${current.slug}`}
                className="mt-3 inline-block underline underline-offset-4"
              >
                What it means, and when it’s worn →
              </Link>
            )}
          </div>
        ) : (
          <p className="animate-rise max-w-prose text-lg [animation-delay:400ms]">
            Every kanga carries a saying printed along the cloth: advice,
            affection or a pointed message for whoever reads it. Guess first,
            then reveal what this one says.
          </p>
        )}
      </div>

      <div className="animate-rise flex flex-wrap items-center gap-4 [animation-delay:550ms]">
        {!revealed ? (
          <button
            type="button"
            aria-controls={answerId}
            onClick={() => setRevealed(true)}
            className={`${button} bg-indigo text-sand hover:bg-forest`}
          >
            Reveal what it says
          </button>
        ) : (
          <Link
            href="/archive"
            className={`${button} bg-indigo text-sand hover:bg-forest`}
          >
            Browse the archive →
          </Link>
        )}
        {pool.length > 1 && (
          <button
            type="button"
            onClick={another}
            className={`${button} border-indigo hover:bg-shell border-2`}
          >
            Try another ↻
          </button>
        )}
      </div>
      {/* Kept in place when hidden, so revealing doesn't shift the layout. */}
      <Link
        href="/archive"
        className={`-mt-4 self-start text-sm underline underline-offset-4 ${revealed ? "invisible" : ""}`}
      >
        Or browse the whole archive
      </Link>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
