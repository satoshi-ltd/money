import { monthIndex } from './monthIndex';

const sum = (values) => values.reduce((total, value) => total + value, 0);

export const budgetState = ({ spent = 0, total }) =>
  !(total > 0) ? 'none' : spent > total ? 'over' : 'within';

export const budgetOf = ({ entry, month, spent = 0, spentBefore = 0 } = {}) => {
  const limit = Number(entry?.limit);
  if (!(limit > 0) || !(month >= entry.since)) return undefined;

  const carried = month > entry.since ? Math.max(0, limit - spentBefore) : 0;
  const total = limit + carried;

  return { carried, left: total - spent, limit, over: Math.max(0, spent - total), spent, state: budgetState({ spent, total }), total };
};

export const budgetsSummary = ({ budgets = {}, month, spent = {}, spentBefore = {} } = {}) => {
  const rows = Object.keys(budgets)
    .map((category) => budgetOf({ entry: budgets[category], month, spent: spent[category], spentBefore: spentBefore[category] }))
    .filter(Boolean);
  if (!rows.length) return undefined;

  return {
    count: rows.length,
    left: sum(rows.map(({ left }) => left)),
    over: rows.filter(({ state }) => state === 'over').length,
    total: sum(rows.map(({ total }) => total)),
  };
};

export const withBudget = (budgets = {}, category, limit, now = Date.now()) => {
  const next = { ...budgets };
  if (!(Number(limit) > 0)) {
    delete next[category];
    return next;
  }
  next[category] = { limit: Number(limit), since: budgets[category]?.since ?? monthIndex(now) };
  return next;
};

export const validBudgets = (budgets, now = Date.now()) =>
  Object.fromEntries(
    Object.entries(budgets && typeof budgets === 'object' ? budgets : {})
      .filter(([category, entry]) => Number.isInteger(Number(category)) && Number(entry?.limit) > 0)
      .map(([category, entry]) => [category, { limit: Number(entry.limit), since: Number.isFinite(entry.since) ? entry.since : monthIndex(now) }]),
  );
