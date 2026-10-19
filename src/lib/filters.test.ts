import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultFilters, filterProperties } from "./filters";
import { properties } from "./properties";

test("search, city, yield, and price sort narrow the sample set", () => {
  const bandra = filterProperties(properties, { ...defaultFilters, query: "bandra" });
  assert.deepEqual(
    bandra.map((property) => property.id),
    ["bandra-court"],
  );

  const mumbai = filterProperties(properties, { ...defaultFilters, city: "Mumbai" });
  assert.equal(mumbai.length, 2);

  const highYield = filterProperties(properties, { ...defaultFilters, minYield: 5 });
  assert.deepEqual(
    highYield.map((property) => property.id),
    ["baner-studio"],
  );

  const cheapest = filterProperties(properties, { ...defaultFilters, sort: "price-asc" });
  assert.equal(cheapest[0]?.id, "baner-studio");
});
