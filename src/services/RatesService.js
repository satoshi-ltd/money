import { C } from '../modules';
import SEED from '../modules/ratesSeed.json';

const { CURRENCY, TIMEOUT } = C;

const CODES = Object.keys(C.SYMBOL);
const START = '2024-03';
const ORIGINS = [
  (date, base) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${base}.json`,
  (date, base) => `https://${date}.currency-api.pages.dev/v1/currencies/${base}.json`,
];

const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

// Day 0 of the next month: a hardcoded -31 is a 404 on both origins for the short ones.
const closingDay = (key) =>
  new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5)), 0)).toISOString().slice(0, 10);

const monthsSince = (from = START) => {
  const out = [];
  const at = new Date(`${from}-01T00:00:00Z`);
  const current = monthKey();

  // Compare month keys, not instants: a cursor kept on a day-of-month lost the current month until that day came.
  while (monthKey(at) <= current) {
    const key = monthKey(at);
    out.push({ date: closingDay(key), key });
    at.setUTCMonth(at.getUTCMonth() + 1);
  }
  return out;
};

// Today, yesterday, the day before: a day's file appears during that day, and the one before is never missing.
const recentDays = (now = new Date()) =>
  [0, 1, 2].map((back) => {
    const at = new Date(now);
    at.setUTCDate(at.getUTCDate() - back);
    return at.toISOString().slice(0, 10);
  });

// A table written while its month was still running is provisional, and the last download is what dates it.
const provisionalMonth = (lastRatesUpdate) => {
  const at = new Date(lastRatesUpdate || SEED.date || 0);

  return Number.isNaN(at.getTime()) ? undefined : monthKey(at);
};

const pick = (day = {}) =>
  Object.fromEntries(CODES.filter((code) => day[code.toLowerCase()] !== undefined).map((code) => [code, day[code.toLowerCase()]]));

const readDay = async (date, base) => {
  for (const origin of ORIGINS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT.GET);

    try {
      const response = await fetch(origin(date, base.toLowerCase()), { signal: controller.signal });
      if (response.ok) {
        const json = await response.json();
        return pick(json[base.toLowerCase()]);
      }
    } catch {
      // fall through to the next origin
    } finally {
      clearTimeout(timer);
    }
  }
  return undefined;
};

// Dated files are immutable, so no cache can age them; the CDN held `@latest` seven days behind once, with a 200.
const readToday = async (base) => {
  for (const date of recentDays()) {
    const day = await readDay(date, base);
    if (day && Object.keys(day).length) return day;
  }
  return readDay('latest', base);
};

// Cross rates from one base are exact, so a table in any currency answers for all of them.
const rebase = (table = {}, base = CURRENCY) => {
  const pivot = table[base];
  if (!pivot) return undefined;

  return Object.fromEntries(Object.entries(table).map(([code, rate]) => [code, rate / pivot]));
};

// A base change is arithmetic on what is already cached, so it lands offline and costs no requests.
export const rebaseRates = (rates = {}, baseCurrency = CURRENCY) => {
  const next = {};
  Object.entries(rates).forEach(([key, table]) => {
    const rebased = rebase(table, baseCurrency);
    if (rebased) next[key] = rebased;
  });

  return { currency: baseCurrency, ...next };
};

export const seedRates = (baseCurrency = CURRENCY) => rebaseRates(SEED.rates, baseCurrency);

const seededAt = SEED.date ? Date.parse(`${SEED.date}T00:00:00Z`) : 0;

// Two traps here. The store defaults its rates to {}, which is truthy, so a cache is judged by the months it
// holds and never by whether it exists. And a cache older than the build is worse than the build: without this
// a device that once stored the seed keeps those prices for ever, and shipping fresher rates changes nothing.
export const ratesOrSeed = (rates, baseCurrency = CURRENCY, lastRatesUpdate) => {
  const cached = Object.keys(rates || {}).length ? rates : undefined;
  const downloadedAt = lastRatesUpdate ? Date.parse(new Date(lastRatesUpdate).toISOString()) : 0;

  if (cached && downloadedAt >= seededAt) return { rates: cached, seeded: false };

  const { currency, ...seeded } = seedRates(baseCurrency);
  return { rates: seeded, seeded: true };
};

export const ServiceRates = {
  // `known` skips the months already held, except the two never final: the current one and the one that just closed.
  get: async ({ baseCurrency = CURRENCY, known = {}, lastRatesUpdate } = {}) => {
    const current = monthKey();
    const provisional = provisionalMonth(lastRatesUpdate);
    const missing = monthsSince().filter(({ key }) => key !== current && (!known[key] || key === provisional));

    // Today first and alone: every balance is read at it, and a download without it did not happen at all.
    const today = await readToday(baseCurrency);
    if (!today || !Object.keys(today).length) throw new Error('[rates] today did not answer');

    const days = await Promise.all(missing.map(({ date }) => readDay(date, baseCurrency)));
    const rates = { [current]: today };
    missing.forEach(({ key }, index) => {
      if (days[index] && Object.keys(days[index]).length) rates[key] = days[index];
    });

    return { currency: baseCurrency, ...rates };
  },
};
