import { L10N, verboseDate } from '..';

describe('modules/verboseDate', () => {
  test('relative: today/yesterday', () => {
    const now = new Date(2026, 0, 10, 12, 0, 0, 0); // Jan 10, 2026
    const today = new Date(2026, 0, 10, 1, 0, 0, 0);
    const yesterday = new Date(2026, 0, 9, 23, 0, 0, 0);

    expect(verboseDate(today, { now, relative: true })).toBe(L10N.TODAY);
    expect(verboseDate(yesterday, { now, relative: true })).toBe(L10N.YESTERDAY);
  });
});

