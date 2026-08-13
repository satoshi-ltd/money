const normalizeScheduledId = (value) => {
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;
  const next = `${value}`.trim();
  return next.length ? next : undefined;
};

const normalizeOccurrenceAt = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : undefined;
};

export const getScheduledOccurrenceKey = ({ scheduledId, occurrenceAt } = {}) => {
  const id = normalizeScheduledId(scheduledId);
  const at = normalizeOccurrenceAt(occurrenceAt);
  if (!id || at === undefined) return undefined;
  return `${id}:${at}`;
};

export const getScheduledOccurrenceKeyFromTx = (tx = {}) => {
  if (tx?.meta?.kind !== 'scheduled') return undefined;
  return getScheduledOccurrenceKey({
    scheduledId: tx?.meta?.scheduledId,
    occurrenceAt: tx?.meta?.occurrenceAt,
  });
};
