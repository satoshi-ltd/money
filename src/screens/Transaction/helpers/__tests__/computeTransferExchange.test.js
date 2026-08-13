import { computeTransferExchange } from '../computeTransferExchange';

const RATES = { USD: 1, EUR: 0.9, JPY: 150, BTC: 0.00002 };
const account = (currency) => ({ currency });

const compute = (props) => computeTransferExchange({ baseCurrency: 'USD', latestRates: RATES, ...props });

describe('screens/Transaction/computeTransferExchange', () => {
  test('moves the exact amount between accounts of the same currency', () => {
    expect(compute({ from: account('USD'), to: account('USD'), value: 10000.5 })).toBe(10000.5);
    expect(compute({ from: account('JPY'), to: account('JPY'), value: 1500.75 })).toBe(1500.75);
    expect(compute({ from: account('BTC'), to: account('BTC'), value: 0.123456789 })).toBe(0.123456789);
  });

  test('moves money between accounts of the same currency with no rates cached at all', () => {
    expect(computeTransferExchange({ baseCurrency: 'USD', from: account('USD'), to: account('USD'), value: 25 })).toBe(
      25,
    );
  });

  test('converts from the base currency', () => {
    expect(compute({ from: account('USD'), to: account('EUR'), value: 100 })).toBe(90);
  });

  test('converts to the base currency', () => {
    expect(compute({ from: account('EUR'), to: account('USD'), value: 90 })).toBe(100);
  });

  test('converts between two non base currencies', () => {
    expect(compute({ from: account('EUR'), to: account('JPY'), value: 90 })).toBe(15000);
  });

  test('rounds to what the destination currency can hold, whatever the amount', () => {
    expect(compute({ from: account('USD'), to: account('JPY'), value: 12345.678 })).toBe(1851852);
    expect(compute({ from: account('USD'), to: account('EUR'), value: 12345.678 })).toBe(11111.11);
    expect(compute({ from: account('USD'), to: account('BTC'), value: 12345.678 })).toBe(0.24691356);
  });

  test('gives nothing when it cannot know the rate', () => {
    expect(compute({ from: account('EUR'), to: account('GBP'), value: 100 })).toBeUndefined();
    expect(compute({ from: account('GBP'), to: account('EUR'), value: 100 })).toBeUndefined();
    expect(computeTransferExchange({ baseCurrency: 'USD', from: account('EUR'), to: account('USD'), value: 1 })).toBeUndefined();
  });

  test('gives nothing for an amount that is not a positive number', () => {
    expect(compute({ from: account('USD'), to: account('EUR'), value: 0 })).toBeUndefined();
    expect(compute({ from: account('USD'), to: account('EUR'), value: -5 })).toBeUndefined();
    expect(compute({ from: account('USD'), to: account('EUR') })).toBeUndefined();
  });
});
