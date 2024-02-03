import { C, groupTxsByDate } from '../../../../modules';

const { CURRENCY } = C;
export const queryLastTxs = ({ accounts = [], txs = [] }) =>
  groupTxsByDate(
    txs
      .slice(-32)
      .reverse()
      .map((tx = {}) => {
        // ! TODO: Somehow we have data con `tx.vault` but should be `tx.account`
        const { currency = CURRENCY } = accounts.find(({ hash }) => hash === tx.vault) || {};

        return { ...tx, currency };
      }),
  );
