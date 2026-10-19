import { grossYield } from "./calculations";
import { priceChange, pricePerSqft } from "./properties";
import type { Property } from "./types";

export type SortKey = "yield-desc" | "price-asc" | "price-desc" | "psf-asc" | "change-desc";

export type ListingFilters = {
  query: string;
  city: string;
  type: string;
  minBeds: number;
  minYield: number;
  sort: SortKey;
};

export const defaultFilters: ListingFilters = {
  query: "",
  city: "all",
  type: "all",
  minBeds: 0,
  minYield: 0,
  sort: "yield-desc",
};

export function filterProperties(list: Property[], filters: ListingFilters): Property[] {
  const query = filters.query.trim().toLowerCase();

  const matched = list.filter((property) => {
    if (query) {
      const haystack = `${property.name} ${property.locality} ${property.city}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.city !== "all" && property.city !== filters.city) return false;
    if (filters.type !== "all" && property.type !== filters.type) return false;
    if (property.beds < filters.minBeds) return false;
    if (grossYield(property.price, property.monthlyRent) < filters.minYield) return false;
    return true;
  });

  return matched.sort((a, b) => compare(a, b, filters.sort));
}

function compare(a: Property, b: Property, sort: SortKey): number {
  switch (sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "psf-asc":
      return pricePerSqft(a) - pricePerSqft(b);
    case "change-desc":
      return priceChange(b) - priceChange(a);
    case "yield-desc":
      return grossYield(b.price, b.monthlyRent) - grossYield(a.price, a.monthlyRent);
  }
}
