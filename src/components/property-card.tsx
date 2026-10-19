import Image from "next/image";
import Link from "next/link";
import { CompareButton } from "@/components/compare-button";
import { grossYield } from "@/lib/calculations";
import { formatCompactINR, formatINR, formatNumber, formatPercent } from "@/lib/format";
import { pricePerSqft } from "@/lib/properties";
import type { Property } from "@/lib/types";

export function PropertyCard({ property }: { property: Property }) {
  const yieldValue = grossYield(property.price, property.monthlyRent);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-card">
      <div className="relative aspect-[16/10] bg-forest">
        <Image
          src={property.image}
          alt={`${property.name} in ${property.locality}. Illustrative photograph, not the sample property.`}
          fill
          sizes="(min-width: 1280px) 340px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
        <span className="num absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium text-forest">
          {formatPercent(yieldValue)} gross
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-brass">{property.type}</p>
        <h2 className="mt-1 font-serif text-2xl tracking-tight">
          <Link href={`/properties/${property.id}`} className="hover:text-forest">
            {property.name}
          </Link>
        </h2>
        <p className="mt-1 text-sm text-muted">
          {property.locality}, {property.city}
        </p>
        <p className="mt-3 text-sm text-ink">
          {property.beds} bed · {property.baths} bath · {formatNumber(property.areaSqft)} sq.ft
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="num font-serif text-2xl leading-none">{formatCompactINR(property.price)}</p>
          <p className="num text-right text-xs text-muted">
            {formatINR(pricePerSqft(property))}
            <span className="block">per sq.ft</span>
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <CompareButton id={property.id} compact />
          <Link
            href={`/properties/${property.id}`}
            className="text-sm text-forest underline-offset-4 hover:underline"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
