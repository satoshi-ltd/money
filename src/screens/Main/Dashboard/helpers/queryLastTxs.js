import { C, groupTxsByDate } from '../../../../modules';

const { CURRENCY } = C;
export const queryLastTxs = ({ txs = [], vaults = [] }) =>
  groupTxsByDate(
    txs
      .slice(-32)
      .reverse()
      .filter(({ vault }) => vault !== undefined)
      .map((tx = {}) => {
        const { currency = CURRENCY } = vaults.find((vault) => vault.hash === tx.vault) || {};

        return { ...tx, currency };
      }),
  );
