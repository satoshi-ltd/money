import { C } from '../constants';
import { buildInsights } from '../insights';
import { L10N } from '../l10n';

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

const income = (year, month, day, value, category = 2) => ({
  account: 'a1',
  category,
  timestamp: at(year, month, day),
  type: INCOME,
  value,
});

const categoryLabel = (category) => L10N.CATEGORIES?.[0]?.[category] || `${category}`;

const build = (props) => buildInsights({ accounts: [ACCOUNT], rates: {}, settings: SETTINGS, ...props });
const find = (insights, id) => insights.find((insight) => insight.id === id);

// Three months of 1,000 spent on the 10th: a baseline any comparison can lean on.
const baseline = (category = 1) => [1, 2, 3].map((back) => expense(2025, 5 - back, 10, 1000, category));

const FIRST = new Date(2025, 5, 1, 12);

// A month that spends most of itself after the 1st, so one day is too small a share of it to compare with.
const spread = (month, first) => [expense(2025, month, 1, first), expense(2025, month, 15, 5000)];

describe('modules/insights lead', () => {
  test('it reports what was spent and what is usual by today', () => {
    const now = new Date(2025, 5, 20, 12);
    const { meta } = find(build({ now, txs: [...baseline(), expense(2025, 5, 5, 1500)] }), 'spending_trend');

    expect(meta).toMatchObject({ baseline: 1000, day: 20, spent: 1500 });
  });

  // The lead used to vanish for anyone without three months of history, so a new ledger rendered the
  // "This month" heading over an empty card - which is every user onboarding has just finished creating.
  test('a ledger too young to have a baseline still says what it spent', () => {
    const now = new Date(2025, 5, 20, 12);
    const { meta, value } = find(build({ now, txs: [expense(2025, 5, 5, 240)] }), 'spending_trend');

    expect(meta).toMatchObject({ day: 20, spent: 240 });
    expect(meta.baseline).toBeUndefined();
    expect(value).toBeUndefined();
  });

  // On the 1st the month has nothing to compare against, so the card led with a figure and no reading at all.
  test('the first days of a month lead with the month that closed instead', () => {
    const now = new Date(2025, 5, 1, 12);
    // The three months before the closed one, so it is the one being read and not part of its own baseline.
    const before = [1, 2, 3].map((back) => expense(2025, 4 - back, 10, 1000));
    const closed = find(build({ now, txs: [...before, expense(2025, 4, 10, 1500)] }), 'closed_month');

    expect(closed.value).toBe(1500);
    expect(new Date(closed.meta.at).getMonth()).toBe(4);
    expect(closed.meta.delta).toBe(50);
  });

  test('once the month has enough of itself to compare, the closed one steps aside', () => {
    const now = new Date(2025, 5, 20, 12);
    const insights = build({ now, txs: [...baseline(), expense(2025, 5, 5, 1500)] });

    expect(find(insights, 'closed_month')).toBeUndefined();
    expect(find(insights, 'spending_trend').value).toBe(50);
  });

  test('a month that closed on nothing is not worth a row', () => {
    const now = new Date(2025, 5, 1, 12);

    expect(find(build({ now, txs: [expense(2025, 2, 10, 900)] }), 'closed_month')).toBeUndefined();
  });

  // A day of month cannot carry a percentage, but a figure above every month it is measured against has a
  // direction, and the view says that in words rather than leaving the row with an empty right side.
  test('too little of the month to earn a percentage still earns a verdict', () => {
    const before = [spread(4, 100), spread(3, 100), spread(2, 100)].flat();
    const { meta, value } = find(build({ now: FIRST, txs: [...before, expense(2025, 5, 1, 900)] }), 'spending_trend');

    expect(value).toBeUndefined();
    expect(meta.baseline).toBeUndefined();
    expect(meta.direction).toBe('over');
  });

  test('a figure inside the range it is measured against is called usual, not a direction', () => {
    const before = [spread(4, 100), spread(3, 900), spread(2, 400)].flat();
    const { meta } = find(build({ now: FIRST, txs: [...before, expense(2025, 5, 1, 500)] }), 'spending_trend');

    expect(meta.direction).toBe('flat');
  });

  test('one month of history is no range, so nothing is called anything', () => {
    const { meta } = find(build({ now: FIRST, txs: [...spread(4, 100), expense(2025, 5, 1, 900)] }), 'spending_trend');

    expect(meta.direction).toBeUndefined();
  });

  // A median of three is beaten by two: school terms one month and a phone the next became "usual".
  test('two one-off months out of six do not become the usual', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [
      expense(2025, 4, 5, 5000),
      expense(2025, 3, 5, 5000),
      ...[2, 1, 0].map((month) => expense(2025, month, 5, 100)),
      expense(2024, 11, 5, 100),
      expense(2025, 5, 5, 90),
    ];

    expect(find(build({ now, txs }), 'spending_trend').meta.baseline).toBe(100);
  });

  test('nothing spent and nothing to compare against emits nothing to render', () => {
    expect(build({ now: new Date(2025, 5, 10, 12), txs: [] })).toEqual([]);
  });

  test('the direction is decided once here, so a flat month never prints as above pace', () => {
    const now = new Date(2025, 5, 20, 12);
    const flat = find(build({ now, txs: [...baseline(), expense(2025, 5, 5, 1030)] }), 'spending_trend');
    const over = find(build({ now, txs: [...baseline(), expense(2025, 5, 5, 1500)] }), 'spending_trend');
    const under = find(build({ now, txs: [...baseline(), expense(2025, 5, 5, 500)] }), 'spending_trend');

    expect([flat.meta.direction, over.meta.direction, under.meta.direction]).toEqual(['flat', 'over', 'under']);
  });

  test('it carries no chart: charts live in Analytics', () => {
    const now = new Date(2025, 5, 20, 12);
    const trend = find(build({ now, txs: [...baseline(), expense(2025, 5, 5, 1500)] }), 'spending_trend');

    expect(trend.chart).toBeUndefined();
  });
});

describe('modules/insights swing', () => {
  // Figure and name must refer to the same thing: a total overshoot beside one category's name reads as
  // if that category explained all of it, and at month end it did not.
  test('the figure is how far that named category moved, not the whole month', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [...baseline(), expense(2025, 5, 5, 1000), expense(2025, 5, 6, 900, 4), ...baseline(4).map((tx) => ({ ...tx, value: 300 }))];
    const swing = find(build({ now, txs }), 'swing');

    expect(swing.value).toBe(600);
    expect(swing.meta.label).toBe(categoryLabel(4));
  });

  // A ratio on a near-zero baseline printed +965% and named a category that had barely moved any money.
  test('a tiny category that multiplied cannot outrank a large one that moved real money', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [];
    [1, 2, 3].forEach((back) => {
      txs.push(expense(2025, 5 - back, 10, 2000, 1));
      txs.push(expense(2025, 5 - back, 11, 30, 4));
    });
    txs.push(expense(2025, 5, 5, 3200, 1));
    txs.push(expense(2025, 5, 6, 319.5, 4));

    expect(find(build({ now, txs }), 'swing').meta.label).toBe(categoryLabel(1));
  });

  test('a month under its usual reads as a cut, not an overshoot', () => {
    const now = new Date(2025, 5, 20, 12);

    expect(find(build({ now, txs: [...baseline(), expense(2025, 5, 5, 100)] }), 'swing').value).toBe(-900);
  });

  test('one month of history is not a baseline anyone should be told about', () => {
    const now = new Date(2025, 5, 20, 12);

    expect(find(build({ now, txs: [expense(2025, 4, 10, 1000), expense(2025, 5, 5, 4000)] }), 'swing')).toBeUndefined();
  });
});

describe('modules/insights income', () => {
  // The only place on the home screen where money coming in appears at all.
  test('it reports what came in this month', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [expense(2025, 5, 5, 1000), income(2025, 5, 6, 4000)];

    expect(find(build({ now, txs }), 'incomes').value).toBe(4000);
  });

  // Where the money came from, read off the income categories - the mirror of the swing naming where it went.
  test('it names the biggest source and the share it accounts for', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [income(2025, 5, 6, 6450, 1), income(2025, 5, 9, 9750, 7), income(2025, 5, 11, 340, 3)];
    const { meta } = find(build({ now, txs }), 'incomes');

    expect(meta.label).toBe(L10N.CATEGORIES[1][7]);
    expect(meta.share).toBe(59);
  });

  // Income categories are their own group: reading the expense names here would call Royalties "Shopping".
  test('it reads the income names, not the expense ones', () => {
    const now = new Date(2025, 5, 20, 12);

    expect(find(build({ now, txs: [income(2025, 5, 6, 3200, 7)] }), 'incomes').meta.label).toBe(L10N.CATEGORIES[1][7]);
  });

  test('a month with a single source names it and says no percentage at all', () => {
    const now = new Date(2025, 5, 20, 12);
    const one = find(build({ now, txs: [income(2025, 5, 6, 3200, 1), income(2025, 5, 20, 900, 1)] }), 'incomes');
    const two = find(build({ now, txs: [income(2025, 5, 6, 3200, 1), income(2025, 5, 20, 900, 7)] }), 'incomes');

    expect(one.meta.share).toBeUndefined();
    expect(two.meta.share).toBe(78);
  });

  // A net figure read -2,901 on the 20th and +15,688 on the 25th with identical behaviour: incomes are
  // counted to date, so the sign was decided by payday rather than by anything the reader did.
  // Hidden from Analytics and still counted on Overview left the same month telling two stories.
  test('a movement marked by hand never reaches the month, on this screen either', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [income(2025, 5, 6, 4000), { ...income(2025, 5, 7, 900000), meta: { moved: true } }];

    expect(find(build({ now, txs }), 'incomes').value).toBe(4000);
  });

  test('and a marked expense is not a month of spending', () => {
    const now = new Date(2025, 5, 20, 12);
    const txs = [...baseline(), expense(2025, 5, 5, 1500), { ...expense(2025, 5, 6, 900000), meta: { moved: true } }];

    expect(find(build({ now, txs }), 'spending_trend').meta.spent).toBe(1500);
  });

  test('a month before payday says nothing rather than a figure the calendar made negative', () => {
    const now = new Date(2025, 5, 20, 12);

    expect(find(build({ now, txs: [expense(2025, 5, 5, 1000)] }), 'incomes')).toBeUndefined();
  });

  test('what it shows only ever grows as the month runs', () => {
    const txs = [income(2025, 5, 6, 4000), income(2025, 5, 25, 1500)];
    const early = find(build({ now: new Date(2025, 5, 10, 12), txs }), 'incomes');
    const late = find(build({ now: new Date(2025, 5, 28, 12), txs }), 'incomes');

    expect(late.value).toBeGreaterThan(early.value);
  });
});

describe('modules/insights scheduled', () => {
  test('it nets what is still to land and counts both sides', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 100), expense(2025, 5, 25, 60), income(2025, 5, 28, 500)];
    const { meta, value } = find(build({ now, txs }), 'scheduled');

    expect(value).toBe(440);
    expect(meta).toEqual({ pending: 2 });
  });

  test('an occurrence already recorded as a transaction is not counted a second time', () => {
    const now = new Date(2025, 5, 10, 12);
    const scheduledTxs = [
      { account: 'a1', category: 1, id: 's1', recurrence: 'monthly', timestamp: at(2025, 4, 25), type: EXPENSE, value: 50 },
    ];
    const recorded = { ...expense(2025, 5, 25, 50), scheduledId: 's1', scheduledOccurrenceAt: at(2025, 5, 25) };

    const withBoth = find(build({ now, scheduledTxs, txs: [recorded] }), 'scheduled');

    expect(withBoth.meta.pending).toBe(1);
  });

  test('a month with nothing left to land says nothing', () => {
    const now = new Date(2025, 5, 28, 12);

    expect(find(build({ now, txs: [expense(2025, 5, 5, 100)] }), 'scheduled')).toBeUndefined();
  });
});

// Comparing a spot-converted month against month-open baselines is not a comparison: with one table the rate
// cancels, so the bar moves only when the user does.
describe('modules/insights constant currency', () => {
  const foreign = [{ hash: 'a1', currency: 'THB' }];
  const txs = [...baseline(), expense(2025, 5, 5, 1500)];

  test('a rate that moved between months does not move the comparison', () => {
    const now = new Date(2025, 5, 20, 12);
    const steady = buildInsights({ accounts: foreign, now, rates: { '2025-06': { THB: 32 } }, settings: SETTINGS, txs });
    const moved = buildInsights({
      accounts: foreign,
      now,
      rates: { '2025-03': { THB: 40 }, '2025-04': { THB: 36 }, '2025-06': { THB: 32 } },
      settings: SETTINGS,
      txs,
    });

    expect(find(moved, 'spending_trend').value).toBe(find(steady, 'spending_trend').value);
    expect(find(moved, 'since')?.value).toBe(find(steady, 'since')?.value);
  });
});

describe('modules/insights hygiene', () => {
  test('it ignores transactions whose account no longer exists', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 100), { ...expense(2025, 5, 6, 900), account: 'gone' }];

    expect(find(build({ now, txs }), 'spending_trend').meta.spent).toBe(100);
  });

  test('it ignores amounts a hand-edited backup made non numeric', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 100), { ...expense(2025, 5, 6, 900), value: 'lots' }];

    expect(find(build({ now, txs }), 'spending_trend').meta.spent).toBe(100);
  });

  test('it drops what it cannot convert instead of counting it as zero', () => {
    const now = new Date(2025, 5, 10, 12);
    const accounts = [ACCOUNT, { hash: 'a2', currency: 'EUR' }];
    const txs = [expense(2025, 5, 5, 100), { ...expense(2025, 5, 6, 500), account: 'a2' }];

    expect(find(buildInsights({ accounts, now, rates: {}, settings: SETTINGS, txs }), 'spending_trend').meta.spent).toBe(100);
  });

  test('it excludes internal transfers', () => {
    const now = new Date(2025, 5, 10, 12);
    const txs = [expense(2025, 5, 5, 100), expense(2025, 5, 6, 900, C.INTERNAL_TRANSFER)];

    expect(find(build({ now, txs }), 'spending_trend').meta.spent).toBe(100);
  });
});
