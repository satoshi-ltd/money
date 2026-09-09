import { isInternalTransfer } from './isInternalTransfer';

const MIN_PREFIX = 2;
const MIN_SEEN = 2;
// The last ten, not all time: a title refiled since last year should follow this year.
const RECENT = 10;
const PROPOSALS = 2;
const RANK_MONTHS = 6;

const BOUNDARY = /[\s\-_/.,()&+]+/g;

const keyOf = (type, title) => `${type}|${title.trim().toLowerCase()}`;

const wordsOf = (text) => ` ${text.replace(BOUNDARY, ' ')}`;

// Ties go to the value seen most recently.
const majority = (entries, field) => {
  const counts = new Map();
  entries.forEach(({ [field]: value }) => counts.set(value, (counts.get(value) || 0) + 1));
  let best;
  let bestCount = 0;
  [...entries].reverse().forEach(({ [field]: value }) => {
    const count = counts.get(value);
    if (count > bestCount) {
      bestCount = count;
      best = value;
    }
  });
  return best;
};

const floorOf = (now) => {
  const date = new Date(now);
  date.setMonth(date.getMonth() - RANK_MONTHS);
  return date.getTime();
};

const latestOf = (entries) => entries[entries.length - 1].timestamp || 0;

const offerOf = (entries) => {
  const recent = entries.slice(-RECENT);
  const latest = entries[entries.length - 1];

  return {
    account: majority(recent, 'account'),
    category: majority(recent, 'category'),
    count: entries.length,
    title: latest.title,
    value: latest.value,
  };
};

// One memory per exact title, read by the chip and by the silent fill alike, so the two cannot disagree.
export const buildTitleMemory = (txs = []) => {
  const memory = new Map();

  txs.forEach((tx) => {
    const title = typeof tx?.title === 'string' ? tx.title.trim() : '';
    if (!title || tx.type === undefined || isInternalTransfer(tx)) return;
    const key = keyOf(tx.type, title);
    memory.set(key, [...(memory.get(key) || []), { ...tx, title }]);
  });

  memory.forEach((entries) => entries.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)));

  return memory;
};

// Ranked by the last six months but never cut: an annual insurance is still a title you repeat.
export const recallTitles = (memory, { prefix = '', type, now = Date.now() } = {}) => {
  const needle = prefix.trim().toLowerCase();
  if (needle.length < MIN_PREFIX || !memory) return [];

  const floor = floorOf(now);
  const word = wordsOf(needle);
  const hits = [];
  memory.forEach((entries, key) => {
    if (!key.startsWith(`${type}|`)) return;
    const title = key.slice(key.indexOf('|') + 1);
    // "beans" finds "Beans" before "Coffee beans": a title that starts with it outranks one that only contains it.
    const tier = title.startsWith(needle) ? 0 : wordsOf(title).includes(word) ? 1 : undefined;
    if (tier !== undefined) {
      hits.push({ entries, lately: entries.filter(({ timestamp }) => timestamp >= floor).length, tier });
    }
  });

  return hits
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        b.lately - a.lately ||
        b.entries.length - a.entries.length ||
        latestOf(b.entries) - latestOf(a.entries),
    )
    .slice(0, PROPOSALS)
    .map(({ entries }) => offerOf(entries));
};

export const recallTitle = (memory, { title = '', type } = {}) => {
  const entries = memory?.get(keyOf(type, title));
  if (!entries || entries.length < MIN_SEEN) return undefined;

  const recent = entries.slice(-RECENT);
  return { account: majority(recent, 'account'), category: majority(recent, 'category') };
};
