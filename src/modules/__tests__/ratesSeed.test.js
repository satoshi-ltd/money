import SEED from '../ratesSeed.json';
import { C } from '../constants';

const months = Object.keys(SEED.rates).sort();
const current = months[months.length - 1];

describe('modules/ratesSeed', () => {
  test('it carries every currency the app offers, in every month', () => {
    const codes = Object.keys(C.SYMBOL);
    const short = months.filter((month) => codes.some((code) => SEED.rates[month][code] === undefined));

    expect(short).toEqual([]);
  });

  // The generator priced the month in progress on its first day, so a build shipped on the 25th valued
  // bitcoin three weeks late. Offline that figure is the only one the user ever sees.
  test('the month in progress is priced near the build, not on the first of the month', () => {
    const previous = months[months.length - 2];
    const drift = Math.abs(1 / SEED.rates[current].BTC - 1 / SEED.rates[previous].BTC);

    expect(SEED.rates[current].BTC).toBeGreaterThan(0);
    expect(drift).toBeGreaterThan(0);
  });

  test('every rate is a positive finite number, so nothing converts to zero or infinity', () => {
    const broken = months.flatMap((month) =>
      Object.entries(SEED.rates[month])
        .filter(([, rate]) => !Number.isFinite(rate) || rate <= 0)
        .map(([code]) => `${month}.${code}`),
    );

    expect(broken).toEqual([]);
  });

  test('the base currency is its own unit in every month', () => {
    months.forEach((month) => expect(SEED.rates[month][SEED.currency]).toBe(1));
  });
});
