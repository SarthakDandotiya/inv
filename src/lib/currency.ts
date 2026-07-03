/**
 * Parse a raw input string into a finite number, or 0 when blank/invalid.
 * Keeps line-amount math safe against empty or partially-typed values.
 */
export function parseAmount(value: string): number {
  if (value == null) return 0;
  const trimmed = String(value).trim();
  if (trimmed === '') return 0;
  const n = Number(trimmed.replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as INR with Indian digit grouping, e.g. ₹1,23,456.78. */
export function formatINR(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return inrFormatter.format(safe);
}

/**
 * The invoice Total sits at the bottom of the Price column, so it is the sum of
 * the Price entries. Quantity is a descriptive field and does not affect the total.
 */
export function computeTotal(items: { price: string }[]): number {
  return items.reduce((sum, it) => sum + parseAmount(it.price), 0);
}
