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
  PurchaseService: { getProducts: jest.fn(() => Promise.resolve([])), restore: jest.fn(() => Promise.resolve({})) },
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
    const labels = root.findAllByProps({ testID: 'eyebrow' }).filter((node) => typeof node.type === 'string');
    const rows = [...componentsBy(root, 'setting'), ...componentsBy(root, 'select')];

    expect(labels.length).toBeGreaterThan(0);
    expect(rows.filter((node) => !node.props.divider)).toHaveLength(labels.length);
  });

  test('the version footer stays a centered micro line', () => {
    const footer = componentsBy(render(), 'text').find((node) => `${node.props.children}`.includes(C.VERSION));

    expect(footer.props.align).toBe('center');
    expect(footer.props.size).toBe('xxs');
    expect(footer.props.tone).toBe('muted');
  });

  test('the banner reports the last copy, and warns while there is none', () => {
    const root = render();
    const texts = allTexts(root);

    expect(texts).toContain(L10N.BACKUP_NEVER);
    expect(texts.some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(false);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(true);
  });

  test('once a copy exists the warning goes and the date takes its place', () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() };
    const root = render();

    expect(allTexts(root).some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(true);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(false);
  });

  test('a copy older than the weekly reminder brings the warning back', () => {
    mockStore.settings = { ...mockStore.settings, backupAt: Date.now() - 8 * 24 * 60 * 60 * 1000 };
    const root = render();

    expect(allTexts(root).some((text) => text.startsWith(L10N.BACKUP_LAST))).toBe(true);
    expect(componentsBy(root, 'icon').some((node) => node.props.name === ICON.ALERT)).toBe(true);
  });
});
