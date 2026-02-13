import { C } from '../constants';
import { buildInsights } from '../insights';

describe('modules/insights scheduled projection', () => {
  test('uses scheduled expenses as projection floor in spending pace', () => {
    const now = new Date(2025, 5, 15, 12, 0, 0, 0); // Jun 15, 2025
    const accounts = [{ hash: 'a1', currency: C.CURRENCY }];
    const settings = { baseCurrency: C.CURRENCY };
    const scheduledTxs = [
      {
        id: 'r1',
        account: 'a1',
        type: C.TX.TYPE.EXPENSE,
        value: 10,
        startAt: new Date(2025, 5, 1, 12, 0, 0, 0).getTime(),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 20 },
      },
    ];

    const txs = [
      {
        account: 'a1',
        category: 1,
        timestamp: new Date(2025, 5, 2, 12, 0, 0, 0).getTime(),
        title: 'Groceries',
        type: C.TX.TYPE.EXPENSE,
        value: 10,
      },
    ];

    const insights = buildInsights({ accounts, now, scheduledTxs, settings, rates: {}, txs });
    const pace = insights.find((item) => item.id === 'spending_pace');
    expect(pace).toBeDefined();
    expect(pace.meta.scheduledRemaining).toBe(10);
    expect(pace.value).toBeGreaterThanOrEqual(20);
    expect(insights.find((item) => item.id === 'forecast_net_end_month')).toBeUndefined();
  });

  test('exposes scheduled pending income/expense in net balance meta', () => {
    const now = new Date(2025, 5, 15, 12, 0, 0, 0); // Jun 15, 2025
    const accounts = [{ hash: 'a1', currency: C.CURRENCY }];
    const settings = { baseCurrency: C.CURRENCY };
    const scheduledTxs = [
      {
        id: 'ri',
        account: 'a1',
        type: C.TX.TYPE.INCOME,
        value: 30,
        startAt: new Date(2025, 5, 1, 12, 0, 0, 0).getTime(),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 20 },
      },
      {
        id: 're',
        account: 'a1',
        type: C.TX.TYPE.EXPENSE,
        value: 10,
        startAt: new Date(2025, 5, 1, 12, 0, 0, 0).getTime(),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 22 },
      },
    ];

    const txs = [
      {
        account: 'a1',
        category: 1,
        timestamp: new Date(2025, 5, 2, 12, 0, 0, 0).getTime(),
        title: 'Salary',
        type: C.TX.TYPE.INCOME,
        value: 100,
      },
      {
        account: 'a1',
        category: 2,
        timestamp: new Date(2025, 5, 3, 12, 0, 0, 0).getTime(),
        title: 'Food',
        type: C.TX.TYPE.EXPENSE,
        value: 20,
      },
    ];

    const insights = buildInsights({ accounts, now, scheduledTxs, settings, rates: {}, txs });
    const net = insights.find((item) => item.id === 'net_balance');

    expect(net).toBeDefined();
    expect(net.meta.scheduledIncomesRemaining).toBe(30);
    expect(net.meta.scheduledExpensesRemaining).toBe(10);
  });
});
