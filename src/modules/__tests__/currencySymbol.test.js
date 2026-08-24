import { currencySymbol } from '../currencySymbol';
import { C } from '../constants';

const { SYMBOL } = C;

describe('modules/currencySymbol', () => {
  test('a currency with a glyph of its own gets it', () => {
    expect(currencySymbol('EUR')).toBe('€');
    expect(currencySymbol('USD')).toBe('$');
    expect(currencySymbol('GBP')).toBe('£');
  });

  test('the dollar belongs to USD; the other dollars use their code, never "Mex$"', () => {
    expect(currencySymbol('USD')).toBe('$');
    ['CAD', 'AUD', 'SGD', 'HKD', 'MXN'].forEach((code) => expect(currencySymbol(code)).toBe(code));
  });

  test('a glyph claimed by one currency is not reused by the next', () => {
    expect(currencySymbol('JPY')).toBe('¥');
    expect(currencySymbol('CNY')).toBe('CNY');
    expect(currencySymbol('XAU')).toBe('gr');
    expect(currencySymbol('XAG')).toBe('XAG');
  });

  test('no symbol is longer than a glyph or an ISO code', () => {
    Object.keys(SYMBOL).forEach((code) => expect(currencySymbol(code).length).toBeLessThanOrEqual(3));
  });

  test('no two currencies ever render the same mark', () => {
    const marks = Object.keys(SYMBOL).map(currencySymbol);

    expect(new Set(marks).size).toBe(marks.length);
  });

  test('an unmapped currency renders as its own code', () => {
    expect(currencySymbol('NOK')).toBe('NOK');
  });

  test('no currency, no mark', () => {
    expect(currencySymbol()).toBe('');
    expect(currencySymbol('')).toBe('');
  });
});
