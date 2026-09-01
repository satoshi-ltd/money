// Zero-balance accounts sink; above them it is the last thirty days, because a calendar month is empty on its 1st.
const spent = ({ currentBalanceBase = 0 }) => (currentBalanceBase === 0 ? 1 : 0);

export const sortAccounts = (accounts = []) =>
  [...accounts].sort(
    (account, next) =>
      spent(account) - spent(next) ||
      (next.recentTxs || 0) - (account.recentTxs || 0) ||
      (next.currentBalanceBase || 0) - (account.currentBalanceBase || 0),
  );
