export const filter = (accounts = [], currency, order = true) =>
  accounts
    .filter((account) => !currency || currency === account.currency)
    .sort((a, b) => {
      if (a.currentBalanceBase < b.currentBalanceBase) return order ? 1 : -1;
      if (a.currentBalanceBase > b.currentBalanceBase) return order ? -1 : 1;
      return 0;
    });
