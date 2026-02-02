import { sortAccounts } from '../../../modules/sortAccounts';

export const queryAccounts = ({ accounts = [], query }) =>
  sortAccounts(
    accounts.filter((tx = {}) => {
      const title = tx.title ? tx.title.toLowerCase() : undefined;
      return !query || (title && title.includes(query));
    }),
  );
