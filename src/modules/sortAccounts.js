export const sortAccounts = (accounts = []) =>
  [...accounts].sort(
    (
      { currentBalanceBase: balance = 0, currentMonth: { txs } = {} },
      { currentBalanceBase: nextBalance = 0, currentMonth: { txs: nextTxs } = {} },
    ) => {
      if (balance === 0) return 1;
      if (nextBalance === 0) return -1;

      const txsComparison = (nextTxs || 0) - (txs || 0);
      const balanceComparison = nextBalance - balance;

      return txsComparison !== 0 ? txsComparison : balanceComparison;
    },
  );

