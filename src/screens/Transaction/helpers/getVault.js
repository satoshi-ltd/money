export const getVault = (vaultHash, vaults = []) => vaults.find(({ hash }) => hash === vaultHash);
