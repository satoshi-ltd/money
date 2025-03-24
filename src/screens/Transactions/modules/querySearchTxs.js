import { C, L10N, groupTxsByDate } from '../../../modules';

const { TRANSACTIONS_PER_PAGE } = C;

export const querySearchTxs = ({ account = {}, page = 1, query }) =>
  query
    ? groupTxsByDate(
        account.txs
          .slice()
          .sort((a, b) => b.timestamp - a.timestamp)
          .filter((tx = {}) => {
            const title = tx.title ? tx.title.toLowerCase() : undefined;

            const category =
              L10N.CATEGORIES[tx.type] && L10N.CATEGORIES[tx.type][tx.category]
                ? L10N.CATEGORIES[tx.type][tx.category].toLowerCase()
                : undefined;
            const lowerCaseQuery = query.toLowerCase();

            return (title && title.includes(lowerCaseQuery)) || (category && category.includes(lowerCaseQuery));
          })
          .slice(0, page * TRANSACTIONS_PER_PAGE),
      )
    : undefined;
