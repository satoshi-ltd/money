import { calcAccount } from './calcAccount';
import { getMonthDiff } from '../../modules';

const KEYS = ['expenses', 'incomes', 'progression', 'today'];

export const consolidate = ({
  now: nowProp,
  rates = {},
  settings = {},
  txs = [],
  scheduledTxs = [],
  accounts: storeAccounts = [],
} = {}) => {
  const { baseCurrency } = settings;
  const now = nowProp instanceof Date ? nowProp : new Date();
  let accounts = [];
  const txsByAccount = {};

  txs.forEach((tx) => {
    const accountHash = tx?.account;
    if (!accountHash) return;
    if (!txsByAccount[accountHash]) txsByAccount[accountHash] = [];
    txsByAccount[accountHash].push(tx);
  });

  if (storeAccounts.length > 0) {
    const accountTimestamps = storeAccounts
      .map((account) => account?.timestamp ?? account?.data?.timestamp)
      .filter((value) => Number.isFinite(value));
    const txTimestamps = txs.map((tx) => tx?.timestamp).filter((value) => Number.isFinite(value));
    const minTimestamp = Math.min(...[...accountTimestamps, ...txTimestamps].filter((value) => value > 0));
    const genesisDate = Number.isFinite(minTimestamp) ? new Date(minTimestamp) : now;
    const months = Math.max(0, getMonthDiff(genesisDate, now));

    accounts = storeAccounts.map(({ hash, timestamp, data = {}, ...others }) =>
      calcAccount({
        account: { hash, timestamp, ...data, ...others },
        baseCurrency,
        genesisDate,
        months,
        now,
        rates,
        txs,
        txsByAccount,
      }),
    );
  }

  const currentMonth = { expenses: 0, incomes: 0, progression: 0, today: 0 };
  let currentBalance = 0;
  let hasMissingRate = false;
  const chartBalance = [];

  accounts.forEach(
    ({
      chartBalance: accountChartBalance,
      currentBalanceBase: accountCurrentBalanceBase,
      currentMonth: accountLast30Days,
      hasMissingRate: accountHasMissingRate,
    }) => {
      if (accountHasMissingRate) hasMissingRate = true;
      if (Number.isFinite(accountCurrentBalanceBase)) currentBalance += accountCurrentBalanceBase;

      KEYS.forEach((key) => {
        currentMonth[key] += accountLast30Days[key];
      });

      accountChartBalance.forEach((value, index) => {
        chartBalance[index] = (chartBalance[index] || 0) + accountChartBalance[index];
      });
    },
  );

  const balance = currentBalance;

  return {
    accounts,
    overall: { balance, chartBalance, currentBalance, currentMonth, hasMissingRate },
    rates,
    scheduledTxs,
    settings,
    txs,
  };
};
