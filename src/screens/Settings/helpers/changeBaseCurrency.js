import { L10N } from '../../../modules';
import { ServiceRates } from '../../../services';

export const changeBaseCurrency = async ({ currency, store: { updateRates } }) => {
  const rates = await ServiceRates.get({ baseCurrency: currency, latest: false }).catch(() =>
    alert(L10N.ERROR_SERVICE_RATES),
  );

  if (rates) await updateRates(rates, currency);
};
