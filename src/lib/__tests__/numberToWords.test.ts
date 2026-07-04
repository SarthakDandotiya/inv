import { describe, expect, it } from 'vitest';
import { integerToIndianWords, numberToIndianWords } from '../numberToWords';

describe('integerToIndianWords', () => {
  it('handles zero', () => {
    expect(integerToIndianWords(0)).toBe('Zero');
  });

  it('handles units and teens', () => {
    expect(integerToIndianWords(7)).toBe('Seven');
    expect(integerToIndianWords(15)).toBe('Fifteen');
  });

  it('hyphenates compound tens', () => {
    expect(integerToIndianWords(78)).toBe('Seventy-Eight');
    expect(integerToIndianWords(40)).toBe('Forty');
  });

  it('handles hundreds', () => {
    expect(integerToIndianWords(100)).toBe('One Hundred');
    expect(integerToIndianWords(456)).toBe('Four Hundred Fifty-Six');
  });

  it('handles thousands and lakhs (Indian grouping)', () => {
    expect(integerToIndianWords(1000)).toBe('One Thousand');
    expect(integerToIndianWords(123456)).toBe('One Lakh Twenty-Three Thousand Four Hundred Fifty-Six');
    expect(integerToIndianWords(100000)).toBe('One Lakh');
  });

  it('handles crores and beyond', () => {
    expect(integerToIndianWords(10000000)).toBe('One Crore');
    expect(integerToIndianWords(1500000000)).toBe('One Hundred Fifty Crore');
  });
});

describe('numberToIndianWords', () => {
  it('formats a whole-rupee amount', () => {
    expect(numberToIndianWords(5000)).toBe('Five Thousand Rupees Only');
  });

  it('formats a full amount with paise', () => {
    expect(numberToIndianWords(123456.78)).toBe(
      'One Lakh Twenty-Three Thousand Four Hundred Fifty-Six Rupees and Seventy-Eight Paise Only',
    );
  });

  it('omits paise when zero', () => {
    expect(numberToIndianWords(500)).toBe('Five Hundred Rupees Only');
  });

  it('handles zero amount', () => {
    expect(numberToIndianWords(0)).toBe('Zero Rupees Only');
  });

  it('rounds paise to two decimals', () => {
    expect(numberToIndianWords(10.005)).toBe('Ten Rupees and One Paise Only');
  });

  it('carries paise rounding up into rupees', () => {
    expect(numberToIndianWords(9.999)).toBe('Ten Rupees Only');
  });

  it('handles negatives', () => {
    expect(numberToIndianWords(-5.5)).toBe('Minus Five Rupees and Fifty Paise Only');
  });

  it('is safe against NaN', () => {
    expect(numberToIndianWords(NaN)).toBe('Zero Rupees Only');
  });
});
