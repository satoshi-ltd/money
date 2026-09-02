import queryChart from '../queryChart';
import { C } from '../../../../modules';

const { EXPENSE, INCOME } = C.TX.TYPE;

const tx = (year, month, day, value, { category = 1, type = EXPENSE } = {}) => ({
  account: 'a1',
  category,
  hash: `${year}-${month}-${day}-${value}`,
  timestamp: new Date(year, month, day, 12).getTime(),
  title: 'Item',
  type,
  value,
});

const store = (txs) => ({
  accounts: [{ hash: 'a1', currency: C.CURRENCY }],
  overall: { chartBalance: [] },
  rates: {},
  settings: { baseCurrency: C.CURRENCY },
  txs,
});

describe('screens/Stats/queryChart', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 20, 10, 0, 0));
  });

  afterEach(() => jest.useRealTimers());

  test('puts the current month in the last bucket and older ones before it', () => {
    const { expenses } = queryChart(store([tx(2026, 4, 2, 50), tx(2026, 3, 2, 30), tx(2026, 2, 2, 20)]), 12);

    expect(expenses).toHaveLength(12);
    expect(expenses[11]).toBe(50);
    expect(expenses[10]).toBe(30);
    expect(expenses[9]).toBe(20);
    expect(expenses.slice(0, 9)).toEqual(new Array(9).fill(0));
  });

  test('counts incomes apart from expenses', () => {
    const { expenses, incomes } = queryChart(
      store([tx(2026, 4, 2, 50), tx(2026, 4, 3, 800, { category: 2, type: INCOME })]),
      12,
    );

    expect(expenses[11]).toBe(50);
    expect(incomes[11]).toBe(800);
  });

  // The mark is on the transaction, not on its category: what it is and how it charts are different questions.
  test('a movement marked by hand stays out of the bars, whatever its category', () => {
    const { incomes } = queryChart(
      store([
        tx(2026, 4, 3, 800, { category: 1, type: INCOME }),
        { ...tx(2026, 4, 5, 90000, { category: 2, type: INCOME }), meta: { moved: true } },
      ]),
      12,
    );

    expect(incomes[11]).toBe(800);
  });

  test('and an unmarked transaction of the same category is counted', () => {
    const { incomes } = queryChart(store([tx(2026, 4, 5, 90000, { category: 2, type: INCOME })]), 12);

    expect(incomes[11]).toBe(90000);
  });

  // One fixed window of three read over half of a 6M view and a tenth of All: the same dotted line saying
  // three different things depending on the tab.
  test('the trend window grows with the range, so the line means the same thing at every one', () => {
    const chartBalance = [...Array(23).fill(100), 200];

    const six = queryChart({ overall: { chartBalance } }, 6);
    const all = queryChart({ overall: { chartBalance } }, 0);

    // 6M reads a quarter of six months (floored to three); All reads a quarter of twenty-four.
    expect(six.trend[six.trend.length - 1]).toBeCloseTo((100 + 100 + 200) / 3);
    expect(all.trend[all.trend.length - 1]).toBeCloseTo((100 * 5 + 200) / 6);
  });

  // A centred window handed the newest point - the one being read - the fewest samples, and a window confined
  // to the visible slice invented a cliff at its left edge.
  test('the trend borrows the months before the visible window instead of clipping', () => {
    const chartBalance = [...Array(6).fill(600), ...Array(6).fill(0)];

    const { balance, trend } = queryChart({ overall: { chartBalance } }, 6);

    expect(balance[0]).toBe(0);
    expect(trend[0]).toBeCloseTo((600 + 600 + 0) / 3);
  });

  test('trend and balance line up month for month, whatever the padding', () => {
    const { balance, trend } = queryChart({ overall: { chartBalance: [100, 200] } }, 6);

    expect(trend).toHaveLength(balance.length);
  });

  test('never counts an internal transfer as spending', () => {
    const { expenses, transfers } = queryChart(
      store([tx(2026, 4, 2, 50), tx(2026, 4, 4, 300, { category: C.INTERNAL_TRANSFER })]),
      12,
    );

    expect(expenses[11]).toBe(50);
    expect(transfers[11]).toBe(300);
  });

  test('ignores what happened before the range', () => {
    const { expenses } = queryChart(store([tx(2025, 4, 2, 999), tx(2026, 4, 2, 50)]), 3);

    expect(expenses).toEqual([0, 0, 50]);
  });
});
