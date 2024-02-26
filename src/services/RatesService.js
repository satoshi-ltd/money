import { apiCall } from './modules';
import { C } from '../modules';

const { CURRENCY } = C;

export const ServiceRates = {
  get: ({ baseCurrency = CURRENCY, latest = false } = {}) => {
    return apiCall({ service: `rates?baseCurrency=${baseCurrency}${latest ? '&latest=true' : ''}` });
  },
};
