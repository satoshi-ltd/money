import { C, groupTxsByDate } from '../../../modules';

const { CURRENCY } = C;
export const queryLastTxs = ({ accounts = [], txs = [] }) =>
  groupTxsByDate(
    txs
      .slice(-64)
      .reverse()
      .map((tx = {}) => {
        const { currency = CURRENCY } = accounts.find(({ hash }) => hash === tx.account) || {};

        return { ...tx, currency };
      }),
  );
