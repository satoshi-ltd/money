import { calcAccount } from './internal';
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
    const { timestamp: blockTimestamp, data: { timestamp } = {} } =
      //  storeAccounts[0].balance ? storeAccounts[0] : storeAccounts[1];
      storeAccounts[0].balance !== undefined ? storeAccounts[0] : storeAccounts[1] || {};
    const genesisDate = new Date(timestamp || blockTimestamp);
    const months = getMonthDiff(genesisDate, new Date());

    accounts = storeAccounts.map(({ hash, timestamp, data = {}, ...others }) =>
      calcAccount({
        baseCurrency,
        genesisDate,
        months,
        rates,
        txs,
        account: { hash, timestamp, ...data, ...others },
      }),
    );
  }

  const currentMonth = {
    expenses: 0,
    incomes: 0,
    progression: 0,
    today: 0,
  };
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
