import { composeDate, dayAllowed, dayKey, dayStart, monthWeeks, weekdayOrder, weekStartFor } from '../monthGrid';

describe('modules/monthGrid', () => {
  test('English weeks open on Sunday and the other languages on Monday', () => {
    expect(['en', 'en-US'].map(weekStartFor)).toEqual([0, 0]);
    expect(['es', 'pt', 'fr', 'de', undefined].map(weekStartFor)).toEqual([1, 1, 1, 1, 1]);
  });

  test('the weekday header follows the first weekday and wraps the week', () => {
    expect(weekdayOrder(1)).toEqual([1, 2, 3, 4, 5, 6, 0]);
    expect(weekdayOrder(0)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  test('a month is whole weeks of seven, padded with blanks around its days', () => {
    const september = monthWeeks({ month: 8, weekStart: 1, year: 2026 });

    expect(september).toHaveLength(5);
    expect(september.every((week) => week.length === 7)).toBe(true);
    expect(september[0]).toEqual([null, 1, 2, 3, 4, 5, 6]);
    expect(september[4]).toEqual([28, 29, 30, null, null, null, null]);
  });

  test('the same month starts a column later when the week opens on Sunday', () => {
    expect(monthWeeks({ month: 8, weekStart: 0, year: 2026 })[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  });

  test('a month that spills over five rows gets a sixth, and February in a leap year keeps its 29th', () => {
    expect(monthWeeks({ month: 7, weekStart: 0, year: 2026 })).toHaveLength(6);
    expect(monthWeeks({ month: 1, weekStart: 1, year: 2028 }).flat().filter(Boolean)).toHaveLength(29);
  });

  test('every day of the month appears once and in order', () => {
    const days = monthWeeks({ month: 11, weekStart: 1, year: 2026 }).flat().filter(Boolean);

    expect(days).toEqual(Array.from({ length: 31 }, (_, index) => index + 1));
  });

  test('days compare by calendar day, never by the hour', () => {
    expect(dayKey(new Date(2026, 8, 9, 23, 59))).toBe(dayKey(new Date(2026, 8, 9, 0, 1)));
    expect(dayKey(new Date(2026, 8, 30))).toBeLessThan(dayKey(new Date(2026, 9, 1)));
    expect(dayKey(new Date(2026, 11, 31))).toBeLessThan(dayKey(new Date(2027, 0, 1)));
    expect(dayStart(new Date(2026, 8, 9, 17, 30)).getTime()).toBe(new Date(2026, 8, 9).getTime());
  });

  test('a day outside the bounds is not allowed, and the bounds themselves are', () => {
    const minimumDate = new Date(2026, 8, 5, 18);
    const maximumDate = new Date(2026, 8, 9, 8);
    const allowed = (date) => dayAllowed({ date, maximumDate, minimumDate });

    expect([4, 5, 7, 9, 10].map((day) => allowed(new Date(2026, 8, day)))).toEqual([false, true, true, true, false]);
    expect(dayAllowed({ date: new Date(1999, 0, 1) })).toBe(true);
  });

  test('a picked day keeps the time of the value it replaces', () => {
    const picked = composeDate({ day: new Date(2026, 8, 4), time: new Date(2026, 8, 9, 17, 30, 12, 345) });

    expect(picked.getTime()).toBe(new Date(2026, 8, 4, 17, 30, 12, 345).getTime());
  });

  test('a picked moment never lands past the maximum or before the minimum', () => {
    const time = new Date(2026, 8, 1, 20);
    const maximumDate = new Date(2026, 8, 9, 8);
    const minimumDate = new Date(2026, 8, 5, 12);

    expect(composeDate({ day: new Date(2026, 8, 9), maximumDate, time })).toEqual(maximumDate);
    expect(composeDate({ day: new Date(2026, 8, 5), minimumDate, time: new Date(2026, 8, 1, 6) })).toEqual(minimumDate);
    expect(composeDate({ day: new Date(2026, 8, 7), maximumDate, minimumDate, time }).getTime()).toBe(
      new Date(2026, 8, 7, 20).getTime(),
    );
  });
});
