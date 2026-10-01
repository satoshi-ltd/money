export const isOwed = ({ currentBalance = 0 } = {}) => currentBalance < 0;

export const ledgerPosition = (accounts = []) =>
  accounts.reduce(
    (position, { currentBalanceBase }) => {
      if (!Number.isFinite(currentBalanceBase)) return position;
      return currentBalanceBase < 0
        ? { ...position, owed: position.owed + currentBalanceBase }
        : { ...position, assets: position.assets + currentBalanceBase };
    },
    { assets: 0, owed: 0 },
  );
