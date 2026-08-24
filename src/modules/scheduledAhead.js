import { C } from './constants';
import { exchange } from './exchange';
import { getOccurrencesBetween } from './recurrence';

const {
  TX: {
    TYPE: { INCOME },
  },
} = C;

const timestamp = (value) => {
  const at = Number.isFinite(value) ? value : new Date(value).getTime();
  return Number.isFinite(at) ? at : Date.now();
};

const endOfMonth = (at) => {
  const date = new Date(at);
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
};

export const scheduledAhead = ({ accounts = [], baseCurrency, now, rates = {}, scheduledTxs = [] }) => {
  const from = timestamp(now);
  const to = endOfMonth(from);

  return scheduledTxs.reduce(
    (summary, scheduled) => {
      const occurrences = getOccurrencesBetween({ scheduled, fromAt: from, toAt: to }).length;
      if (!occurrences) return summary;

      const currency = accounts.find(({ hash }) => hash === scheduled.account)?.currency;
      const value =
        !currency || !baseCurrency || currency === baseCurrency
          ? scheduled.value
          : exchange(scheduled.value, currency, baseCurrency, rates);
      if (!Number.isFinite(value)) return summary;

      const isCredit = scheduled.type === INCOME;

      return {
        charges: summary.charges + (isCredit ? 0 : occurrences),
        credits: summary.credits + (isCredit ? occurrences : 0),
        net: summary.net + (isCredit ? value : -value) * occurrences,
      };
    },
    { charges: 0, credits: 0, net: 0 },
  );
};
