import { foreignSymbol } from '../currencySymbol';

// The rule is transversal: a figure in the currency the reader thinks in never repeats its symbol.
describe('modules/foreignSymbol', () => {
  test('the base currency is never marked', () => {
    expect(foreignSymbol('USD', 'USD')).toBe('');
    expect(foreignSymbol('EUR', 'EUR')).toBe('');
  });

  test('anything else is marked with its own glyph', () => {
    expect(foreignSymbol('THB', 'USD')).toBe('฿');
    expect(foreignSymbol('EUR', 'USD')).toBe('€');
  });

  test('a currency that shares a glyph still falls back to its code', () => {
    expect(foreignSymbol('CAD', 'USD')).toBe('CAD');
  });

  test('nothing to mark, nothing rendered', () => {
    expect(foreignSymbol(undefined, 'USD')).toBe('');
    expect(foreignSymbol('', 'USD')).toBe('');
  });

  // Before a base is known, suppressing every symbol would leave bare numbers with no unit at all.
  test('with no base known, the amount is still marked', () => {
    expect(foreignSymbol('THB')).toBe('฿');
  });
});
