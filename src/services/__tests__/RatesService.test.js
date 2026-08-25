import { ratesOrSeed, rebaseRates, seedRates, ServiceRates } from '../RatesService';
import SEED from '../../modules/ratesSeed.json';

const table = { AUD: 1.5, BTC: 0.000013, EUR: 0.86, THB: 32.6, USD: 1, XAU: 0.00022 };

const answer = (day) => ({ ok: true, json: async () => ({ usd: day, eur: day }) });

// Everything but the current month already cached: what is left is the one request every sync makes.
const FULL = Object.fromEntries(Object.keys(SEED.rates).map((key) => [key, table]));

describe('services/RatesService seed', () => {
  test('the bundled seed carries a real series, so a first run with no network still converts', () => {
    const keys = Object.keys(SEED.rates).sort();

    expect(keys.length).toBeGreaterThan(12);
    expect(keys[0]).toBe('2024-03');
    expect(SEED.rates[keys[0]].THB).toBeGreaterThan(0);
  });

  test('it answers in the base the reader asked for, whatever base it was written in', () => {
    const usd = seedRates('USD');
    const eur = seedRates('EUR');
    const key = Object.keys(SEED.rates)[0];

    expect(usd.currency).toBe('USD');
    expect(eur.currency).toBe('EUR');
    expect(eur[key].EUR).toBe(1);
  });

  // Cross rates from a common base are exact, which is why one table can seed nineteen currencies.
  test('a rebased figure matches the arithmetic it came from', () => {
    const key = Object.keys(SEED.rates)[0];
    const { [key]: base } = seedRates('USD');
    const { [key]: rebased } = seedRates('EUR');

    expect(rebased.THB).toBeCloseTo(base.THB / base.EUR, 6);
  });

  // `{}` is truthy, so `stored || seed` silently kept an empty cache and every foreign balance read 0.00.
  test('an empty cache is no cache: it falls back to the seed like a missing one', () => {
    [undefined, null, {}].forEach((empty) => {
      const { rates, seeded } = ratesOrSeed(empty, 'USD');

      expect(seeded).toBe(true);
      expect(Object.keys(rates).length).toBeGreaterThan(12);
    });
  });

  test('a cache downloaded after the build is left exactly as it was found', () => {
    const cached = { '2026-01': { USD: 1 } };
    const { rates, seeded } = ratesOrSeed(cached, 'USD', '2099-01-01T00:00:00.000Z');

    expect(seeded).toBe(false);
    expect(rates).toBe(cached);
  });

  // A device that once stored the seed kept those prices for ever, and shipping fresher rates changed nothing.
  test('a cache older than the build loses to the build', () => {
    const cached = { '2026-01': { USD: 1 } };
    const { rates, seeded } = ratesOrSeed(cached, 'USD', '2024-01-01T00:00:00.000Z');

    expect(seeded).toBe(true);
    expect(Object.keys(rates).length).toBeGreaterThan(12);
  });

  test('a cache nobody can date is treated as older than the build', () => {
    expect(ratesOrSeed({ '2026-01': { USD: 1 } }, 'USD').seeded).toBe(true);
  });

  test('what it hands back is a month map, with no currency key mixed in', () => {
    const { rates } = ratesOrSeed({}, 'USD');

    expect(rates.currency).toBeUndefined();
    expect(Object.keys(rates).every((key) => /^\d{4}-\d{2}$/.test(key))).toBe(true);
  });

  test('an unknown base leaves the series out rather than inventing one', () => {
    expect(Object.keys(seedRates('ZZZ'))).toEqual(['currency']);
  });

  // Changing base currency is arithmetic, not a download: it has to land with the network off.
  test('a cached series converts to another base without asking anyone', () => {
    const rebased = rebaseRates({ '2026-01': table }, 'EUR');

    expect(rebased.currency).toBe('EUR');
    expect(rebased['2026-01'].EUR).toBe(1);
    expect(rebased['2026-01'].THB).toBeCloseTo(table.THB / table.EUR, 6);
  });

  test('a month that never held the new base is dropped instead of converted wrong', () => {
    expect(rebaseRates({ '2026-01': { USD: 1 } }, 'EUR')['2026-01']).toBeUndefined();
  });
});

describe('services/RatesService fetch', () => {
  afterEach(() => {
    global.fetch = undefined;
  });

  test('it keys what it reads by month, and keeps only the currencies the app knows', async () => {
    global.fetch = jest.fn(async () => answer({ ...Object.fromEntries(Object.entries(table).map(([k, v]) => [k.toLowerCase(), v])), zzz: 9 }));

    const rates = await ServiceRates.get({ baseCurrency: 'USD', known: FULL });
    const [key] = Object.keys(rates).filter((k) => k !== 'currency');

    expect(key).toMatch(/^\d{4}-\d{2}$/);
    expect(rates[key].ZZZ).toBeUndefined();
    expect(rates[key].THB).toBe(32.6);
  });

  // A month already stored is a month not worth a request; the current one is always refreshed.
  test('with nothing cached it reads the whole series, not just today', async () => {
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 32 }));

    await ServiceRates.get({ baseCurrency: 'USD' });

    expect(global.fetch.mock.calls.length).toBeGreaterThan(12);
  });

  test('it asks only for the months it is missing', async () => {
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 32 }));

    await ServiceRates.get({ baseCurrency: 'USD', known: FULL });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('it falls back to the second origin before giving up', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => ({ ok: false }))
      .mockImplementationOnce(async () => answer({ usd: 1, thb: 32 }));

    const rates = await ServiceRates.get({ baseCurrency: 'USD', known: FULL });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(Object.keys(rates).length).toBeGreaterThan(1);
  });

  test('when no origin answers it throws, so the caller keeps what it already had', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));

    await expect(ServiceRates.get({ baseCurrency: 'USD', known: FULL })).rejects.toThrow();
  });
});
