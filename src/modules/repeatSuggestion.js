const MIN_PREFIX = 2;

// What you already did, offered back. A finished title still counts: the amount, account and category
// are the point of the offer, and they are still empty.
export const repeatSuggestion = (txs = [], { prefix = '', type } = {}) => {
  const needle = prefix.trim().toLowerCase();
  if (needle.length < MIN_PREFIX) return undefined;

  const byTitle = new Map();
  txs.forEach((tx) => {
    const title = typeof tx?.title === 'string' ? tx.title.trim() : '';
    if (!title || tx.type !== type) return;
    if (!title.toLowerCase().startsWith(needle)) return;

    const key = title.toLowerCase();
    const seen = byTitle.get(key);
    // Count every repeat, but describe the latest one: that is the price and account in force now.
    if (!seen) byTitle.set(key, { count: 1, latest: tx });
    else {
      seen.count += 1;
      if ((tx.timestamp || 0) > (seen.latest.timestamp || 0)) seen.latest = tx;
    }
  });

  if (!byTitle.size) return undefined;

  const [best] = [...byTitle.values()].sort(
    (a, b) => b.count - a.count || (b.latest.timestamp || 0) - (a.latest.timestamp || 0),
  );

  const { account, category, title, value } = best.latest;

  return { account, category, count: best.count, title, value };
};
