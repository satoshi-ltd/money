import { getProgressionPercentage } from '../getProgressionPercentage';
import { isOwed, ledgerPosition } from '../ledgerPosition';

describe('modules/ledgerPosition', () => {
  test('splits what you hold from what you owe, in the base currency', () => {
    const accounts = [
      { currentBalanceBase: 6000 },
      { currentBalanceBase: 1800 },
      { currentBalanceBase: -1284.3 },
      { currentBalanceBase: -15.7 },
    ];

    expect(ledgerPosition(accounts)).toEqual({ assets: 7800, owed: -1300 });
  });

  test('skips an account whose rate is unknown instead of counting it as zero on either side', () => {
    expect(ledgerPosition([{ currentBalanceBase: undefined }, { currentBalanceBase: 10 }])).toEqual({ assets: 10, owed: 0 });
  });

  test('an account is owed when its own balance is below zero, and a zero balance is not', () => {
    expect(isOwed({ currentBalance: -0.01 })).toBe(true);
    expect(isOwed({ currentBalance: 0 })).toBe(false);
    expect(isOwed({ currentBalance: 12 })).toBe(false);
    expect(isOwed()).toBe(false);
  });
});

describe('modules/getProgressionPercentage on a balance below zero', () => {
  test('paying a card down reads as a rise, by the size of what was owed', () => {
    expect(getProgressionPercentage(-600, 400)).toBeCloseTo(40, 8);
  });

  test('borrowing more reads as a fall', () => {
    expect(getProgressionPercentage(-1200, -200)).toBeCloseTo(-20, 8);
  });

  test('a positive balance reads as it always did', () => {
    expect(getProgressionPercentage(1200, 200)).toBe(20);
  });
});
