import { AVERAGE_MONTHS, queryCategory } from '../queryCategory';

const AUGUST = { category: 4, month: 7, type: 0, year: 2026 };

const tx = (hash, title, value, year, month, day = 5, extra = {}) => ({
  account: 'a1',
  category: 4,
  hash,
  timestamp: new Date(year, month, day).getTime(),
  title,
  type: 0,
  value,
  ...extra,
});

const store = (txs) => ({
  accounts: [{ currency: 'EUR', hash: 'a1', title: 'N26' }],
  rates: {},
  settings: { baseCurrency: 'EUR' },
  txs,
});

describe('screens/Category/queryCategory', () => {
  test('totals the month and groups repeats into one merchant with a count', () => {
    const { merchants, total } = queryCategory(
      store([
        tx('t1', 'Mercadona', 100, 2026, 7, 3),
        tx('t2', 'mercadona', 138.4, 2026, 7, 9),
        tx('t3', 'Lidl', 98.2, 2026, 7, 14),
      ]),
      AUGUST,
    );

    expect(total).toBeCloseTo(336.6);
    expect(merchants).toEqual([
      { count: 2, title: 'Mercadona', value: 238.4 },
      { count: 1, title: 'Lidl', value: 98.2 },
    ]);
  });

  test('ignores other months, other categories and other types', () => {
    const { entries, total } = queryCategory(
      store([
        tx('t1', 'Mercadona', 100, 2026, 7),
        tx('t2', 'July', 500, 2026, 6),
        tx('t3', 'Other category', 500, 2026, 7, 5, { category: 9 }),
        tx('t4', 'Income', 500, 2026, 7, 5, { type: 1 }),
      ]),
      AUGUST,
    );

    expect(total).toBe(100);
    expect(entries.map(({ hash }) => hash)).toEqual(['t1']);
  });

  test('entries are newest first and carry the account name', () => {
    const { entries } = queryCategory(
      store([tx('t1', 'Lidl', 40, 2026, 7, 2), tx('t2', 'Mercadona', 20, 2026, 7, 23)]),
      AUGUST,
    );

    expect(entries.map(({ hash }) => hash)).toEqual(['t2', 't1']);
    expect(entries[0].account).toBe('N26');
  });

  test('averages the three previous months once the ledger reaches back that far', () => {
    const { average } = queryCategory(
      store([
        tx('t0', 'Mercadona', 10, 2026, 3),
        tx('t1', 'Mercadona', 300, 2026, 4),
        tx('t2', 'Mercadona', 600, 2026, 5),
        tx('t3', 'Mercadona', 450, 2026, 6),
        tx('t4', 'Mercadona', 100, 2026, 7),
      ]),
      AUGUST,
    );

    expect(average).toBeCloseTo((300 + 600 + 450) / AVERAGE_MONTHS);
  });

  test('a ledger too short to compare has no average, rather than a misleading one', () => {
    const { average } = queryCategory(
      store([tx('t1', 'Mercadona', 300, 2026, 6), tx('t2', 'Mercadona', 100, 2026, 7)]),
      AUGUST,
    );

    expect(average).toBeUndefined();
  });

  test('an untouched category comes back empty instead of throwing', () => {
    expect(queryCategory(store([]), AUGUST)).toEqual({
      average: undefined,
      entries: [],
      merchants: [],
      total: 0,
    });
  });
});
