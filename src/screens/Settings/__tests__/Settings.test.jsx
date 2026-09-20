import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Settings } from '../Settings';
import { theme } from '../../../theme';
import { viewOffset } from '../../../theme/layout';
import { biometricName, C, ICON, L10N, TEXT_SCALES } from '../../../modules';
import { BackupService, BiometricAuthService } from '../../../services';

const ACCENT_SOFT = '#S0FT00';
const SURFACE = '#SURFA0';

let mockStore = {};

jest.mock('@react-navigation/native', () => ({ useScrollToTop: () => {} }));

jest.mock('../../../services', () => ({
  BiometricAuthService: {
    clearPin: jest.fn(() => Promise.resolve(true)),
    isAvailable: jest.fn(() => Promise.resolve({ available: true })),
    savePin: jest.fn(() => Promise.resolve(true)),
  },
  BackupService: {
    export: jest.fn(() => Promise.resolve(true)),
    exportCsv: jest.fn(() => Promise.resolve(true)),
    import: jest.fn(() => Promise.resolve(undefined)),
  },
  NotificationsService: { reminders: jest.fn() },
  ServiceRates: { get: jest.fn(() => Promise.resolve({})) },
}));

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#ACCE07', accentSoft: '#S0FT00', dangerSoft: '#DANG00', surface: '#SURFA0' },
    textScale: 1,
  }),
  useStore: () => mockStore,
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });

  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Chip: (props) => MockReact.createElement(ReactNative.View, { testID: 'chip', ...props }),
    Icon: stub('icon'),
    Masthead: stub('masthead'),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    Screen: MockReact.forwardRef((props, ref) => {
      MockReact.useImperativeHandle(ref, () => ({}));
      return MockReact.createElement(ReactNative.View, props);
    }),
    Setting: (props) => MockReact.createElement(ReactNative.View, { testID: 'setting', ...props }),
    SettingSelect: (props) => MockReact.createElement(ReactNative.View, { testID: 'select', ...props }),
    Text: (props) => MockReact.createElement(ReactNative.Text, { testID: 'text', ...props }),
    View: ({ row, flex, spaceBetween, align, gap, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

  // Async: the screen asks the reader hardware on mount, and that answer has to land inside act.
const render = async () => {
  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(<Settings navigation={{ navigate: jest.fn() }} />);
  });
  return renderer.root;
};

  // Its title changes with the reader and the platform, so every name it can wear is what identifies it.
const BIOMETRIC_TITLES = ['face', 'fingerprint'].flatMap((kind) => [
  biometricName(kind, 'ios'),
  biometricName(kind, 'android'),
]);

const biometricRow = (root) =>
  componentsBy(root, 'setting').find((node) => BIOMETRIC_TITLES.includes(node.props.title));

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

const flats = (root) =>
  root
    .findAllByType('View')
    .map((node) => StyleSheet.flatten(node.props.style))
    .filter(Boolean);

const allTexts = (root) =>
  root.findAll((node) => typeof node.props?.children === 'string').map((node) => node.props.children);

describe('screens/Settings', () => {
  beforeEach(() => {
    BackupService.export.mockClear();
    BiometricAuthService.clearPin.mockClear();
    BiometricAuthService.savePin.mockClear();
    BiometricAuthService.isAvailable.mockClear();
    BiometricAuthService.isAvailable.mockResolvedValue({ available: true });
    mockStore = {
      accounts: [],
      scheduledTxs: [],
      settings: { baseCurrency: 'EUR', language: 'en', pin: '1234', reminders: [1], theme: 'light' },
      txs: [],
      updateSettings: jest.fn(),
      updateTheme: jest.fn(),
    };
  });

  test('the section is announced by the masthead, not a big title', async () => {
    const masthead = componentsBy(await render(), 'masthead');

    expect(masthead).toHaveLength(1);
    expect(masthead[0].props.section).toBe(L10N.SETTINGS);
  });

  test('the backup block is a full-bleed accent-soft band with no radius and no elevation', async () => {
    const band = flats(await render()).find((flat) => flat.backgroundColor === ACCENT_SOFT);

    expect(band.borderRadius).toBe(theme.borderRadius.none);
    expect(band.paddingHorizontal).toBe(viewOffset);
    expect(band.paddingVertical).toBe(14);
    expect(band.marginHorizontal).toBeUndefined();
    expect(band.shadowOpacity).toBeUndefined();
    expect(band.elevation).toBeUndefined();
  });


  test('the backup CTA exports the ledger', async () => {
    const cta = componentsBy(await render(), 'chip').find((node) => node.props.label === L10N.BACKUP_CTA);

    await act(async () => cta.props.onPress());

    expect(BackupService.export).toHaveBeenCalledTimes(1);
  });

  test('groups are rows on paper: no surface card, no radius wrapper', async () => {
    const cards = flats(await render()).filter((flat) => flat.backgroundColor === SURFACE);

    expect(cards).toHaveLength(0);
  });

  test('every row after the first of its group carries the hairline divider', async () => {
    const root = await render();
    // The colophon signs off with its own eyebrows, and it heads no group of rows.
    const signature = [C.MAKER_NAME, `v${C.VERSION}`];
    const labels = root
      .findAllByProps({ testID: 'eyebrow' })
      .filter((node) => typeof node.type === 'string' && !signature.includes(node.props.children));
    const rows = [...componentsBy(root, 'setting'), ...componentsBy(root, 'select')];

    expect(labels.length).toBeGreaterThan(0);
    expect(rows.filter((node) => !node.props.divider)).toHaveLength(labels.length);
  });

  test('the version is stated once, in the colophon that signs the app', async () => {
    const stamped = (await render())
      .findAllByProps({ testID: 'eyebrow' })
      .filter((node) => typeof node.type === 'string' && `${node.props.children}`.includes(C.VERSION));

    expect(stamped).toHaveLength(1);
  });

  test('the banner reports the last copy, and warns while there is none', async () => {
    const root = await render();
    const texts = allTexts(root);

    expect(texts).toContain(L10N.BACKUP_NEVER);
    expect(texts.some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(false);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(true);
  });

  // The band rode the screen for ever, so it stopped reading as a warning and became furniture.
  test('a copy inside the week takes the band away entirely', async () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() };
    const root = await render();

    expect(flats(root).find((flat) => flat.backgroundColor === ACCENT_SOFT)).toBeUndefined();
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(false);
  });

  // Update rates already reported when it last ran; a backup is the other row worth dating.
  test('the export row dates its last copy, the way the rates row dates its last sync', async () => {
    const at = new Date();
    at.setHours(9, 5, 0, 0);
    mockStore.settings = { ...mockStore.settings, backupAt: at.getTime() };
    const root = await render();
    const row = componentsBy(root, 'setting').find((node) => node.props.title === L10N.EXPORT_DATA);
    const shown = row.props.right.props.value;

    expect(shown).toBe(at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    expect(row.props.right.props.figure).toBe(true);
  });

  test('with no copy to date, the row keeps the plain chevron', async () => {
    const root = await render();
    const row = componentsBy(root, 'setting').find((node) => node.props.title === L10N.EXPORT_DATA);

    expect(row.props.right.props.value).toBeUndefined();
  });

  test('and the export is still one row away, so the band is a nudge and never the only door', async () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() };
    const root = await render();
    const row = componentsBy(root, 'setting').find((node) => node.props.title === L10N.EXPORT_DATA);

    act(() => row.props.onPress());

    expect(BackupService.export).toHaveBeenCalledTimes(1);
  });

  test('a copy older than the weekly reminder brings the warning back', async () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() - 8 * 24 * 60 * 60 * 1000 };
    const root = await render();

    expect(allTexts(root).some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(true);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(true);
  });

  test('text size sits with the theme, and writes the step the reader picked', async () => {
    const root = await render();
    const selects = componentsBy(root, 'select');
    const sizeRow = selects.find((node) => node.props.title === L10N.TEXT_SIZE);

    expect(selects.indexOf(sizeRow)).toBe(selects.findIndex((node) => node.props.title === L10N.THEME) + 1);
    expect(sizeRow.props.value).toBe(1);
    expect(sizeRow.props.options.map((option) => option.value)).toEqual(TEXT_SCALES);

    act(() => sizeRow.props.onChange(1.3));
    expect(mockStore.updateSettings).toHaveBeenCalledWith({ textSize: 1.3 });
  });

  test('every text size step is named in the reader language', async () => {
    const sizeRow = componentsBy(await render(), 'select').find((node) => node.props.title === L10N.TEXT_SIZE);
    const labels = sizeRow.props.options.map((option) => option.label);

    expect(labels).toEqual([L10N.TEXT_SIZE_SMALL, L10N.TEXT_SIZE_DEFAULT, L10N.TEXT_SIZE_LARGE, L10N.TEXT_SIZE_LARGEST]);
    expect(new Set(labels).size).toBe(labels.length);
  });

  test('the fingerprint toggle arms the reader, and says nothing more than its name', async () => {
    const row = biometricRow(await render());

    expect(row.props.type).toBe('toggle');
    expect(row.props.value).toBe(false);
    expect(row.props.disabled).toBe(false);
    expect(row.props.subtitle).toBeUndefined();

    await act(async () => row.props.onValueChange(true));

    expect(BiometricAuthService.savePin).toHaveBeenCalledWith('1234');
    expect(mockStore.updateSettings).toHaveBeenCalledWith({ biometricUnlockEnabled: true });
  });

  test('turning it off forgets the stored pin, not just the preference', async () => {
    mockStore.settings = { ...mockStore.settings, biometricUnlockEnabled: true };
    const row = biometricRow(await render());

    await act(async () => row.props.onValueChange(false));

    expect(BiometricAuthService.clearPin).toHaveBeenCalled();
    expect(mockStore.updateSettings).toHaveBeenCalledWith({ biometricUnlockEnabled: false });
  });

  test('a phone with no reader set up cannot arm it, and says so', async () => {
    BiometricAuthService.isAvailable.mockResolvedValueOnce({ available: false });
    const row = biometricRow(await render());

    expect(row.props.disabled).toBe(true);
    expect(row.props.subtitle).toBe(L10N.BIOMETRIC_UNLOCK_NOT_AVAILABLE);
  });

  test('a phone that already armed it can still turn it off after the reader goes away', async () => {
    BiometricAuthService.isAvailable.mockResolvedValueOnce({ available: false });
    mockStore.settings = { ...mockStore.settings, biometricUnlockEnabled: true };
    const row = biometricRow(await render());

    expect(row.props.disabled).toBe(false);
  });

  test('there is nothing to store until a pin exists', async () => {
    mockStore.settings = { ...mockStore.settings, pin: undefined };
    const row = biometricRow(await render());

    await act(async () => row.props.onValueChange(true));

    expect(BiometricAuthService.savePin).not.toHaveBeenCalled();
    expect(mockStore.updateSettings).not.toHaveBeenCalled();
  });

  test('the groups read as their own concerns, not one long list of preferences', async () => {
    const root = await render();
    const groups = root
      .findAllByProps({ testID: 'eyebrow' })
      .filter((node) => typeof node.type === 'string')
      .map((node) => node.props.children);

    expect(groups).toEqual(
      expect.arrayContaining([L10N.DATA, L10N.APPEARANCE, L10N.PREFERENCES, L10N.UNLOCK, L10N.ABOUT]),
    );
    expect(groups.indexOf(L10N.APPEARANCE)).toBeLessThan(groups.indexOf(L10N.PREFERENCES));
    expect(groups.indexOf(L10N.PREFERENCES)).toBeLessThan(groups.indexOf(L10N.UNLOCK));
  });

  test('appearance holds the theme and the text size, and nothing else', async () => {
    const root = await render();
    const titles = componentsBy(root, 'select')
      .concat(componentsBy(root, 'setting'))
      .map((node) => node.props.title);

    expect(titles).toContain(L10N.THEME);
    expect(titles).toContain(L10N.TEXT_SIZE);
    expect(titles).not.toContain(L10N.APPEARANCE);
  });

  test('the row is named after the reader the phone actually has', async () => {
    BiometricAuthService.isAvailable.mockResolvedValueOnce({ available: true, kind: 'face' });
    expect(biometricRow(await render()).props.title).toBe(biometricName('face'));

    BiometricAuthService.isAvailable.mockResolvedValueOnce({ available: true, kind: 'fingerprint' });
    expect(biometricRow(await render()).props.title).toBe(biometricName('fingerprint'));

    expect(biometricName('face')).not.toBe(biometricName('fingerprint'));
  });

  test('the two things you switch on and off are switched the same way', async () => {
    const root = await render();
    const toggles = componentsBy(root, 'setting').filter((node) => node.props.type === 'toggle');

    expect(toggles.map((node) => node.props.title)).toEqual(
      expect.arrayContaining([L10N.REMINDER_BACKUP, biometricRow(root).props.title]),
    );
    expect(toggles.every((node) => typeof node.props.onValueChange === 'function')).toBe(true);
    expect(toggles.every((node) => node.props.right === undefined)).toBe(true);
  });
});
