import { frequentCategory } from '../frequentCategory';

const tx = (category, type = 0, account = 'a1') => ({ account, category, type, value: 10 });

describe('modules/frequentCategory', () => {
  test('picks what this account is most often used for', () => {
    const txs = [tx(1), tx(1), tx(5), tx(9, 0, 'a2'), tx(9, 0, 'a2'), tx(9, 0, 'a2')];

    expect(frequentCategory({ account: 'a1', txs, type: 0 })).toBe(1);
    expect(frequentCategory({ account: 'a2', txs, type: 0 })).toBe(9);
  });

  test('expenses and incomes are counted apart', () => {
    const txs = [tx(1), tx(1), tx(7, 1), tx(7, 1), tx(7, 1)];

    expect(frequentCategory({ account: 'a1', txs, type: 0 })).toBe(1);
    expect(frequentCategory({ account: 'a1', txs, type: 1 })).toBe(7);
  });

  test('a brand-new account borrows the habit from the whole ledger', () => {
    const txs = [tx(4), tx(4), tx(6)];

    expect(frequentCategory({ account: 'unused', txs, type: 0 })).toBe(4);
  });

  test('internal transfers never become a suggestion', () => {
    const txs = [{ account: 'a1', category: 12, type: 0, value: 10 }, tx(3)];

    expect(frequentCategory({ account: 'a1', txs, type: 0 })).toBe(3);
  });

  test('an empty ledger suggests nothing rather than guessing', () => {
    expect(frequentCategory({ account: 'a1', txs: [], type: 0 })).toBeUndefined();
    expect(frequentCategory({})).toBeUndefined();
  });
});
