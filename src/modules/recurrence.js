import { C } from './constants';

const { MS_IN_DAY, MS_IN_WEEK } = C;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

const atMidday = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
const atMiddayFromParts = (year, monthIndex, day) => new Date(year, monthIndex, day, 12, 0, 0, 0);

const startOfWeekSundayMidday = (date) => {
  const d = atMidday(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  return atMiddayFromParts(d.getFullYear(), d.getMonth(), d.getDate() - day);
};

const monthIndexKey = (date) => date.getFullYear() * 12 + date.getMonth();

export const getOccurrencesBetween = ({ scheduled, fromAt, toAt }) => {
  if (!scheduled) return [];
  if (!Number.isFinite(fromAt) || !Number.isFinite(toAt)) return [];
  if (toAt < fromAt) return [];

  const startAt = Number.isFinite(scheduled.startAt) ? scheduled.startAt : undefined;
  if (!Number.isFinite(startAt)) return [];

  const { pattern = {} } = scheduled;
  const kind = pattern.kind;
  const interval = clamp(Number(pattern.interval || 1), 1, 365);

  const from = atMidday(new Date(fromAt));
  const to = atMidday(new Date(toAt));
  const start = atMidday(new Date(startAt));

  if (to.getTime() < start.getTime()) return [];

  if (kind === 'weekly') {
    const weekdays =
      Array.isArray(pattern.byWeekday) && pattern.byWeekday.length ? pattern.byWeekday : [start.getDay()];
    const weekdaySet = new Set(weekdays.map((d) => clamp(Number(d), 0, 6)));
    const baseWeek = startOfWeekSundayMidday(start);
    const out = [];

    for (let t = from.getTime(); t <= to.getTime(); t += MS_IN_DAY) {
      const d = new Date(t);
      const candidate = atMidday(d);
      if (candidate.getTime() < start.getTime()) continue;
      if (!weekdaySet.has(candidate.getDay())) continue;
      const weekDiff = Math.floor((startOfWeekSundayMidday(candidate).getTime() - baseWeek.getTime()) / MS_IN_WEEK);
      if (weekDiff < 0) continue;
      if (weekDiff % interval !== 0) continue;
      out.push(candidate.getTime());
    }
    return out;
  }

  if (kind === 'monthly') {
    const baseMonth = monthIndexKey(start);
    const targetDay = clamp(
      Number.isFinite(Number(pattern.byMonthDay)) ? Number(pattern.byMonthDay) : start.getDate(),
      1,
      31,
    );

    const fromMonth = monthIndexKey(from);
    const toMonth = monthIndexKey(to);
    const out = [];

    for (let m = fromMonth; m <= toMonth; m += 1) {
      const year = Math.floor(m / 12);
      const month = m % 12;
      const dim = daysInMonth(year, month);
      const day = clamp(targetDay, 1, dim);
      const candidate = atMiddayFromParts(year, month, day);
      if (candidate.getTime() < from.getTime() || candidate.getTime() > to.getTime()) continue;
      if (candidate.getTime() < start.getTime()) continue;
      const monthDiff = m - baseMonth;
      if (monthDiff < 0) continue;
      if (monthDiff % interval !== 0) continue;
      out.push(candidate.getTime());
    }
    return out;
  }

  return [];
};

export const getNextOccurrenceAt = ({ scheduled, afterAt }) => {
  if (!scheduled) return undefined;
  const after = Number.isFinite(afterAt) ? afterAt : Date.now();

  const windowDays = scheduled?.pattern?.kind === 'monthly' ? 366 * 5 : 400;
  const fromAt = after + 1;
  const toAt = after + windowDays * MS_IN_DAY;
  const occurrences = getOccurrencesBetween({ scheduled, fromAt, toAt });
  return occurrences.length ? occurrences[0] : undefined;
};
