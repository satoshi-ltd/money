import { RANGE_ALL, selectedRange } from '../statsRange';

describe('screens/Stats/statsRange', () => {
  test('a stored range comes back selected after a restart', () => {
    expect(selectedRange(6)).toBe(6);
    expect(selectedRange(12)).toBe(12);
    expect(selectedRange(RANGE_ALL)).toBe(RANGE_ALL);
  });

  test('a range no toggle offers any more falls back to All instead of selecting nothing', () => {
    expect(selectedRange(48)).toBe(RANGE_ALL);
    expect(selectedRange(24)).toBe(RANGE_ALL);
    expect(selectedRange(undefined)).toBe(RANGE_ALL);
  });
});
