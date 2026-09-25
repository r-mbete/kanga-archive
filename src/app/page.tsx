export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-4 py-24 sm:px-8">
      <p className="font-mono text-xs tracking-widest uppercase">
        Kanga Archive
      </p>
      <h1
        lang="sw"
        className="font-display text-5xl leading-tight italic sm:text-7xl"
      >
        Haba na haba hujaza kibaba
      </h1>
      <p className="max-w-prose text-lg">
        Little by little fills the measure. An archive of kanga sayings is on
        its way.
      </p>
    </main>
  );
}
