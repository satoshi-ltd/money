import { monthFlow } from '../monthFlow';
import { C } from '../constants';

const {
  TX: {
    TYPE: { EXPENSE, INCOME, TRANSFER },
  },
} = C;

const NOW = new Date(2026, 1, 22).getTime();
const feb = (day) => new Date(2026, 1, day).getTime();
const jan = (day) => new Date(2026, 0, day).getTime();

describe('modules/monthFlow', () => {
  test('sums only the current month, split by direction', () => {
    const txs = [
      { type: INCOME, value: 2450, timestamp: feb(21) },
      { type: EXPENSE, value: 23.8, timestamp: feb(22) },
      { type: EXPENSE, value: 52.3, timestamp: feb(21) },
      { type: EXPENSE, value: 99, timestamp: jan(15) },
    ];

    expect(monthFlow(txs, NOW)).toEqual({ incomes: 2450, expenses: 76.1 });
  });

  test('ignores transfers', () => {
    const txs = [{ type: TRANSFER, value: 500, timestamp: feb(10) }];

    expect(monthFlow(txs, NOW)).toEqual({ incomes: 0, expenses: 0 });
  });

  test('handles empty history', () => {
    expect(monthFlow([], NOW)).toEqual({ incomes: 0, expenses: 0 });
  });
});
