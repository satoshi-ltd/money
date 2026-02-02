import { sortAccounts } from '../../../modules/sortAccounts';

export const queryAvailableAccounts = (accounts = [], account = {}) => {
  const availableAccounts = [];
  const currencies = account.currency ? [account.currency] : [];
  const sortedAccounts = sortAccounts(accounts.filter(({ hash }) => hash !== account.hash));

  sortedAccounts.forEach(({ currency }) => !currencies.includes(currency) && currencies.push(currency));

  currencies.forEach((currency) => {
    sortedAccounts.filter((account) => currency === account.currency).map((account) => availableAccounts.push(account));
  });

  return availableAccounts;
};
