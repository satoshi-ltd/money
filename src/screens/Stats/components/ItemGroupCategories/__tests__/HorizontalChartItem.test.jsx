import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { HorizontalChartItem } from '../HorizontalChartItem';

jest.mock('../../../../../contexts', () => ({
  useApp: () => ({ colors: {} }),
  useAmountSettings: () => ({ baseCurrency: 'EUR', maskAmount: false }),
}));

const collect = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(collect).join('');
  if (children?.props?.children) return collect(children.props.children);
  return '';
};

const render = (props = {}) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(
      <HorizontalChartItem color="#accent" currency="EUR" title="groceries" value={300} width={42} {...props} />,
    );
  });
  return renderer.root;
};

describe('screens/Stats/HorizontalChartItem', () => {
  test('the percent column keeps one line and grows with the font scale instead of wrapping', () => {
    const percent = render()
      .findAllByType(RNText)
      .find((node) => /%$/.test(collect(node.props.children)));
    const style = StyleSheet.flatten(percent.props.style);

    expect(percent.props.numberOfLines).toBe(1);
    expect(style.width).toBeUndefined();
    expect(style.flexShrink).toBe(0);
    expect(style.minWidth).toBeGreaterThan(0);
  });
});
