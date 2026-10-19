import { formatINR, formatPercent } from "@/lib/format";
import type { CitySummary } from "@/lib/market";

export function CityTable({ rows }: { rows: CitySummary[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="mb-3 text-left text-sm text-muted">
          Equal weight per sample listing. Net yield uses each listing’s occupancy and expense ratio.
        </caption>
        <thead>
          <tr className="border-b border-line text-[11px] uppercase tracking-[0.14em] text-muted">
            <th className="py-3 pr-4 font-medium">City</th>
            <th className="py-3 pr-4 text-right font-medium">Listings</th>
            <th className="py-3 pr-4 text-right font-medium">Avg gross yield</th>
            <th className="py-3 pr-4 text-right font-medium">Avg net yield</th>
            <th className="py-3 pr-4 text-right font-medium">Avg price / sq.ft</th>
            <th className="py-3 text-right font-medium">Avg price change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.city} className="border-b border-line/80">
              <th className="py-3 pr-4 font-medium text-ink">{row.city}</th>
              <td className="num py-3 pr-4 text-right">{row.listings}</td>
              <td className="num py-3 pr-4 text-right">{formatPercent(row.averageYield)}</td>
              <td className="num py-3 pr-4 text-right">{formatPercent(row.averageNetYield)}</td>
              <td className="num py-3 pr-4 text-right">{formatINR(row.averagePricePerSqft)}</td>
              <td className="num py-3 text-right">{formatPercent(row.averageAppreciation, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
