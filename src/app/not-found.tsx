import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-24 sm:px-8">
      <p className="font-mono text-xs tracking-widest uppercase">404</p>
      <h1 className="font-display text-4xl leading-tight italic sm:text-5xl">
        This page isn’t in the archive.
      </h1>
      <p className="max-w-prose text-lg">
        The link may be mistyped, or the kanga may have been taken down.
      </p>
      <p>
        <Link
          href="/archive"
          className="font-mono text-xs tracking-widest uppercase underline underline-offset-4"
        >
          Back to the archive →
        </Link>
      </p>
    </div>
  );
}
