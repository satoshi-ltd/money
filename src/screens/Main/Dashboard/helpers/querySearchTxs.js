import { L10N, groupTxsByDate } from '../../../../modules';

export const querySearchTxs = ({ accounts = [], query, txs = [] }) =>
  query
    ? groupTxsByDate(
        txs
          .slice()
          .reverse()
          .filter((tx = {}) => {
            const title = tx.title ? tx.title.toLowerCase() : undefined;

            const category =
              L10N.CATEGORIES[tx.type] && L10N.CATEGORIES[tx.type][tx.category]
                ? L10N.CATEGORIES[tx.type][tx.category].toLowerCase()
                : undefined;

            return (title && title.includes(query)) || (category && category.includes(query));
          })
          .slice(0, 16)
          .map((tx = {}) => {
            const { currency } = accounts.find(({ hash }) => hash === tx.account) || {};

            return { ...tx, currency };
          }),
      )
    : undefined;
