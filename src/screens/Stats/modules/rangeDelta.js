export const rangeDelta = (balances = []) => {
  const series = balances.filter((value) => Number.isFinite(value));
  if (series.length < 2) return undefined;

  // A padded window opens at zero before the ledger starts; the baseline is the first real balance.
  const from = series.find((value) => value !== 0);
  const to = series[series.length - 1];
  if (from === undefined || to === undefined) return undefined;

  return ((to - from) / Math.abs(from)) * 100;
};
