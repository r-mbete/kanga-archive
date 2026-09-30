/** The saying set as a band across the cloth, between two rows of spots, opening from one edge on load. */
export function JinaBand({
  children,
  as: Heading = "h1",
  size = "text-4xl sm:text-6xl",
}: {
  children: React.ReactNode;
  as?: "h1" | "p";
  size?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden="true" className="spot-rule animate-unfurl" />
      <Heading
        lang="sw"
        className={`animate-unfurl bg-shell text-indigo font-display px-4 py-6 leading-tight italic sm:px-8 ${size}`}
      >
        {children}
      </Heading>
      <div aria-hidden="true" className="spot-rule animate-unfurl" />
    </div>
  );
}
