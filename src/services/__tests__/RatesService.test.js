import { ratesOrSeed, rebaseRates, seedRates, ServiceRates } from '../RatesService';
import { exchange } from '../../modules/exchange';
import SEED from '../../modules/ratesSeed.json';

const table = { AUD: 1.5, BTC: 0.000013, EUR: 0.86, THB: 32.6, USD: 1, XAU: 0.00022 };

const answer = (day) => ({ ok: true, json: async () => ({ usd: day, eur: day }) });

// Everything but the current month already cached: what is left is the one request every sync makes.
const FULL = Object.fromEntries(Object.keys(SEED.rates).map((key) => [key, table]));

const SEED_LAST = Object.keys(SEED.rates).sort().pop();

// FULL only means "everything but the current month" while the clock sits in the month after the seed.
const afterSeed = (day) => {
  const at = new Date(`${SEED_LAST}-01T00:00:00Z`);
  at.setUTCMonth(at.getUTCMonth() + 1);
  return new Date(`${at.toISOString().slice(0, 7)}-${day}T12:00:00Z`);
};

const CURRENT = `${afterSeed('15').getFullYear()}-${`${afterSeed('15').getMonth() + 1}`.padStart(2, '0')}`;

// A download already made inside the current month: nothing older is still provisional.
const SYNCED = afterSeed('15').toISOString();

// jsdelivr carries the date after the @, the pages.dev mirror as its subdomain.
const dateOf = (url) => url.match(/currency-api@([^/]+)\//)?.[1] ?? url.match(/^https:\/\/([^.]+)\.currency-api/)?.[1];

// Under the fake clock: the dated file the current month is read from.
const TODAY = () => new Date().toISOString().slice(0, 10);
const daysBack = (n) => {
  const at = new Date();
  at.setUTCDate(at.getUTCDate() - n);
  return at.toISOString().slice(0, 10);
};
const isToday = (url) => [TODAY(), daysBack(1), daysBack(2), 'latest'].includes(dateOf(url));

// The day a month ends on: it has to be a date that exists, and the next one has to belong to another month.
const isClose = (date, key) => {
  const at = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(at.getTime()) || at.toISOString().slice(0, 10) !== date) return false;

  at.setUTCDate(at.getUTCDate() + 1);
  return date.startsWith(key) && at.toISOString().slice(0, 7) !== key;
};

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
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(afterSeed('15'));
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = undefined;
  });

  test('it keys what it reads by month, and keeps only the currencies the app knows', async () => {
    global.fetch = jest.fn(async () => answer({ ...Object.fromEntries(Object.entries(table).map(([k, v]) => [k.toLowerCase(), v])), zzz: 9 }));

    const rates = await ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: SYNCED });
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

    await ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: SYNCED });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(dateOf(global.fetch.mock.calls[0][0])).toBe(TODAY());
  });

  // The cursor stepped from the dataset's start day, so on the 1st the current month never entered the list:
  // nothing was requested, and the empty result surfaced as "check your internet connection".
  test('on the first of the month it still asks for the current month', async () => {
    jest.setSystemTime(afterSeed('01'));
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 32 }));

    const rates = await ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: afterSeed('01').toISOString() });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(dateOf(global.fetch.mock.calls[0][0])).toBe(TODAY());
    expect(rates[CURRENT].THB).toBe(32);
  });

  // A month read at its first day carries the rate from before anything in it happened.
  test('a month that is over is read at the day it closed, and never at a date that does not exist', async () => {
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 32 }));

    await ServiceRates.get({ baseCurrency: 'USD' });
    const [today, ...closes] = global.fetch.mock.calls.map(([url]) => dateOf(url));

    expect(today).toBe(TODAY());
    expect(closes[0]).toBe('2024-03-31');
    expect(closes).toContain('2026-02-28');
    expect(closes).toContain('2026-04-30');
    expect(closes.every((date) => isClose(date, date.slice(0, 7)))).toBe(true);
  });

  // The month in progress is stored from `latest`, so it closes holding whatever day the app was last opened on.
  test('the month that closed since the last download is read again, at its close', async () => {
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 33 }));

    const rates = await ServiceRates.get({
      baseCurrency: 'USD',
      known: FULL,
      lastRatesUpdate: `${SEED_LAST}-20T09:00:00.000Z`,
    });
    const dates = global.fetch.mock.calls.map(([url]) => dateOf(url));

    expect(dates).toHaveLength(2);
    expect(dates[0]).toBe(TODAY());
    expect(isClose(dates[1], SEED_LAST)).toBe(true);
    expect(rates[SEED_LAST].THB).toBe(33);
  });

  // The seed is built mid-month, so the month it ends on is as provisional as any other.
  test("with no download of its own the seed's last month is read again at its close", async () => {
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 33 }));

    await ServiceRates.get({ baseCurrency: 'USD', known: FULL });
    const dates = global.fetch.mock.calls.map(([url]) => dateOf(url));

    expect(dates).toHaveLength(2);
    expect(isClose(dates[1], SEED_LAST)).toBe(true);
  });

  test('it falls back to the second origin before giving up', async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => ({ ok: false }))
      .mockImplementationOnce(async () => answer({ usd: 1, thb: 32 }));

    const rates = await ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: SYNCED });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(Object.keys(rates).length).toBeGreaterThan(1);
  });

  // The phone's 545,901: jsdelivr answered `@latest` with the table of seven days before, status 200.
  test('the current month is read from a dated file, never from an alias the CDN may hold for a week', async () => {
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 32 }));

    await ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: SYNCED });
    const dates = global.fetch.mock.calls.map(([url]) => dateOf(url));

    expect(dates).toEqual([TODAY()]);
    expect(dates).not.toContain('latest');
  });

  test("when today's file is not published yet it steps back a day, then another, before trusting latest", async () => {
    global.fetch = jest.fn(async (url) => (dateOf(url) === daysBack(1) ? answer({ usd: 1, thb: 34 }) : { ok: false }));

    const rates = await ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: SYNCED });
    const dates = global.fetch.mock.calls.map(([url]) => dateOf(url));

    expect(dates.slice(0, 2)).toEqual([TODAY(), TODAY()]);
    expect(dates[2]).toBe(daysBack(1));
    expect(dates).not.toContain('latest');
    expect(rates[CURRENT].THB).toBe(34);
  });

  // The ledger's 545,516: a sync brought the closed month, missed today, and still dated itself as fresh.
  test('a download that misses today is no download: it throws, whatever older month answered', async () => {
    global.fetch = jest.fn(async (url) => (isToday(url) ? { ok: false } : answer({ usd: 1, thb: 33 })));

    await expect(
      ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: `${SEED_LAST}-20T09:00:00.000Z` }),
    ).rejects.toThrow();
    expect(global.fetch.mock.calls.every(([url]) => isToday(url))).toBe(true);
  });

  test('when no origin answers it throws, so the caller keeps what it already had', async () => {
    global.fetch = jest.fn(async () => ({ ok: false }));

    await expect(ServiceRates.get({ baseCurrency: 'USD', known: FULL, lastRatesUpdate: SYNCED })).rejects.toThrow();
  });
});

describe('services/RatesService month calendar', () => {
  const clockAt = (offsetHours) => {
    const shifted = (date) => new Date(date.getTime() + offsetHours * 3600000);

    jest.spyOn(Date.prototype, 'getFullYear').mockImplementation(function year() {
      return shifted(this).getUTCFullYear();
    });
    jest.spyOn(Date.prototype, 'getMonth').mockImplementation(function month() {
      return shifted(this).getUTCMonth();
    });
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    global.fetch = undefined;
  });

  const syncAt = async (offsetHours, instant) => {
    jest.useFakeTimers().setSystemTime(new Date(instant));
    clockAt(offsetHours);
    let calls = 0;
    global.fetch = jest.fn(async () => {
      calls += 1;
      return answer({ usd: 1, thb: calls === 1 ? 101 : 5 });
    });

    return ServiceRates.get({ baseCurrency: 'USD' });
  };

  test("east of UTC, in the first hours of a month, today's table is that month's, not the month before's", async () => {
    const rates = await syncAt(7, '2026-08-31T20:00:00Z');

    expect(rates['2026-09'].THB).toBe(101);
    expect(rates['2026-08'].THB).toBe(5);
  });

  test("west of UTC, in the last hours of a month, today's table is still that month's", async () => {
    const rates = await syncAt(-5, '2026-09-01T02:00:00Z');

    expect(rates['2026-08'].THB).toBe(101);
    expect(rates['2026-09']).toBeUndefined();
  });

  test('an entry made at that instant is priced from the table the service just wrote, on either side of UTC', async () => {
    const cases = [
      [7, '2026-08-31T20:00:00Z'],
      [-5, '2026-09-01T02:00:00Z'],
      [13, '2026-12-31T12:00:00Z'],
      [-10, '2027-01-01T05:00:00Z'],
    ];

    for (const [offset, instant] of cases) {
      const { currency, ...rates } = await syncAt(offset, instant);

      expect(exchange(1010, 'THB', 'USD', rates, new Date(instant).getTime())).toBeCloseTo(10, 6);
      jest.restoreAllMocks();
    }
  });

  test('every month from the start to now is requested once, the year turning included', async () => {
    await syncAt(13, '2027-01-01T12:00:00Z');
    const dates = global.fetch.mock.calls.map(([url]) => dateOf(url));
    const count = (date) => dates.filter((each) => each === date).length;

    expect(count('2026-12-31')).toBe(1);
    expect(count('2026-11-30')).toBe(1);
    expect(dates.filter((date) => date.startsWith('2027-01') && date !== '2026-12-31')).toHaveLength(1);
    expect(dates).toContain('2024-03-31');
  });

  test('a month whose closing day is still running in UTC stays provisional after the local month turned, until it is read at its close', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-31T10:30:00Z'));
    clockAt(14);
    const known = { ...FULL, '2026-08': table };
    global.fetch = jest
      .fn()
      .mockImplementationOnce(async () => answer({ usd: 1, thb: 101 }))
      .mockImplementation(async () => ({ ok: false }));

    const first = await ServiceRates.get({ baseCurrency: 'USD', known, lastRatesUpdate: '2026-08-20T09:00:00.000Z' });
    const firstDates = global.fetch.mock.calls.map(([url]) => dateOf(url));

    expect(firstDates).toEqual(['2026-08-31', '2026-08-31', '2026-08-31']);
    expect(first['2026-08']).toBeUndefined();

    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 33 }));
    const second = await ServiceRates.get({ baseCurrency: 'USD', known, lastRatesUpdate: '2026-08-31T10:30:00.000Z' });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(second['2026-08'].THB).toBe(33);
  });

  test('once the closing day is past in UTC a month is final and is not read again', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-02T10:30:00Z'));
    clockAt(14);
    global.fetch = jest.fn(async () => answer({ usd: 1, thb: 33 }));

    await ServiceRates.get({ baseCurrency: 'USD', known: { ...FULL, '2026-08': table }, lastRatesUpdate: '2026-09-01T00:00:00.000Z' });

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
