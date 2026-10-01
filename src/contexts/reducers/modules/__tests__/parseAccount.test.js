import { parseAccount } from '../parseAccount';

describe('contexts/reducers/modules/parseAccount', () => {
  test('keeps an opening balance below zero, which is how a card you owe starts', () => {
    expect(parseAccount({ balance: '-1284.30', currency: 'USD', title: 'Visa' }).balance).toBe(-1284.3);
  });

  test('a minus with nothing after it is zero, never NaN in the ledger', () => {
    expect(parseAccount({ balance: '-', title: 'Visa' }).balance).toBe(0);
    expect(parseAccount({ balance: undefined, title: 'Visa' }).balance).toBe(0);
  });
});
