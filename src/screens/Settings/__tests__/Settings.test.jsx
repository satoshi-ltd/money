import React from 'react';
import { StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Settings } from '../Settings';
import { theme } from '../../../theme';
import { viewOffset } from '../../../theme/layout';
import { C, ICON, L10N } from '../../../modules';
import { BackupService } from '../../../services';

const ACCENT_SOFT = '#S0FT00';
const SURFACE = '#SURFA0';

let mockStore = {};

jest.mock('@react-navigation/native', () => ({ useScrollToTop: () => {} }));

jest.mock('../../../services', () => ({
  BackupService: {
    export: jest.fn(() => Promise.resolve(true)),
    exportCsv: jest.fn(() => Promise.resolve(true)),
    import: jest.fn(() => Promise.resolve(undefined)),
  },
  NotificationsService: { reminders: jest.fn() },
  ServiceRates: { get: jest.fn(() => Promise.resolve({})) },
}));

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', accentSoft: '#S0FT00', dangerSoft: '#DANG00', surface: '#SURFA0' } }),
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

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Settings navigation={{ navigate: jest.fn() }} />);
  });
  return renderer.root;
};

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
    mockStore = {
      accounts: [],
      scheduledTxs: [],
      settings: { baseCurrency: 'EUR', language: 'en', reminders: [1], theme: 'light' },
      txs: [],
      updateSettings: jest.fn(),
      updateTheme: jest.fn(),
    };
  });

  test('the section is announced by the masthead, not a big title', () => {
    const masthead = componentsBy(render(), 'masthead');

    expect(masthead).toHaveLength(1);
    expect(masthead[0].props.section).toBe(L10N.SETTINGS);
  });

  test('the backup block is a full-bleed accent-soft band with no radius and no elevation', () => {
    const band = flats(render()).find((flat) => flat.backgroundColor === ACCENT_SOFT);

    expect(band.borderRadius).toBe(theme.borderRadius.none);
    expect(band.paddingHorizontal).toBe(viewOffset);
    expect(band.paddingVertical).toBe(14);
    expect(band.marginHorizontal).toBeUndefined();
    expect(band.shadowOpacity).toBeUndefined();
    expect(band.elevation).toBeUndefined();
  });


  test('the backup CTA exports the ledger', async () => {
    const cta = componentsBy(render(), 'chip').find((node) => node.props.label === L10N.BACKUP_CTA);

    await act(async () => cta.props.onPress());

    expect(BackupService.export).toHaveBeenCalledTimes(1);
  });

  test('groups are rows on paper: no surface card, no radius wrapper', () => {
    const cards = flats(render()).filter((flat) => flat.backgroundColor === SURFACE);

    expect(cards).toHaveLength(0);
  });

  test('every row after the first of its group carries the hairline divider', () => {
    const root = render();
    // The colophon signs off with its own eyebrows, and it heads no group of rows.
    const signature = [C.MAKER_NAME, `v${C.VERSION}`];
    const labels = root
      .findAllByProps({ testID: 'eyebrow' })
      .filter((node) => typeof node.type === 'string' && !signature.includes(node.props.children));
    const rows = [...componentsBy(root, 'setting'), ...componentsBy(root, 'select')];

    expect(labels.length).toBeGreaterThan(0);
    expect(rows.filter((node) => !node.props.divider)).toHaveLength(labels.length);
  });

  test('the version is stated once, in the colophon that signs the app', () => {
    const stamped = render()
      .findAllByProps({ testID: 'eyebrow' })
      .filter((node) => typeof node.type === 'string' && `${node.props.children}`.includes(C.VERSION));

    expect(stamped).toHaveLength(1);
  });

  test('the banner reports the last copy, and warns while there is none', () => {
    const root = render();
    const texts = allTexts(root);

    expect(texts).toContain(L10N.BACKUP_NEVER);
    expect(texts.some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(false);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(true);
  });

  // The band rode the screen for ever, so it stopped reading as a warning and became furniture.
  test('a copy inside the week takes the band away entirely', () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() };
    const root = render();

    expect(flats(root).find((flat) => flat.backgroundColor === ACCENT_SOFT)).toBeUndefined();
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(false);
  });

  // Update rates already reported when it last ran; a backup is the other row worth dating.
  test('the export row dates its last copy, the way the rates row dates its last sync', () => {
    const at = new Date();
    at.setHours(9, 5, 0, 0);
    mockStore.settings = { ...mockStore.settings, backupAt: at.getTime() };
    const root = render();
    const row = componentsBy(root, 'setting').find((node) => node.props.title === L10N.EXPORT_DATA);
    const shown = row.props.right.props.value;

    expect(shown).toBe(at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    expect(row.props.right.props.figure).toBe(true);
  });

  test('with no copy to date, the row keeps the plain chevron', () => {
    const root = render();
    const row = componentsBy(root, 'setting').find((node) => node.props.title === L10N.EXPORT_DATA);

    expect(row.props.right.props.value).toBeUndefined();
  });

  test('and the export is still one row away, so the band is a nudge and never the only door', () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() };
    const root = render();
    const row = componentsBy(root, 'setting').find((node) => node.props.title === L10N.EXPORT_DATA);

    act(() => row.props.onPress());

    expect(BackupService.export).toHaveBeenCalledTimes(1);
  });

  test('a copy older than the weekly reminder brings the warning back', () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() - 8 * 24 * 60 * 60 * 1000 };
    const root = render();

    expect(allTexts(root).some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(true);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(true);
  });
});
