import { L10N } from './l10n';

// One grammar for the figure over every hero: what it is, what it covers, what it is counted in.
export const netWorthEyebrow = ({ accounts = 0, currency }) =>
  `${L10N.NET_WORTH} · ${accounts} ${L10N.ACCOUNTS.toLowerCase()} · ${currency}`;

export const accountBalanceEyebrow = (currency) => `${L10N.ACCOUNT_BALANCE} · ${currency}`;
