import { C } from './constants';
import { exchange } from './exchange';
import { isInternalTransfer } from './isInternalTransfer';
import { L10N } from './l10n';

const { TX: { TYPE } = {} } = C;

const MONTH_WINDOW = 3;
const TREND_MONTHS = 6;

const monthKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${year}-${month}`;
};

const getPreviousMonths = (date, count) => {
  const months = [];
  for (let i = 1; i <= count; i += 1) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  return months;
};

const getRecentMonths = (date, count) => {
  const months = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    months.push(monthKey(d));
  }
  return months;
};

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const formatPercent = (value) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`;
const formatPercentAbs = (value) => `${Math.round(Math.abs(value))}%`;

export const buildInsights = ({ accounts = [], rates = {}, settings = {}, txs = [] } = {}) => {
  const baseCurrency = settings.baseCurrency;
  const now = new Date();
  const currentKey = monthKey(now);
  const previousKeys = getPreviousMonths(now, MONTH_WINDOW);

  const accountMap = new Map(accounts.map((account) => [account.hash, account]));

  const totals = {
    expenses: {},
    incomes: {},
    categories: {},
  };

  txs.forEach((tx) => {
    if (!tx || tx.timestamp === undefined) return;
    if (isInternalTransfer(tx)) return;

    const date = new Date(tx.timestamp);
    const key = monthKey(date);
    const account = accountMap.get(tx.account);
    const currency = account?.currency || baseCurrency;
    const valueBase = exchange(tx.value, currency, baseCurrency, rates, tx.timestamp);

    if (tx.type === TYPE.EXPENSE) {
      totals.expenses[key] = (totals.expenses[key] || 0) + valueBase;
      if (tx.category) {
        if (!totals.categories[key]) totals.categories[key] = {};
        totals.categories[key][tx.category] = (totals.categories[key][tx.category] || 0) + valueBase;
      }
    } else if (tx.type === TYPE.INCOME) {
      totals.incomes[key] = (totals.incomes[key] || 0) + valueBase;
    }
  });

  const currentExpenses = totals.expenses[currentKey] || 0;
  const currentIncomes = totals.incomes[currentKey] || 0;

  const avgExpenses = previousKeys.length
    ? previousKeys.reduce((sum, key) => sum + (totals.expenses[key] || 0), 0) / previousKeys.length
    : 0;

  const insights = [];

  const trendKeys = getRecentMonths(now, TREND_MONTHS);
  const expenseTrend = trendKeys.map((key) => totals.expenses[key] || 0);
  const hasTrend = expenseTrend.some((value) => value > 0);
  if (avgExpenses > 0 && currentExpenses > 0) {
    const delta = ((currentExpenses - avgExpenses) / avgExpenses) * 100;
    const title =
      delta > 5
        ? L10N.INSIGHT_SPENDING_MORE_TITLE
        : delta < -5
          ? L10N.INSIGHT_SPENDING_LESS_TITLE
          : L10N.INSIGHT_SPENDING_FLAT_TITLE;
    insights.push({
      id: 'spending_trend',
      title,
      caption: L10N.INSIGHT_VS_LAST_3_MONTHS,
      type: 'trend',
      value: delta,
      valueLabel: formatPercentAbs(delta),
      tone: delta > 5 ? 'negative' : delta < -5 ? 'positive' : 'neutral',
      chart: hasTrend ? { values: expenseTrend, monthsLimit: TREND_MONTHS } : undefined,
    });
  } else if (hasTrend) {
    insights.push({
      id: 'spending_trend',
      title: L10N.INSIGHT_SPENDING_TREND_FALLBACK,
      caption: L10N.INSIGHT_LAST_6_MONTHS,
      type: 'trend',
      chart: { values: expenseTrend, monthsLimit: TREND_MONTHS },
      tone: 'neutral',
    });
  }

  const currentCategories = totals.categories[currentKey] || {};
  const topCategories = Object.entries(currentCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => {
      const avg = previousKeys.length
        ? previousKeys.reduce((sum, key) => sum + (totals.categories[key]?.[category] || 0), 0) /
          previousKeys.length
        : 0;
      const delta = avg > 0 ? ((amount - avg) / avg) * 100 : 0;
      const label = L10N.CATEGORIES?.[0]?.[category] || `${category}`;
      const share = currentExpenses > 0 ? (amount / currentExpenses) * 100 : 0;
      return { category: Number(category), label, amount, avg, delta, share };
    });

  if (topCategories.length > 0) {
    insights.push({
      id: 'top_categories',
      title: L10N.INSIGHT_TOP_CATEGORIES_TITLE,
      caption: L10N.INSIGHT_TOP_CATEGORIES_CAPTION,
      type: 'categories',
      items: topCategories,
      tone: 'neutral',
    });
  }

  const topMover = topCategories
    .filter(({ avg }) => avg > 0)
    .sort((a, b) => b.delta - a.delta)[0];
  const topMoverInsight = topMover && Number.isFinite(topMover.delta)
    ? {
        id: 'top_mover',
        title: L10N.INSIGHT_TOP_MOVER_TITLE,
        caption: `${topMover.label} ${L10N.INSIGHT_VS_LAST_3_MONTHS}`,
        type: 'mover',
        value: topMover.delta,
        valueLabel: formatPercentAbs(topMover.delta),
        meta: {
          current: topMover.amount,
          avg: topMover.avg,
        },
        tone: topMover.delta >= 0 ? 'positive' : 'negative',
      }
    : null;

  if (currentExpenses > 0 || currentIncomes > 0) {
    insights.push({
      id: 'net_balance',
      title: L10N.INSIGHT_NET_BALANCE_TITLE,
      caption: L10N.INSIGHT_NET_BALANCE_CAPTION,
      type: 'net',
      value: currentIncomes - currentExpenses,
      meta: {
        incomes: currentIncomes,
        expenses: currentExpenses,
      },
      tone: currentIncomes - currentExpenses > 0 ? 'positive' : currentIncomes - currentExpenses < 0 ? 'negative' : 'neutral',
    });
  }

  const day = now.getDate();
  const daysInMonth = getDaysInMonth(now);
  if (currentExpenses > 0 && day >= 2) {
    const projected = (currentExpenses / day) * daysInMonth;
    insights.push({
      id: 'spending_pace',
      title: L10N.INSIGHT_SPENDING_PACE_TITLE,
      caption: L10N.INSIGHT_SPENDING_PACE_CAPTION,
      type: 'pace',
      value: projected,
      meta: {
        spent: currentExpenses,
        projected,
        day,
        daysInMonth,
      },
      tone: 'neutral',
    });
  }

  if (topMoverInsight) {
    const isTopCategory = topCategories.some((item) => item.category === topMover.category);
    if (!isTopCategory) insights.push(topMoverInsight);
  }

  return insights;
};
