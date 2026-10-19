import type { Metadata } from "next";
import { ListingBrowser } from "@/components/listing-browser";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Listings",
  description: "Search and filter the sample property listings.",
};

export default function ListingsPage() {
  return (
    <>
      <PageHeader
        title="Listings"
        description="Search the sample set by city, type, size, and gross yield. Prices and rents are sample figures."
      />
      <ListingBrowser />
    </>
  );
}
