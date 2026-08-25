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
const START = '2024-03-02';
const OUT = path.join('src', 'modules', 'ratesSeed.json');

const origins = (date) => [
  `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${date}/v1/currencies/${BASE}.json`,
  `https://${date}.currency-api.pages.dev/v1/currencies/${BASE}.json`,
];

const readDay = async (date) => {
  for (const url of origins(date)) {
    try {
      const response = await fetch(url);
      if (response.ok) return (await response.json())[BASE];
    } catch {
      // try the next origin
    }
  }
  return undefined;
};

const months = () => {
  const out = [];
  const start = new Date(`${START}T00:00:00Z`);
  const now = new Date();
  for (let at = new Date(start); at <= now; at.setUTCMonth(at.getUTCMonth() + 1)) {
    const key = at.toISOString().slice(0, 7);
    out.push({ date: out.length === 0 ? START : `${key}-01`, key });
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

fs.writeFileSync(OUT, `${JSON.stringify({ currency: BASE.toUpperCase(), rates }, undefined, 2)}\n`);
console.log(`${OUT}: ${keys.length} months, ${keys[0]} to ${keys[keys.length - 1]}, ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
