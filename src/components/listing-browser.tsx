"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PropertyCard } from "@/components/property-card";
import { useCompare } from "@/components/compare-context";
import { defaultFilters, filterProperties, type ListingFilters } from "@/lib/filters";
import { orderedCities, PROPERTY_TYPES, properties, getProperty } from "@/lib/properties";

const controlClass =
  "h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-forest";

const YIELD_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "4%+", value: 4 },
  { label: "4.5%+", value: 4.5 },
  { label: "5%+", value: 5 },
];

export function ListingBrowser() {
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters);
  const { ids, remove } = useCompare();
  const results = useMemo(() => filterProperties(properties, filters), [filters]);
  const selected = ids.map((id) => getProperty(id)).filter((property) => property !== undefined);
  const dirty =
    filters.query !== "" ||
    filters.city !== "all" ||
    filters.type !== "all" ||
    filters.minBeds !== 0 ||
    filters.minYield !== 0 ||
    filters.sort !== "yield-desc";

  function update(patch: Partial<ListingFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  return (
    <div className={selected.length > 0 ? "pb-24" : undefined}>
      <div className="rounded-lg border border-line bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">Search</span>
            <input
              value={filters.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder="Name, locality, or city"
              autoComplete="off"
              className={controlClass}
            />
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">City</span>
            <select
              value={filters.city}
              onChange={(event) => update({ city: event.target.value })}
              className={controlClass}
            >
              <option value="all">All cities</option>
              {orderedCities().map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">Type</span>
            <select
              value={filters.type}
              onChange={(event) => update({ type: event.target.value })}
              className={controlClass}
            >
              <option value="all">All types</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted">Sort</span>
            <select
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value as ListingFilters["sort"] })}
              className={controlClass}
            >
              <option value="yield-desc">Highest gross yield</option>
              <option value="price-asc">Lowest price</option>
              <option value="price-desc">Highest price</option>
              <option value="psf-asc">Lowest price / sq.ft</option>
              <option value="change-desc">Highest 2019–2026 change</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-muted">Beds</span>
          {[
            { label: "Any", value: 0 },
            { label: "2+", value: 2 },
            { label: "3+", value: 3 },
            { label: "4+", value: 4 },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={filters.minBeds === option.value}
              onClick={() => update({ minBeds: option.value })}
              className={`rounded-full px-3 py-1 text-sm ${
                filters.minBeds === option.value ? "bg-forest text-[#f4efe6]" : "bg-paper text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
          <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-muted">Min gross yield</span>
          <span className="contents" role="group" aria-label="Minimum gross yield">
            {YIELD_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={filters.minYield === option.value}
                onClick={() => update({ minYield: option.value })}
                className={`rounded-full px-3 py-1 text-sm ${
                  filters.minYield === option.value ? "bg-forest text-[#f4efe6]" : "bg-paper text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted">
        <p>
          Showing {results.length} of {properties.length} sample listings
        </p>
        {dirty ? (
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="text-forest underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line px-6 py-14 text-center">
          <p className="font-serif text-3xl">No listings match</p>
          <p className="mt-2 text-sm text-muted">The sample set has 12 homes. Clear a filter to see them.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {selected.length > 0 ? (
        <div className="fixed inset-x-4 bottom-4 z-20 flex items-center gap-3 rounded-lg border border-line bg-card/95 px-3 py-3 shadow-[0_12px_40px_rgba(23,53,44,0.14)] lg:left-[272px] lg:right-8">
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            {selected.map((property) => (
              <span
                key={property.id}
                className="inline-flex shrink-0 items-center gap-2 rounded-md bg-paper px-2 py-1 text-sm"
              >
                {property.name}
                <button
                  type="button"
                  onClick={() => remove(property.id)}
                  aria-label={`Remove ${property.name}`}
                  className="text-muted hover:text-ink"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {selected.length < 2 ? (
            <span className="shrink-0 text-sm text-muted">Add one more</span>
          ) : (
            <Link
              href="/compare"
              className="shrink-0 rounded-md bg-forest px-4 py-2 text-sm text-[#f4efe6]"
            >
              Compare {selected.length}
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
