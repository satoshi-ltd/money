import React from 'react';
import { Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { Chart } from '../Chart';
import { percentText } from '../../../modules';

const ACCENT = '#ACCE07';
const MUTED = '#MUTED0';
const TEXT = '#TEXT00';

jest.mock('../../../contexts', () => ({
  useApp: () => ({
    colors: { accent: '#ACCE07', background: '#8ACC60', border: '#B0RDE0', text: '#TEXT00', textMuted: '#MUTED0' },
  }),
}));

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ height: 844, width: 390 }),
}));

jest.mock('react-native-svg', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  const stub = (testID) => (props) => MockReact.createElement(ReactNative.View, { testID, ...props });
  const Svg = stub('svg');
  return { __esModule: true, default: Svg, Circle: stub('circle'), Line: stub('line'), Path: stub('path') };
});

jest.mock('../../PriceFriendly', () => {
  const ReactNative = require('react-native');
  const MockReact = require('react');
  return { PriceFriendly: (props) => MockReact.createElement(ReactNative.View, { testID: 'price', ...props }) };
});

const VALUES = [100, 300, 200, 500, 400, 700];

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<Chart values={VALUES} {...props} />);
  });
  return renderer.root;
};

const svgBy = (root, testID) => root.findAllByProps({ testID }).filter((node) => typeof node.type === 'function');

const texts = (root) => root.findAllByType(RNText).map((node) => node.props.children);

describe('components/Chart', () => {
  test('draws the balance line over a dashed moving average', () => {
    const [trend, line] = svgBy(render(), 'path');

    expect(trend.props.stroke).toBe(MUTED);
    expect(trend.props.strokeDasharray).toBe('2 3');
    expect(line.props.stroke).toBe(TEXT);
    expect(line.props.strokeDasharray).toBeUndefined();
  });

  test('three hairline gridlines carry abbreviated value labels', () => {
    const root = render();

    expect(svgBy(root, 'line')).toHaveLength(3);
    expect(texts(root)).toEqual(expect.arrayContaining(['700', '400', '100']));
  });

  test('the last point is marked in ink and the selected month in accent', () => {
    const dots = svgBy(render({ pointerIndex: 2 }), 'circle');

    expect(dots).toHaveLength(2);
    expect(dots[0].props.fill).toBe(ACCENT);
    expect(dots[1].props.fill).toBe(TEXT);
  });

  test('the selected marker is dropped when it sits on the last point', () => {
    expect(svgBy(render({ pointerIndex: VALUES.length - 1 }), 'circle')).toHaveLength(1);
  });

  test('tapping a column reports its index', () => {
    const onPointerChange = jest.fn();
    const root = render({ onPointerChange });
    const columns = root.findAll((node) => node.props?.onPress && typeof node.type === 'function');

    expect(columns).toHaveLength(VALUES.length);
    act(() => columns[3].props.onPress());
    expect(onPointerChange).toHaveBeenCalledWith(3);
  });

  test('the hero, eyebrow and axis are optional so the dashboard can show the plot alone', () => {
    const bare = render({ axis: false });

    expect(svgBy(bare, 'price')).toHaveLength(0);
    expect(texts(bare)).toEqual(['700', '400', '100']);

    const full = render({ axis: false, currency: 'EUR', delta: 12.4, eyebrow: 'Balance', heroValue: 700 });
    expect(svgBy(full, 'price')[0].props.value).toBe(700);
    expect(texts(full)).toContain('Balance');
    expect(texts(full)).toContain(percentText(12.4, { decimals: 1, signed: true }));
  });

  test('fewer than two points renders nothing', () => {
    expect(svgBy(render({ values: [100] }), 'svg')).toHaveLength(0);
    expect(svgBy(render({ values: [] }), 'svg')).toHaveLength(0);
  });
});
