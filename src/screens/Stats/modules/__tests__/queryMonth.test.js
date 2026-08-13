import queryMonth from '../queryMonth';
import { C } from '../../../../modules';

const { EXPENSE, INCOME } = C.TX.TYPE;

const store = (txs) => ({
  accounts: [{ hash: 'a1', currency: C.CURRENCY }],
  rates: {},
  settings: { baseCurrency: C.CURRENCY },
  txs,
});

const tx = (year, month, day, value, { category = 1, title = 'Coffee', type = EXPENSE } = {}) => ({
  account: 'a1',
  category,
  hash: `${year}-${month}-${day}-${value}`,
  timestamp: new Date(year, month, day, 12).getTime(),
  title,
  type,
  value,
});

describe('screens/Stats/queryMonth', () => {
  afterEach(() => jest.useRealTimers());

  test('reads the month asked for even when today has no matching day', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 31, 10, 0, 0));

    const values = queryMonth(store([tx(2026, 3, 15, 40), tx(2026, 4, 2, 90)]), 10, 12);

    expect(values.expenses[1]).toEqual({ coffee: 40 });
  });

  test('reads the current month at the last index', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 31, 10, 0, 0));

    const values = queryMonth(store([tx(2026, 3, 15, 40), tx(2026, 4, 2, 90)]), 11, 12);

    expect(values.expenses[1]).toEqual({ coffee: 90 });
  });

  test('keeps expenses and incomes apart and leaves transfers out', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 4, 15, 10, 0, 0));

    const values = queryMonth(
      store([
        tx(2026, 4, 2, 90),
        tx(2026, 4, 3, 500, { category: 2, title: 'Salary', type: INCOME }),
        tx(2026, 4, 4, 300, { category: C.INTERNAL_TRANSFER, title: 'Savings' }),
      ]),
      11,
      12,
    );

    expect(values.expenses).toEqual({ 1: { coffee: 90 } });
    expect(values.incomes).toEqual({ 2: { salary: 500 } });
  });
});
