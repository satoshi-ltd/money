export const getCurrency = (accountHash, accounts = []) => {
  const { currency } = accounts.find(({ hash }) => hash === accountHash) || {};

  return currency;
};
