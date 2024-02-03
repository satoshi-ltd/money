export const queryAccounts = ({ accounts = [], query }) =>
  accounts
    .filter((tx = {}) => {
      const title = tx.title ? tx.title.toLowerCase() : undefined;
      return !query || (title && title.includes(query));
    })
    .sort(
      (
        { currentBalanceBase: balance = 0, currentMonth: { txs } },
        { currentBalanceBase: nextBalance = 0, currentMonth: { txs: nextTxs } },
      ) => {
        if (balance === 0) return 1;
        else if (nextBalance === 0) return -1;

        const txsComparison = nextTxs - txs;
        const balanceComparison = nextBalance - balance;

        return txsComparison !== 0 ? txsComparison : balanceComparison;
      },
    );
