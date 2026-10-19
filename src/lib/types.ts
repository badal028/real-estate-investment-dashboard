export type PropertyType = "Apartment" | "Villa" | "Independent House" | "Studio";

export type Furnishing = "Unfurnished" | "Semi-furnished" | "Furnished";

export type PricePoint = {
  year: number;
  price: number;
};

export type Property = {
  id: string;
  name: string;
  city: string;
  locality: string;
  type: PropertyType;
  /** Sample asking price, in rupees. */
  price: number;
  /** Sample monthly asking rent, in rupees. */
  monthlyRent: number;
  beds: number;
  baths: number;
  areaSqft: number;
  yearBuilt: number;
  furnishing: Furnishing;
  /** Share of collected rent. Sample operating assumption. */
  expenseRatio: number;
  /** Share of the year the home is occupied. Sample operating assumption. */
  occupancyRate: number;
  /** Forward annual price growth used to prefill the calculator. Not the historical change. */
  assumedAppreciation: number;
  priceHistory: PricePoint[];
  image: string;
};
