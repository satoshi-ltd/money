import { getLatestRates } from '../getLatestRates';
import { C, eventEmitter, L10N } from '../../../../modules';
import { ServiceRates } from '../../../../services';

jest.mock('../../../../services', () => ({ ServiceRates: { get: jest.fn() } }));

const RATES = { '2026-09': { USD: 1 } };

const store = (updateRates = jest.fn()) => ({
  rates: {},
  settings: { baseCurrency: 'USD', lastRatesUpdate: '2026-09-01T00:00:00.000Z' },
  updateRates,
});

const notifications = () => {
  const seen = [];
  const listener = (payload) => seen.push(payload);
  eventEmitter.on(C.EVENT.NOTIFICATION, listener);
  return { seen, stop: () => eventEmitter.off(C.EVENT.NOTIFICATION, listener) };
};

describe('screens/Settings/helpers/getLatestRates', () => {
  afterEach(() => jest.clearAllMocks());

  // The action only ever spoke to complain, so a sync that worked looked exactly like a button that did nothing.
  test('it says so when the rates came down', async () => {
    ServiceRates.get.mockResolvedValueOnce(RATES);
    const updateRates = jest.fn();
    const { seen, stop } = notifications();

    await getLatestRates({ store: store(updateRates) });
    stop();

    expect(updateRates).toHaveBeenCalledWith(RATES);
    expect(seen).toEqual([{ title: L10N.CONFIRM_RATES_SUCCESS }]);
  });

  test('and it still blames nobody but the network when they did not', async () => {
    ServiceRates.get.mockRejectedValueOnce(new Error('offline'));
    const updateRates = jest.fn();
    const { seen, stop } = notifications();

    await getLatestRates({ store: store(updateRates) });
    stop();

    expect(updateRates).not.toHaveBeenCalled();
    expect(seen).toEqual([{ error: true, title: L10N.ERROR_SERVICE_RATES }]);
  });

  test('it carries the last update, so the month that closed is read again at its close', async () => {
    ServiceRates.get.mockResolvedValueOnce(RATES);
    const { stop } = notifications();

    await getLatestRates({ store: store() });
    stop();

    expect(ServiceRates.get).toHaveBeenCalledWith(
      expect.objectContaining({ baseCurrency: 'USD', lastRatesUpdate: '2026-09-01T00:00:00.000Z' }),
    );
  });
});
