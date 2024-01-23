export const filter = (vaults = [], currency, order = true) =>
  vaults
    .filter((vault) => !currency || currency === vault.currency)
    .sort((a, b) => {
      if (a.currentBalanceBase < b.currentBalanceBase) return order ? 1 : -1;
      if (a.currentBalanceBase > b.currentBalanceBase) return order ? -1 : 1;
      return 0;
    });
