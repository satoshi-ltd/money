import { C, eventEmitter, L10N } from '../../../modules';
import { ServiceRates } from '../../../services';

const { EVENT } = C;

export const getLatestRates = async ({
  store: {
    settings: { baseCurrency },
    updateRates,
  },
}) => {
  const rates = await ServiceRates.get({ baseCurrency, latest: true }).catch(() =>
    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, message: L10N.ERROR_SERVICE_RATES }),
  );

  if (rates) await updateRates(rates);
};
