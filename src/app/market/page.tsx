import type { Metadata } from "next";
import { CityBarChart, CityIndexChart } from "@/components/charts";
import { CityTable } from "@/components/city-table";
import { PageHeader } from "@/components/page-header";
import { formatPercent } from "@/lib/format";
import { citySummaries, rankCities } from "@/lib/market";

export const metadata: Metadata = {
  title: "Market",
  description: "Sample price index and yields built from the demo listings.",
};

function countLabel(count: number) {
  return count === 1 ? "1 sample listing" : `${count} sample listings`;
}

export default function MarketPage() {
  const summaries = citySummaries();
  const { yieldLeader, growthLeader } = rankCities(summaries);

  return (
    <>
      <PageHeader
        title="Market"
        description="Price index and yields built only from the sample listings. 2019 = 100. Each listing has equal weight. A city with one listing is not a market."
      />

      {yieldLeader && growthLeader ? (
        <div className="mb-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          <div className="bg-card p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Highest average yield</p>
            <p className="num mt-2 font-serif text-4xl tracking-tight">{formatPercent(yieldLeader.averageYield)}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {yieldLeader.city}, from {countLabel(yieldLeader.listings)}.
            </p>
          </div>
          <div className="bg-card p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Strongest price change</p>
            <p className="num mt-2 font-serif text-4xl tracking-tight">
              {formatPercent(growthLeader.averageAppreciation, 1)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {growthLeader.city}, 2019 to 2026, average of {countLabel(growthLeader.listings)}.
            </p>
          </div>
        </div>
      ) : null}

      <section className="rounded-lg border border-line bg-card p-4 sm:p-5">
        <h2 className="font-serif text-2xl tracking-tight">Price index by city</h2>
        <p className="mt-1 text-sm text-muted">
          Each line is the average of that city’s listing indexes. The brass line is 2019.
        </p>
        <div className="mt-4 h-80 min-w-0">
          <CityIndexChart summaries={summaries} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-card p-4 sm:p-5">
          <h2 className="font-serif text-2xl tracking-tight">Average gross yield</h2>
          <p className="mt-1 text-sm text-muted">Asking rent divided by price. Vacancy is not included.</p>
          <div className="mt-4 h-80 min-w-0">
            <CityBarChart
              summaries={summaries}
              dataKey="averageYield"
              label="Gross yield"
              color="#17352c"
              format="percent"
            />
          </div>
        </section>
        <section className="rounded-lg border border-line bg-card p-4 sm:p-5">
          <h2 className="font-serif text-2xl tracking-tight">Average price / sq.ft</h2>
          <p className="mt-1 text-sm text-muted">Sample asking price divided by area.</p>
          <div className="mt-4 h-80 min-w-0">
            <CityBarChart
              summaries={summaries}
              dataKey="averagePricePerSqft"
              label="Price / sq.ft"
              color="#8d6840"
              format="inr"
            />
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 font-serif text-2xl tracking-tight">Figures behind the charts</h2>
        <CityTable rows={summaries} />
      </section>
    </>
  );
}
