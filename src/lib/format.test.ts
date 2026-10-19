import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCompactINR, formatINR, formatPercent } from "./format";

test("formats crores and lakhs", () => {
  assert.equal(formatCompactINR(4_85_00_000), "₹4.85 Cr");
  assert.equal(formatCompactINR(62_00_000), "₹62 L");
  assert.equal(formatCompactINR(-2_50_000), "-₹2.5 L");
  assert.equal(formatCompactINR(1_00_00_000), "₹1 Cr");
});

test("formats rupees and percents", () => {
  const formatted = formatINR(1500);
  assert.ok(formatted.includes("1,500"));
  assert.ok(formatted.includes("₹") || formatted.includes("INR"));
  assert.equal(formatPercent(4.256), "4.26%");
  assert.equal(formatPercent(Number.NaN), "—");
});
