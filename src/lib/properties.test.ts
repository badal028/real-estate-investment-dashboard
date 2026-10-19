import assert from "node:assert/strict";
import { test } from "node:test";
import { grossYield } from "./calculations";
import { CITY_ORDER, properties } from "./properties";

test("sample listings stay internally consistent", () => {
  assert.equal(properties.length, 12);
  const ids = new Set(properties.map((property) => property.id));
  assert.equal(ids.size, properties.length);

  for (const property of properties) {
    assert.ok(CITY_ORDER.includes(property.city as (typeof CITY_ORDER)[number]));
    assert.ok(property.price > 0);
    assert.ok(property.monthlyRent > 0);
    assert.ok(property.areaSqft > 0);
    assert.ok(property.expenseRatio > 0 && property.expenseRatio < 0.8);
    assert.ok(property.occupancyRate > 0 && property.occupancyRate <= 1);
    assert.equal(property.priceHistory.length, 8);
    assert.equal(property.priceHistory[0]?.year, 2019);
    assert.equal(property.priceHistory[7]?.year, 2026);
    assert.equal(property.priceHistory[7]?.price, property.price);

    for (let index = 1; index < property.priceHistory.length; index += 1) {
      const current = property.priceHistory[index];
      const previous = property.priceHistory[index - 1];
      assert.ok(current && previous);
      assert.equal(current.year, previous.year + 1);
      assert.ok(current.price >= previous.price);
    }

    const yieldValue = grossYield(property.price, property.monthlyRent);
    assert.ok(yieldValue > 2 && yieldValue < 8, `${property.name} yield ${yieldValue}`);
  }
});
