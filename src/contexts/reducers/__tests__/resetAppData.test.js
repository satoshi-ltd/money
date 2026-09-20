import { resetAppData } from '../resetAppData';
import { BiometricAuthService } from '../../../services';
import { DEFAULTS } from '../../store.constants';

jest.mock('../../../services', () => ({
  BiometricAuthService: { clearPin: jest.fn(() => Promise.resolve(true)) },
  NotificationsService: { clearAll: jest.fn(() => Promise.resolve()) },
}));

const createState = () => ({ settings: { pin: '1234' }, store: { wipe: jest.fn(() => Promise.resolve()) } });

describe('contexts/reducers/resetAppData', () => {
  beforeEach(() => jest.clearAllMocks());

  test('wiping the ledger also forgets the pin kept behind the reader', async () => {
    const state = createState();

    await resetAppData([state, jest.fn()]);

    expect(BiometricAuthService.clearPin).toHaveBeenCalled();
    expect(state.store.wipe).toHaveBeenCalled();
  });

  test('a reader that refuses to forget does not block the wipe', async () => {
    BiometricAuthService.clearPin.mockRejectedValueOnce(new Error('ERR_BIOMETRIC_FAILED'));
    const state = createState();
    const setState = jest.fn();

    await resetAppData([state, setState]);

    expect(state.store.wipe).toHaveBeenCalled();
    expect(setState).toHaveBeenCalled();
  });

  test('the defaults it restores have no fingerprint armed', async () => {
    expect(DEFAULTS.settings.biometricUnlockEnabled).toBe(false);
  });
});
