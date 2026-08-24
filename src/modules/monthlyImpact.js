import { C } from './constants';
import { exchange } from './exchange';
import { getOccurrencesBetween } from './recurrence';

const {
  MS_IN_DAY,
  TX: {
    TYPE: { INCOME },
  },
} = C;

const WINDOW_MS = MS_IN_DAY * 30;

export const monthlyImpact = ({ accounts = [], baseCurrency, now = Date.now(), rates = {}, scheduledTxs = [] }) =>
  scheduledTxs.reduce((total, scheduled) => {
    const occurrences = getOccurrencesBetween({ scheduled, fromAt: now, toAt: now + WINDOW_MS }).length;
    if (!occurrences) return total;

    const currency = accounts.find(({ hash }) => hash === scheduled.account)?.currency;
    const value =
      !currency || !baseCurrency || currency === baseCurrency
        ? scheduled.value
        : exchange(scheduled.value, currency, baseCurrency, rates);
    if (!Number.isFinite(value)) return total;

    return total + (scheduled.type === INCOME ? value : -value) * occurrences;
  }, 0);
