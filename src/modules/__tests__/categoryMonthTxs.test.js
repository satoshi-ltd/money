import { categoryMonthTxs, isCategoryEntry } from '../categoryMonthTxs';

const tx = (hash, category, type, date) => ({ hash, category, type, timestamp: date.getTime(), value: 10 });

const TXS = [
  tx('a', 10, 0, new Date(2026, 8, 8)),
  tx('b', 10, 0, new Date(2026, 8, 30, 23, 59)),
  tx('c', 10, 0, new Date(2026, 7, 31, 23, 59)),
  tx('d', 1, 0, new Date(2026, 8, 8)),
  tx('e', 10, 1, new Date(2026, 8, 8)),
  tx('f', 99, 0, new Date(2026, 8, 8)),
];

describe('modules/categoryMonthTxs', () => {
  test('keeps the entries of one category, one type and one month, by the local calendar', () => {
    const hashes = categoryMonthTxs(TXS, { category: 10, month: 8, type: 0, year: 2026 }).map(({ hash }) => hash);

    expect(hashes).toEqual(['a', 'b']);
  });

  test('a swap is never a category entry, and an empty ledger answers nothing', () => {
    expect(isCategoryEntry(TXS[5], { category: 99, type: 0 })).toBe(false);
    expect(categoryMonthTxs(TXS, { category: 99, month: 8, type: 0, year: 2026 })).toEqual([]);
    expect(categoryMonthTxs([], { category: 10, month: 8, type: 0, year: 2026 })).toEqual([]);
  });

  test('a zero amount or an unrated currency is still an entry of the month', () => {
    const zero = { ...tx('z', 10, 0, new Date(2026, 8, 9)), value: 0 };
    expect(categoryMonthTxs([...TXS, zero], { category: 10, month: 8, type: 0, year: 2026 })).toHaveLength(3);
  });
});
