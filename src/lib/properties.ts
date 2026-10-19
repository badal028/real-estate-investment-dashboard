import type { PricePoint, Property } from "./types";

/**
 * Fictional listings for the demo.
 * Prices, rents, expenses, occupancy, and the price history are sample figures.
 */

export const CITY_ORDER = [
  "Mumbai",
  "New Delhi",
  "Gurugram",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Ahmedabad",
] as const;

const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;

function history(endPrice: number, growth: readonly number[]): PricePoint[] {
  if (growth.length !== YEARS.length - 1) {
    throw new Error("Price history needs one growth rate between each year.");
  }

  const prices = new Array<number>(YEARS.length);
  prices[YEARS.length - 1] = endPrice;
  for (let index = YEARS.length - 2; index >= 0; index -= 1) {
    const previous = prices[index + 1] / (1 + growth[index]);
    prices[index] = Math.round(previous / 10_000) * 10_000;
  }
  prices[YEARS.length - 1] = endPrice;

  return YEARS.map((year, index) => ({ year, price: prices[index] }));
}

function listing(
  input: Omit<Property, "priceHistory" | "image"> & { growth: readonly number[] },
): Property {
  const { growth, ...property } = input;
  return {
    ...property,
    image: `/properties/${property.id}.jpg`,
    priceHistory: history(property.price, growth),
  };
}

export const properties: Property[] = [
  listing({
    id: "bandra-court",
    name: "Bandra Court",
    city: "Mumbai",
    locality: "Bandra West",
    type: "Apartment",
    price: 4_85_00_000,
    monthlyRent: 1_72_000,
    beds: 3,
    baths: 3,
    areaSqft: 1420,
    yearBuilt: 2016,
    furnishing: "Furnished",
    expenseRatio: 0.18,
    occupancyRate: 0.96,
    assumedAppreciation: 5,
    growth: [0.03, 0.015, 0.055, 0.07, 0.06, 0.045, 0.04],
  }),
  listing({
    id: "worli-crest",
    name: "Worli Crest",
    city: "Mumbai",
    locality: "Worli",
    type: "Apartment",
    price: 3_40_00_000,
    monthlyRent: 1_28_000,
    beds: 2,
    baths: 2,
    areaSqft: 980,
    yearBuilt: 2019,
    furnishing: "Semi-furnished",
    expenseRatio: 0.18,
    occupancyRate: 0.95,
    assumedAppreciation: 5,
    growth: [0.035, 0.02, 0.06, 0.075, 0.065, 0.05, 0.04],
  }),
  listing({
    id: "gk-two",
    name: "GK II Apartment",
    city: "New Delhi",
    locality: "Greater Kailash II",
    type: "Apartment",
    price: 3_65_00_000,
    monthlyRent: 1_15_000,
    beds: 3,
    baths: 3,
    areaSqft: 1750,
    yearBuilt: 2012,
    furnishing: "Unfurnished",
    expenseRatio: 0.19,
    occupancyRate: 0.95,
    assumedAppreciation: 4.5,
    growth: [0.02, 0, 0.04, 0.05, 0.045, 0.04, 0.03],
  }),
  listing({
    id: "apex-golf",
    name: "Apex Golf Apartment",
    city: "Gurugram",
    locality: "Golf Course Road",
    type: "Apartment",
    price: 2_95_00_000,
    monthlyRent: 98_000,
    beds: 3,
    baths: 3,
    areaSqft: 1890,
    yearBuilt: 2019,
    furnishing: "Semi-furnished",
    expenseRatio: 0.18,
    occupancyRate: 0.95,
    assumedAppreciation: 6,
    growth: [0.03, 0.01, 0.07, 0.09, 0.08, 0.05, 0.04],
  }),
  listing({
    id: "whitefield-grove",
    name: "Whitefield Grove",
    city: "Bengaluru",
    locality: "Whitefield",
    type: "Apartment",
    price: 1_72_00_000,
    monthlyRent: 62_000,
    beds: 3,
    baths: 3,
    areaSqft: 1640,
    yearBuilt: 2021,
    furnishing: "Semi-furnished",
    expenseRatio: 0.17,
    occupancyRate: 0.96,
    assumedAppreciation: 7,
    growth: [0.04, 0.02, 0.09, 0.11, 0.08, 0.06, 0.05],
  }),
  listing({
    id: "indiranagar-house",
    name: "Indiranagar House",
    city: "Bengaluru",
    locality: "Indiranagar",
    type: "Independent House",
    price: 3_95_00_000,
    monthlyRent: 1_35_000,
    beds: 4,
    baths: 4,
    areaSqft: 2800,
    yearBuilt: 2008,
    furnishing: "Semi-furnished",
    expenseRatio: 0.22,
    occupancyRate: 0.95,
    assumedAppreciation: 6.5,
    growth: [0.035, 0.015, 0.08, 0.1, 0.075, 0.055, 0.045],
  }),
  listing({
    id: "gachibowli-heights",
    name: "Gachibowli Heights",
    city: "Hyderabad",
    locality: "Gachibowli",
    type: "Apartment",
    price: 1_48_00_000,
    monthlyRent: 58_000,
    beds: 3,
    baths: 3,
    areaSqft: 1690,
    yearBuilt: 2020,
    furnishing: "Semi-furnished",
    expenseRatio: 0.17,
    occupancyRate: 0.96,
    assumedAppreciation: 6.5,
    growth: [0.035, 0.02, 0.08, 0.1, 0.09, 0.06, 0.05],
  }),
  listing({
    id: "jubilee-villa",
    name: "Jubilee Villa",
    city: "Hyderabad",
    locality: "Jubilee Hills",
    type: "Villa",
    price: 4_20_00_000,
    monthlyRent: 1_25_000,
    beds: 4,
    baths: 4,
    areaSqft: 3200,
    yearBuilt: 2014,
    furnishing: "Furnished",
    expenseRatio: 0.24,
    occupancyRate: 0.93,
    assumedAppreciation: 6,
    growth: [0.03, 0.015, 0.07, 0.09, 0.08, 0.05, 0.04],
  }),
  listing({
    id: "kalyani-residency",
    name: "Kalyani Residency",
    city: "Pune",
    locality: "Kalyani Nagar",
    type: "Apartment",
    price: 1_86_00_000,
    monthlyRent: 68_000,
    beds: 3,
    baths: 3,
    areaSqft: 1580,
    yearBuilt: 2018,
    furnishing: "Semi-furnished",
    expenseRatio: 0.18,
    occupancyRate: 0.96,
    assumedAppreciation: 6,
    growth: [0.03, 0.015, 0.07, 0.08, 0.07, 0.05, 0.045],
  }),
  listing({
    id: "baner-studio",
    name: "Baner Studio",
    city: "Pune",
    locality: "Baner",
    type: "Studio",
    price: 62_00_000,
    monthlyRent: 28_000,
    beds: 1,
    baths: 1,
    areaSqft: 540,
    yearBuilt: 2022,
    furnishing: "Furnished",
    expenseRatio: 0.16,
    occupancyRate: 0.9,
    assumedAppreciation: 6,
    growth: [0.03, 0.02, 0.08, 0.09, 0.07, 0.055, 0.05],
  }),
  listing({
    id: "adyar-house",
    name: "Adyar House",
    city: "Chennai",
    locality: "Adyar",
    type: "Independent House",
    price: 2_40_00_000,
    monthlyRent: 78_000,
    beds: 4,
    baths: 4,
    areaSqft: 2400,
    yearBuilt: 2004,
    furnishing: "Unfurnished",
    expenseRatio: 0.22,
    occupancyRate: 0.95,
    assumedAppreciation: 5,
    growth: [0.025, 0.01, 0.05, 0.06, 0.055, 0.04, 0.035],
  }),
  listing({
    id: "sg-highway",
    name: "SG Highway Flat",
    city: "Ahmedabad",
    locality: "SG Highway",
    type: "Apartment",
    price: 88_00_000,
    monthlyRent: 36_000,
    beds: 2,
    baths: 2,
    areaSqft: 1180,
    yearBuilt: 2021,
    furnishing: "Semi-furnished",
    expenseRatio: 0.17,
    occupancyRate: 0.96,
    assumedAppreciation: 5.5,
    growth: [0.03, 0.015, 0.06, 0.07, 0.06, 0.05, 0.04],
  }),
];

export const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Studio"] as const;

export function getProperty(id: string): Property | undefined {
  return properties.find((property) => property.id === id);
}

export function orderedCities(list: Property[] = properties): string[] {
  const present = new Set(list.map((property) => property.city));
  return CITY_ORDER.filter((city) => present.has(city));
}

export function pricePerSqft(property: Property): number {
  if (property.areaSqft <= 0) return 0;
  return property.price / property.areaSqft;
}

/** Sample price change from the first history year to the listing price. */
export function priceChange(property: Property): number {
  const first = property.priceHistory[0]?.price ?? 0;
  const last = property.priceHistory[property.priceHistory.length - 1]?.price ?? 0;
  if (first <= 0) return 0;
  return (last / first - 1) * 100;
}
