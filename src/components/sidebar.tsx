"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCompare } from "@/components/compare-context";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/properties", label: "Listings" },
  { href: "/compare", label: "Compare" },
  { href: "/market", label: "Market" },
  { href: "/calculator", label: "Calculator" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const { ids } = useCompare();

  return (
    <aside className="bg-forest text-[#f4efe6] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-5 lg:pt-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-sm bg-[#d7c4a3] font-serif text-lg text-forest">
            M
          </span>
          <span>
            <span className="block font-serif text-xl leading-none">Meridian</span>
            <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-[#f4efe6]/70">
              Investment desk
            </span>
          </span>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:mt-6 lg:block lg:space-y-1 lg:overflow-visible lg:px-3 lg:pb-0">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                active ? "bg-[#f4efe6] font-medium text-forest" : "text-[#f4efe6]/80 hover:bg-white/10"
              }`}
            >
              {item.label}
              {item.href === "/compare" && ids.length > 0 ? (
                <span
                  className={`num ml-2 rounded-full px-1.5 text-xs ${
                    active ? "bg-forest text-[#f4efe6]" : "bg-[#d7c4a3] text-forest"
                  }`}
                >
                  {ids.length}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 p-5 lg:block">
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#d9c7a6]">Sample dataset</p>
        <p className="mt-2 text-sm leading-6 text-[#f4efe6]/80">
          12 fictional listings across 8 Indian metros. Prices, rents, and histories are sample figures.
        </p>
      </div>
    </aside>
  );
}
