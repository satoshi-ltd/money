import { calcAccount } from './calcAccount';
import { exchange, getMonthDiff } from '../../modules';

const KEYS = ['expenses', 'incomes', 'progression', 'today'];

export const consolidate = ({
  rates = {},
  settings = {},
  subscription = {},
  txs = [],
  accounts: storeAccounts = [],
} = {}) => {
  const { baseCurrency } = settings;
  let accounts = [];

  if (storeAccounts.length > 0) {
    const accountTimestamps = storeAccounts
      .map((account) => account?.timestamp ?? account?.data?.timestamp)
      .filter((value) => Number.isFinite(value));
    const txTimestamps = txs.map((tx) => tx?.timestamp).filter((value) => Number.isFinite(value));
    const minTimestamp = Math.min(...[...accountTimestamps, ...txTimestamps].filter((value) => value > 0));
    const genesisDate = Number.isFinite(minTimestamp) ? new Date(minTimestamp) : new Date();
    const months = Math.max(0, getMonthDiff(genesisDate, new Date()));

    accounts = storeAccounts.map(({ hash, timestamp, data = {}, ...others }) =>
      calcAccount({
        account: { hash, timestamp, ...data, ...others },
        baseCurrency,
        genesisDate,
        months,
        rates,
        txs,
      }),
    );
  }

  const currentMonth = { expenses: 0, incomes: 0, progression: 0, today: 0 };
  let balance = 0;
  let currentBalance = 0;
  const chartBalance = [];

  accounts.forEach(
    ({
      balance: acountBalance,
      chartBalance: accountChartBalance,
      currentBalanceBase: accountCurrentBalanceBase,
      currency,
      currentMonth: accountLast30Days,
    }) => {
      const sameCurrency = currency === baseCurrency;
      const exchangeProps = [currency, baseCurrency, rates];

      balance += sameCurrency ? acountBalance : exchange(acountBalance, ...exchangeProps);
      currentBalance += accountCurrentBalanceBase;

      KEYS.forEach((key) => {
        currentMonth[key] += accountLast30Days[key];
      });

      accountChartBalance.forEach((value, index) => {
        chartBalance[index] = (chartBalance[index] || 0) + accountChartBalance[index];
      });
    },
  );

  return {
    accounts,
    overall: { balance, chartBalance, currentBalance, currentMonth },
    rates,
    settings,
    subscription,
    txs,
  };
};
