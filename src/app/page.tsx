export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-24 sm:px-8">
      <p className="font-mono text-xs tracking-widest uppercase">
        Kanga Archive
      </p>
      <div className="border-olive border-y-8 py-2">
        <h1
          lang="sw"
          className="bg-wine font-display px-4 py-6 text-5xl leading-tight italic sm:px-8 sm:text-7xl"
        >
          Haba na haba hujaza kibaba
        </h1>
      </div>
      <p className="max-w-prose text-lg">
        Little by little fills the measure. An archive of kanga sayings is on
        its way.
      </p>
    </main>
  );
}
