import { backupAge } from '../backupAge';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-08-24T09:00:00Z').getTime();

describe('modules/backupAge', () => {
  test('a ledger never backed up is stale, and has no age to show', () => {
    expect(backupAge(undefined, NOW)).toEqual({ days: undefined, stale: true });
  });

  test('a copy made today is fresh', () => {
    expect(backupAge(NOW - 2 * 60 * 60 * 1000, NOW)).toEqual({ days: 0, stale: false });
  });

  test('it stays fresh for the whole week the reminder covers', () => {
    expect(backupAge(NOW - 6 * DAY, NOW).stale).toBe(false);
  });

  test('once the week is up, it is stale', () => {
    expect(backupAge(NOW - 7 * DAY, NOW)).toEqual({ days: 7, stale: true });
  });

  test('a clock that went backwards is treated as no backup, not as one from the future', () => {
    expect(backupAge(NOW + DAY, NOW)).toEqual({ days: undefined, stale: true });
  });
});
