import { C, L10N, groupTxsByDate } from '../../../../modules';

const { ITEMS_PER_PAGE } = C;
export const querySearchTxs = ({ accounts = [], page = 2, query, txs = [] }) =>
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
            const lowerCaseQuery = query.toLowerCase();

            return (title && title.includes(lowerCaseQuery)) || (category && category.includes(lowerCaseQuery));
          })
          .slice(0, ITEMS_PER_PAGE * page)
          .map((tx = {}) => {
            const { currency } = accounts.find(({ hash }) => hash === tx.account) || {};

            return { ...tx, currency };
          }),
      )
    : undefined;
