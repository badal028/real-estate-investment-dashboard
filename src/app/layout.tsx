import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { Suspense } from "react";
import { CompareProvider } from "@/components/compare-context";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600"],
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meridian | Real Estate Investment Dashboard",
    template: "%s · Meridian",
  },
  description:
    "Sample real estate investment and market intelligence dashboard with listings, comparison, a yield calculator, and price charts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full" suppressHydrationWarning>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-30 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <CompareProvider>
          <div className="min-h-screen lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
            <Suspense fallback={<div className="h-[4.5rem] bg-forest lg:h-screen" />}>
              <Sidebar />
            </Suspense>
            <div className="min-w-0">
              <main
                id="content"
                className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10"
              >
                {children}
              </main>
              <footer className="mx-auto w-full max-w-[1120px] px-4 pb-10 text-xs leading-5 text-muted sm:px-6 lg:px-10">
                Sample figures for demonstration. Not a valuation and not investment advice.
              </footer>
            </div>
          </div>
        </CompareProvider>
      </body>
    </html>
  );
}
