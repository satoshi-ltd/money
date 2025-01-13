import { C, groupTxsByDate } from '../../../modules';

const { CURRENCY, TRANSACTIONS_PER_PAGE } = C;

export const queryLastTxs = ({ accounts = [], page = 1, txs = [] }) =>
  groupTxsByDate(
    txs
      .slice(-(TRANSACTIONS_PER_PAGE * page))
      .reverse()
      .map((tx = {}) => {
        const { currency = CURRENCY } = accounts.find(({ hash }) => hash === tx.account) || {};

        return { ...tx, currency };
      }),
  );
