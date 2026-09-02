import { getLastMonths, L10N, median } from '../../../modules';

// How many columns fit the width; the rest are reached by scrolling, never by a second range control.
export const FLOW_VISIBLE = 6;

const shortMonth = (monthIndex) => `${L10N.MONTHS[monthIndex] || ''}`.slice(0, 3).toLowerCase();

export const buildFlowColumns = ({ incomes = [], expenses = [], monthsLimit = 0 }) => {
  const length = Math.min(monthsLimit, Math.max(incomes.length, expenses.length));
  if (length <= 0) return [];

  return getLastMonths(monthsLimit)
    .slice(0, length)
    .map((item, index) => ({
      globalIndex: index,
      label: shortMonth(item.month),
      income: incomes[index] || 0,
      expense: expenses[index] || 0,
    }));
};

// How many times the usual month a figure may reach before it is drawn clipped rather than setting the scale
// for every other month. One dividend priced the whole year into slivers.
export const OUTLIER_CEILING = 3;

const ceilingOf = (values = []) => {
  const max = Math.max(0, ...values);
  const usual = median(values) * OUTLIER_CEILING;

  return usual > 0 && max > usual ? usual : max;
};

export const flowLayout = ({ columns = [], slotWidth = 0, height = 0 }) => {
  if (!columns.length || slotWidth <= 0 || height <= 0) return undefined;

  const PAD = 8;
  const usable = height - PAD * 2;
  const incomeCeiling = ceilingOf(columns.map(({ income }) => income));
  const expenseCeiling = ceilingOf(columns.map(({ expense }) => expense));
  // One scale for both directions, and a baseline placed so neither side wastes room.
  const scale = usable / Math.max(1, incomeCeiling + expenseCeiling);
  const baselineY = PAD + incomeCeiling * scale;

  const width = slotWidth * columns.length;
  const barWidth = Math.min(28, Math.round(slotWidth * 0.46));

  const bars = columns.map(({ expense, income }, index) => {
    const incomeHeight = income > 0 ? Math.max(2, Math.min(income, incomeCeiling) * scale) : 0;
    const expenseHeight = expense > 0 ? Math.max(2, Math.min(expense, expenseCeiling) * scale) : 0;

    return {
      x: slotWidth * index + (slotWidth - barWidth) / 2,
      width: barWidth,
      incomeY: baselineY - incomeHeight,
      incomeHeight,
      incomeClipped: income > incomeCeiling,
      expenseY: baselineY,
      expenseHeight,
      expenseClipped: expense > expenseCeiling,
    };
  });

  const complete = columns.length > 1 ? columns.slice(0, -1) : columns;
  // The median, not the mean: the reference a reader measures against cannot be moved by the one month that
  // is being measured. The insights lead already reads its baseline this way.
  const averages = {
    expense: median(complete.map(({ expense }) => expense)),
    income: median(complete.map(({ income }) => income)),
  };

  return {
    averages,
    bars,
    baselineY,
    expenseAverageY: baselineY + averages.expense * scale,
    incomeAverageY: baselineY - averages.income * scale,
    slot: slotWidth,
    width,
  };
};

// Centres the chosen month, so a tap on the line chart brings its column into view.
export const flowScrollOffset = ({ index, slotWidth, viewportWidth, count }) => {
  const max = Math.max(0, slotWidth * count - viewportWidth);
  const centred = slotWidth * index + slotWidth / 2 - viewportWidth / 2;

  return Math.min(max, Math.max(0, centred));
};
