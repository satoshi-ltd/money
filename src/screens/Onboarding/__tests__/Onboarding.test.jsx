import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Onboarding } from '../Onboarding';
import { L10N } from '../../../modules';

const mockCreateAccount = jest.fn();
const mockUpdateSettings = jest.fn();
const mockUpdateRates = jest.fn();
const mockReset = jest.fn();

let mockStore;

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { accent: '#ACCE07', border: '#B0RDE0', surface: '#5URFA0', textMuted: '#MUTED0' } }),
  useStore: () => mockStore,
}));

jest.mock('../../../services', () => ({
  rebaseRates: jest.requireActual('../../../services/RatesService').rebaseRates,
  ServiceRates: { get: jest.fn(() => Promise.resolve({ currency: 'THB', '2026-08': { EUR: 0.026, THB: 1 } })) },
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');

  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Button: ({ children, onPress, disabled }) =>
      MockReact.createElement(ReactNative.View, { onPress, disabled }, MockReact.createElement(ReactNative.Text, null, children)),
    Logo: () => MockReact.createElement(ReactNative.Text, null, 'MÔNEY'),
    Heading: ({ eyebrow, value }) =>
      MockReact.createElement(
        ReactNative.View,
        null,
        MockReact.createElement(ReactNative.Text, null, value),
        MockReact.createElement(ReactNative.Text, null, eyebrow),
      ),
    Icon: ({ name, tone }) => MockReact.createElement(ReactNative.View, { accessibilityLabel: name, tone }),
    Input: (props) => MockReact.createElement(ReactNative.View, props),
    Masthead: ({ children, eyebrow }) =>
      MockReact.createElement(ReactNative.View, null, MockReact.createElement(ReactNative.Text, null, eyebrow), children),
    Pressable: (props) => MockReact.createElement(ReactNative.View, props),
    ScrollView: ({ contentContainerStyle, ...props }) => MockReact.createElement(ReactNative.View, props),
    Text: ({ bold, figure, flex, medium, size, tone, uppercase, ...props }) =>
      MockReact.createElement(ReactNative.Text, props),
    View: ({ flex, row, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { SafeAreaView: (props) => MockReact.createElement(ReactNative.View, props) };
});

jest.mock('../../Session/components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return {
    NumKeyboard: ({ onDelete, onPress }) =>
      MockReact.createElement(ReactNative.View, { testID: 'numkeyboard', onDelete, onPress }),
  };
});

const collect = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(collect).join('');
  if (children?.props?.children) return collect(children.props.children);
  return '';
};

const allText = (root) => root.findAllByType(RNText).map((node) => collect(node.props.children));

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Onboarding navigation={{ reset: mockReset }} />);
  });
  return renderer.root;
};

const advance = async (root, label) => {
  const node = root.findAll((item) => item.props?.onPress && collect(item.props.children).includes(label)).pop();
  await act(async () => {
    node.props.onPress();
  });
};

const type = (root, placeholder, text) => {
  const [input] = root.findAllByProps({ placeholder });
  act(() => {
    input.props.onChange(text);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockStore = {
    createAccount: mockCreateAccount,
    rates: { '2026-08': { EUR: 1, THB: 38.1, USD: 1.0849 } },
    settings: { baseCurrency: 'EUR' },
    updateRates: mockUpdateRates,
    updateSettings: mockUpdateSettings,
  };
});

describe('screens/Onboarding', () => {
  test('opens on the cover with the mark, the headline and three numbered claims', () => {
    const text = allText(render());

    expect(text).toContain('MÔNEY');
    expect(text).toContain(L10N.ONB_COVER_TITLE);
    expect(text).toEqual(expect.arrayContaining(['01', '02', '03']));
    expect(text).toContain(L10N.ONB_START);
  });

  test('the cover carries its folio in the footer, later steps in the masthead', async () => {
    const root = render();
    expect(allText(root)).toContain('01 / 04');

    await advance(root, L10N.ONB_START);
    expect(allText(root)).toContain('02 / 04');
  });

  // Picking a currency during onboarding must land with the network off: the seeded series is converted in place.
  test('the currency step converts the cached rates before it ever asks the network', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);

    expect(allText(root)).toContain('THB');

    await advance(root, 'THB');

    expect(mockUpdateRates.mock.calls[0][0]).toEqual(
      expect.objectContaining({ currency: 'THB', '2026-08': expect.objectContaining({ THB: 1 }) }),
    );
    expect(mockUpdateRates).toHaveBeenCalledTimes(2);
  });

  test('a named account is written on finish and the pin is stored', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);

    type(root, '…', 'N26');
    type(root, '0', '8412.90');

    await advance(root, L10N.CONTINUE);

    for (const digit of [1, 2, 3, 4]) {
      const keyboard = root.findByProps({ testID: 'numkeyboard' });
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        keyboard.props.onPress(digit);
      });
    }

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ baseCurrency: 'EUR', onboarded: true, pin: '1234' }),
    );
    expect(mockCreateAccount).toHaveBeenCalledWith({ balance: 8412.9, currency: 'EUR', title: 'N26' });
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'main' }] });
  });

  test('skipping the passcode finishes without one', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);
    await advance(root, L10N.CONTINUE);
    await advance(root, L10N.ONB_PIN_SKIP);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ baseCurrency: 'EUR', onboarded: true });
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });

  test('skipping the account step discards what was typed into it', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);

    type(root, '…', 'N26');

    await advance(root, L10N.ONB_SKIP);
    await advance(root, L10N.ONB_PIN_SKIP);

    expect(mockCreateAccount).not.toHaveBeenCalled();
  });
});
