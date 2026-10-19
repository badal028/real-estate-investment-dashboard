const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const grouped = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return rupees.format(Math.round(value));
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return grouped.format(Math.round(value));
}

function trim(value: number): string {
  return value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export function formatCompactINR(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const amount = Math.abs(value);
  if (amount >= 1_00_00_000) return `${sign}₹${trim(amount / 1_00_00_000)} Cr`;
  if (amount >= 1_00_000) return `${sign}₹${trim(amount / 1_00_000)} L`;
  return formatINR(value);
}

export function formatPercent(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(digits)}%`;
}
