import { currencyPrecision, roundToCurrency } from '../currencyPrecision';

describe('modules/currencyPrecision', () => {
  test('keeps the decimals each currency can hold, including the ones with none', () => {
    expect(currencyPrecision('USD')).toBe(2);
    expect(currencyPrecision('JPY')).toBe(0);
    expect(currencyPrecision('BTC')).toBe(8);
    expect(currencyPrecision('GBP')).toBe(2);
  });

  test('does not change precision with the size of the amount', () => {
    expect(roundToCurrency(9999.999, 'USD')).toBe(10000);
    expect(roundToCurrency(10000.505, 'USD')).toBe(10000.51);
    expect(roundToCurrency(10000.5, 'JPY')).toBe(10001);
  });

  test('ignores what is not a number', () => {
    expect(roundToCurrency(undefined, 'USD')).toBeUndefined();
    expect(roundToCurrency('abc', 'USD')).toBeUndefined();
  });
});
