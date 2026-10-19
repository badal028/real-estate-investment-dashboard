export function PageHeader({
  kicker = "Sample data",
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8 max-w-3xl">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-brass">{kicker}</p>
      <h1 className="mt-2 font-serif text-[2.5rem] leading-none tracking-tight text-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
    </header>
  );
}
