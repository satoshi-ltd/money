import { currencyDecimals } from '../currencyDecimals';

describe('modules/currencyDecimals', () => {
  test('fiat always shows its cents, so the column keeps one rhythm', () => {
    expect(currencyDecimals(845, 'USD')).toBe(2);
    expect(currencyDecimals(845.87, 'USD')).toBe(2);
  });

  test('a currency with no minor unit shows none', () => {
    expect(currencyDecimals(27615, 'THB')).toBe(0);
  });

  // An ounce of gold is worth thousands, so whole ounces rendered a quarter-ounce holding as "0".
  test('metals are divisible, and rounding them to whole units hid real money', () => {
    expect(currencyDecimals(0.25, 'XAU')).toBe(2);
    expect(currencyDecimals(15.5, 'XAU')).toBe(2);
    expect(currencyDecimals(1.333, 'XAU')).toBe(3);
    expect(currencyDecimals(0.25, 'XAG')).toBe(2);
  });

  // "4.00000000" spent eight characters saying nothing at all.
  test('crypto drops the zeros it is not using', () => {
    expect(currencyDecimals(3.04, 'BTC')).toBe(2);
    expect(currencyDecimals(0.00012345, 'BTC')).toBe(8);
    expect(currencyDecimals(1.2, 'BTC')).toBe(2);
  });

  test('it never falls below cents, so a round amount still aligns with the column', () => {
    expect(currencyDecimals(4, 'BTC')).toBe(2);
    expect(currencyDecimals(4, 'ETH')).toBe(2);
  });

  test('it never invents precision the currency does not have', () => {
    expect(currencyDecimals(0.000000004, 'BTC')).toBeLessThanOrEqual(8);
    expect(currencyDecimals(1.23456, 'ETH')).toBe(4);
  });

  test('a negative amount is measured by its digits, not its sign', () => {
    expect(currencyDecimals(-3.04, 'BTC')).toBe(2);
  });
});
