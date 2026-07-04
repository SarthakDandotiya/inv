// Converts amounts to words using the Indian numbering system
// (thousand / lakh / crore) for use as "amount in words" on invoices.

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/** 0–99 → words, hyphenating compound numbers (e.g. 78 → "Seventy-Eight"). */
function twoDigit(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens];
}

/** 0–999 → words (with "Hundred"). */
function threeDigit(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigit(rest));
  return parts.join(' ');
}

/** Non-negative integer → Indian-system words. */
export function integerToIndianWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'Zero';

  let remaining = n;
  const crore = Math.floor(remaining / 10_000_000);
  remaining %= 10_000_000;
  const lakh = Math.floor(remaining / 100_000);
  remaining %= 100_000;
  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;
  const hundred = remaining;

  const parts: string[] = [];
  // Crore group can itself exceed 99 (e.g. 150 crore), so recurse.
  if (crore) parts.push(`${integerToIndianWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigit(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigit(thousand)} Thousand`);
  if (hundred) parts.push(threeDigit(hundred));
  return parts.join(' ');
}

/**
 * Format an INR amount in words, e.g.
 * 5000 → "Five Thousand Rupees Only",
 * 123456.78 → "One Lakh Twenty-Three Thousand Four Hundred Fifty-Six Rupees and Seventy-Eight Paise Only".
 */
export function numberToIndianWords(amount: number): string {
  const value = Math.round((Number(amount) || 0) * 100) / 100;
  const negative = value < 0;
  const abs = Math.abs(value);

  let rupees = Math.floor(abs);
  let paise = Math.round((abs - rupees) * 100);
  if (paise === 100) {
    rupees += 1;
    paise = 0;
  }

  let result = `${integerToIndianWords(rupees)} Rupees`;
  if (paise > 0) result += ` and ${twoDigit(paise)} Paise`;
  result += ' Only';
  if (negative) result = `Minus ${result}`;
  return result;
}
