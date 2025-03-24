import { C, groupTxsByDate } from '../../../modules';

const { CURRENCY, TRANSACTIONS_PER_PAGE } = C;

export const queryLastTxs = ({ accounts = [], page = 1, txs = [] }) =>
  groupTxsByDate(
    txs
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, TRANSACTIONS_PER_PAGE * page)
      .map((tx = {}) => {
        const { currency = CURRENCY } = accounts.find(({ hash }) => hash === tx.account) || {};

        return { ...tx, currency };
      }),
  );
