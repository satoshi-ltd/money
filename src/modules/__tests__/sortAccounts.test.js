import { sortAccounts } from '../sortAccounts';

const account = (title, currentBalanceBase, recentTxs) => ({ title, currentBalanceBase, recentTxs });

describe('modules/sortAccounts', () => {
  // Counting the calendar month ranked the busiest ledger below a dormant one on the 1st, every 1st.
  test('the busiest thirty days come first, whatever the balances are', () => {
    const order = sortAccounts([
      account('Vault', 315000, 0),
      account('Daily', 800, 175),
      account('Wallet', 1000, 62),
    ]);

    expect(order.map(({ title }) => title)).toEqual(['Daily', 'Wallet', 'Vault']);
  });

  test('with nothing moving it falls back to the balance', () => {
    const order = sortAccounts([account('Small', 100, 0), account('Big', 900, 0)]);

    expect(order.map(({ title }) => title)).toEqual(['Big', 'Small']);
  });

  test('an emptied account sinks below every account that still holds something', () => {
    const order = sortAccounts([account('Empty', 0, 90), account('Quiet', 50, 0)]);

    expect(order.map(({ title }) => title)).toEqual(['Quiet', 'Empty']);
  });

  // Answering 1 in both directions is not an order: sort may return anything when the comparator contradicts itself.
  test('several emptied accounts keep one stable order instead of an arbitrary one', () => {
    const empties = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((title) => account(title, 0, 0));
    const once = sortAccounts(empties).map(({ title }) => title);

    expect(sortAccounts([...empties].reverse()).map(({ title }) => title)).toEqual([...once].reverse());
    expect(sortAccounts(empties).map(({ title }) => title)).toEqual(once);
  });
});
