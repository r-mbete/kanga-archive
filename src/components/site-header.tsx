import Link from "next/link";

export const SOURCE_URL = "https://github.com/r-mbete/kanga-archive";

export function SiteHeader() {
  const link = "hover:underline hover:underline-offset-4";
  return (
    <header className="border-cream/15 border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-5 font-mono text-xs tracking-widest uppercase sm:px-8"
      >
        <Link href="/" className={link}>
          Kanga Archive
        </Link>
        <ul className="flex gap-6">
          <li>
            <Link href="/archive" className={link}>
              Archive
            </Link>
          </li>
          <li>
            <a href={SOURCE_URL} className={link}>
              Source
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
