export const queryAvailableVaults = (vaults = [], vault = {}) => {
  const availableVaults = [];
  const currencies = vault.currency ? [vault.currency] : [];
  const sortedVaults = vaults
    .filter(({ hash }) => hash !== vault.hash)
    .sort(({ currentBalanceBase: balance }, { currentBalanceBase: nextBalance }) => nextBalance - balance);

  sortedVaults.forEach(({ currency }) => !currencies.includes(currency) && currencies.push(currency));

  currencies.forEach((currency) => {
    sortedVaults.filter((vault) => currency === vault.currency).map((vault) => availableVaults.push(vault));
  });

  return availableVaults;
};
