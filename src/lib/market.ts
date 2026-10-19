import { grossYield, netYield } from "./calculations";
import { orderedCities, priceChange, pricePerSqft, properties } from "./properties";
import type { Property } from "./types";

export type CitySummary = {
  city: string;
  listings: number;
  averageYield: number;
  averageNetYield: number;
  averagePricePerSqft: number;
  averageAppreciation: number;
  index: { year: number; value: number }[];
};

export const CITY_COLORS: Record<string, string> = {
  Mumbai: "#17352c",
  "New Delhi": "#8d6840",
  Gurugram: "#3e5c76",
  Bengaluru: "#1f6b4a",
  Hyderabad: "#6b4f3a",
  Pune: "#8e3d34",
  Chennai: "#3f5e52",
  Ahmedabad: "#5c5346",
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function listingIndex(property: Property): { year: number; value: number }[] {
  const base = property.priceHistory[0]?.price ?? 0;
  return property.priceHistory.map((point) => ({
    year: point.year,
    value: base > 0 ? (point.price / base) * 100 : 0,
  }));
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  }
  return sorted[middle] ?? 0;
}

export function marketSnapshot(list: Property[] = properties) {
  return {
    listings: list.length,
    cities: new Set(list.map((property) => property.city)).size,
    medianYield: median(list.map((property) => grossYield(property.price, property.monthlyRent))),
    medianPricePerSqft: median(list.map(pricePerSqft)),
    medianAppreciation: median(list.map(priceChange)),
  };
}

export function citySummaries(list: Property[] = properties): CitySummary[] {
  return orderedCities(list).map((city) => {
    const rows = list.filter((property) => property.city === city);
    const series = rows.map(listingIndex);
    const index = (series[0] ?? []).map((point, pointIndex) => {
      const value =
        series.reduce((sum, row) => sum + (row[pointIndex]?.value ?? 0), 0) / series.length;
      return { year: point.year, value: Math.round(value * 10) / 10 };
    });

    return {
      city,
      listings: rows.length,
      averageYield: average(rows.map((property) => grossYield(property.price, property.monthlyRent))),
      averageNetYield: average(
        rows.map((property) =>
          netYield(property.price, property.monthlyRent, property.occupancyRate, property.expenseRatio),
        ),
      ),
      averagePricePerSqft: average(rows.map(pricePerSqft)),
      averageAppreciation: average(rows.map(priceChange)),
      index,
    };
  });
}

/** Equal weight per listing. 2019 = 100. */
export function nationalIndex(list: Property[] = properties): { year: number; value: number }[] {
  if (list.length === 0) return [];
  const series = list.map(listingIndex);
  return (series[0] ?? []).map((point, index) => {
    const value = series.reduce((sum, row) => sum + (row[index]?.value ?? 0), 0) / series.length;
    return { year: point.year, value: Math.round(value * 10) / 10 };
  });
}

export function rankCities(summaries: CitySummary[]) {
  const byYield = [...summaries].sort((a, b) => b.averageYield - a.averageYield);
  const byChange = [...summaries].sort((a, b) => b.averageAppreciation - a.averageAppreciation);
  return {
    yieldLeader: byYield[0],
    growthLeader: byChange[0],
  };
}
