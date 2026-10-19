export function MetricGrid({
  items,
  columns = 4,
}: {
  items: { label: string; value: string; detail?: string }[];
  columns?: 3 | 4;
}) {
  const layout = columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <dl className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line ${layout}`}>
      {items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-4">
          <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{item.label}</dt>
          <dd className="num mt-2 font-serif text-2xl tracking-tight text-ink sm:text-3xl">{item.value}</dd>
          {item.detail ? <p className="mt-1 text-xs leading-5 text-muted">{item.detail}</p> : null}
        </div>
      ))}
    </dl>
  );
}
