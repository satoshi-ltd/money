// Writes the offline seed. Run it by hand (`yarn rates:seed`), never from a build step: a build that
// reaches for the network is not reproducible, and a CDN hiccup would fail it.
import fs from 'node:fs';
import path from 'node:path';

// Read from the app instead of repeating it: a hand-kept copy silently seeds the currencies of a past release.
const readCurrencies = () => {
  const source = fs.readFileSync(path.join('src', 'modules', 'constants.js'), 'utf8');
  const block = source.match(/SYMBOL: \{([\s\S]*?)\n {2}\}/);
  const codes = block ? [...block[1].matchAll(/^\s+([A-Z]{3,4}):/gm)].map(([, code]) => code.toLowerCase()) : [];

  if (codes.length < 2) throw new Error('[rates-seed] could not read SYMBOL out of src/modules/constants.js');
  return codes;
};

const CURRENCIES = readCurrencies();
const BASE = 'usd';
const START = '2024-03';
const OUT = path.join('src', 'modules', 'ratesSeed.json');

const origins = (date) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${BASE}.json`,
  `https://${date}.currency-api.pages.dev/v1/currencies/${BASE}.json`,
];

let datasetDate;

const readDay = async (date) => {
  for (const url of origins(date)) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        // The feed dates itself; trusting it beats trusting the clock of whoever runs the release.
        if (date === 'latest' && json.date) datasetDate = json.date;
        return json[BASE];
      }
    } catch {
      // try the next origin
    }
  }
  return undefined;
};

// Day 0 of the next month: a hardcoded -31 is a 404 on both origins for the short ones.
const closingDay = (key) =>
  new Date(Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5)), 0)).toISOString().slice(0, 10);

const months = () => {
  const out = [];
  const at = new Date(`${START}-01T00:00:00Z`);
  const current = new Date().toISOString().slice(0, 7);

  // Compare month keys, not instants: a cursor kept on a day-of-month lost the current month until that day came.
  while (at.toISOString().slice(0, 7) <= current) {
    const key = at.toISOString().slice(0, 7);
    // The month in progress is priced today, not at its close: the service asks for `latest` and the seed must
    // agree, or a build shipped on the 25th values bitcoin at the price it had three weeks earlier.
    out.push({ date: key === current ? 'latest' : closingDay(key), key });
    at.setUTCMonth(at.getUTCMonth() + 1);
  }
  return out;
};

const rates = {};
for (const { date, key } of months()) {
  const day = await readDay(date);
  if (!day) {
    console.warn(`  skipped ${key}: no origin answered for ${date}`);
    continue;
  }
  rates[key] = Object.fromEntries(
    CURRENCIES.filter((code) => day[code] !== undefined).map((code) => [code.toUpperCase(), day[code]]),
  );
}

const keys = Object.keys(rates).sort();
if (!keys.length) throw new Error('[rates-seed] no month could be read');

fs.writeFileSync(OUT, `${JSON.stringify({ currency: BASE.toUpperCase(), date: datasetDate, rates }, undefined, 2)}\n`);
console.log(`${OUT}: ${keys.length} months, ${keys[0]} to ${keys[keys.length - 1]}, ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
