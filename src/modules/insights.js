import { C } from './constants';
import { exchange } from './exchange';
import { isInternalTransfer } from './isInternalTransfer';
import { L10N } from './l10n';
import { getOccurrencesBetween } from './recurrence';

const { TX: { TYPE } = {} } = C;

const MONTH_WINDOW = 3;
const TREND_MONTHS = 6;
const PACE_MONTHS = 6;

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

const monthDateFromKey = (key) => {
  const [year, month] = `${key}`.split('-');
  return new Date(Number(year), Number(month) - 1, 1);
};

export const buildInsights = ({
  accounts = [],
  now: nowProp,
  rates = {},
  scheduledTxs = [],
  settings = {},
  txs = [],
} = {}) => {
  const baseCurrency = settings.baseCurrency;
  const now = nowProp instanceof Date ? nowProp : new Date();
  const currentKey = monthKey(now);
  const previousKeys = getPreviousMonths(now, MONTH_WINDOW);

  const accountMap = new Map(accounts.map((account) => [account.hash, account]));

  const totals = {
    expenses: {},
    expensesByDay: {},
    incomes: {},
    categories: {},
    categoriesByDay: {},
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
      const day = date.getDate();
      if (!totals.expensesByDay[key]) totals.expensesByDay[key] = {};
      totals.expensesByDay[key][day] = (totals.expensesByDay[key][day] || 0) + valueBase;
      if (tx.category) {
        if (!totals.categories[key]) totals.categories[key] = {};
        totals.categories[key][tx.category] = (totals.categories[key][tx.category] || 0) + valueBase;

        if (!totals.categoriesByDay[key]) totals.categoriesByDay[key] = {};
        if (!totals.categoriesByDay[key][day]) totals.categoriesByDay[key][day] = {};
        totals.categoriesByDay[key][day][tx.category] =
          (totals.categoriesByDay[key][day][tx.category] || 0) + valueBase;
      }
    } else if (tx.type === TYPE.INCOME) {
      totals.incomes[key] = (totals.incomes[key] || 0) + valueBase;
    }
  });

  const currentExpenses = totals.expenses[currentKey] || 0;
  const currentIncomes = totals.incomes[currentKey] || 0;

  const day = now.getDate();
  const cumulativeExpensesMemo = {};
  const cumulativeExpenses = (key) => {
    if (cumulativeExpensesMemo[key] !== undefined) return cumulativeExpensesMemo[key];
    const daily = totals.expensesByDay[key];
    if (!daily) {
      cumulativeExpensesMemo[key] = 0;
      return 0;
    }
    const effectiveDay = Math.min(day, getDaysInMonth(monthDateFromKey(key)));
    let cumulative = 0;
    for (let d = 1; d <= effectiveDay; d += 1) cumulative += daily[d] || 0;
    cumulativeExpensesMemo[key] = cumulative;
    return cumulative;
  };
  const cumulativeCategoriesMemo = {};
  const cumulativeCategories = (key) => {
    if (cumulativeCategoriesMemo[key]) return cumulativeCategoriesMemo[key];
    const daily = totals.categoriesByDay[key];
    if (!daily) {
      cumulativeCategoriesMemo[key] = {};
      return {};
    }
    const effectiveDay = Math.min(day, getDaysInMonth(monthDateFromKey(key)));
    const out = {};
    for (let d = 1; d <= effectiveDay; d += 1) {
      const dayCats = daily[d];
      if (!dayCats) continue;
      Object.entries(dayCats).forEach(([category, amount]) => {
        out[category] = (out[category] || 0) + amount;
      });
    }
    cumulativeCategoriesMemo[key] = out;
    return out;
  };

  const previousSpendKeys = previousKeys.filter((key) => (totals.expenses[key] || 0) > 0);
  const avgExpenses = previousSpendKeys.length
    ? previousSpendKeys.reduce((sum, key) => sum + cumulativeExpenses(key), 0) / previousSpendKeys.length
    : 0;

  const insights = [];

  const trendKeys = getRecentMonths(now, TREND_MONTHS);
  const expenseTrend = trendKeys.map((key) => cumulativeExpenses(key));
  const hasTrend = expenseTrend.some((value) => value > 0);
  if (avgExpenses > 0) {
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

  const currentCategories = cumulativeCategories(currentKey);
  const topCategories = Object.entries(currentCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => {
      const avg = previousSpendKeys.length
        ? previousSpendKeys.reduce((sum, key) => sum + (cumulativeCategories(key)?.[category] || 0), 0) /
          previousSpendKeys.length
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

  const topMover = topCategories.filter(({ avg }) => avg > 0).sort((a, b) => b.delta - a.delta)[0];
  const topMoverInsight =
    topMover && Number.isFinite(topMover.delta)
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
      tone:
        currentIncomes - currentExpenses > 0
          ? 'positive'
          : currentIncomes - currentExpenses < 0
          ? 'negative'
          : 'neutral',
    });
  }

  const daysInMonth = getDaysInMonth(now);
  if (currentExpenses > 0 && day >= 2) {
    const tomorrowMidday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0, 0, 0);
    const endOfMonthMidday = new Date(now.getFullYear(), now.getMonth() + 1, 0, 12, 0, 0, 0);
    const fromAt = tomorrowMidday.getTime();
    const toAt = endOfMonthMidday.getTime();
    const remainingScheduledExpenses = (Array.isArray(scheduledTxs) ? scheduledTxs : []).reduce((sum, scheduled) => {
      if (scheduled.type !== TYPE.EXPENSE) return sum;
      const occurrences = getOccurrencesBetween({ scheduled, fromAt, toAt });
      if (!occurrences.length) return sum;
      const account = accountMap.get(scheduled.account);
      const currency = account?.currency || baseCurrency;
      return (
        sum +
        occurrences.reduce(
          (occurrenceSum, occurrenceAt) =>
            occurrenceSum + exchange(scheduled.value, currency, baseCurrency, rates, occurrenceAt),
          0,
        )
      );
    }, 0);

    const paceKeys = getPreviousMonths(now, PACE_MONTHS);
    const ratios = paceKeys
      .map((key) => {
        const total = totals.expenses[key] || 0;
        if (!total) return null;
        const daily = totals.expensesByDay[key];
        if (!daily) return null;

        const effectiveDay = Math.min(day, getDaysInMonth(monthDateFromKey(key)));
        let cumulative = 0;
        for (let d = 1; d <= effectiveDay; d += 1) cumulative += daily[d] || 0;
        const ratio = cumulative / total;
        if (!Number.isFinite(ratio)) return null;
        if (ratio < 0.05 || ratio >= 0.995) return null;
        return ratio;
      })
      .filter((ratio) => typeof ratio === 'number' && Number.isFinite(ratio));

    const avgRatio = ratios.length ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length : undefined;
    const useHistoricalRatio = Number.isFinite(avgRatio) && ratios.length >= 3;
    const baseProjection = useHistoricalRatio ? currentExpenses / avgRatio : (currentExpenses / day) * daysInMonth;
    const scheduledAwareProjection = currentExpenses + remainingScheduledExpenses;
    const projected = Math.max(baseProjection, scheduledAwareProjection);
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
        method: useHistoricalRatio ? 'historical_ratio' : 'linear',
        scheduledFloor: scheduledAwareProjection,
        ratioAvg: avgRatio,
        ratioSamples: ratios.length,
        scheduledRemaining: remainingScheduledExpenses,
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
