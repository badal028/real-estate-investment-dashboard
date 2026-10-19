import Link from "next/link";
import { CityTable } from "@/components/city-table";
import { NationalIndexChart } from "@/components/charts";
import { MetricGrid } from "@/components/metric-grid";
import { PageHeader } from "@/components/page-header";
import { PropertyCard } from "@/components/property-card";
import { grossYield } from "@/lib/calculations";
import { formatINR, formatPercent } from "@/lib/format";
import { citySummaries, marketSnapshot, nationalIndex } from "@/lib/market";
import { properties } from "@/lib/properties";

export default function OverviewPage() {
  const snapshot = marketSnapshot();
  const index = nationalIndex();
  const summaries = citySummaries();
  const featured = [...properties]
    .sort((a, b) => grossYield(b.price, b.monthlyRent) - grossYield(a.price, a.monthlyRent))
    .slice(0, 3);

  return (
    <>
      <PageHeader
        title="Market snapshot"
        description="Twelve fictional homes across eight Indian metros. Prices, rents, and the price history are sample figures, so the yield and return maths can be checked."
      />
      <MetricGrid
        items={[
          { label: "Listings", value: String(snapshot.listings), detail: `${snapshot.cities} metros` },
          { label: "Median gross yield", value: formatPercent(snapshot.medianYield), detail: "Asking rent, no vacancy" },
          { label: "Median price / sq.ft", value: formatINR(snapshot.medianPricePerSqft), detail: "Sample asking prices" },
          {
            label: "Median price change",
            value: formatPercent(snapshot.medianAppreciation, 1),
            detail: "2019–2026, sample paths",
          },
        ]}
      />

      <section className="mt-10 rounded-lg border border-line bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Sample price index</h2>
            <p className="mt-1 text-sm text-muted">2019 = 100. Each of the 12 listings has equal weight.</p>
          </div>
          <Link href="/market" className="text-sm text-forest underline-offset-4 hover:underline">
            City charts
          </Link>
        </div>
        <div className="mt-4 h-72 min-w-0">
          <NationalIndexChart data={index} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl tracking-tight">By city</h2>
        <div className="mt-4">
          <CityTable rows={summaries} />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-serif text-2xl tracking-tight">Highest gross yield</h2>
          <Link href="/properties" className="text-sm text-forest underline-offset-4 hover:underline">
            All listings
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </section>
    </>
  );
}
