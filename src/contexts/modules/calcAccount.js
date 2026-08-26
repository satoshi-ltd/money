import { C, exchange, getMonthDiff } from '../../modules';

const { TX: { TYPE } = {} } = C;

export const calcAccount = ({
  account = {},
  baseCurrency,
  genesisDate,
  months = 0,
  rates = {},
  txs = [],
  txsByAccount,
}) => {
  const { balance = 0, currency } = account;
  const exchangeProps = [currency, baseCurrency, rates];
  let currentBalance = Number.isFinite(balance) ? balance : 0;
  let currentMonthTxs = 0;
  let progression = 0;
  let progressionCurrency = 0;

  const chartBalance = new Array(months + 1).fill(0);
  chartBalance[0] = currentBalance;

  const dataSource = txsByAccount?.[account.hash] || txs.filter((tx) => tx.account === account.hash);
  dataSource.forEach(({ timestamp, type, value = 0 }) => {
    const isExpense = type === TYPE.EXPENSE;
    const date = new Date(timestamp);
    const monthIndex = getMonthDiff(genesisDate, date);
    const converted = currency !== baseCurrency ? exchange(value, ...exchangeProps, timestamp) : value;
    const valueBase = Number.isFinite(converted) ? converted : 0;
    const signedValue = isExpense ? -value : value;
    const signedValueBase = isExpense ? -valueBase : valueBase;

    currentBalance += signedValue;
    if (monthIndex >= 0 && monthIndex <= months) {
      chartBalance[monthIndex] += signedValue;
    }

    // ! @TODO: Should revisit this algo
    if (monthIndex === months) {
      currentMonthTxs += 1;
      progression += signedValueBase;
      progressionCurrency += signedValue;
    }
  });

  chartBalance.forEach((value, index) => {
    if (index > 0) chartBalance[index] += chartBalance[index - 1];
  });

  const chartBalanceExchanged = chartBalance.map((value, index) => {
    if (currency === baseCurrency) return value;
    const converted =
      index === months
        ? exchange(value, ...exchangeProps)
        : exchange(value, ...exchangeProps, new Date(genesisDate.getFullYear(), genesisDate.getMonth() + index, 1));
    return Number.isFinite(converted) ? converted : 0;
  });
  const currentBalanceBase = exchange(currentBalance, ...exchangeProps);

  return {
    ...account,
    balance: Number.isFinite(balance) ? balance : 0,
    chartBalance: chartBalanceExchanged,
    currentBalance,
    currentBalanceBase,
    currentMonth: {
      progression,
      progressionCurrency,
      txs: currentMonthTxs,
    },
    txs: dataSource,
  };
};
