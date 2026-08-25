import fs from 'fs';
import path from 'path';

const SRC = path.join(__dirname, '..');
const ROOT = path.join(SRC, '..');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : walk(full);
    return /\.jsx?$/.test(entry.name) ? [full] : [];
  });

const sources = () => walk(SRC).map((file) => [path.relative(ROOT, file), fs.readFileSync(file, 'utf8')]);

const TRACKERS = [
  'amplitude',
  'appsflyer',
  'bugsnag',
  'firebase',
  'mixpanel',
  'onesignal',
  'posthog',
  '@segment',
  '@sentry',
  'react-native-device-info',
];

// Onboarding promises no analytics and one request. These tests are what keep that promise from rotting.
describe('privacy', () => {
  test('the only thing that reaches the network is the public rate feed', () => {
    const callers = sources()
      .filter(([, source]) => /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\s*\(/.test(source))
      .map(([file]) => file);

    expect(callers).toEqual(['src/services/RatesService.js']);
  });

  test('no analytics, crash reporting or device-fingerprinting package is installed', () => {
    const { dependencies = {} } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const found = Object.keys(dependencies).filter((name) =>
      TRACKERS.some((tracker) => name.toLowerCase().includes(tracker)),
    );

    expect(found).toEqual([]);
  });

  test('nothing asks the device who it is', () => {
    const identifying = sources()
      .filter(([, source]) => /getUniqueId|getAndroidId|identifierForVendor|installationId|advertisingId/.test(source))
      .map(([file]) => file);

    expect(identifying).toEqual([]);
  });

  test('notifications are scheduled on the device, never delivered through a push service', () => {
    const push = sources()
      .filter(([, source]) => /getExpoPushToken|getDevicePushToken|registerForPushNotifications/.test(source))
      .map(([file]) => file);

    expect(push).toEqual([]);
  });
});
