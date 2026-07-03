import { describe, expect, it } from 'vitest';
import { computeTotal, formatINR, parseAmount } from '../currency';

describe('parseAmount', () => {
  it('parses numbers and blanks safely', () => {
    expect(parseAmount('100')).toBe(100);
    expect(parseAmount('')).toBe(0);
    expect(parseAmount('   ')).toBe(0);
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount('1,234.5')).toBe(1234.5);
  });
});

describe('formatINR', () => {
  it('uses Indian digit grouping', () => {
    expect(formatINR(123456.78)).toBe('₹1,23,456.78');
    expect(formatINR(1000)).toBe('₹1,000.00');
  });

  it('is safe against non-finite values', () => {
    expect(formatINR(NaN)).toBe('₹0.00');
  });
});

describe('computeTotal', () => {
  it('sums the price column', () => {
    expect(computeTotal([{ price: '100' }, { price: '250.5' }, { price: '' }])).toBe(350.5);
  });

  it('ignores blank and invalid prices', () => {
    expect(computeTotal([{ price: 'abc' }, { price: '  ' }])).toBe(0);
  });
});
