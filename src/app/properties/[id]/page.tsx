import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompareButton } from "@/components/compare-button";
import { PriceHistoryChart } from "@/components/charts";
import { InvestmentCalculator } from "@/components/investment-calculator";
import { MetricGrid } from "@/components/metric-grid";
import { grossYield, netYield } from "@/lib/calculations";
import { formatCompactINR, formatINR, formatNumber, formatPercent } from "@/lib/format";
import { getProperty, properties } from "@/lib/properties";

export function generateStaticParams() {
  return properties.map((property) => ({ id: property.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) return { title: "Listing" };
  return {
    title: property.name,
    description: `Sample listing in ${property.locality}, ${property.city}.`,
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getProperty(id);
  if (!property) notFound();

  const gross = grossYield(property.price, property.monthlyRent);
  const net = netYield(property.price, property.monthlyRent, property.occupancyRate, property.expenseRatio);

  return (
    <>
      <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <figure>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-forest">
            <Image
              src={property.image}
              alt={`${property.name} in ${property.locality}. Illustrative photograph, not the sample property.`}
              fill
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted">
            Illustrative photograph. Not a photo of this sample listing.
          </figcaption>
        </figure>
        <div>
          <nav className="text-sm text-muted">
            <Link href="/properties" className="hover:text-ink">
              Listings
            </Link>
            <span className="px-2">/</span>
            <span className="text-ink">{property.name}</span>
          </nav>
          <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-brass">{property.type}</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">{property.name}</h1>
          <p className="mt-2 text-base text-muted">
            {property.locality}, {property.city}
          </p>
          <p className="mt-4 text-sm leading-6 text-ink">
            {property.beds} bed · {property.baths} bath · {property.yearBuilt} · {property.furnishing}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Sample operating assumptions: occupancy {(property.occupancyRate * 100).toFixed(0)}%, expenses{" "}
            {(property.expenseRatio * 100).toFixed(0)}% of collected rent.
          </p>
          <div className="mt-5">
            <CompareButton id={property.id} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <MetricGrid
          columns={3}
          items={[
            { label: "Sample asking price", value: formatCompactINR(property.price) },
            { label: "Sample monthly rent", value: formatINR(property.monthlyRent) },
            { label: "Gross yield", value: formatPercent(gross), detail: "Asking rent, full occupancy" },
            { label: "Net yield", value: formatPercent(net), detail: "After vacancy and expenses" },
            { label: "Price / sq.ft", value: formatINR(property.price / property.areaSqft) },
            { label: "Area", value: `${formatNumber(property.areaSqft)} sq.ft` },
          ]}
        />
      </div>

      <section id="calculator" className="mt-12">
        <h2 className="font-serif text-3xl tracking-tight">Investment calculator</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Prefilled with this listing’s sample price, rent, occupancy, and expense ratio. Loan terms and growth
          rates are assumptions you can change.
        </p>
        <div className="mt-6">
          <InvestmentCalculator key={property.id} propertyId={property.id} />
        </div>
      </section>

      <section id="history" className="mt-12">
        <h2 className="font-serif text-3xl tracking-tight">Price history</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Sample asking-price path from 2019 to 2026. The 2026 figure is this listing’s price.
        </p>
        <div className="mt-4 h-80 rounded-lg border border-line bg-card p-4">
          <PriceHistoryChart history={property.priceHistory} />
        </div>
      </section>
    </>
  );
}
