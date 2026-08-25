import { C } from '../modules';
import SEED from '../modules/ratesSeed.json';

const { CURRENCY, TIMEOUT } = C;

const CODES = Object.keys(C.SYMBOL);
const START = '2024-03-02';
const ORIGINS = [
  (date, base) => `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${base}.json`,
  (date, base) => `https://${date}.currency-api.pages.dev/v1/currencies/${base}.json`,
];

const monthKey = (date = new Date()) => date.toISOString().slice(0, 7);

// The first month starts the day the dataset does; every other one reads its first.
const monthsSince = (from = START) => {
  const out = [];
  const at = new Date(`${from}T00:00:00Z`);
  const now = new Date();

  while (at <= now) {
    const key = monthKey(at);
    out.push({ date: out.length === 0 ? from : `${key}-01`, key });
    at.setUTCMonth(at.getUTCMonth() + 1);
  }
  return out;
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

// The store defaults its rates to {}, which is truthy: a cache is judged by the months it holds, never
// by whether it exists. Without this every foreign balance reads 0.00 until a fetch lands, and offline none does.
export const ratesOrSeed = (rates, baseCurrency = CURRENCY) => {
  if (Object.keys(rates || {}).length) return rates;

  const { currency, ...seeded } = seedRates(baseCurrency);
  return seeded;
};

export const ServiceRates = {
  // `known` reduces the whole series to the months nobody has yet; the current one is always re-read.
  get: async ({ baseCurrency = CURRENCY, known = {} } = {}) => {
    const current = monthKey();
    const missing = monthsSince()
      .filter(({ key }) => !known[key] || key === current)
      .map((month) => (month.key === current ? { ...month, date: 'latest' } : month));

    const days = await Promise.all(missing.map(({ date }) => readDay(date, baseCurrency)));
    const rates = {};
    missing.forEach(({ key }, index) => {
      if (days[index] && Object.keys(days[index]).length) rates[key] = days[index];
    });

    if (!Object.keys(rates).length) throw new Error('[rates] no origin answered');

    return { currency: baseCurrency, ...rates };
  },
};
