import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ScheduledForm } from '../ScheduledForm';
import { L10N } from '../../../modules';

let mockStore = {};

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: {}, language: 'en' }),
  useStore: () => mockStore,
}));

jest.mock('../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Button: (props) => MockReact.createElement(ReactNative.View, { testID: 'button', ...props }, props.children),
    DatePicker: (props) => MockReact.createElement(ReactNative.View, { testID: 'date-picker', ...props }),
    Dropdown: stub('dropdown'),
    FieldRow: ({ children, label, ...props }) =>
      MockReact.createElement(
        ReactNative.View,
        { testID: 'fieldrow', ...props },
        MockReact.createElement(ReactNative.Text, null, label),
        children,
      ),
    Icon: stub('icon'),
    Input: stub('input'),
    Modal: ({ children }) => MockReact.createElement(ReactNative.View, { testID: 'modal' }, children),
    Panel: ({ children, footerElement, ...props }) =>
      MockReact.createElement(ReactNative.View, { testID: 'panel', ...props }, children, footerElement),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    SegmentedToggle: stub('segmented'),
    Text: ({ bold, flex, medium, size, uppercase, ...props }) => MockReact.createElement(ReactNative.Text, props),
    View: ({ row, flex, spaceBetween, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

const START = new Date(2026, 0, 5, 9, 0, 0).getTime();

const existing = {
  id: 'gym',
  account: 'a1',
  type: 0,
  category: 10,
  value: 40,
  title: 'Gym',
  startAt: START,
  pattern: { kind: 'weekly', interval: 1, byWeekday: [1] },
};

const render = (route = {}) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<ScheduledForm navigation={{ goBack: () => {} }} route={route} />);
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

describe('screens/ScheduledForm', () => {
  beforeEach(() => {
    mockStore = {
      accounts: [{ hash: 'a1', title: 'N26', currency: 'EUR' }],
      scheduledTxs: [existing],
      session: { locale: 'en-US' },
      settings: {},
      createScheduled: jest.fn(),
      deleteScheduled: jest.fn(),
      updateScheduled: jest.fn(),
    };
  });

  test('the weekday chips are single letters derived from the locale', () => {
    const root = render();

    const letters = root
      .findAllByType('Text')
      .filter((node) => node.props.align === 'center')
      .map((node) => node.props.children);

    expect(letters).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  test('the selected weekday reads on the accent', () => {
    const root = render({ params: { id: 'gym' } });

    const onAccent = root
      .findAllByType('Text')
      .filter((node) => node.props.tone === 'onAccent')
      .map((node) => node.props.children);

    expect(onAccent).toEqual(['M']);
  });

  test('deleting an existing schedule is a soft-danger action', () => {
    const variants = componentsBy(render({ params: { id: 'gym' } }), 'button').map((node) => node.props.variant);

    expect(variants).toContain('dangerSoft');
  });

  test('a new schedule offers no delete action', () => {
    const variants = componentsBy(render(), 'button').map((node) => node.props.variant);

    expect(variants).not.toContain('dangerSoft');
  });

  // It used to hand-roll a second copy of FieldRow, which is why its amount looked nothing like the others.
  test('the fields are the same rows every other form uses, in the same order', () => {
    const labels = render()
      .findAllByProps({ testID: 'fieldrow' })
      .filter((node) => typeof node.type === 'function')
      .map((row) => row.findAll((node) => typeof node.props?.children === 'string')[0].props.children);

    expect(labels).toEqual([L10N.CONCEPT, L10N.AMOUNT, L10N.ACCOUNT, L10N.CATEGORY]);
  });

  test('the start date opens the shared picker, never earlier than today', () => {
    const root = render();
    act(() => componentsBy(root, 'segmented')[1].props.onChange('monthly'));
    const row = root.findAllByProps({ testID: 'fieldrow' }).find((node) => node.props.onPress && node.findAll((child) => child.props.children === L10N.DATE).length > 0);
    const pickers = () => root.findAllByProps({ testID: 'date-picker' }).filter((node) => node.props.onSelect);
    expect(pickers()).toHaveLength(0);

    act(() => row.props.onPress());

    const [open] = pickers();
    expect(open.props.minimumDate.toDateString()).toBe(new Date().toDateString());
    expect(Math.abs(open.props.value.getTime() - Date.now())).toBeLessThan(60000);

    const day = new Date(2030, 2, 17, 9);
    act(() => open.props.onSelect(day));
    expect(pickers()[0].props.value.getTime()).toBe(day.getTime());

    act(() => pickers()[0].props.onClose());
    expect(pickers()).toHaveLength(0);
  });

  test('a start date already in the past stays the floor of its own picker, so OK never moves it to today', () => {
    const root = render({ params: { id: 'gym' } });
    act(() => componentsBy(root, 'segmented')[1].props.onChange('monthly'));
    const row = root.findAllByProps({ testID: 'fieldrow' }).find((node) => node.props.onPress && node.findAll((child) => child.props.children === L10N.DATE).length > 0);

    act(() => row.props.onPress());

    const [open] = root.findAllByProps({ testID: 'date-picker' }).filter((node) => node.props.onSelect);
    expect(open.props.minimumDate.getTime()).toBe(START);
  });

  test('the sheet names the thing, not the verb, whether it is new or not', () => {
    const panel = render().findAllByProps({ testID: 'panel' }).find((node) => node.props.title);

    expect(panel.props.title).toBe(L10N.SCHEDULED_ONE);
  });
});
