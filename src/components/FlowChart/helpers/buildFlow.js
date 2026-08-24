import { getLastMonths, L10N } from '../../../modules';

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

export const flowLayout = ({ columns = [], slotWidth = 0, height = 0 }) => {
  if (!columns.length || slotWidth <= 0 || height <= 0) return undefined;

  const PAD = 8;
  const usable = height - PAD * 2;
  const maxIncome = Math.max(0, ...columns.map(({ income }) => income));
  const maxExpense = Math.max(0, ...columns.map(({ expense }) => expense));
  // One scale for both directions, and a baseline placed so neither side wastes room.
  const scale = usable / Math.max(1, maxIncome + maxExpense);
  const baselineY = PAD + maxIncome * scale;

  const width = slotWidth * columns.length;
  const barWidth = Math.min(28, Math.round(slotWidth * 0.46));

  const bars = columns.map(({ expense, income }, index) => {
    const incomeHeight = income > 0 ? Math.max(2, income * scale) : 0;
    const expenseHeight = expense > 0 ? Math.max(2, expense * scale) : 0;

    return {
      x: slotWidth * index + (slotWidth - barWidth) / 2,
      width: barWidth,
      incomeY: baselineY - incomeHeight,
      incomeHeight,
      expenseY: baselineY,
      expenseHeight,
    };
  });

  const complete = columns.length > 1 ? columns.slice(0, -1) : columns;
  const mean = (key) => complete.reduce((total, column) => total + column[key], 0) / complete.length;
  const averages = { expense: mean('expense'), income: mean('income') };

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
