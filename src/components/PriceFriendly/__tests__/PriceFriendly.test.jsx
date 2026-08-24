import React from 'react';
import { StyleSheet, Text as RNText } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';

import { PriceFriendly } from '../PriceFriendly';

jest.mock('../../../contexts', () => ({
  useApp: () => ({ colors: { text: '#15140F', textMuted: '#8A8474', positive: '#A87B14' } }),
  useStore: () => ({ settings: {} }),
}));

const render = (props) => {
  let renderer;
  act(() => {
    renderer = TestRenderer.create(<PriceFriendly currency="EUR" {...props} />);
  });
  return renderer.root;
};

const collect = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return `${children}`;
  if (Array.isArray(children)) return children.map(collect).join('');
  if (children?.props?.children) return collect(children.props.children);
  return '';
};

const flatText = (root) => collect(root.findAllByType(RNText)[0]?.props?.children);

describe('components/PriceFriendly', () => {
  test('negatives carry a real minus sign and never a positive tone', () => {
    const root = render({ value: -23.8 });

    expect(flatText(root)).toContain('−23');
    expect(flatText(root)).not.toContain('(');
    const styles = root.findAllByType(RNText).map((n) => StyleSheet.flatten(n.props.style));
    expect(styles.some((s) => s?.color === '#A87B14')).toBe(false);
  });

  test('gains carry a leading plus in gold when an operator is asked for', () => {
    const root = render({ value: 2450, operator: true });

    expect(flatText(root)).toContain('+2,450');
    const styles = root.findAllByType(RNText).map((n) => StyleSheet.flatten(n.props.style));
    expect(styles.some((s) => s?.color === '#A87B14')).toBe(true);
  });

  test('thousands use commas and cents are split into a muted span', () => {
    const root = render({ value: 24618.42 });
    const nodes = root.findAllByType(RNText);

    expect(flatText(root)).toContain('24,618');
    const centsNode = nodes.find((n) => n.props.children === '.42');
    expect(centsNode).toBeDefined();
    expect(StyleSheet.flatten(centsNode.props.style)?.color).toBe('#8A8474');
  });

  test('every figure is set in the mono face', () => {
    const root = render({ value: 100 });
    const families = root.findAllByType(RNText).map((n) => StyleSheet.flatten(n.props.style)?.fontFamily);

    expect(families.every((f) => f === 'font-mono' || f === 'font-mono-medium')).toBe(true);
  });

  test('masking hides the digits entirely', () => {
    const root = render({ value: 1234.56, maskAmount: true });

    expect(flatText(root)).not.toContain('1,234');
  });
});
