import { C } from '../constants';
import { buildInsights } from '../insights';

const { EXPENSE, INCOME } = C.TX.TYPE;
const ACCOUNT = { hash: 'a1', currency: C.CURRENCY };
const SETTINGS = { baseCurrency: C.CURRENCY };

const at = (year, month, day) => new Date(year, month, day, 12, 0, 0, 0).getTime();

const expense = (year, month, day, value, category = 1) => ({
  account: 'a1',
  category,
  timestamp: at(year, month, day),
  type: EXPENSE,
  value,
});

const income = (year, month, day, value) => ({
  account: 'a1',
  category: 2,
  timestamp: at(year, month, day),
  type: INCOME,
  value,
});

const build = (props) => buildInsights({ accounts: [ACCOUNT], rates: {}, settings: SETTINGS, ...props });
const find = (insights, id) => insights.find((insight) => insight.id === id);

describe('modules/insights trend chart', () => {
  test('plots full-month totals for closed months and month-to-date for the current one', () => {
    const now = new Date(2025, 5, 5, 12);
    const txs = [];
    for (let month = 1; month <= 12; month += 1) {
      txs.push(expense(2025, 5 - month, 20, 600));
      txs.push(expense(2025, 5 - month, 25, 300));
    }
    txs.push(expense(2025, 5, 2, 120));

    const { chart } = find(build({ now, txs }), 'spending_trend');

    expect(chart.values).toEqual([900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 900, 120]);
    expect(chart.monthsLimit).toBe(12);
  });

  test('never emits months before the first transaction, and keeps monthsLimit aligned', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [expense(2025, 3, 10, 400), expense(2025, 4, 10, 500), expense(2025, 5, 10, 300)];

    const { chart } = find(build({ now, txs }), 'spending_trend');

    expect(chart.values).toEqual([400, 500, 300]);
    expect(chart.monthsLimit).toBe(3);
  });
});

describe('modules/insights spending trend', () => {
  test('stays silent instead of reporting a huge delta when the elapsed window carries no history', () => {
    const now = new Date(2025, 5, 2, 12);
    const txs = [
      expense(2025, 2, 15, 1000),
      expense(2025, 3, 15, 1000),
      expense(2025, 4, 15, 1000),
      expense(2025, 5, 1, 1000),
    ];

    const trend = find(build({ now, txs }), 'spending_trend');

    expect(trend.value).toBeUndefined();
    expect(trend.chart.values).toEqual([1000, 1000, 1000, 1000]);
  });

  test('reads flat for a steady spender whose baseline has one late month', () => {
    const now = new Date(2025, 5, 3, 12);
    const txs = [
      expense(2025, 2, 20, 300),
      expense(2025, 3, 1, 300),
      expense(2025, 4, 1, 300),
      expense(2025, 5, 1, 300),
    ];

    const trend = find(build({ now, txs }), 'spending_trend');

    expect(trend.value).toBe(0);
    expect(trend.tone).toBe('neutral');
  });

  test('compares like-for-like windows and flags a real increase as negative tone', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [
      expense(2025, 2, 5, 200),
      expense(2025, 3, 5, 200),
      expense(2025, 4, 5, 200),
      expense(2025, 5, 5, 300),
    ];

    const trend = find(build({ now, txs }), 'spending_trend');

    expect(trend.value).toBe(50);
    expect(trend.valueLabel).toBe('50%');
    expect(trend.tone).toBe('negative');
  });

  test('keeps the headline consistent with the rounded percentage it renders', () => {
    const now = new Date(2025, 5, 28, 12);
    const txs = [
      expense(2025, 2, 5, 1000),
      expense(2025, 3, 5, 1000),
      expense(2025, 4, 5, 1000),
      expense(2025, 5, 5, 1049),
    ];

    const trend = find(build({ now, txs }), 'spending_trend');

    expect(trend.value).toBe(5);
    expect(trend.tone).toBe('neutral');
  });

  test('keeps comparing when a month inside the history had no spending at all', () => {
    const now = new Date(2025, 5, 15, 12);
    const txs = [expense(2025, 0, 10, 900), expense(2025, 4, 10, 1000), expense(2025, 5, 10, 1500)];

    const trend = find(build({ now, txs }), 'spending_trend');

    expect(trend.value).toBe(50);
    expect(trend.caption).toBe('vs your usual');
  });

  test('an empty month never drags the baseline down', () => {
    const now = new Date(2025, 5, 15, 12);
    const txs = [
      expense(2025, 0, 10, 10),
      expense(2025, 3, 10, 500),
      expense(2025, 4, 10, 1500),
      expense(2025, 5, 10, 1000),
    ];

    expect(find(build({ now, txs }), 'spending_trend').value).toBe(0);
  });

  test('clamps runaway deltas', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [
      expense(2025, 2, 5, 1),
      expense(2025, 3, 5, 1),
      expense(2025, 4, 5, 1),
      expense(2025, 5, 5, 100000),
    ];

    expect(find(build({ now, txs }), 'spending_trend').value).toBe(999);
  });
});

describe('modules/insights spending pace', () => {
  test('projects the remaining spend from history instead of extrapolating the elapsed days', () => {
    const now = new Date(2025, 5, 5, 12);
    const txs = [];
    for (let month = 1; month <= 6; month += 1) txs.push(expense(2025, 5 - month, 20, 900));
    txs.push(expense(2025, 5, 2, 200));

    const pace = find(build({ now, txs }), 'spending_pace');

    expect(pace.meta.method).toBe('history');
    expect(pace.value).toBe(1100);
  });

  test('does not extrapolate a brand-new user from the first days of the month', () => {
    const now = new Date(2025, 5, 2, 12);

    expect(find(build({ now, txs: [expense(2025, 5, 1, 1000)] }), 'spending_pace')).toBeUndefined();
  });

  test('falls back to a linear projection once enough of the month has elapsed', () => {
    const now = new Date(2025, 5, 6, 12);
    const pace = find(build({ now, txs: [expense(2025, 5, 1, 100)] }), 'spending_pace');

    expect(pace.meta.method).toBe('linear');
    expect(pace.value).toBe(500);
  });

  test('adds pending scheduled expenses on top of the linear estimate', () => {
    const now = new Date(2025, 5, 10, 12);
    const scheduledTxs = [
      {
        id: 'r1',
        account: 'a1',
        type: EXPENSE,
        value: 1000,
        startAt: at(2025, 5, 1),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 28 },
      },
    ];

    const pace = find(build({ now, scheduledTxs, txs: [expense(2025, 5, 5, 300)] }), 'spending_pace');

    expect(pace.meta.pendingExpenses).toBe(1000);
    expect(pace.value).toBe(1900);
  });

  test('treats scheduled expenses as a floor when history already contains them', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [];
    for (let month = 1; month <= 6; month += 1) txs.push(expense(2025, 5 - month, 28, 1000));
    txs.push(expense(2025, 5, 5, 300));

    const scheduledTxs = [
      {
        id: 'r1',
        account: 'a1',
        type: EXPENSE,
        value: 1000,
        startAt: at(2024, 11, 28),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 28 },
      },
    ];

    const pace = find(build({ now, scheduledTxs, txs }), 'spending_pace');

    expect(pace.meta.method).toBe('history');
    expect(pace.value).toBe(1300);
  });

  test('does not project spend for days the current month does not have', () => {
    const now = new Date(2025, 1, 28, 12);
    const txs = [
      expense(2024, 10, 5, 100),
      expense(2024, 10, 30, 400),
      expense(2024, 11, 5, 100),
      expense(2024, 11, 31, 400),
      expense(2025, 0, 5, 100),
      expense(2025, 0, 31, 400),
      expense(2025, 1, 5, 100),
    ];

    const pace = find(build({ now, txs }), 'spending_pace');

    expect(pace.meta.remainder).toBe(0);
    expect(pace.value).toBe(100);
  });

  test('ignores baseline months too short to have the days still left in the current one', () => {
    const now = new Date(2025, 2, 30, 12);
    const txs = [
      expense(2024, 11, 5, 100),
      expense(2024, 11, 31, 300),
      expense(2025, 0, 5, 100),
      expense(2025, 0, 31, 300),
      expense(2025, 1, 5, 100),
      expense(2025, 2, 5, 100),
    ];

    const pace = find(build({ now, txs }), 'spending_pace');

    expect(pace.meta.samples).toBe(2);
    expect(pace.meta.remainder).toBe(300);
  });

  test('stays silent in the first days of the month even when a bill is scheduled', () => {
    const now = new Date(2025, 5, 3, 12);
    const scheduledTxs = [
      {
        id: 'r1',
        account: 'a1',
        type: EXPENSE,
        value: 50,
        startAt: at(2025, 5, 1),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 25 },
      },
    ];

    expect(find(build({ now, scheduledTxs, txs: [expense(2025, 5, 1, 500)] }), 'spending_pace')).toBeUndefined();
  });

  test('ignores a scheduled occurrence that is already recorded as a transaction', () => {
    const now = new Date(2025, 5, 10, 12);
    const occurrenceAt = at(2025, 5, 28);
    const txs = [
      { ...expense(2025, 5, 5, 300) },
      {
        ...expense(2025, 5, 28, 1000),
        meta: { kind: 'scheduled', occurrenceAt, scheduledId: 'r1' },
      },
    ];
    const scheduledTxs = [
      {
        id: 'r1',
        account: 'a1',
        type: EXPENSE,
        value: 1000,
        startAt: at(2025, 5, 1),
        pattern: { kind: 'monthly', interval: 1, byMonthDay: 28 },
      },
    ];

    const net = find(build({ now, scheduledTxs, txs }), 'net_balance');

    expect(net.meta.pendingExpenses).toBe(1000);
  });
});

describe('modules/insights net balance', () => {
  test('splits realized month-to-date from what is still pending', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [income(2025, 5, 1, 2000), expense(2025, 5, 5, 300), expense(2025, 5, 20, 700)];

    const net = find(build({ now, txs }), 'net_balance');

    expect(net.value).toBe(1700);
    expect(net.meta).toMatchObject({ expenses: 300, incomes: 2000, pendingExpenses: 700, projected: 1000 });
  });
});

describe('modules/insights biggest change', () => {
  test('surfaces the largest move outside the top categories with the right tone', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [];
    for (let month = 1; month <= 3; month += 1) {
      txs.push(expense(2025, 5 - month, 5, 1000, 1));
      txs.push(expense(2025, 5 - month, 5, 800, 2));
      txs.push(expense(2025, 5 - month, 5, 600, 3));
      txs.push(expense(2025, 5 - month, 5, 200, 4));
    }
    txs.push(expense(2025, 5, 5, 1000, 1));
    txs.push(expense(2025, 5, 5, 800, 2));
    txs.push(expense(2025, 5, 5, 600, 3));
    txs.push(expense(2025, 5, 5, 500, 4));

    const insights = build({ now, txs });
    const mover = find(insights, 'top_mover');

    expect(mover).toBeDefined();
    expect(mover.meta).toMatchObject({ avg: 200, current: 500 });
    expect(mover.value).toBe(150);
    expect(mover.tone).toBe('negative');
    expect(find(insights, 'top_categories').items.map(({ category }) => category)).not.toContain(4);
  });

  test('ignores irregular categories that only moved because the baseline is sparse', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [
      expense(2025, 2, 5, 1000, 1),
      expense(2025, 3, 5, 1000, 1),
      expense(2025, 4, 5, 1000, 1),
      expense(2025, 2, 5, 300, 7),
      expense(2025, 5, 5, 1000, 1),
      expense(2025, 5, 5, 400, 7),
    ];

    expect(find(build({ now, txs }), 'top_mover')).toBeUndefined();
  });
});

describe('modules/insights data hygiene', () => {
  test('ignores transactions of accounts that no longer exist', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 300), { ...expense(2025, 5, 6, 150000), account: 'gone' }];

    expect(find(build({ now, txs }), 'net_balance').meta.expenses).toBe(300);
  });

  test('ignores non numeric amounts coming from a hand edited backup', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 20), { ...expense(2025, 5, 6, 0), value: '10.5' }];

    expect(find(build({ now, txs }), 'net_balance').meta.expenses).toBe(30.5);
  });

  test('drops transactions that cannot be converted instead of counting them as zero', () => {
    const now = new Date(2025, 5, 10, 12);
    const accounts = [ACCOUNT, { hash: 'a2', currency: 'EUR' }];
    const txs = [expense(2025, 5, 5, 100), { ...expense(2025, 5, 6, 500, 3), account: 'a2' }];

    const insights = buildInsights({ accounts, now, rates: {}, settings: SETTINGS, txs });

    expect(find(insights, 'net_balance').meta.expenses).toBe(100);
    expect(find(insights, 'top_categories').items).toHaveLength(1);
  });

  test('excludes internal transfers', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 100), expense(2025, 5, 6, 900, C.INTERNAL_TRANSFER)];

    expect(find(build({ now, txs }), 'net_balance').meta.expenses).toBe(100);
  });

  test('returns nothing when there is no data', () => {
    expect(build({ now: new Date(2025, 5, 10, 12), txs: [] })).toEqual([]);
  });
});

describe('modules/insights top categories', () => {
  test('shares are computed over the same month-to-date total', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 2, 300, 1), expense(2025, 5, 3, 100, 2), expense(2025, 5, 25, 600, 3)];

    const { items } = find(build({ now, txs }), 'top_categories');

    expect(items.map(({ category, share }) => [category, share])).toEqual([
      [1, 75],
      [2, 25],
    ]);
  });
});
