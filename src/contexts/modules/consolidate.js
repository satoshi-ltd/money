import { calcAccount } from './calcAccount';
import { getMonthDiff } from '../../modules';

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
        rates,
        txs,
        txsByAccount,
      }),
    );
  }

  const currentMonth = { progression: 0 };
  let currentBalance = 0;
  const chartBalance = [];

  accounts.forEach(
    ({
      chartBalance: accountChartBalance,
      currentBalanceBase: accountCurrentBalanceBase,
      currentMonth: accountLast30Days,
    }) => {
      if (Number.isFinite(accountCurrentBalanceBase)) currentBalance += accountCurrentBalanceBase;

      currentMonth.progression += accountLast30Days.progression;

      accountChartBalance.forEach((value, index) => {
        chartBalance[index] = (chartBalance[index] || 0) + accountChartBalance[index];
      });
    },
  );

  return {
    accounts,
    overall: { chartBalance, currentBalance, currentMonth },
    rates,
    scheduledTxs,
    settings,
    txs,
  };
};
