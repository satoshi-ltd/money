export const getCurrency = (vaultHash, vaults = []) => {
  const { currency } = vaults.find(({ hash }) => hash === vaultHash) || {};

  return currency;
};
