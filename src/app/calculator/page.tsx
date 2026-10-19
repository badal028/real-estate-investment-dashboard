import type { Metadata } from "next";
import { InvestmentCalculator } from "@/components/investment-calculator";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Calculator",
  description: "Rental yield, cash-on-cash, and hold-period IRR on sample property figures.",
};

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="Calculator"
        description="Gross yield, net yield, cash-on-cash, and an IRR over the holding period. The form starts from a sample listing. Change the assumptions and the results update."
      />
      <InvestmentCalculator propertyId="baner-studio" allowPropertyChange />
    </>
  );
}
