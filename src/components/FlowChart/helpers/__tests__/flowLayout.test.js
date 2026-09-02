import { flowLayout } from '../buildFlow';

const columns = (pairs) =>
  pairs.map(([income, expense], index) => ({ expense, globalIndex: index, income, label: `m${index}` }));

const LAYOUT = { height: 78, slotWidth: 60 };

describe('components/FlowChart/flowLayout', () => {
  test('income and expense meet at the baseline, with no gap between them', () => {
    const { bars, baselineY } = flowLayout({ ...LAYOUT, columns: columns([[100, 80]]) });

    expect(bars[0].incomeY + bars[0].incomeHeight).toBeCloseTo(baselineY);
    expect(bars[0].expenseY).toBe(baselineY);
  });

  test('the tallest bar each way reaches the edge, so no room is wasted', () => {
    const { bars } = flowLayout({ ...LAYOUT, columns: columns([[100, 20], [40, 60]]) });

    expect(bars[0].incomeY).toBeCloseTo(8);
    expect(bars[1].expenseY + bars[1].expenseHeight).toBeCloseTo(LAYOUT.height - 8);
  });

  test('a month that dwarfs the rest does not squash them into slivers', () => {
    const { bars } = flowLayout({ ...LAYOUT, columns: columns([[1000, 500], [100, 50]]) });

    expect(bars[0].incomeHeight / bars[1].incomeHeight).toBeCloseTo(10);
    expect(bars[0].incomeHeight + bars[0].expenseHeight).toBeCloseTo(LAYOUT.height - 16);
  });

  // A single dividend used to set the scale for the whole year: every ordinary month became a sliver.
  test('a figure far past the usual month is clipped instead of scaling everything else down', () => {
    const steady = [[100, 40], [100, 40], [100, 40], [100, 40]];
    const { bars } = flowLayout({ ...LAYOUT, columns: columns([...steady, [4000, 40]]) });

    expect(bars[4].incomeClipped).toBe(true);
    expect(bars[0].incomeClipped).toBe(false);
    // Clipped to three usual months, so an ordinary bar keeps a third of the ceiling instead of a fortieth.
    expect(bars[0].incomeHeight / bars[4].incomeHeight).toBeCloseTo(1 / 3, 2);
  });

  test('a month merely above the others is not clipped, only an outlier is', () => {
    const { bars } = flowLayout({ ...LAYOUT, columns: columns([[100, 40], [100, 40], [250, 40]]) });

    expect(bars.every(({ incomeClipped }) => incomeClipped === false)).toBe(true);
  });

  test('both directions share one scale, so a bar above compares to a bar below', () => {
    const { bars } = flowLayout({ ...LAYOUT, columns: columns([[100, 50]]) });

    expect(bars[0].expenseHeight).toBeCloseTo(bars[0].incomeHeight / 2);
  });

  test('bars are centred in their slot so the month labels line up', () => {
    const { bars, slot } = flowLayout({ ...LAYOUT, columns: columns([[10, 5], [20, 5], [30, 5]]) });

    bars.forEach((bar, index) => {
      expect(bar.x + bar.width / 2).toBeCloseTo(slot * index + slot / 2);
    });
  });

  test('nothing is drawn where nothing happened', () => {
    const { bars } = flowLayout({ ...LAYOUT, columns: columns([[0, 0]]) });

    expect(bars[0].incomeHeight).toBe(0);
    expect(bars[0].expenseHeight).toBe(0);
  });

  test('the averages exclude the month still running', () => {
    const { averages } = flowLayout({ ...LAYOUT, columns: columns([[100, 40], [200, 60], [999, 999]]) });

    expect(averages.income).toBe(150);
    expect(averages.expense).toBe(50);
  });

  test('no columns, no layout', () => {
    expect(flowLayout({ ...LAYOUT, columns: [] })).toBeUndefined();
    expect(flowLayout({ columns: columns([[1, 1]]), height: 0, width: 0 })).toBeUndefined();
  });
});
