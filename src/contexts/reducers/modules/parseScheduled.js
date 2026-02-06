import { UUID } from '../../modules';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const parseScheduled = (data = {}) => {
  const now = Date.now();
  const safe = data && typeof data === 'object' ? data : {};

  const startAt = Number.isFinite(safe.startAt) ? safe.startAt : now;
  const kind = safe?.pattern?.kind === 'monthly' ? 'monthly' : 'weekly';
  const interval = clamp(Number(safe?.pattern?.interval || 1), 1, 365);

  const basePattern =
    kind === 'monthly'
      ? {
          kind,
          interval,
          byMonthDay: clamp(Number(safe?.pattern?.byMonthDay || new Date(startAt).getDate()), 1, 31),
        }
      : {
          kind,
          interval,
          byWeekday:
            Array.isArray(safe?.pattern?.byWeekday) && safe.pattern.byWeekday.length
              ? safe.pattern.byWeekday.map((d) => clamp(Number(d), 0, 6))
              : [new Date(startAt).getDay()],
        };

  const createdAt = Number.isFinite(safe.createdAt) ? safe.createdAt : now;
  const updatedAt = now;

  return {
    id: safe.id || UUID({ entity: 'scheduled', account: safe.account, createdAt }),
    title: typeof safe.title === 'string' ? safe.title.trim() : 'Scheduled',
    account: safe.account,
    type: safe.type,
    category: safe.category,
    value: Number.isFinite(Number(safe.value)) ? Math.abs(Number(safe.value)) : 0,
    startAt,
    pattern: basePattern,
    createdAt,
    updatedAt,
  };
};
