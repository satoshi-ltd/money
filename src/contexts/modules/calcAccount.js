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
  const { balance, currency } = account;
  const exchangeProps = [currency, baseCurrency, rates];
  let { balance: currentBalance = 0 } = account;
  let currentMonthTxs = 0;
  let expenses = 0;
  let expensesBase = 0;
  let incomes = 0;
  let incomesBase = 0;
  let progression = 0;
  let progressionCurrency = 0;
  let today = 0;

  const chartBalance = new Array(months + 1).fill(0);
  chartBalance[0] = account.balance > 0 ? account.balance : 0;

  const dataSource = txsByAccount?.[account.hash] || txs.filter((tx) => tx.account === account.hash);
  dataSource.forEach(({ category, timestamp, type, value = 0 }) => {
    const isExpense = type === TYPE.EXPENSE;
    const date = new Date(timestamp);
    const monthIndex = getMonthDiff(genesisDate, date);
    const valueBase = currency !== baseCurrency ? exchange(value, ...exchangeProps, timestamp) : value;
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

  return {
    ...account,
    balance: balance > 0 ? balance : 0,
    chartBalance: chartBalance.map((value, index) =>
      currency !== baseCurrency
        ? exchange(value, ...exchangeProps, new Date(genesisDate.getFullYear(), genesisDate.getMonth() + index, 1))
        : value,
    ),
    chartBalanceBase: [...chartBalance],
    currentBalance,
    currentBalanceBase: exchange(currentBalance, ...exchangeProps),
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
