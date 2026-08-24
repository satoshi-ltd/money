import { buildFlowColumns, flowLayout, flowScrollOffset } from '../helpers';

const incomes = [2450, 2450, 2450, 2610, 2450, 2450, 2450, 2450, 2610, 2450, 2900, 2450];
const expenses = [2260, 2310, 2295, 2380, 2530, 2610, 2280, 2190, 2440, 2870, 2540, 1318];

const SLOT = 52;

describe('components/FlowChart/buildFlowColumns', () => {
  // The screen has one range control; the flow used to keep a second one dressed as granularity.
  test('every month of the range gets a column, so the range above commands the chart', () => {
    expect(buildFlowColumns({ incomes, expenses, monthsLimit: 12 })).toHaveLength(12);
    expect(buildFlowColumns({ incomes, expenses, monthsLimit: 6 })).toHaveLength(6);
  });

  test('columns are aligned to global indexes, so a tap maps back to the same month', () => {
    const columns = buildFlowColumns({ incomes, expenses, monthsLimit: 12 });

    expect(columns[0].globalIndex).toBe(0);
    expect(columns[11].globalIndex).toBe(11);
    expect(columns[11].income).toBe(2450);
    expect(columns[11].expense).toBe(1318);
  });

  test('short histories yield fewer columns without crashing', () => {
    const columns = buildFlowColumns({ incomes: [100, 200], expenses: [50, 60], monthsLimit: 2 });

    expect(columns).toHaveLength(2);
    expect(columns[0].globalIndex).toBe(0);
  });
});

describe('components/FlowChart/flowLayout', () => {
  const columns = buildFlowColumns({ incomes, expenses, monthsLimit: 12 });
  const layout = flowLayout({ columns, slotWidth: SLOT, height: 120 });

  test('income and expense meet on the baseline, with no gap between them', () => {
    layout.bars.forEach((bar) => {
      expect(bar.incomeY + bar.incomeHeight).toBeCloseTo(layout.baselineY);
      expect(bar.expenseY).toBe(layout.baselineY);
    });
  });

  test('heights are proportional to values', () => {
    const ratio = layout.bars[11].expenseHeight / layout.bars[10].expenseHeight;
    expect(ratio).toBeCloseTo(1318 / 2540, 2);
  });

  test('the slot is fixed, so more months make a wider chart rather than thinner bars', () => {
    const half = flowLayout({ columns: columns.slice(0, 6), slotWidth: SLOT, height: 120 });

    expect(layout.width).toBe(SLOT * 12);
    expect(half.width).toBe(SLOT * 6);
    expect(half.bars[0].width).toBe(layout.bars[0].width);
  });

  test('averages cover the complete columns only', () => {
    const window = columns.slice(0, -1);
    const expected = window.reduce((total, { expense }) => total + expense, 0) / window.length;
    expect(layout.averages.expense).toBeCloseTo(expected);
  });

  test('returns nothing without data or size', () => {
    expect(flowLayout({ columns: [], slotWidth: SLOT, height: 120 })).toBeUndefined();
    expect(flowLayout({ columns, slotWidth: 0, height: 120 })).toBeUndefined();
  });
});

describe('components/FlowChart/flowScrollOffset', () => {
  const frame = { count: 12, slotWidth: SLOT, viewportWidth: SLOT * 6 };

  test('it centres the month picked on the line chart', () => {
    expect(flowScrollOffset({ ...frame, index: 6 })).toBe(SLOT * 6 + SLOT / 2 - SLOT * 3);
  });

  test('it never scrolls past either end', () => {
    expect(flowScrollOffset({ ...frame, index: 0 })).toBe(0);
    expect(flowScrollOffset({ ...frame, index: 11 })).toBe(SLOT * 12 - SLOT * 6);
  });

  test('a range that already fits does not scroll at all', () => {
    expect(flowScrollOffset({ count: 6, index: 5, slotWidth: SLOT, viewportWidth: SLOT * 6 })).toBe(0);
  });
});
