import { C, exchange, getMonthDiff, isInternalTransfer } from '../../modules';

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
  const now = new Date();

  const currentDay = now.getDate();
  const { balance = 0, currency } = account;
  const exchangeProps = [currency, baseCurrency, rates];
  let currentBalance = Number.isFinite(balance) ? balance : 0;
  let currentMonthTxs = 0;
  let hasMissingRate = false;
  let expenses = 0;
  let expensesBase = 0;
  let incomes = 0;
  let incomesBase = 0;
  let progression = 0;
  let progressionCurrency = 0;
  let today = 0;

  const chartBalance = new Array(months + 1).fill(0);
  chartBalance[0] = currentBalance;

  const dataSource = txsByAccount?.[account.hash] || txs.filter((tx) => tx.account === account.hash);
  dataSource.forEach(({ category, timestamp, type, value = 0 }) => {
    const isExpense = type === TYPE.EXPENSE;
    const date = new Date(timestamp);
    const monthIndex = getMonthDiff(genesisDate, date);
    const converted = currency !== baseCurrency ? exchange(value, ...exchangeProps, timestamp) : value;
    const isConverted = Number.isFinite(converted);
    if (!isConverted) hasMissingRate = true;
    const valueBase = isConverted ? converted : 0;
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
      if (date.getDate() === currentDay) today += signedValueBase;

      if (!isInternalTransfer({ category })) {
        if (isExpense) {
          expenses += valueBase;
          expensesBase += value;
        } else {
          incomes += valueBase;
          incomesBase += value;
        }
      }
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
    if (Number.isFinite(converted)) return converted;
    hasMissingRate = true;
    return 0;
  });
  const currentBalanceBase = exchange(currentBalance, ...exchangeProps);
  if (!Number.isFinite(currentBalanceBase)) hasMissingRate = true;

  return {
    ...account,
    balance: Number.isFinite(balance) ? balance : 0,
    chartBalance: chartBalanceExchanged,
    chartBalanceBase: [...chartBalance],
    currentBalance,
    currentBalanceBase,
    hasMissingRate,
    currentMonth: {
      expenses,
      expensesBase,
      incomes,
      incomesBase,
      progression,
      progressionCurrency,
      today,
      txs: currentMonthTxs,
    },
    txs: dataSource,
  };
};
