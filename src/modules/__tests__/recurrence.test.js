import { getNextOccurrenceAt, getOccurrencesBetween } from '../recurrence';

const ymd = (ts) => {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
};

describe('modules/recurrence', () => {
  test('weekly: Saturdays', () => {
    const scheduled = {
      id: 'r1',
      startAt: new Date(2026, 0, 1, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'weekly', interval: 1, byWeekday: [6] }, // Sat
    };

    const fromAt = new Date(2026, 0, 1, 0, 0, 0, 0).getTime();
    const toAt = new Date(2026, 0, 31, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2026-01-03', '2026-01-10', '2026-01-17', '2026-01-24', '2026-01-31']);
  });

  test('weekly: multiple weekdays', () => {
    const scheduled = {
      id: 'r2',
      startAt: new Date(2026, 0, 1, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'weekly', interval: 1, byWeekday: [1, 5] }, // Mon, Fri
    };

    const fromAt = new Date(2026, 0, 1, 0, 0, 0, 0).getTime();
    const toAt = new Date(2026, 0, 11, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2026-01-02', '2026-01-05', '2026-01-09']);
  });

  test('weekly: interval 2 weeks', () => {
    const startAt = new Date(2025, 0, 5, 12, 0, 0, 0); // 2025-01-05
    const scheduled = {
      id: 'r3',
      startAt: startAt.getTime(),
      pattern: { kind: 'weekly', interval: 2, byWeekday: [startAt.getDay()] },
    };

    const fromAt = new Date(2025, 0, 1, 0, 0, 0, 0).getTime();
    const toAt = new Date(2025, 1, 5, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2025-01-05', '2025-01-19', '2025-02-02']);
  });

  test('monthly: day 5', () => {
    const scheduled = {
      id: 'r4',
      startAt: new Date(2025, 0, 5, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'monthly', interval: 1, byMonthDay: 5 },
    };

    const fromAt = new Date(2025, 0, 1, 0, 0, 0, 0).getTime();
    const toAt = new Date(2025, 3, 30, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2025-01-05', '2025-02-05', '2025-03-05', '2025-04-05']);
  });

  test('monthly: clamps day 31 to last day', () => {
    const scheduled = {
      id: 'r5',
      startAt: new Date(2025, 0, 31, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'monthly', interval: 1, byMonthDay: 31 },
    };

    const fromAt = new Date(2025, 1, 1, 0, 0, 0, 0).getTime();
    const toAt = new Date(2025, 2, 31, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2025-02-28', '2025-03-31']);
  });

  test('getNextOccurrenceAt returns first after afterAt', () => {
    const scheduled = {
      id: 'r6',
      startAt: new Date(2026, 0, 1, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'monthly', interval: 1, byMonthDay: 5 },
    };

    const afterAt = new Date(2026, 0, 2, 12, 0, 0, 0).getTime();
    const next = getNextOccurrenceAt({ scheduled, afterAt });
    expect(ymd(next)).toEqual('2026-01-05');
  });

  test('weekly: Saturdays keep their local day across the clock change', () => {
    const scheduled = {
      id: 'r-dst',
      startAt: new Date(2026, 2, 21, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'weekly', interval: 1, byWeekday: [6] },
    };

    const fromAt = new Date(2026, 2, 21, 0, 0, 0, 0).getTime();
    const toAt = new Date(2026, 3, 11, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2026-03-21', '2026-03-28', '2026-04-04', '2026-04-11']);
  });

  test('every second week keeps its parity across the clock change', () => {
    const scheduled = {
      id: 'r-dst2',
      startAt: new Date(2026, 2, 7, 12, 0, 0, 0).getTime(),
      pattern: { kind: 'weekly', interval: 2, byWeekday: [6] },
    };

    const fromAt = new Date(2026, 2, 1, 0, 0, 0, 0).getTime();
    const toAt = new Date(2026, 4, 31, 23, 59, 59, 999).getTime();
    const out = getOccurrencesBetween({ scheduled, fromAt, toAt }).map(ymd);
    expect(out).toEqual(['2026-03-07', '2026-03-21', '2026-04-04', '2026-04-18', '2026-05-02', '2026-05-16', '2026-05-30']);
  });

  test('a window with an unrepresentable end answers nothing instead of looping', () => {
    const scheduled = { id: 'r-far', startAt: 1, pattern: { kind: 'weekly' } };

    expect(getOccurrencesBetween({ scheduled, fromAt: 0, toAt: 1e16 })).toEqual([]);
  });
});

