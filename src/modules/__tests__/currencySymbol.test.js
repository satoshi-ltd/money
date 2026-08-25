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
    ['CAD', 'AUD', 'NZD', 'SGD', 'HKD', 'MXN'].forEach((code) => expect(currencySymbol(code)).toBe(code));
  });

  test('a glyph claimed by one currency is not reused by the next', () => {
    expect(currencySymbol('JPY')).toBe('¥');
    expect(currencySymbol('CNY')).toBe('CNY');
    expect(currencySymbol('XAU')).toBe('oz');
    expect(currencySymbol('XAG')).toBe('XAG');
  });

  test('a mark is either a short glyph or the code itself, never an invented "Mex$"', () => {
    Object.keys(SYMBOL).forEach((code) => {
      const mark = currencySymbol(code);

      expect(mark.length <= 3 || mark === code).toBe(true);
    });
  });

  // The API prices gold and silver per troy ounce, so the mark has to say ounce.
  test('the metals are marked in the unit they are actually priced in', () => {
    expect(SYMBOL.XAU).toBe('oz');
    expect(SYMBOL.XAG).toBe('oz');
  });

  test('no two currencies ever render the same mark', () => {
    const marks = Object.keys(SYMBOL).map(currencySymbol);

    expect(new Set(marks).size).toBe(marks.length);
  });

  test('an unmapped currency renders as its own code', () => {
    expect(currencySymbol('RUB')).toBe('RUB');
  });

  test('no currency, no mark', () => {
    expect(currencySymbol()).toBe('');
    expect(currencySymbol('')).toBe('');
  });
});
