"use client";

import { useEffect, useRef } from "react";

/** Kanga is Swahili for guineafowl; the first cloths were said to be spotted like its plumage. */
const SPOTS = [
  { x: 58, y: 4, size: 38, colour: "var(--color-forest)", delay: 0 },
  { x: 8, y: 14, size: 30, colour: "var(--color-marigold)", delay: 1.2 },
  { x: 40, y: 30, size: 16, colour: "var(--color-rust)", delay: 0.6 },
  { x: 72, y: 44, size: 24, colour: "var(--color-rose)", delay: 2.1 },
  { x: 30, y: 52, size: 26, colour: "var(--color-shell)", delay: 1.7 },
  { x: 52, y: 66, size: 30, colour: "var(--color-sage)", delay: 0.3 },
  { x: 12, y: 70, size: 12, colour: "var(--color-forest)", delay: 2.6 },
  { x: 84, y: 76, size: 18, colour: "var(--color-rust)", delay: 1 },
  { x: 24, y: 8, size: 6, colour: "var(--color-rose)", delay: 3 },
  { x: 90, y: 22, size: 8, colour: "var(--color-shell)", delay: 0.9 },
  { x: 46, y: 18, size: 5, colour: "var(--color-indigo)", delay: 2.3 },
  { x: 66, y: 90, size: 7, colour: "var(--color-marigold)", delay: 1.5 },
  { x: 4, y: 46, size: 9, colour: "var(--color-cocoa)", delay: 0.4 },
] as const;

/** Decorative drifting spots that lean toward the pointer; sizes are % of the container width. */
export function GuineafowlSpots({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty(
          "--px",
          `${event.clientX / window.innerWidth - 0.5}`,
        );
        el.style.setProperty(
          "--py",
          `${event.clientY / window.innerHeight - 0.5}`,
        );
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`relative ${className}`}>
      {SPOTS.map((spot, i) => (
        <span
          key={i}
          className="animate-rise absolute transition-[translate] duration-700 ease-out"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.size}%`,
            animationDelay: `${i * 60}ms`,
            // Bigger spots sit "closer", so they lean further.
            translate: `calc(var(--px, 0) * ${spot.size * 1.2}px) calc(var(--py, 0) * ${spot.size * 1.2}px)`,
          }}
        >
          <span
            className="animate-drift block aspect-square rounded-full"
            style={{
              backgroundColor: spot.colour,
              animationDelay: `-${spot.delay}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
