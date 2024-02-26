import { C, exchange, getMonthDiff, isInternalTransfer } from '../../../modules';

const {
  TX: { TYPE },
} = C;

export const calcAccount = ({ account = {}, baseCurrency, genesisDate, months = 0, rates = {}, txs = [] }) => {
  const now = new Date();

  const currentDay = now.getDate();
  const { balance, currency } = account;
  const exchangeProps = [currency, baseCurrency, rates];
  let { balance: currentBalance = 0 } = account;
  let currentMonthTxs = 0;
  let expenses = 0;
  let incomes = 0;
  let progression = 0;
  let today = 0;

  const chartBalance = new Array(months + 1).fill(0);
  chartBalance[0] = account.balance > 0 ? account.balance : 0;

  const dataSource = txs.filter((tx) => tx.account === account.hash);
  dataSource.forEach(({ category, timestamp, type, value = 0 }) => {
    const isExpense = type === TYPE.EXPENSE;
    const date = new Date(timestamp);
    const monthIndex = getMonthDiff(genesisDate, date);

    currentBalance += isExpense ? -value : value;
    chartBalance[monthIndex] += isExpense ? -value : value;

    // ! @TODO: Should revisit this algo
    if (monthIndex === months) {
      if (!isInternalTransfer({ category })) {
        currentMonthTxs += 1;
        if (isExpense) expenses += value;
        else incomes += value;
        progression += isExpense ? -value : value;

        if (date.getDate() === currentDay) today += isExpense ? -value : value;
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
        ? exchange(value, ...exchangeProps, new Date(genesisDate.getFullYear(), genesisDate.getMonth() + index + 1, 1))
        : value,
    ),
    currentBalance,
    currentBalanceBase: exchange(currentBalance, ...exchangeProps),
    currentMonth: {
      expenses: exchange(expenses, ...exchangeProps),
      incomes: exchange(incomes, ...exchangeProps),
      progression: exchange(progression, ...exchangeProps),
      progressionCurrency: progression,
      today: exchange(today, ...exchangeProps),
      txs: currentMonthTxs,
    },
    txs: dataSource,
  };
};
