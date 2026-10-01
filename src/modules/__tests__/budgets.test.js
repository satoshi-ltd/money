import { budgetOf, budgetsSummary, budgetState, validBudgets, withBudget } from '../budgets';

const SEPTEMBER = 2026 * 12 + 8;

describe('modules/budgets state', () => {
  test('within up to the limit itself, over only past it', () => {
    expect(budgetState({ spent: 79, total: 100 })).toBe('within');
    expect(budgetState({ spent: 80, total: 100 })).toBe('within');
    expect(budgetState({ spent: 100, total: 100 })).toBe('within');
    expect(budgetState({ spent: 100.01, total: 100 })).toBe('over');
  });

  test('a category with no limit has no state', () => {
    expect(budgetState({ spent: 50 })).toBe('none');
  });
});

describe('modules/budgets of a month', () => {
  const entry = { limit: 300, since: SEPTEMBER - 3 };

  // A budget set this month has nothing behind it: counting an empty last month as unspent doubled it on day one.
  test('the month a budget starts carries nothing, however little was spent before', () => {
    expect(budgetOf({ entry: { limit: 300, since: SEPTEMBER }, month: SEPTEMBER, spent: 0, spentBefore: 0 }).total).toBe(300);
  });

  test('what was left last month rides into this one', () => {
    const budget = budgetOf({ entry, month: SEPTEMBER, spent: 226, spentBefore: 255 });

    expect(budget).toMatchObject({ carried: 45, left: 119, limit: 300, over: 0, state: 'within', total: 345 });
  });

  test('an overspent month is not a debt: nothing is carried and nothing is taken off', () => {
    expect(budgetOf({ entry, month: SEPTEMBER, spent: 0, spentBefore: 410 })).toMatchObject({ carried: 0, total: 300 });
  });

  test('past the total the excess is named and the state is over', () => {
    expect(budgetOf({ entry, month: SEPTEMBER, spent: 121, spentBefore: 300, ...{} }).over).toBe(0);
    expect(budgetOf({ entry: { limit: 100, since: SEPTEMBER - 2 }, month: SEPTEMBER, spent: 121, spentBefore: 100 })).toMatchObject({ over: 21, state: 'over' });
  });

  test('a month before the budget existed draws as if there were none', () => {
    expect(budgetOf({ entry, month: entry.since - 1, spent: 500 })).toBeUndefined();
    expect(budgetOf({ entry: undefined, month: SEPTEMBER, spent: 500 })).toBeUndefined();
    expect(budgetOf({ entry: { limit: 0, since: 0 }, month: SEPTEMBER, spent: 500 })).toBeUndefined();
  });
});

describe('modules/budgets summary', () => {
  const budgets = { 1: { limit: 120, since: SEPTEMBER - 2 }, 4: { limit: 300, since: SEPTEMBER - 2 }, 7: { limit: 100, since: SEPTEMBER - 2 } };

  test('what is left of the sum of the limits, and how many categories are over', () => {
    const summary = budgetsSummary({
      budgets,
      month: SEPTEMBER,
      spent: { 1: 105, 4: 226, 7: 121, 9: 999 },
      spentBefore: { 1: 120, 4: 300, 7: 100 },
    });

    expect(summary).toEqual({ count: 3, left: 120 + 300 + 100 - (105 + 226 + 121), over: 1, total: 520 });
  });

  test('without a budget there is no summary to draw', () => {
    expect(budgetsSummary({ budgets: {}, month: SEPTEMBER })).toBeUndefined();
    expect(budgetsSummary({ month: SEPTEMBER })).toBeUndefined();
  });
});

describe('modules/budgets edits', () => {
  const NOW = new Date(2026, 8, 9).getTime();

  test('a new limit starts this month and an edited one keeps its start', () => {
    const created = withBudget({}, 4, '300', NOW);
    const edited = withBudget(created, 4, '350', new Date(2026, 10, 1).getTime());

    expect(created).toEqual({ 4: { limit: 300, since: SEPTEMBER } });
    expect(edited[4]).toEqual({ limit: 350, since: SEPTEMBER });
  });

  test('an empty or zero limit removes the budget and leaves the others', () => {
    const budgets = { 1: { limit: 10, since: 1 }, 4: { limit: 300, since: 1 } };

    expect(withBudget(budgets, 4, '', NOW)).toEqual({ 1: budgets[1] });
    expect(withBudget(budgets, 4, '0', NOW)).toEqual({ 1: budgets[1] });
  });

  test('a stored value is kept only when it is a limit on a category, and starts now when it has no start', () => {
    expect(validBudgets({ 4: { limit: 300, since: 5 }, 7: { limit: -1, since: 5 }, x: { limit: 10, since: 5 }, 9: { limit: 40 } }, NOW)).toEqual({
      4: { limit: 300, since: 5 },
      9: { limit: 40, since: SEPTEMBER },
    });
    expect(validBudgets(undefined)).toEqual({});
    expect(validBudgets([1, 2])).toEqual({});
  });
});
