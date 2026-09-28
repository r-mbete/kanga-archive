import Link from "next/link";
import { archiveHref } from "@/lib/kangas/archive";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const linkClass = "hover:underline hover:underline-offset-4";

  return (
    <nav
      aria-label="Archive pages"
      className="mt-16 flex items-center justify-between gap-4 font-mono text-xs tracking-widest uppercase"
    >
      {page > 1 ? (
        <Link href={archiveHref(page - 1)} rel="prev" className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span aria-hidden="true" className="opacity-40">
          ← Previous
        </span>
      )}
      <p>
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={archiveHref(page + 1)} rel="next" className={linkClass}>
          Next →
        </Link>
      ) : (
        <span aria-hidden="true" className="opacity-40">
          Next →
        </span>
      )}
    </nav>
  );
}
