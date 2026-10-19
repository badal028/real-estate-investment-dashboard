import type { Metadata } from "next";
import { CompareView } from "@/components/compare-view";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare up to three sample listings side by side.",
};

export default function ComparePage() {
  return (
    <>
      <PageHeader
        title="Compare"
        description="Up to three listings, side by side. Cash-on-cash uses the same sample loan for each column: 20% down, 6% closing costs, 8.5% interest, 20 years."
      />
      <CompareView />
    </>
  );
}
