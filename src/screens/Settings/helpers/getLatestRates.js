import { C, eventEmitter, L10N } from '../../../modules';
import { ServiceRates } from '../../../services';

const { EVENT } = C;

export const getLatestRates = async ({
  store: {
    rates: known,
    settings: { baseCurrency, lastRatesUpdate },
    updateRates,
  },
}) => {
  const rates = await ServiceRates.get({ baseCurrency, known, lastRatesUpdate }).catch(() =>
    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES }),
  );

  if (rates) await updateRates(rates);
};
