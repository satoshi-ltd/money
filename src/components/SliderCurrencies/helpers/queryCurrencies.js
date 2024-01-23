import { C } from '../../../modules';

const { CURRENCY } = C;

export const queryCurrencies = ({ baseCurrency = CURRENCY, rates = {} }) => {
  const keys = Object.keys(rates);

  return keys.length > 0 ? [...new Set([baseCurrency, ...Object.keys(rates[keys[keys.length - 1]])])] : [baseCurrency];
};
