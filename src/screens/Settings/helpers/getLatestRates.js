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
  // A block body, not an expression: `emit` answers true, and returning it made a failed sync look like rates.
  const rates = await ServiceRates.get({ baseCurrency, known, lastRatesUpdate }).catch(() => {
    eventEmitter.emit(EVENT.NOTIFICATION, { error: true, title: L10N.ERROR_SERVICE_RATES });
  });

  if (!rates) return;

  await updateRates(rates);
  // Every other action in Settings says when it worked; this one only ever spoke to complain.
  eventEmitter.emit(EVENT.NOTIFICATION, { title: L10N.CONFIRM_RATES_SUCCESS });
};
