"use client";

import Link from "next/link";
import { YieldCompareChart } from "@/components/charts";
import { useCompare } from "@/components/compare-context";
import {
  DEFAULT_FINANCING,
  evaluateInvestment,
  grossYield,
  netYield,
} from "@/lib/calculations";
import { formatCompactINR, formatINR, formatNumber, formatPercent } from "@/lib/format";
import { getProperty, priceChange, pricePerSqft } from "@/lib/properties";
import type { Property } from "@/lib/types";

function bestFlags(values: number[], direction: "high" | "low"): boolean[] {
  if (values.length === 0) return [];
  const target = direction === "high" ? Math.max(...values) : Math.min(...values);
  const flags = values.map((value) => Math.abs(value - target) < 1e-6);
  if (flags.every(Boolean)) return flags.map(() => false);
  return flags;
}

function analyze(property: Property) {
  return evaluateInvestment({
    purchasePrice: property.price,
    monthlyRent: property.monthlyRent,
    expenseRatio: property.expenseRatio,
    occupancyRate: property.occupancyRate,
    appreciationRate: property.assumedAppreciation,
    downPaymentPercent: DEFAULT_FINANCING.downPaymentPercent,
    closingCostPercent: DEFAULT_FINANCING.closingCostPercent,
    annualInterestRate: DEFAULT_FINANCING.annualInterestRate,
    loanYears: DEFAULT_FINANCING.loanYears,
    rentGrowthRate: DEFAULT_FINANCING.rentGrowthRate,
    holdingYears: DEFAULT_FINANCING.holdingYears,
  });
}

export function CompareView() {
  const { ids, remove, clear } = useCompare();
  const selected = ids.map((id) => getProperty(id)).filter((property) => property !== undefined);

  if (selected.length < 2) {
    return (
      <div className="rounded-lg border border-dashed border-line px-6 py-14">
        <p className="font-serif text-3xl tracking-tight">Pick two listings</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted">
          Add homes from the listings. The comparison holds three and uses one sample loan for every column.
        </p>
        {selected[0] ? (
          <p className="mt-4 text-sm text-ink">{selected[0].name} is selected. Add one more.</p>
        ) : null}
        <Link
          href="/properties"
          className="mt-6 inline-flex rounded-md bg-forest px-4 py-2 text-sm text-[#f4efe6]"
        >
          Browse listings
        </Link>
      </div>
    );
  }

  const columns = selected.map((property) => ({
    property,
    gross: grossYield(property.price, property.monthlyRent),
    net: netYield(property.price, property.monthlyRent, property.occupancyRate, property.expenseRatio),
    psf: pricePerSqft(property),
    change: priceChange(property),
    result: analyze(property),
  }));

  const rows: { label: string; values: string[]; best?: boolean[] }[] = [
    {
      label: "Asking price",
      values: columns.map((column) => formatCompactINR(column.property.price)),
    },
    {
      label: "Monthly rent",
      values: columns.map((column) => formatINR(column.property.monthlyRent)),
    },
    {
      label: "Area",
      values: columns.map((column) => `${formatNumber(column.property.areaSqft)} sq.ft`),
    },
    {
      label: "Price / sq.ft",
      values: columns.map((column) => formatINR(column.psf)),
      best: bestFlags(
        columns.map((column) => column.psf),
        "low",
      ),
    },
    {
      label: "Configuration",
      values: columns.map((column) => `${column.property.beds} bed · ${column.property.baths} bath`),
    },
    {
      label: "Year built",
      values: columns.map((column) => String(column.property.yearBuilt)),
    },
    {
      label: "Furnishing",
      values: columns.map((column) => column.property.furnishing),
    },
    {
      label: "Gross yield",
      values: columns.map((column) => formatPercent(column.gross)),
      best: bestFlags(
        columns.map((column) => column.gross),
        "high",
      ),
    },
    {
      label: "Net yield",
      values: columns.map((column) => formatPercent(column.net)),
      best: bestFlags(
        columns.map((column) => column.net),
        "high",
      ),
    },
    {
      label: "Cash-on-cash",
      values: columns.map((column) =>
        column.result.cashOnCash === null ? "—" : formatPercent(column.result.cashOnCash),
      ),
      best: bestFlags(
        columns.map((column) => column.result.cashOnCash ?? Number.NEGATIVE_INFINITY),
        "high",
      ),
    },
    {
      label: "Price change, 2019–2026",
      values: columns.map((column) => formatPercent(column.change, 1)),
      best: bestFlags(
        columns.map((column) => column.change),
        "high",
      ),
    },
    {
      label: "Assumed appreciation",
      values: columns.map((column) => formatPercent(column.property.assumedAppreciation, 1)),
    },
  ];

  const chartRows = columns.map((column) => ({
    name: column.property.locality,
    gross: Number(column.gross.toFixed(2)),
    net: Number(column.net.toFixed(2)),
  }));

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button type="button" onClick={clear} className="text-sm text-muted hover:text-ink">
          Clear comparison
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 z-10 bg-card px-4 py-4 text-left font-medium text-muted">Metric</th>
              {columns.map((column) => (
                <th key={column.property.id} className="min-w-48 px-4 py-4 text-left align-top font-normal">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-brass">{column.property.city}</p>
                  <Link
                    href={`/properties/${column.property.id}`}
                    className="mt-1 block font-serif text-xl tracking-tight text-ink hover:text-forest"
                  >
                    {column.property.name}
                  </Link>
                  <p className="mt-1 text-xs text-muted">{column.property.locality}</p>
                  <button
                    type="button"
                    onClick={() => remove(column.property.id)}
                    className="mt-3 text-xs text-muted hover:text-ink"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line/80">
                <th className="sticky left-0 z-10 bg-card px-4 py-3 text-left font-medium text-ink">
                  {row.label}
                </th>
                {row.values.map((value, index) => {
                  const best = row.best?.[index] ?? false;
                  return (
                    <td
                      key={`${row.label}-${columns[index]?.property.id}`}
                      className={`num px-4 py-3 ${best ? "bg-canopy font-medium text-forest" : "text-ink"}`}
                    >
                      {value}
                      {best ? <span className="ml-2 text-[10px] uppercase tracking-[0.12em]">Best</span> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Cash-on-cash uses a common sample loan: {DEFAULT_FINANCING.downPaymentPercent}% down,{" "}
        {DEFAULT_FINANCING.closingCostPercent}% closing costs, {DEFAULT_FINANCING.annualInterestRate}% interest,{" "}
        {DEFAULT_FINANCING.loanYears} years. Expense ratio and occupancy stay with each listing. Assumed
        appreciation is a forward input, so it is not marked best.
      </p>
      <section className="mt-8 rounded-lg border border-line bg-card p-4 sm:p-5">
        <h2 className="font-serif text-2xl tracking-tight">Yield</h2>
        <p className="mt-1 text-sm text-muted">Gross yield ignores vacancy. Net yield uses the sample operating assumptions.</p>
        <div className="mt-4 h-72 min-w-0">
          <YieldCompareChart rows={chartRows} />
        </div>
      </section>
    </div>
  );
}
