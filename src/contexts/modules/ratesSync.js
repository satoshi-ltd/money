export const RATES_SYNC_INTERVAL = 6 * 60 * 60 * 1000;

export const isRatesSyncDue = ({ force = false, lastRatesUpdate, now = Date.now() } = {}) => {
  if (force) return true;

  const lastUpdate = new Date(lastRatesUpdate || 0).getTime();
  return !Number.isFinite(lastUpdate) || now - lastUpdate >= RATES_SYNC_INTERVAL;
};
