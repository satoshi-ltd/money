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
