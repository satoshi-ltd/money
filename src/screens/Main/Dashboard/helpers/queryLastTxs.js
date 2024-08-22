import { C, groupTxsByDate } from '../../../../modules';

const { CURRENCY, ITEMS_PER_PAGE } = C;

export const queryLastTxs = ({ accounts = [], page = 2, txs = [] }) =>
  groupTxsByDate(
    txs
      .slice(-(ITEMS_PER_PAGE * page))
      .reverse()
      .map((tx = {}) => {
        const { currency = CURRENCY } = accounts.find(({ hash }) => hash === tx.account) || {};

        return { ...tx, currency };
      }),
  );
