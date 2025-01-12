export const queryAvailableAccounts = (accounts = [], account = {}) => {
  const availableAccounts = [];
  const currencies = account.currency ? [account.currency] : [];
  const sortedAccounts = accounts
    .filter(({ hash }) => hash !== account.hash)
    .sort(({ currentBalanceBase: balance }, { currentBalanceBase: nextBalance }) => nextBalance - balance);

  sortedAccounts.forEach(({ currency }) => !currencies.includes(currency) && currencies.push(currency));

  currencies.forEach((currency) => {
    sortedAccounts.filter((account) => currency === account.currency).map((account) => availableAccounts.push(account));
  });

  return availableAccounts;
};
