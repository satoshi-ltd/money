import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { ItemGroupCategories } from '../ItemGroupCategories';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockNavigate }) }));

jest.mock('../../../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#ACCE07', text: '#TEXT00', textMuted: '#MUTED0', textSecondary: '#SECON0' },
  }),
  useStore: () => ({ settings: { baseCurrency: 'EUR' } }),
}));

jest.mock('../../../../../components', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');

  return {
    Eyebrow: ({ children, ...props }) => MockReact.createElement(ReactNative.Text, { testID: 'eyebrow', ...props }, children),
    Chip: (props) => MockReact.createElement(ReactNative.View, { testID: 'chip', ...props }),
    Heading: (props) => MockReact.createElement(ReactNative.View, { testID: 'heading', ...props }),
    Pressable: (props) => MockReact.createElement(ReactNative.View, { testID: 'pressable', ...props }),
    View: ({ flex, row, ...props }) => MockReact.createElement(ReactNative.View, props),
  };
});

jest.mock('../HorizontalChartItem', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { HorizontalChartItem: (props) => MockReact.createElement(ReactNative.View, { testID: 'bar', ...props }) };
});

const DATA_SOURCE = {
  4: { mercadona: 300, lidl: 100 },
  5: { 'casa paco': 200 },
  6: { renfe: 50 },
  7: { gym: 25 },
  8: { vet: 25 },
};

const render = () => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <ItemGroupCategories dataSource={DATA_SOURCE} month={7} type={0} year={2026} />,
    );
  });
  return renderer.root;
};

const componentsBy = (root, testID) =>
  root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

beforeEach(() => mockNavigate.mockClear());

describe('screens/Stats/ItemGroupCategories', () => {
  test('tapping a category opens the sheet instead of expanding in place', () => {
    const root = render();
    act(() => componentsBy(root, 'pressable')[0].props.onPress());

    expect(mockNavigate).toHaveBeenCalledWith(
      'category',
      expect.objectContaining({ category: 4, color: '#ACCE07', month: 7, monthTotal: 700, type: 0, year: 2026 }),
    );
  });

  test('the leader is the only coloured row: accent first, ink after', () => {
    const bars = componentsBy(render(), 'bar');

    expect(bars.map(({ props }) => props.color)).toEqual(['#ACCE07', '#TEXT00', '#SECON0', '#MUTED0']);
  });

  test('only the top three categories are listed, with the tail folded into one row', () => {
    const bars = componentsBy(render(), 'bar');

    expect(bars).toHaveLength(4);
    expect(bars[3].props.value).toBe(50);
    expect(bars[3].props.title).toContain('2');
  });

  // A fifth of the spend used to sit behind a row that looked tappable and was not.
  test('the folded tail opens in place, and folds back', () => {
    const root = render();
    const tail = componentsBy(root, 'pressable').slice(-1)[0];
    const before = componentsBy(root, 'pressable').length;

    act(() => tail.props.onPress());
    expect(componentsBy(root, 'pressable').length).toBeGreaterThan(before);

    act(() => componentsBy(root, 'pressable').slice(-1)[0].props.onPress());
    expect(componentsBy(root, 'pressable')).toHaveLength(before);
  });
});
