import { foregroundNotification } from '../foregroundNotification';

describe('services/modules/foregroundNotification', () => {
  test('a notification that arrives with the app open shows as a banner and in the list, without the deprecated alert flag', async () => {
    const behavior = await foregroundNotification();

    expect(behavior).toEqual({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true });
    expect(behavior).not.toHaveProperty('shouldShowAlert');
  });
});
