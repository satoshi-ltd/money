import { calcVault } from './internal';
import { exchange, getMonthDiff } from '../../modules';

const KEYS = ['expenses', 'incomes', 'progression', 'today'];

export const consolidate = ({ rates = {}, settings = {}, txs = [], vaults: storeVaults = [] } = {}) => {
  const { baseCurrency } = settings;
  let vaults = [];

  if (storeVaults.length > 0) {
    const { timestamp: blockTimestamp, data: { timestamp } = {} } =
      //  storeVaults[0].balance ? storeVaults[0] : storeVaults[1];
      storeVaults[0].balance !== undefined ? storeVaults[0] : storeVaults[1] || {};
    const genesisDate = new Date(timestamp || blockTimestamp);
    const months = getMonthDiff(genesisDate, new Date());

    vaults = storeVaults.map(({ hash, timestamp, data = {}, ...others }) =>
      calcVault({
        baseCurrency,
        genesisDate,
        months,
        rates,
        txs,
        vault: { hash, timestamp, ...data, ...others },
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

  vaults.forEach(
    ({
      balance: vaultBalance,
      chartBalance: vaultChartBalance,
      currentBalanceBase: vaultCurrentBalanceBase,
      currency,
      currentMonth: vaultLast30Days,
    }) => {
      const sameCurrency = currency === baseCurrency;
      const exchangeProps = [currency, baseCurrency, rates];

      balance += sameCurrency ? vaultBalance : exchange(vaultBalance, ...exchangeProps);
      currentBalance += vaultCurrentBalanceBase;

      KEYS.forEach((key) => {
        currentMonth[key] += vaultLast30Days[key];
      });

      vaultChartBalance.forEach((value, index) => {
        chartBalance[index] = (chartBalance[index] || 0) + vaultChartBalance[index];
      });
    },
  );

  return {
    overall: { balance, chartBalance, currentBalance, currentMonth },
    rates,
    settings,
    txs,
    vaults,
  };
};
