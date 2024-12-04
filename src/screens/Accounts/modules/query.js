export const query = (accounts = []) => {
  const currencies = {};

  accounts.forEach(({ currency, currentBalance: balance, currentBalanceBase: base }) => {
    let item = currencies[currency] || { balance: 0, base: 0 };
    item = { balance: item.balance + balance, base: item.base + base, currency };

    currencies[currency] = item;
  });

  return (
    Object.values(currencies)
      // .filter(({ base }) => base > 0)
      .sort((a, b) => {
        if (a.base < b.base) return 1;
        if (a.base > b.base) return -1;
        return 0;
      })
  );
};
