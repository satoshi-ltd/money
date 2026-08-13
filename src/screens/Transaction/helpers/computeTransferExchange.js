import { roundToCurrency } from '../../../modules';

export const computeTransferExchange = ({ baseCurrency, from, latestRates, to, value } = {}) => {
  if (!from?.currency || !to?.currency || !latestRates) return undefined;
  if (!Number.isFinite(value) || value <= 0) return undefined;

  if (from.currency === to.currency) return value;

  const fromRate = latestRates[from.currency];
  const toRate = latestRates[to.currency];

  let exchange;
  if (from.currency === baseCurrency) exchange = Number.isFinite(toRate) ? value * toRate : undefined;
  else if (to.currency === baseCurrency) exchange = fromRate ? value / fromRate : undefined;
  else if (fromRate && Number.isFinite(toRate)) exchange = (value / fromRate) * toRate;

  return exchange === undefined ? undefined : roundToCurrency(exchange, to.currency);
};
