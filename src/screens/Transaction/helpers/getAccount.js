export const getAccount = (accountHash, accounts = []) => accounts.find(({ hash }) => hash === accountHash);
