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
    Mark: () => MockReact.createElement(ReactNative.Text, null, 'MÔ'),
    Heading: ({ eyebrow, value }) =>
      MockReact.createElement(
        ReactNative.View,
        null,
        MockReact.createElement(ReactNative.Text, null, value),
        MockReact.createElement(ReactNative.Text, null, eyebrow),
      ),
    FieldRow: ({ children, label }) =>
      MockReact.createElement(ReactNative.View, null, MockReact.createElement(ReactNative.Text, null, label), children),
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

let lastRenderer;

const render = () => {
  act(() => {
    lastRenderer = TestRenderer.create(<Onboarding navigation={{ reset: mockReset }} />);
  });
  return lastRenderer.root;
};

const advance = async (root, label) => {
  const node = root.findAll((item) => item.props?.onPress && collect(item.props.children).includes(label)).pop();
  await act(async () => {
    node.props.onPress();
  });
};

const button = (root, label) =>
  root.findAll((item) => item.props?.onPress && collect(item.props.children).includes(label)).pop();

const punch = async (root, digits) => {
  for (const digit of digits) {
    const keyboard = root.findByProps({ testID: 'numkeyboard' });
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      keyboard.props.onPress(digit);
    });
  }
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
  test('opens on the cover with the mark, the headline and four numbered claims', () => {
    const text = allText(render());

    // The masthead already carries the wordmark: the cover shows the icon, not a second MÔNEY.
    expect(text).toContain('MÔ');
    expect(text).toContain(L10N.ONB_COVER_TITLE);
    expect(text).toEqual(expect.arrayContaining(['01', '02', '03', '04']));
    expect(text).toContain(L10N.ONB_START);
  });

  // The promise is the product: it must survive a refactor that quietly reintroduces a tracker.
  test('the cover says out loud that nothing is measured', () => {
    const text = allText(render());

    expect(text).toContain(L10N.ONB_CLAIM_3);
    expect(text).toContain(L10N.ONB_CLAIM_3_CAPTION);
    expect(text).toContain(L10N.ONB_COVER_CAPTION);
  });

  // The wordmark owns the left of the masthead everywhere in the app; the step count reads on the right.
  test('every step counts itself in the masthead, and the mark keeps the left to itself', async () => {
    const root = render();
    expect(allText(root)).toEqual(expect.arrayContaining(['MÔNEY', L10N.ONB_SETUP, '01 / 04']));

    await advance(root, L10N.ONB_START);
    expect(allText(root)).toEqual(expect.arrayContaining(['MÔNEY', L10N.ONB_SETUP, '02 / 04']));
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
    await punch(root, [1, 2, 3, 4, 1, 2, 3, 4]);

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ baseCurrency: 'EUR', onboarded: true, pin: '1234' }),
    );
    expect(mockCreateAccount).toHaveBeenCalledWith({ balance: 8412.9, currency: 'EUR', title: 'N26' });
    expect(mockReset).toHaveBeenCalledWith({ index: 0, routes: [{ name: 'main' }] });
  });

  // An effect that returns its async work hands React a promise where it wants a cleanup, and the
  // screen only blows up when it unmounts — which is exactly what finishing onboarding does.
  test('finishing tears the screen down without a render error', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);

    type(root, '…', 'N26');

    await advance(root, L10N.CONTINUE);
    await punch(root, [1, 2, 3, 4, 1, 2, 3, 4]);

    expect(() => act(() => lastRenderer.unmount())).not.toThrow();
  });

  // The passcode cannot be recovered, so a typo has to be caught here rather than at the next launch.
  test('the passcode is asked twice, and a second entry that differs starts it over', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);

    type(root, '…', 'N26');

    await advance(root, L10N.CONTINUE);
    await punch(root, [1, 2, 3, 4]);

    expect(allText(root)).toContain(L10N.ONB_PIN_CONFIRM_TITLE);

    await punch(root, [9, 9, 9, 9]);

    expect(mockUpdateSettings).not.toHaveBeenCalled();
    expect(mockReset).not.toHaveBeenCalled();
    expect(allText(root)).toContain(L10N.ONB_PIN_TITLE);
  });

  // môney is useless without somewhere to put money: the step that opens the first account has no way past it.
  test('the account step will not continue until the account has a name', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);

    expect(button(root, L10N.CONTINUE).props.disabled).toBe(true);

    type(root, '…', 'N26');

    expect(button(root, L10N.CONTINUE).props.disabled).toBe(false);
  });

  // Everything the app promises rests on the ledger being on this device and locked: neither step is optional.
  test('no step offers a way out of naming the account or setting the passcode', async () => {
    const root = render();
    await advance(root, L10N.ONB_START);
    await advance(root, L10N.CONTINUE);

    expect(button(root, L10N.CONTINUE).props.disabled).toBe(true);

    type(root, '…', 'N26');
    await advance(root, L10N.CONTINUE);
    await punch(root, [1, 2, 3, 4]);

    expect(mockReset).not.toHaveBeenCalled();
  });
});
