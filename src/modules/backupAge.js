const DAY = 24 * 60 * 60 * 1000;

// The reminder fires weekly, so a copy older than that week is the one worth flagging.
const STALE_DAYS = 7;

export const backupAge = (backupAt, now = Date.now()) => {
  if (!backupAt || backupAt > now) return { days: undefined, stale: true };

  const days = Math.floor((now - backupAt) / DAY);

  return { days, stale: days >= STALE_DAYS };
};
