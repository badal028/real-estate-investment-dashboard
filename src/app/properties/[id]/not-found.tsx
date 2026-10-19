import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <div className="max-w-lg">
      <p className="text-[11px] uppercase tracking-[0.18em] text-brass">Sample data</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">That listing is not in the sample</h1>
      <p className="mt-3 text-muted">The dashboard only includes the 12 fictional properties.</p>
      <Link href="/properties" className="mt-6 inline-block text-sm text-forest underline-offset-4 hover:underline">
        Back to listings
      </Link>
    </div>
  );
}
